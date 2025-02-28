import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

// Sử dụng AuthGuard thay vì JwtAuthGuard để bảo vệ các route
// Vì JwtAuthGuard chỉ bảo vệ các route sử dụng Passport
// mà Passport không hỗ trợ mặc định GraphQL mà phải custom lai
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private readonly configureService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let request: Request;
    console.log('AuthGuard');

    // ✅ Kiểm tra nếu là GraphQL request
    // if (context.getType() === 'http') {
    //   request = context.switchToHttp().getRequest();
    // } else {
    //   const ctx = GqlExecutionContext.create(context);
    //   request = ctx.getContext().req;
    // }

    const ctx = GqlExecutionContext.create(context);
    request = ctx.getContext().req;

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configureService.get<string>('JWT_SECRET'),
      });

      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
