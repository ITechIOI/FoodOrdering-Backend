import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { OrderDetailsService } from './order_details.service';
import { OrderDetail } from '../../entities/order_detail.entity';
import { CreateOrderDetailInput } from './dto/create-order_detail.input';
import { UpdateOrderDetailInput } from './dto/update-order_detail.input';
import { create } from 'domain';
import { createPaginatedType } from 'src/utils/paginated';

const PaginatedOrderDetails = createPaginatedType(
  OrderDetail,
  'PaginatedOrderDetails',
);

@Resolver(() => OrderDetail)
export class OrderDetailsResolver {
  constructor(private readonly orderDetailsService: OrderDetailsService) {}

  @Mutation(() => OrderDetail)
  async createOrderDetail(
    @Args('createOrderDetailInput')
    createOrderDetailInput: CreateOrderDetailInput,
  ) {
    return await this.orderDetailsService.create(createOrderDetailInput);
  }

  @Query(() => PaginatedOrderDetails)
  async findAllOrderDetails(
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    return await this.orderDetailsService.findAll(page, limit);
  }

  @Query(() => OrderDetail)
  async findOneDetailById(@Args('id', { type: () => Int }) id: number) {
    return await this.orderDetailsService.findOne(id);
  }

  @Query(() => [OrderDetail])
  async findOrderDetailByOrderId(
    @Args('orderId', { type: () => Int }) orderId: number,
  ) {
    return await this.orderDetailsService.findOneByOrderId(orderId);
  }

  // Không cho phép update menuId và orderId
  @Mutation(() => OrderDetail)
  async updateOrderDetail(
    @Args('updateOrderDetailInput')
    updateOrderDetailInput: UpdateOrderDetailInput,
  ) {
    return await this.orderDetailsService.update(
      updateOrderDetailInput.id,
      updateOrderDetailInput,
    );
  }

  @Mutation(() => OrderDetail)
  async removeOrderDetail(@Args('id', { type: () => Int }) id: number) {
    return await this.orderDetailsService.remove(id);
  }
}
