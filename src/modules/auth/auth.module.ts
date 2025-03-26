import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UsersModule } from '../users/users.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from 'src/common/strategies/jwt.strategy';
import { EmailService } from 'src/common/services/notification/email.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '60m'), // Giá trị mặc định là '60m'
        },
      }),
    }),
    NotificationModule,
  ],
  providers: [AuthResolver, AuthService, EmailService],
  exports: [AuthService],
})
export class AuthModule {}
