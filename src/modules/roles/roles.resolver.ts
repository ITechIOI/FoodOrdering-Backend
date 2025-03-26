import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { RolesService } from './roles.service';
import { Role } from '../../entities/role.entity';
import { CreateRoleInput } from './dto/create-role.input';
import { UpdateRoleInput } from './dto/update-role.input';

@Resolver(() => Role)
export class RolesResolver {
  constructor(private readonly rolesService: RolesService) {}

  @Query(() => [Role])
  async findAllRole() {
    return await this.rolesService.findAll();
  }

  @Query(() => Role)
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return await this.rolesService.findOne(id);
  }

  @Mutation(() => Role)
  async createRole(@Args('createRoleInput') createRoleInput: CreateRoleInput) {
    return await this.rolesService.create(createRoleInput);
  }
}
