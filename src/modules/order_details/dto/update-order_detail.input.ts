import { CreateOrderDetailInput } from './create-order_detail.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateOrderDetailInput extends PartialType(CreateOrderDetailInput) {
  @Field(() => Int)
  id: number;
}
