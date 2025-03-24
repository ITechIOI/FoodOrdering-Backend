import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentResolver } from './payment.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from 'src/entities/payment.entity';
import { ConfigService } from '@nestjs/config';
import { PaymentController } from './payment.controller';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), OrderModule],
  providers: [PaymentResolver, PaymentService, ConfigService],
  controllers: [PaymentController],
})
export class PaymentModule {}
