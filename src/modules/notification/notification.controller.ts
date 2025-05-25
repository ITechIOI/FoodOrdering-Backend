import { Controller } from '@nestjs/common';
import { NotificationService } from './notification.service';
import {
  EventPattern,
  Payload,
  Ctx,
  RmqContext,
  MessagePattern,
} from '@nestjs/microservices';
import { CreateNotificationInput } from './dto/create-notification.input';
import axios from 'axios';
import { Mutation } from '@nestjs/graphql';
import { PushService } from './strategy/push.service';
import { Notification } from 'src/entities/notification.entity';

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
  async handlePaymentCompleted(
    @Payload() message: any,
    @Ctx() ctx: RmqContext,
  ) {
    const subject = 'Thanh toán thành công';
    const content = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Thông tin thanh toán</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.5;">
            <h3>✅ Thanh toán thành công!</h3>
            <p>Xin chào thực khách,</p>
            <p>Bạn đã thanh toán thành công đơn hàng <strong>${message.id}</strong> tại <strong>FoodieGO</strong>.</p>
            <p><strong>Tổng tiền:</strong> {{${message.totalPrice}}} VND</p>
            <p>Cảm ơn bạn đã ủng hộ! Chúc bạn ngon miệng. 🍽️</p>
            <p>📞 Hỗ trợ: +84 456 334 7886</p>
        </body>
        </html>   
    `;

    const createNotification: CreateNotificationInput = {
      userId: message.userId,
      title: subject,
      content: 'Thông báo thanh toán đơn hàng thành công',
      type: 'email',
      isRead: 'unread',
    };
    await this.notificationService.create(createNotification);

    console.log('Payment', message);
  }

  @EventPattern('push_notification')
  async handlePushNotification(
    @Payload() data: [string, object, { headers: object }],
  ) {
    try {
      const [url, message, headers] = data;

      console.log('📨 Nhận dữ liệu từ RabbitMQ:', { url, message, headers });

      // Gửi request đến FCM
      // const response = await axios.post(url, message, headers);
      // console.log('📨 Đã gửi thông báo đến FCM:', response.data);
    } catch (error) {
      throw new Error('Error push notification');
    }
  }
}
