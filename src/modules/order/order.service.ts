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

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly userService: UsersService,
    private readonly restaurantService: RestaurantService,
    private readonly discountService: DiscountService,
    private readonly addressService: AddressService,
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
    let order;

    if (createOrderInput.discountId) {
      const discount = await this.discountService.findOneById(
        createOrderInput.discountId,
      );
      if (!discount || discount.endTime < new Date()) {
        throw new NotFoundException(
          `Discount with ID ${createOrderInput.discountId} not found`,
        );
      }
      order.totalPrice = createOrderInput.shippingFee;
      order.totalPrice = order.totalPrice - discount.percentage;
      if (order.totalPrice < 0) {
        order.totalPrice = 0;
      }
      order = this.orderRepository.create({
        ...createOrderInput,
        user,
        restaurant,
        address,
        discount,
      });
    } else {
      order.totalPrice = createOrderInput.shippingFee;
      order = this.orderRepository.create({
        ...createOrderInput,
        user,
        restaurant,
        address,
      });
    }

    return await this.orderRepository.save(order);
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
      .where('order.restaurant.id = :restaurantId', { restaurantId })
      .andWhere('order.deletedAt is null')
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();
    if (data.length === 0) {
      throw new NotFoundException(
        `Order with user ID ${restaurantId} not found`,
      );
    }
    return { total, data };
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
}
