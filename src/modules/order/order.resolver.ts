import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { OrderService } from './order.service';
import { Order } from '../../entities/order.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderInput } from './dto/update-order.input';
import { createPaginatedType } from 'src/utils/paginated';

const PaginatedOrder = createPaginatedType(Order, 'PaginatedOrder');

@Resolver(() => Order)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  // KHởi tạo đơn hàng thì totalPrice = shippingFree
  @Mutation(() => Order)
  async createOrder(
    @Args('createOrderInput') createOrderInput: CreateOrderInput,
  ) {
    return await this.orderService.create(createOrderInput);
  }

  @Query(() => PaginatedOrder)
  async findAllOrders(
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return await this.orderService.findAll(page, limit);
  }

  @Query(() => Order)
  async findOrderById(@Args('id', { type: () => Int }) id: number) {
    return await this.orderService.findOne(id);
  }

  @Query(() => PaginatedOrder)
  async findOrderByUserId(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('page', { type: () => Int, nullable: true }) page: number,
    @Args('limit', { type: () => Int, nullable: true }) limit: number,
  ) {
    return await this.orderService.findByUserId(userId, page, limit);
  }

  @Query(() => PaginatedOrder)
  async findOrdersByRestaurantId(
    @Args('restaurantId', { type: () => Int }) restaurantId: number,
    @Args('page', { type: () => Int, nullable: true }) page: number,
    @Args('limit', { type: () => Int, nullable: true }) limit,
  ) {
    return await this.orderService.findByUserId(restaurantId, page, limit);
  }

  // Không cho phép update userId, restaurantId, discountId, và addressId
  // Nếu muốn update địa chỉ của đơn hàng thì chỉ được phép update nội dung của địa chỉ trong đối tượng address
  @Mutation(() => Order)
  async updateOrder(
    @Args('updateOrderInput') updateOrderInput: UpdateOrderInput,
  ) {
    return await this.orderService.update(
      updateOrderInput.id,
      updateOrderInput,
    );
  }

  @Mutation(() => Order)
  async removeOrder(@Args('id', { type: () => Int }) id: number) {
    return await this.orderService.remove(id);
  }
}
