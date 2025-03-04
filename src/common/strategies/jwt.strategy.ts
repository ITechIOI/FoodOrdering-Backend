import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    // console.log('JWT_SECRET:', jwtSecret);
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret, // Lấy từ .env
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, userRole: payload.roleId };
  }

  // async validate(payload: any) {
  //   return {
  //     userId: payload.sub,
  //     userRole: payload.roleId,
  //     email: payload.email,
  //   };
  // }
}
