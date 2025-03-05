import { Injectable } from '@nestjs/common';
import { CreateOrderDetailInput } from './dto/create-order_detail.input';
import { UpdateOrderDetailInput } from './dto/update-order_detail.input';

@Injectable()
export class OrderDetailsService {
  create(createOrderDetailInput: CreateOrderDetailInput) {
    return 'This action adds a new orderDetail';
  }

  findAll() {
    return `This action returns all orderDetails`;
  }

  findOne(id: number) {
    return `This action returns a #${id} orderDetail`;
  }

  update(id: number, updateOrderDetailInput: UpdateOrderDetailInput) {
    return `This action updates a #${id} orderDetail`;
  }

  remove(id: number) {
    return `This action removes a #${id} orderDetail`;
  }
}
