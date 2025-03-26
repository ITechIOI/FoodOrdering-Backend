import { Controller } from '@nestjs/common';
import { NotificationService } from './notification.service';
import {
  EventPattern,
  Payload,
  Ctx,
  RmqContext,
  MessagePattern,
} from '@nestjs/microservices';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern('otp')
  async handleOrderCreatedV2(@Payload() message: any, @Ctx() ctx: RmqContext) {
    console.log('otp');
    const routingKey = ctx.getMessage().fields.routingKey;
    console.log('📩 Routing key:', routingKey);
    // console.log('📩 Routing key:', ctx);
    console.log('📩 Message:', message);
  }

  @EventPattern('payment_completed')
  async handlePaymentCompleted(@Payload() message: any, @Ctx() ctx: RmqContext) {
    console.log('payment_completed');
    const routingKey = ctx.getMessage().fields.routingKey;
    console.log('📩 Routing key:', routingKey);
    // console.log('📩 Routing key:', ctx);
    console.log('📩 Message:', message);
  }
}
