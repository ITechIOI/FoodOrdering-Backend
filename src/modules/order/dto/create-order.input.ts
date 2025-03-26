import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateOrderInput {
  @Field(() => Int, { nullable: true })
  totalPrice: number;

  @Field(() => String, { nullable: true })
  status: string;

  @Field(() => Int, { nullable: true })
  shippingFee: number;

  @Field(() => Int, { nullable: true })
  userId: number;

  @Field(() => Int, { nullable: true })
  restaurantId: number;

  @Field(() => Int, { nullable: true })
  discountId: number;

  @Field(() => Int, { nullable: true })
  addressId: number;
}
