import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateOrderDetailInput {
  @Field(() => Int, { nullable: true })
  quantity: number;

  @Field(() => String, { nullable: true })
  note: string;

  @Field(() => Int, { nullable: true })
  orderId: number;

  @Field(() => Int, { nullable: true })
  menuId: number;
}
