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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private roleService: RolesService,
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
      // console.log('User:', user);
      // const role = updateUserInput.roleId
      //   ? await this.roleService.findOne(updateUserInput.roleId)
      //   : undefined;

      // if (!role) {
      //   throw new NotFoundException('Role not found');
      // }
      const updatedUser = await this.userRepository.save({
        ...user,
        ...updateUserInput,
      });
      return updatedUser;
    } catch (error) {
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
