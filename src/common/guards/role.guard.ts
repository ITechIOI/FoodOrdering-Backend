import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { RolesService } from 'src/modules/roles/roles.service';
import { UsersService } from 'src/modules/users/users.service';
import { ROLES_KEY } from '../decorators/role.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private roleService: RolesService,
    private userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!Array.isArray(requiredRoles) || requiredRoles.length === 0) {
      return true; // Không yêu cầu role → Cho phép truy cập
    }

    // ✅ Sử dụng GqlExecutionContext để hỗ trợ GraphQL
    const ctx = GqlExecutionContext.create(context);
    const { user } = ctx.getContext().req;

    if (!user) {
      Logger.warn('User not authenticated');
      return false;
    }

    console.log('User Log in', user);

    // // ✅ Lấy danh sách role từ database
    // const allRoles = await this.roleService.findAllNameRole(); // Phương thức này trả về danh sách tất cả các role
    // const validRoles = allRoles.map(role => role.name.toLowerCase());

    // // ✅ Kiểm tra xem role trong metadata có hợp lệ không
    // const invalidRoles = requiredRoles.filter(
    //   (role) => !validRoles.includes(role.trim().toLowerCase())
    // );

    // if (invalidRoles.length > 0) {
    //   throw new BadRequestException(`Invalid roles: ${invalidRoles.join(", ")}`);
    // }

    let roleString;
    const userLogin = await this.userService.findOneById(user.userId);

    if (!userLogin) {
      throw new NotFoundException('User not found');
    } else {
      roleString = userLogin.role.name;
    }

    const allow = requiredRoles.some(
      (role) => role.trim().toLowerCase() === roleString.trim().toLowerCase(),
    );

    Logger.log(`Allow user to login the system: ${allow}`);
    return allow;
  }
}
