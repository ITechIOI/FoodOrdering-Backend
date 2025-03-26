import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreatePaymentInput {
  // @Field(() => String)
  // transactionId: string;

  @Field(() => String)
  paymentMethod: string;

  @Field(() => Int)
  orderId: number;

  // @Field(() => Int)
  // amount: number;

  @Field(() => String)
  status: string;
}
