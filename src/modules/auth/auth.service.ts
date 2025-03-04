import { CreateUserInput } from './../users/dto/create-user.input';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthInput } from './dto/create-auth.input';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/common/services/email.service';
import { UpdateUserInput } from '../users/dto/update-user.input';
import { AuthPayload } from 'src/utils/authpayload';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService,
    private readonly configureService: ConfigService,
    private emailService: EmailService,
  ) {}

  async register(createUser: CreateUserInput) {
    const hashedPassword = await bcrypt.hash(createUser.password, 10);
    return await this.userService.create({
      ...createUser,
      password: hashedPassword,
    });
  }

  // async login(loginDto: CreateAuthInput) {
  //   const user = await this.userService.findOneByUsername(loginDto.username);
  //   if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
  //     throw new UnauthorizedException('Invalid credentials');
  //   }
  //   // console.log("User ", this.jwtService.sign({ id: user.id, role: user.role.id }));
  //   return {
  //     token: this.jwtService.sign({ id: user.id, role: user.role.id }),
  //   };
  // }

  private generateOTP(): string {
    return Math.random().toString(36).substring(2, 7).toUpperCase(); // Ví dụ: "A1B2C"
  }

  async login(loginDto: CreateAuthInput): Promise<AuthPayload> {
    const { username, password } = loginDto;
    const user = await this.userService.findOneByUsername(username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // ✅ Tạo mã OTP và lưu vào database
    const otp = this.generateOTP();
    const newUser: UpdateUserInput = {
      ...user,
      otpCode: otp,
      roleId: user.role.id,
    };
    newUser.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP hết hạn sau 5 phút

    const updatedUser = await this.userService.updateUser(user.id, newUser);
    console.log('Updated user:', updatedUser);
    await this.emailService.sendVerificationEmail(user.email, otp);
    return { token: otp };
  }

  async verifyLogin(otp: string): Promise<AuthPayload> {
    const user = await this.userService.findOneByOtp(otp);

    if (!user || new Date() > user.otpExpiresAt) {
      throw new UnauthorizedException('Mã OTP không hợp lệ hoặc đã hết hạn');
    }

    // ✅ Xóa OTP sau khi xác thực thành công
    user.otpCode = '';
    user.otpExpiresAt = new Date();
    await this.userService.updateUser(user.id, user);

    return {
      token: this.jwtService.sign({ id: user.id, role: user.role.id }),
    };
  }
}
