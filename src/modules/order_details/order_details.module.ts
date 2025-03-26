import { Module } from '@nestjs/common';
import { OrderDetailsService } from './order_details.service';
import { OrderDetailsResolver } from './order_details.resolver';
import { OrderDetail } from 'src/entities/order_detail.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderModule } from '../order/order.module';
import { MenuModule } from '../menu/menu.module';

@Module({
  imports: [TypeOrmModule.forFeature([OrderDetail]), OrderModule, MenuModule],
  providers: [OrderDetailsResolver, OrderDetailsService],
  exports: [OrderDetailsService],
})
export class OrderDetailsModule {}
