import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PaymentService } from './payment.service';
import { Payment } from '../../entities/payment.entity';
import { CreatePaymentInput } from './dto/create-payment.input';
import { UpdatePaymentInput } from './dto/update-payment.input';

@Resolver(() => Payment)
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  // Phương thức này dùng để tạo thanh toán trên paypal
  @Mutation(() => String)
  async createPaypalOrder(
    @Args('createPaymentInput') createPaymentInput: CreatePaymentInput,
  ): Promise<string> {
    const order = await this.paymentService.createPayment(createPaymentInput);

    const approvalUrl = order.links.find(
      (link) => link.rel === 'approve',
    )?.href;
    // console.log('Approval URL: ', approvalUrl);
    return approvalUrl; // Gửi URL này về frontend để redirect
  }

  @Mutation(() => Boolean)
  async capturePaypalOrder(@Args('orderId') orderId: string): Promise<boolean> {
    const result = await this.paymentService.captureOrder(orderId);
    return result.status === 'completed';
  }

  @Query(() => [Payment], { name: 'payment' })
  async findAll() {
    return await this.paymentService.findAll();
  }

  @Query(() => Payment, { name: 'payment' })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return await this.paymentService.findOne(id);
  }

  @Mutation(() => Payment)
  async updatePayment(
    @Args('updatePaymentInput') updatePaymentInput: UpdatePaymentInput,
  ) {
    return await this.paymentService.update(
      updatePaymentInput.id,
      updatePaymentInput,
    );
  }

  @Mutation(() => Payment)
  async removePayment(@Args('id', { type: () => Int }) id: number) {
    return await this.paymentService.remove(id);
  }
}
