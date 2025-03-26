import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderResolver } from './order.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/entities/order.entity';
import { DiscountModule } from '../discount/discount.module';
import { UsersModule } from '../users/users.module';
import { AddressModule } from '../address/address.module';
import { RestaurantModule } from '../restaurant/restaurant.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    DiscountModule,
    UsersModule,
    AddressModule,
    RestaurantModule,
  ],
  providers: [OrderResolver, OrderService],
  exports: [OrderService],
})
export class OrderModule {}
