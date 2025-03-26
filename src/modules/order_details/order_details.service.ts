import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDetailInput } from './dto/create-order_detail.input';
import { UpdateOrderDetailInput } from './dto/update-order_detail.input';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDetail } from 'src/entities/order_detail.entity';
import { Repository } from 'typeorm';
import { OrderService } from '../order/order.service';
import { MenuService } from '../menu/menu.service';
import { UpdateMenuInput } from '../menu/dto/update-menu.input';
import { UpdateOrderInput } from '../order/dto/update-order.input';

@Injectable()
export class OrderDetailsService {
  constructor(
    @InjectRepository(OrderDetail)
    private readonly orderDetailRepository: Repository<OrderDetail>,
    private readonly orderService: OrderService,
    private readonly menuService: MenuService,
  ) {}

  async create(
    createOrderDetailInput: CreateOrderDetailInput,
  ): Promise<OrderDetail> {
    const menu = await this.menuService.findOne(createOrderDetailInput.menuId);
    if (!menu) {
      throw new NotFoundException('Menu is not found');
    }

    const order = await this.orderService.findOne(
      createOrderDetailInput.orderId,
    );
    if (!order) {
      throw new NotFoundException('Order is not found');
    }
    const result = await this.orderDetailRepository.save({
      ...createOrderDetailInput,
      menu,
      order,
    });

    // Cập nhật tồn kho của món ăn
    menu.quantity = menu.quantity - createOrderDetailInput.quantity;
    const updateMenuDto = UpdateMenuInput.fromEntity(menu);
    await this.menuService.update(menu.id, updateMenuDto);

    // Cập nhật tổng tiền của đơn hàng
    order.totalPrice =
      order.totalPrice + menu.price * createOrderDetailInput.quantity;
    const updateOrderDto = UpdateOrderInput.fromEntity(order);
    await this.orderService.update(order.id, updateOrderDto);

    return result;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ total: number; data: OrderDetail[] }> {
    const [data, total] = await this.orderDetailRepository
      .createQueryBuilder('orderDetails')
      .leftJoinAndSelect('orderDetails.order', 'order')
      .where('order.deletedAt is null')
      .andWhere('orderDetails.deletedAt is null')
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();

    if (data.length === 0) {
      throw new NotFoundException(`Detail not found`);
    }
    return { total, data };
  }

  async findOne(id: number): Promise<OrderDetail> {
    const detail = await this.orderDetailRepository
      .createQueryBuilder('detail')
      .leftJoinAndSelect('detail.menu', 'menu')
      .leftJoinAndSelect('detail.order', 'order')
      .where('detail.id = :id', { id })
      .where('detail.id = :id', { id })
      .andWhere('order.deletedAt is null')
      .andWhere('detail.deletedAt is null')
      .getOne();
    if (!detail) {
      throw new NotFoundException(`Detail not found`);
    }
    return detail;
  }

  async findOneByOrderId(orderId: number): Promise<OrderDetail[]> {
    const details = await this.orderDetailRepository
      .createQueryBuilder('detail')
      .where('detail.orderId = :orderId', { orderId })
      .andWhere('detail.deletedAt is null')
      .getMany();
    if (!details) {
      throw new NotFoundException(`Detail not found`);
    }
    return details;
  }

  async update(
    id: number,
    updateOrderDetailInput: UpdateOrderDetailInput,
  ): Promise<OrderDetail> {
    const detail = await this.findOne(id);
    const newDetail = await this.orderDetailRepository.save({
      ...detail,
      ...updateOrderDetailInput,
    });

    // Cập nhật tồn kho của món ăn và tổng tiền của đơn hàng
    if (updateOrderDetailInput.quantity) {
      const menu = await this.menuService.findOne(detail.menu.id);
      const order = await this.orderService.findOne(detail.order.id);

      const oldQuantity = detail.quantity;
      const newQuantity = updateOrderDetailInput.quantity;
      const diff = newQuantity - oldQuantity;
      menu.quantity = menu.quantity + diff;
      const updateMenuDto = UpdateMenuInput.fromEntity(menu);
      await this.menuService.update(menu.id, updateMenuDto);

      order.totalPrice = order.totalPrice + diff * menu.price;
      const updateOrderDto = UpdateOrderInput.fromEntity(order);
      await this.orderService.update(order.id, updateOrderDto);
    }
    return newDetail;
  }

  async remove(id: number): Promise<OrderDetail> {
    const detail = await this.findOne(id);
    const deleteDetail = await this.orderDetailRepository.save({
      ...detail,
      deletedAt: new Date(),
    });

    // Cập nhật tồn kho của món ăn và tổng tiền của đơn hàng
    const menu = await this.menuService.findOne(detail.menu.id);
    const order = await this.orderService.findOne(detail.order.id);
    menu.quantity = menu.quantity + detail.quantity;
    const updateMenuDto = UpdateMenuInput.fromEntity(menu);
    await this.menuService.update(menu.id, updateMenuDto);

    order.totalPrice = order.totalPrice - detail.quantity * menu.price;
    const updateOrderDto = UpdateOrderInput.fromEntity(order);
    await this.orderService.update(order.id, updateOrderDto);

    return deleteDetail;
  }
}
