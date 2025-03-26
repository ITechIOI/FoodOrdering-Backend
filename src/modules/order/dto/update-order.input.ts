import { Order } from 'src/entities/order.entity';
import { CreateOrderInput } from './create-order.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateOrderInput extends PartialType(CreateOrderInput) {
  @Field(() => Int)
  id: number;

  static fromEntity(order: Order): UpdateOrderInput {
    const input = new UpdateOrderInput();
    input.id = order.id;
    input.status = order.status;
    input.totalPrice = order.totalPrice;
    input.userId = order.user.id;
    input.shippingFee = order.shippingFee;
    input.discountId = order.discount.id;
    input.restaurantId = order.restaurant.id;
    input.addressId = order.address.id;
    return input;
  }
}
