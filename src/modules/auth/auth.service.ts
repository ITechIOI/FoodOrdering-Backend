import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthInput } from './dto/create-auth.input';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { CreateUserInput } from '../users/dto/create-user.input';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService,
    private readonly configureService: ConfigService,
  ) {}

  async register(createUser: CreateUserInput) {
    const hashedPassword = await bcrypt.hash(createUser.password, 10);
    return await this.userService.create({
      ...createUser,
      password: hashedPassword,
    });
  }

  async login(loginDto: CreateAuthInput) {
    const user = await this.userService.findOneByUsername(loginDto.username);
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // console.log("User ", this.jwtService.sign({ id: user.id, role: user.role.id }));
    return {
      token: this.jwtService.sign({ id: user.id, role: user.role.id }),
    };
  }
}
