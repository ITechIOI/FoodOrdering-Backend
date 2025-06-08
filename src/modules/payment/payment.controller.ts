import {
  Controller,
  Get,
  Inject,
  InternalServerErrorException,
  Query,
  Res,
} from '@nestjs/common';
import { join } from 'path';
import { PaymentService } from './payment.service';
import { Response } from 'express';
import { UpdatePaymentInput } from './dto/update-payment.input';
import { ClientRMQ } from '@nestjs/microservices';
import { NotificationService } from '../notification/notification.service';
import { CreateNotificationInput } from '../notification/dto/create-notification.input';
import { UsersService } from '../users/users.service';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    @Inject('PAYMENT_SERVICE') private rabbitClient: ClientRMQ,

    private readonly notificationService: NotificationService,
    private readonly userService: UsersService,
  ) {}

  @Get('success')
  async handleSuccessRedirect(
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    const payment = await this.paymentService.findOneByTransactionId(token);
    console.log('Payment: ', payment);

    if (!payment) {
      throw new Error('Payment not found');
    }
    const updatePayment: UpdatePaymentInput = {
      id: payment.id,
      status: 'completed',
    };
    const paymentStatus = await this.paymentService.update(
      payment.id,
      updatePayment,
    );

    if (!paymentStatus) {
      throw new InternalServerErrorException('Update payment failed');
    }

    this.rabbitClient.emit('payment_completed', payment.order);

    const unpaid = await this.paymentService.findUnpaidPaymentByOrderId(
      payment.order.id,
    );
    if (unpaid.length !== 0) {
      for (let i = 0; i < unpaid.length; i++) {
        // delete all
        await this.paymentService.remove(unpaid[i].id);
      }
    }

    const result = await this.paymentService.captureOrder(token);

    const notification: CreateNotificationInput = {
      userId: payment.order.user.id,
      title: 'Thanh toán thành công',
      content: `Thanh toán cho đơn hàng #${payment.order.id} của bạn đã được hoàn tất.`,
      type: 'push',
      isRead: 'unread',
    };

    console.log('Payment result: ', notification);

    await this.notificationService.create(notification);

    // return res.sendFile(
    //   join(process.cwd(), 'src/modules/payment/templates/payment_success.html'),
    // );
    return res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      orderId: payment.order.id,
    });
  }

  // @Get('test')
  // handleTest() {
  //   this.rabbitClient.emit('payment_completed', 'test');
  //   return 'test';
  // }

  @Get('cancel')
  async handleCancel(@Query('token') token: string, @Res() res: Response) {
    const payment = await this.paymentService.findOneByTransactionId(token);
    if (!payment) {
      throw new Error('Payment not found');
    }
    // return res.sendFile(
    //   join(process.cwd(), 'src/modules/payment/templates/payment_error.html'),
    // );
    const notification: CreateNotificationInput = {
      userId: payment.order.user.id,
      title: 'Thanh toán bị hủy',
      content: `Thanh toán cho đơn hàng #${payment.order.id} của bạn đã bị hủy.`,
      type: 'push',
      isRead: 'unread',
    };

    await this.notificationService.create(notification);

    return res.status(200).json({
      success: false,
      message: 'Payment canceled',
      orderId: payment.order.id,
    });
  }
}
