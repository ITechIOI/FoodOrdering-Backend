import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from 'src/entities/user.entity';
import { GraphQLScalarType } from 'graphql';
import {
  FileUpload,
  GraphQLUpload,
  GraphQLUpload as GraphQLUploadScalar,
  Upload,
} from 'graphql-upload-minimal';
import { createPaginatedType } from 'src/utils/paginated';
import { UseGuards } from '@nestjs/common';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { AuthGuard } from 'src/common/guards/auth.guard';

const PaginatedUser = createPaginatedType(User, 'PaginatedUser');

// const GraphQLUpload = new GraphQLScalarType({
//   name: 'Upload',
//   description: 'The `Upload` scalar type represents a file upload.',
// });

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  // Không sử dụng phương thức này để đăng ký tài khoản
  @Mutation(() => User)
  // @UseGuards(AuthGuard, RoleGuard)
  // @Roles('manager', 'customer')
  async createUser(
    @Args('createUserInput')
    createUserInput: CreateUserInput,
  ): Promise<User> {
    const user = await this.usersService.create(createUserInput);
    console.log(user);
    return user;
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard)
  async uploadAvatar(
    @Args('id', { type: () => Int }) id: number,
    @Args({ name: 'file', type: () => GraphQLUpload }) file: FileUpload, // ✅ dùng type đúng
  ): Promise<User> {
    console.log('Resolved file:', file); // 👍 chính là file rồi
    return await this.usersService.updateAvatar(id, file); // truyền trực tiếp
  }

  @Mutation(() => User)
  @UseGuards(AuthGuard)
  async updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    // console.log(updateUserInput);
    return await this.usersService.updateUser(
      updateUserInput.id,
      updateUserInput,
    );
  }
  @Mutation(() => User, { name: 'linkUserAddress' })
  @UseGuards(AuthGuard)
  async linkAddressToUser(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('addressId', { type: () => Int, nullable: true })
    addressId: number | null,
  ): Promise<User> {
    console.log(
      `[UsersResolver] linkAddressToUser - Request received for UserID: ${userId}, AddressID: ${addressId}`,
    );
    return this.usersService.linkOrUpdateUserAddress(userId, addressId);
  }

  @Mutation(() => User)
  removeUser(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.remove(id);
  }

  @Query(() => PaginatedUser)
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('manager', 'admin')
  async findAllUsers(
    @Args('page', { type: () => Int, nullable: true }) page: number,
    @Args('limit', { type: () => Int, nullable: true }) limit: number,
  ) {
    console.log('Querying all users');
    return this.usersService.findAllUser(page, limit);
  }

  @Query(() => User)
  @UseGuards(AuthGuard)
  async findUserById(@Args('id', { type: () => Int }) id: number) {
    console.log('Querying user by ID');
    return this.usersService.findOneById(id);
  }
}
