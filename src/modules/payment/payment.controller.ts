import {
  Controller,
  Get,
  InternalServerErrorException,
  Query,
  Res,
} from '@nestjs/common';
import { join } from 'path';
import { PaymentService } from './payment.service';
import { Response } from 'express';
import { UpdatePaymentInput } from './dto/update-payment.input';

@Controller('payment')
export class PaymentController {
  private readonly paymentService: PaymentService;

  constructor(paymentService: PaymentService) {
    this.paymentService = paymentService;
  }

  @Get('success')
  async handleSuccessRedirect(
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    console.log('🔍 PayPal Redirect Success:', token);

    const payment = await this.paymentService.findOneByTransactionId(token);
    if (!payment) {
      throw new Error('Payment not found');
    }
    const updatePayment: UpdatePaymentInput = {
      id: payment.id,
      status: 'completed',
    };

    if (!(await this.paymentService.update(payment.id, updatePayment))) {
      throw new InternalServerErrorException('Update payment failed');
    }

    const result = await this.paymentService.captureOrder(token);

    return res.sendFile(
      join(process.cwd(), 'src/modules/payment/templates/payment_success.html'),
    );
  }

  @Get('cancel')
  handleCancel(@Res() res: Response) {
    return res.sendFile(
      join(process.cwd(), 'src/modules/payment/templates/payment_error.html'),
    );
  }
}
