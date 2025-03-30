import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { User } from 'src/entities/user.entity';
import { CreateUserInput } from '../users/dto/create-user.input';
import { CreateAuthInput } from './dto/create-auth.input';
import { AuthPayload } from 'src/utils/authpayload';
import { UseGuards } from '@nestjs/common';

@Resolver(() => User)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query(() => String)
  sayHello(): string {
    return 'Hello World!';
  }

  @Mutation(() => AuthPayload)
  async register(@Args('createUser') createUser: CreateUserInput) {
    return await this.authService.register(createUser);
  }

  @Mutation(() => AuthPayload)
  async verifySignup(@Args('token') token: string) {
    return await this.authService.verifySignUp(token);
  }

  @Mutation(() => AuthPayload)
  async login(@Args('loginDto') loginDto: CreateAuthInput) {
    return await this.authService.login(loginDto);
  }

  // @Mutation(() => AuthPayload)
  // async verifyLogin(@Args('token') token: string) {
  //   return await this.authService.verifyLogin(token);
  // }

  @Mutation(() => AuthPayload)
  async requestResetPassword(
    @Args('email', { type: () => String }) email: string,
  ): Promise<AuthPayload> {
    return await this.authService.requestResetPassword(email);
  }

  @Mutation(() => AuthPayload)
  async verifyChangePassword(
    @Args('token') token: string,
    @Args('password') password: string,
  ): Promise<AuthPayload> {
    return await this.authService.verifyChangePassword(token, password);
  }
}
