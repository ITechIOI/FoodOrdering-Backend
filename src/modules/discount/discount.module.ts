import { Module } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { DiscountResolver } from './discount.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Discount } from 'src/entities/discount.entity';
import { JwtModule } from '@nestjs/jwt';
import { RolesModule } from '../roles/roles.module';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Discount]),
    JwtModule,
    RolesModule,
    UsersModule,
  ],
  providers: [DiscountResolver, DiscountService, AuthGuard],
  exports: [DiscountService],
})
export class DiscountModule {}
