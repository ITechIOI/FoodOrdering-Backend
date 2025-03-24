import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { PaymentService } from './payment.service';
import { Payment } from '../../entities/payment.entity';
import { CreatePaymentInput } from './dto/create-payment.input';
import { UpdatePaymentInput } from './dto/update-payment.input';

@Resolver(() => Payment)
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  @Mutation(() => String)
  async createPaypalOrder(
    @Args('createPaymentInput') createPaymentInput: CreatePaymentInput,
  ): Promise<string> {
    const order = await this.paymentService.createPayment(createPaymentInput);

    const approvalUrl = order.links.find(
      (link) => link.rel === 'approve',
    )?.href;

    return approvalUrl; // Gửi URL này về frontend để redirect
  }

  @Mutation(() => Boolean)
  async capturePaypalOrder(@Args('orderId') orderId: string): Promise<boolean> {
    const result = await this.paymentService.captureOrder(orderId);
    return result.status === 'COMPLETED';
  }

  @Query(() => [Payment], { name: 'payment' })
  findAll() {
    return this.paymentService.findAll();
  }

  @Query(() => Payment, { name: 'payment' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.paymentService.findOne(id);
  }

  @Mutation(() => Payment)
  updatePayment(
    @Args('updatePaymentInput') updatePaymentInput: UpdatePaymentInput,
  ) {
    return this.paymentService.update(
      updatePaymentInput.id,
      updatePaymentInput,
    );
  }

  @Mutation(() => Payment)
  removePayment(@Args('id', { type: () => Int }) id: number) {
    return this.paymentService.remove(id);
  }
}
