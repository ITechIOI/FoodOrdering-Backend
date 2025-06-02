import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderInput } from './dto/update-order.input';
import { Order } from 'src/entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { RestaurantService } from '../restaurant/restaurant.service';
import { DiscountService } from '../discount/discount.service';
import { AddressService } from '../address/address.service';
import { RevenueByYear } from './dto/output/RevenueByYear';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly userService: UsersService,
    private readonly restaurantService: RestaurantService,
    private readonly discountService: DiscountService,
    private readonly addressService: AddressService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(createOrderInput: CreateOrderInput): Promise<Order> {
    const user = await this.userService.findOneById(createOrderInput.userId);
    if (!user) {
      throw new NotFoundException(
        `User with ID ${createOrderInput.userId} not found`,
      );
    }
    const restaurant = await this.restaurantService.findOne(
      createOrderInput.restaurantId,
    );
    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with ID ${createOrderInput.restaurantId} not found`,
      );
    }
    const address = await this.addressService.findOneAddress(
      createOrderInput.addressId,
    );
    if (!address) {
      throw new NotFoundException(
        `Address with ID ${createOrderInput.addressId} not found`,
      );
    }

    let order = this.orderRepository.create({
      ...createOrderInput,
      user,
      restaurant,
      address,
    });

    // Tính toán totalPrice riêng
    if (createOrderInput.discountId) {
      const discount = await this.discountService.findOneById(
        createOrderInput.discountId,
      );
      if (!discount || discount.endTime < new Date()) {
        throw new NotFoundException(
          `Discount with ID ${createOrderInput.discountId} not found`,
        );
      }
      order.discount = discount;
      order.totalPrice = createOrderInput.shippingFee - discount.percentage;
      if (order.totalPrice < 0) order.totalPrice = 0;
    } else {
      order.totalPrice = createOrderInput.shippingFee;
    }

    const newOrder = await this.orderRepository.save(order);

    await this.notificationService.create({
      userId: restaurant.owner.id,
      title: `🛎 Đơn hàng mới từ ${restaurant.name}`,
      content: `Bạn vừa nhận một đơn hàng mới trị giá ${newOrder.totalPrice}₫. Hãy kiểm tra ngay!`,
      type: 'push',
      isRead: 'unread', // optional nếu đã có default
    });

    return newOrder;
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
  ): Promise<{ total: number; data: Order[] }> {
    const [data, total] = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.deletedAt is null')
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();
    if (data.length === 0) {
      throw new NotFoundException(`Order not found`);
    }
    return { total, data };
  }

  async findOne(id: number): Promise<Order> {
    // console.log('order of orderService id');
    const order = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.restaurant', 'restaurant')
      .leftJoinAndSelect('order.discount', 'discount')
      .leftJoinAndSelect('order.address', 'address')
      .where('order.id = :id', { id })
      .andWhere('order.deletedAt is null')
      .getOne();

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    // console.log('order of orderService', order);
    return order;
  }

  async findByUserId(
    userId: number,
    page: number,
    limit: number,
  ): Promise<{ total: number; data: Order[] }> {
    const [data, total] = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.user.id = :userId', { userId })
      .andWhere('order.deletedAt is null')
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();
    if (data.length === 0) {
      throw new NotFoundException(`Order with user ID ${userId} not found`);
    }
    return { total, data };
  }

  async findByRestaurantId(
    restaurantId: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ total: number; data: Order[] }> {
    const [data, total] = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.restaurant', 'restaurant')
      .leftJoinAndSelect('order.address', 'address')
      .leftJoinAndSelect('order.discount', 'discount')
      .where('order.restaurant.id = :restaurantId', { restaurantId })
      .andWhere('order.deletedAt is null')
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();
    if (data.length === 0) {
      throw new NotFoundException(
        `Order with restaurant ${restaurantId} not found`,
      );
    }
    return { total, data };
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const order = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.id = :id', { id })
      .andWhere('order.deletedAt is null')
      .getOne();

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    order.status = status;
    const updatedOrder = await this.orderRepository.save(order);
    const restaurant = await this.restaurantService.findOne(
      updatedOrder.restaurant.id,
    );
    if (!restaurant) {
      throw new NotFoundException(
        `Restaurant with ID ${updatedOrder.restaurant.id} not found`,
      );
    }
    if (status === 'completed' || status === 'cancelled') {
      const notificationContent =
        status === 'completed'
          ? `Đơn hàng #${updatedOrder.id} đã được hoàn thành. Tổng giá trị: ${updatedOrder.totalPrice}₫. Cảm ơn bạn đã sử dụng dịch vụ!`
          : `Đơn hàng #${updatedOrder.id} đã bị hủy. Chúng tôi xin lỗi vì sự bất tiện này.`;
      await this.notificationService.create({
        userId: restaurant.owner.id,
        title: `🛎 Cập nhật đơn hàng #${updatedOrder.id}`,
        content: notificationContent,
        type: 'push',
        isRead: 'unread',
      });
    }

    if (status === 'confirmed') {
      await this.notificationService.create({
        userId: updatedOrder.user.id,
        title: `🛎 Đơn hàng #${updatedOrder.id} đã được xác nhận`,
        content: `Đơn hàng của bạn tại ${restaurant.name} đã được xác nhận. Tổng giá trị: ${updatedOrder.totalPrice}₫.`,
        type: 'push',
        isRead: 'unread',
      });
    }

    return updatedOrder;
  }

  async update(id: number, updateOrderInput: UpdateOrderInput) {
    const order = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.id = :id', { id })
      .andWhere('order.deletedAt is null')
      .getOne();

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // if (updateOrderInput.discountId) {
    //   const discount = await this.discountService.findOneById(
    //     updateOrderInput.discountId,
    //   );
    //   if (!discount) {
    //     throw new NotFoundException(
    //       `Discount with ID ${updateOrderInput.discountId} not found`,
    //     );
    //   }
    //   order.totalPrice = order.totalPrice - order.discount.percentage;
    //   if (order.totalPrice < 0) {
    //     order.totalPrice = 0;
    //   }
    // }

    const updatedOrder = await this.orderRepository.save({
      ...order,
      ...updateOrderInput,
    });

    return updatedOrder;
  }

  async remove(id: number) {
    const order = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.id = :id', { id })
      .andWhere('order.deletedAt is null')
      .getOne();

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    order.deletedAt = new Date();
    return await this.orderRepository.save(order);
  }

  // Thống kê tổng đơn hàng của nhà hàng theo tháng + năm hoặc năm (Tham số đầu vào là mã nhà hàng)
  async getTotalOrderByRestaurantId(
    restaurantId: number,
    year: number,
    month?: number,
  ): Promise<number> {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .where('order.restaurant.id = :restaurantId', { restaurantId })
      .andWhere('YEAR(order.createdAt) = :year', { year })
      .andWhere('order.deletedAt IS NULL');

    if (month !== undefined) {
      query.andWhere('MONTH(order.createdAt) = :month', { month });
    }

    return await query.getCount();
  }

  // Thống kê tổng doanh thu của nhà hàng theo tháng + năm hoặc năm
  async getTotalRevenueByRestaurantId(
    restaurantId: number,
    year: number,
    month?: number,
  ): Promise<number> {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalPrice)', 'totalRevenue')
      .where('order.restaurant.id = :restaurantId', { restaurantId })
      .andWhere('YEAR(order.createdAt) = :year', { year })
      .andWhere('order.deletedAt IS NULL');

    if (month !== undefined) {
      query.andWhere('MONTH(order.createdAt) = :month', { month });
    }

    const result = await query.getRawOne();
    return result.totalRevenue || 0;
  }

  // Thống kê tổng doanh thu của nhà hàng theo từng tháng trong năm (Tham số đầu vào là mã nhà hàng và năm)
  async getTotalRevenueByRestaurantIdByYear(
    restaurantId: number,
    year: number,
  ): Promise<RevenueByYear[]> {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .select('MONTH(order.createdAt)', 'month')
      .addSelect('SUM(order.totalPrice)', 'totalRevenue')
      .where('order.restaurant.id = :restaurantId', { restaurantId })
      .andWhere('YEAR(order.createdAt) = :year', { year })
      .andWhere('order.deletedAt IS NULL')
      .groupBy('month')
      .orderBy('month', 'ASC');

    const raw = await query.getRawMany();

    const result: { month: number; totalRevenue: number }[] = [];

    for (let m = 1; m <= 12; m++) {
      const found = raw.find((r) => Number(r.month) === m);
      result.push({
        month: m,
        totalRevenue: found ? Number(found.totalRevenue) : 0,
      });
    }

    return result;
  }
}
