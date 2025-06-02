import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryResolver } from './category.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Restaurant } from 'src/entities/restaurant.entity';
import { RestaurantModule } from '../restaurant/restaurant.module';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    RestaurantModule,
    UsersModule,
    JwtModule,
    RolesModule,
  ],
  providers: [CategoryResolver, CategoryService, AuthGuard],
  exports: [CategoryService],
})
export class CategoryModule {}
