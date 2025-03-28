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

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    @Inject('PAYMENT_SERVICE') private rabbitClient: ClientRMQ,
  ) {}

  @Get('success')
  async handleSuccessRedirect(
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    const payment = await this.paymentService.findOneByTransactionId(token);
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

    return res.sendFile(
      join(process.cwd(), 'src/modules/payment/templates/payment_success.html'),
    );
  }

  // @Get('test')
  // handleTest() {
  //   this.rabbitClient.emit('payment_completed', 'test');
  //   return 'test';
  // }

  @Get('cancel')
  handleCancel(@Res() res: Response) {
    return res.sendFile(
      join(process.cwd(), 'src/modules/payment/templates/payment_error.html'),
    );
  }
}
