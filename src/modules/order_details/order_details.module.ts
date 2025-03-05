import { Module } from '@nestjs/common';
import { OrderDetailsService } from './order_details.service';
import { OrderDetailsResolver } from './order_details.resolver';

@Module({
  providers: [OrderDetailsResolver, OrderDetailsService],
})
export class OrderDetailsModule {}
