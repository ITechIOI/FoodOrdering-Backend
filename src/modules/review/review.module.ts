import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewResolver } from './review.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from 'src/entities/review.entity';
import { OrderModule } from '../order/order.module';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { RolesModule } from '../roles/roles.module';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review]),
    OrderModule,
    UsersModule,
    JwtModule,
    RolesModule,
  ],
  providers: [ReviewResolver, ReviewService, AuthGuard],
  exports: [ReviewService],
})
export class ReviewModule {}
