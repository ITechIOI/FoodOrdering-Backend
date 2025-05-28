import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuResolver } from './menu.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Menu } from 'src/entities/menu.entity';
import { CategoryModule } from '../category/category.module';
import { CacheService } from 'src/common/cache/cache.service';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Menu]), CategoryModule, RolesModule, UsersModule, JwtModule],
  providers: [MenuResolver, MenuService, CacheService, AuthGuard],
  exports: [MenuService],
})
export class MenuModule {}
