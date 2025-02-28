import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateRoleInput } from './dto/create-role.input';
import { UpdateRoleInput } from './dto/update-role.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RolesService {
  @InjectRepository(Role)
  private roleRepository: Repository<Role>;

  async findOne(id: number) {
    try {
      return await this.roleRepository.findOneBy({ id });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll() {
    try {
      return await this.roleRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async create(createRoleInput: CreateRoleInput) {
    try {
      return await this.roleRepository.save(createRoleInput);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAllNameRole(): Promise<Array<string>> {
    const roles = await this.roleRepository.find();
    const roleName: Array<string> = [];
    roles.forEach((group) => {
      roleName.push(group.name);
    });
    return roleName;
  }
}
