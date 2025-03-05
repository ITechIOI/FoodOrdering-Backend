import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { Role } from 'src/entities/role.entity';
import { RolesService } from '../roles/roles.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { FileUpload } from 'graphql-upload-minimal';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private roleService: RolesService,
    private cloudinaryService: CloudinaryService,
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
      });
      const savedUser = await this.userRepository.save(newUser);
      if (!savedUser.id) {
        throw new InternalServerErrorException('User ID not generated');
      }
      // console.log(savedUser);
      // throw new ConflictException('Role not found');
      return savedUser;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findOneByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { username },
      relations: ['role'],
    });
  }

  async findOneById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['role'],
    });
  }

  async findOneByOtp(otp: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { otpCode: otp },
      relations: ['role'],
    });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });
  }

  async updateUser(id: number, updateUserInput: UpdateUserInput) {
    // console.log(updateUserInput);
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

      const stream = createReadStream(); // ✅ Bây giờ có thể gọi được
      const uploadResponse = await this.cloudinaryService.uploadImage(stream);
      console.log('Upload response: ', uploadResponse);
      const imageUrl =
        uploadResponse.secure_url + ' ' + uploadResponse.public_id;
      const newUser = this.userRepository.create({
        ...user,
        avatar: imageUrl,
      });
      this.userRepository.save(newUser);

      return uploadResponse.secure_url; // ✅ Trả về URL ảnh
    } catch (error) {
      console.error('Upload error:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async updateAvatar(id: number, file: FileUpload) {
    const user = await this.findOneById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    const oldPublicId = user.avatar.split(' ')[1];
    const deleteOldImage =
      await this.cloudinaryService.deleteImage(oldPublicId);
    console.log('Delete old image:', deleteOldImage);
    let imageUrl: string = '';
    try {
      const { createReadStream, filename, mimetype } = file;

      if (!createReadStream) {
        throw new Error('createReadStream is not available');
      }

      const stream = createReadStream(); // ✅ Bây giờ có thể gọi được
      const uploadResponse = await this.cloudinaryService.uploadImage(stream);
      console.log('Upload response: ', uploadResponse);
      imageUrl = uploadResponse.secure_url + ' ' + uploadResponse.public_id;
      const newUser = this.userRepository.create({
        ...user,
        avatar: imageUrl,
      });
      this.userRepository.save(newUser);
      // const saveUser = await this.userRepository.save(newUser);
      return uploadResponse.secure_url; // ✅ Trả về URL ảnh
    } catch (error) {
      console.error('Upload error:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll() {
    return await this.userRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
