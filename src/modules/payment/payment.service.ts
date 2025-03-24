import { Injectable } from '@nestjs/common';
import { CreatePaymentInput } from './dto/create-payment.input';
import { UpdatePaymentInput } from './dto/update-payment.input';
import { ConfigService } from '@nestjs/config';
import { Payment } from 'src/entities/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Order } from 'src/entities/order.entity';
import { OrderService } from '../order/order.service';

@Injectable()
export class PaymentService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly apiUrl: string;
  private readonly successUrl: string;
  private readonly cancelUrl: string;
  private readonly orderService: OrderService;
  @InjectRepository(Payment)
  private readonly paymentRepository: Repository<Payment>;

  constructor(private readonly config: ConfigService) {
    this.clientId = config.get('PAYPAL_CLIENT_ID') || '';
    this.clientSecret = config.get('PAYPAL_CLIENT_SECRET') || '';
    this.apiUrl = config.get('PAYPAL_API') || '';
    this.successUrl = config.get('PAYPAL_SUCCESS_URL') || '';
    this.cancelUrl = config.get('PAYPAL_CANCEL_URL') || '';
  }

  private async getAccessToken(): Promise<string> {
    const response = await axios.post(
      `${this.apiUrl}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        auth: {
          username: this.clientId,
          password: this.clientSecret,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    return response.data.access_token;
  }

  async createPayment(createPaymentDto: CreatePaymentInput) {
    const token = await this.getAccessToken();
    const amount = createPaymentDto.amount;
    const response = await axios.post(
      `${this.apiUrl}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: amount,
            },
          },
        ],
        application_context: {
          return_url: this.successUrl,
          cancel_url: this.cancelUrl,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    // const order = await this.orderService.findOne(createPaymentDto.orderId);

    //   const newPayment = this.paymentRepository.create({
    //     transactionId: response.data.id,
    //     paymentMethod: 'paypal',
    //     order: order,
    //     amount: amount,
    //     status: 'pending',
    //   });

    return response.data;
  }

  async captureOrder(orderId: string) {
    const token = await this.getAccessToken();
    const response = await axios.post(
      `${this.apiUrl}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  }

  async findOneByTransactionId(transactionId: string): Promise<Payment> {
    return this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.transactionId = :transactionId', { transactionId })
      .where('payment.status = :status', { status: 'pending' })
      .where('payment.deletedAt IS NULL')
      .getOneOrFail();
  }

  findAll() {
    return `This action returns all payment`;
  }

  async findOne(id: number): Promise<Payment> {
    return this.paymentRepository
      .createQueryBuilder('payment')
      .where('payment.id = :id', { id })
      .where('payment.deletedAt IS NULL')
      .getOneOrFail();
  }

  async update(id: number, updatePaymentInput: UpdatePaymentInput) {
    const payment = await this.findOne(id);
    const updatePayment = this.paymentRepository.create({
      ...payment,
      ...updatePaymentInput,
    });
    return this.paymentRepository.save(payment);
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
