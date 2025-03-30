import { CreateUserInput } from './../users/dto/create-user.input';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthInput } from './dto/create-auth.input';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserInput } from '../users/dto/update-user.input';
import { AuthPayload } from 'src/utils/authpayload';
import { NotificationService } from '../notification/notification.service';
import { CreateNotificationInput } from '../notification/dto/create-notification.input';
import { User } from 'src/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private jwtService: JwtService,
    private notificationService: NotificationService,
  ) {}

  private generateOTP(): string {
    return Math.random().toString(36).substring(2, 7).toUpperCase(); // Ví dụ: "A1B2C"
  }

  async register(createUser: CreateUserInput): Promise<AuthPayload> {
    const hashedPassword = await bcrypt.hash(createUser.password, 10);

    // Tạo mã OTP và lưu vào database
    const otp = this.generateOTP();

    let message: string = `Your OTP code is: ${otp} (Valid for 1 minute)`;
    const subject = 'OTP Login Authentication';

    const user = await this.userService.create({
      ...createUser,
      password: hashedPassword,
      otpCode: otp,
      otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000), // OTP hết hạn sau 5 phút
    });

    const createNotificationDto: CreateNotificationInput = {
      userId: user.id,
      title: subject,
      content: message,
      type: 'email',
      isRead: 'unread',
    };
    const notification = this.notificationService.create(createNotificationDto);
    return { token: otp };
  }

  async verifySignUp(otp: string): Promise<AuthPayload> {
    const user = await this.userService.findOneByOtp(otp);
    // console.log('User found:', user);

    if (!user || new Date() > user.otpExpiresAt) {
      throw new UnauthorizedException('OTP code is invalid or expired');
    }

    user.status = 'active'; // Đặt trạng thái người dùng thành 'active'
    const result = await this.userService.updateUser(user.id, user);
    // console.log('Updated user:', result);
    return {
      token: this.jwtService.sign({ id: user.id, role: user.role.id }),
    };
  }

  // async login(loginDto: CreateAuthInput): Promise<AuthPayload> {
  //   const { username, password } = loginDto;
  //   const user = await this.userService.findOneByUsername(username);

  //   if (!user || !(await bcrypt.compare(password, user.password))) {
  //     throw new UnauthorizedException('Invalid credentials');
  //   }

  //   // Tạo mã OTP và lưu vào database
  //   const otp = this.generateOTP();
  //   const newUser: UpdateUserInput = {
  //     ...user,
  //     otpCode: otp,
  //     roleId: user.role.id,
  //   };
  //   let message: string = `Your OTP code is: ${otp} (Valid for 1 minute)`;
  //   const subject = 'OTP Login Authentication';
  //   newUser.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP hết hạn sau 5 phút

  //   const updatedUser = await this.userService.updateUser(user.id, newUser);
  //   // console.log('Updated user:', updatedUser);

  //   const createNotificationDto: CreateNotificationInput = {
  //     userId: user.id,
  //     title: subject,
  //     content: message,
  //     type: 'email',
  //     isRead: 'unread',
  //   };

  //   const notification = this.notificationService.create(createNotificationDto);
  //   // await this.emailService.sendNotification(user.email, subject, message);
  //   return { token: otp };
  // }

  async login(loginDto: CreateAuthInput): Promise<AuthPayload> {
    const { username, password } = loginDto;
    const user = await this.userService.findOneByUsername(username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      token: this.jwtService.sign({ id: user.id, role: user.role.id }),
    };
  }

  async verifyLogin(otp: string): Promise<AuthPayload> {
    const user = await this.userService.findOneByOtp(otp);

    if (!user || new Date() > user.otpExpiresAt) {
      throw new UnauthorizedException('OTP code is invalid or expired');
    }

    user.status = 'active'; // Đặt trạng thái người dùng thành 'active'
    await this.userService.updateUser(user.id, user);

    return {
      token: this.jwtService.sign({ id: user.id, role: user.role.id }),
    };
  }

  // Phương thức này được dùng để đổi password trước khi đăng nhập
  async requestResetPassword(email: string): Promise<AuthPayload> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email not found');
    }

    const otp = this.generateOTP();
    let message: string = `Your OTP code is: ${otp} (Valid for 5 minute)`;
    const subject = 'OTP Login Authentication';

    const newUser: UpdateUserInput = {
      ...user,
      otpCode: otp,
      otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000), // OTP hết hạn sau 5 phút
    };

    const updatedUser = await this.userService.updateUser(user.id, newUser);

    const createNotificationDto: CreateNotificationInput = {
      userId: user.id,
      title: subject,
      content: message,
      type: 'email',
      isRead: 'unread',
    };
    const notification = this.notificationService.create(createNotificationDto);
    return { token: otp };
  }

  async verifyChangePassword(
    otp: string,
    newPassword: string,
  ): Promise<AuthPayload> {
    const user = await this.userService.findOneByOtp(otp);

    if (!user || new Date() > user.otpExpiresAt) {
      throw new UnauthorizedException('OTP code is invalid or expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updateUser: UpdateUserInput = {
      id: user.id,
      password: hashedPassword,
    };
    const result = await this.userService.updateUser(user.id, updateUser);
    const token = await this.login({
      username: user.username,
      password: newPassword,
    })
      .then((res) => res.token)
      .catch((err) => {
        throw new UnauthorizedException('Invalid credentials');
      });
    return { token };
  }
}
