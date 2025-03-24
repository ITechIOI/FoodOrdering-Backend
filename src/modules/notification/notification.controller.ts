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

  @EventPattern('otp_authentication')
  async handleOrderCreated(@Payload() message: any, @Ctx() ctx: RmqContext) {
    console.log('Send.otp');
    const routingKey = ctx.getMessage().fields.routingKey;
    console.log('📩 Routing key:', routingKey);
    // console.log('📩 Routing key:', ctx);
    console.log('📩 Message:', message);
  }

  // @EventPattern({
  //   exchange: 'notification_exchange',
  //   routingKey: 'order.success',
  // })
  // async handleOrderSuccess(@Payload() message: any, @Ctx() ctx: RmqContext) {
  //   console.log('order.success');
  //   // const routingKey = ctx.getMessage().fields.routingKey;
  //   // console.log('📩 Routing key:', routingKey);
  //   console.log('📩 Message:', message);
  // }

  // @EventPattern({
  //   exchange: 'notification_exchange',
  //   routingKey: 'order.status.update',
  // })
  // async handleOrderStatusUpdate(
  //   @Payload() message: any,
  //   @Ctx() ctx: RmqContext,
  // ) {
  //   console.log('order.status.update');
  //   // const routingKey = ctx.getMessage().fields.routingKey;
  //   // console.log('📩 Routing key:', routingKey);
  //   console.log('📩 Message:', message);
}
