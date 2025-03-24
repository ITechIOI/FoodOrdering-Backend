import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderResolver } from './order.resolver';

@Module({
  providers: [OrderResolver, OrderService],
  exports: [OrderService],
})
export class OrderModule {}
