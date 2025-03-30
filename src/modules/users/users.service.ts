import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { IsNull, Repository } from 'typeorm';
import { Role } from 'src/entities/role.entity';
import { RolesService } from '../roles/roles.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { FileUpload } from 'graphql-upload-minimal';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from '@nestjs/cache-manager';
import Redis from 'ioredis';
import { ClientProxy } from '@nestjs/microservices';
import { CacheService } from 'src/common/cache/cache.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private roleService: RolesService,
    private cloudinaryService: CloudinaryService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    @Inject('REDIS_SERVICE') private readonly cacheClient: ClientProxy,
    private readonly cacheService: CacheService,
  ) {}

  async create(createUserInput: CreateUserInput): Promise<User> {
    try {
      const role = await this.roleService.findOne(createUserInput.roleId);
      if (!role) {
        throw new NotFoundException('Role not found');
      }
      const newUser = this.userRepository.create({
        ...createUserInput,
        role,
        status: 'inactive',
      });
      const savedUser = await this.userRepository.save(newUser);
      if (!savedUser.id) {
        throw new InternalServerErrorException('User ID not generated');
      }
      return savedUser;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOneByUsername(username: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { username, deletedAt: IsNull(), status: 'active' },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findOneByOtp(otp: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { otpCode: otp, deletedAt: IsNull() },
      relations: ['role'],
    });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email, deletedAt: IsNull(), status: 'active' },
      relations: ['role'],
    });
  }

  async updateUser(id: number, updateUserInput: UpdateUserInput) {
    try {
      const user = await this.findOneById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const updatedUser = await this.userRepository.save({
        ...user,
        ...updateUserInput,
      });
      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async createAvatar(id: number, file: FileUpload) {
    const user = await this.findOneById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      const { createReadStream, filename, mimetype } = file;

      if (!createReadStream) {
        throw new Error('createReadStream is not available');
      }

      const stream = createReadStream();
      const uploadResponse = await this.cloudinaryService.uploadImage(stream);
      console.log('Upload response: ', uploadResponse);
      const imageUrl =
        uploadResponse.secure_url + ' ' + uploadResponse.public_id;
      const newUser = this.userRepository.create({
        ...user,
        avatar: imageUrl,
      });
      this.userRepository.save(newUser);

      return uploadResponse.secure_url;
    } catch (error) {
      console.error('Upload error:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateAvatar(id: number, file: FileUpload) {
    const user = await this.findOneById(id);
    console.log('User found:', user);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    //  / console.log('User found:', user.avatar);
    const oldPublicId = user.avatar.split(' ')[1];
    console.log('User found:', oldPublicId);
    const deleteOldImage =
      await this.cloudinaryService.deleteImage(oldPublicId);
    console.log('Delete old image:', deleteOldImage);
    let imageUrl: string = '';
    try {
      const { createReadStream, filename, mimetype } = file;

      if (!createReadStream) {
        throw new Error('createReadStream is not available');
      }

      const stream = createReadStream();
      const uploadResponse = await this.cloudinaryService.uploadImage(stream);
      console.log('Upload response: ', uploadResponse);
      imageUrl = uploadResponse.secure_url + ' ' + uploadResponse.public_id;
      const newUser = this.userRepository.create({
        ...user,
        avatar: imageUrl,
      });
      return this.userRepository.save(newUser);
      // const saveUser = await this.userRepository.save(newUser);
    } catch (error) {
      console.error('Upload error:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async remove(id: number) {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.deletedAt = new Date();
    return await this.userRepository.save(user);
  }

  // Phương thức này sẽ được sử dụng khi thực hiện tính năng cache thông tin của người dùng
  // async findOneById(id: number): Promise<User | null> {
  //   try {
  //     const cacheKey = `user:detail:${id}`;
  //     const cacheUserString = await this.cacheService.getCache(cacheKey);
  //     // console.log('Raw data', cacheUserString);

  //     if (cacheUserString) {
  //       console.log('[CACHE] HIT:', cacheKey);
  //       return JSON.parse(cacheUserString);
  //     }
  //     console.log('Cache miss:', cacheKey);

  //     const user = await this.userRepository.findOne({
  //       where: { id, deletedAt: IsNull() },
  //       relations: ['role'],
  //     });
  //     if (!user) {
  //       throw new NotFoundException('User not found');
  //     }

  //     // await this.cacheService.setCache(cacheKey, JSON.stringify(user), 30000);
  //     await this.cacheClient.emit('user.cache.set', JSON.stringify(user));
  //     return user;
  //   } catch (error) {
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  async findOneById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['role'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findAllUser(
    page = 1,
    limit = 10,
  ): Promise<{ total: number; data: User[] }> {
    const cacheKey = `user:all:page=${page}:limit=${limit}`;

    const cached = await this.cacheManager.get<{ total: number; data: User[] }>(
      cacheKey,
    );

    if (cached) {
      console.log('[CACHE] HIT:', cacheKey);
      return cached;
    }

    console.log('[CACHE] MISS:', cacheKey);
    const [data, total] = await this.userRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
    });

    const result = { total, data };

    await this.cacheManager.set(cacheKey, result, 30000);
    return result;
  }
}
