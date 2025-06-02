import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderResolver } from './order.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/entities/order.entity';
import { DiscountModule } from '../discount/discount.module';
import { UsersModule } from '../users/users.module';
import { AddressModule } from '../address/address.module';
import { RestaurantModule } from '../restaurant/restaurant.module';
import { NotificationModule } from '../notification/notification.module';
import { RolesModule } from '../roles/roles.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from 'src/common/guards/auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    DiscountModule,
    UsersModule,
    RolesModule,
    JwtModule,
    AddressModule,
    RestaurantModule,
    NotificationModule, // Assuming NotificationModule is defined elsewhere
  ],
  providers: [OrderResolver, OrderService, AuthGuard],
  exports: [OrderService],
})
export class OrderModule {}
