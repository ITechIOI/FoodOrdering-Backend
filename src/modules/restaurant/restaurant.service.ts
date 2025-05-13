import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Restaurant } from '../../entities/restaurant.entity';
import { CreateRestaurantInput } from './dto/create-restaurant.input';
import { UpdateRestaurantInput } from './dto/update-restaurant.input';
import { AddressService } from '../address/address.service';
import { UsersService } from '../users/users.service';
import { ClientProxy } from '@nestjs/microservices';
import { CacheService } from 'src/common/cache/cache.service';
import { PaginatedResponse } from 'src/utils/paginatedType';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    private readonly addressService: AddressService,
    private readonly userService: UsersService,
    @Inject('REDIS_SERVICE') private readonly cacheClient: ClientProxy,
    private readonly cacheService: CacheService,
  ) {}
  async create(
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<Restaurant> {
    const { addressId, ownerId, ...data } = createRestaurantInput;

    const address = await this.addressService.findOneAddress(addressId);
    if (!address) {
      throw new NotFoundException(`Address with ID ${addressId} not found`);
    }

    const owner = await this.userService.findOneById(ownerId);
    if (!owner) {
      throw new NotFoundException(`Owner with ID ${ownerId} not found`);
    }

    const restaurant = this.restaurantRepository.create({
      ...data,
      address,
      owner,
    });

    return await this.restaurantRepository.save(restaurant);
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<Restaurant>> {
    const [data, total] = await this.restaurantRepository.findAndCount({
      relations: ['address', 'owner'],
      where: { deletedAt: IsNull() },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async findOne(id: number): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['address', 'owner'],
    });

    if (!restaurant)
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    return restaurant;
  }

  async update(
    id: number,
    updateRestaurantInput: UpdateRestaurantInput,
  ): Promise<Restaurant> {
    const restaurant = await this.findOne(id);

    if (updateRestaurantInput.addressId) {
      const address = await this.addressService.findOneAddress(
        updateRestaurantInput.addressId,
      );
      if (!address) {
        throw new NotFoundException(
          `Address with ID ${updateRestaurantInput.addressId} not found`,
        );
      }
      restaurant.address = address;
    }

    if (updateRestaurantInput.ownerId) {
      const owner = await this.userService.findOneById(
        updateRestaurantInput.ownerId,
      );
      if (!owner) {
        throw new NotFoundException(
          `Owner with ID ${updateRestaurantInput.ownerId} not found`,
        );
      }
      restaurant.owner = owner;
    }

    Object.assign(restaurant, updateRestaurantInput);
    return await this.restaurantRepository.save(restaurant);
  }

  async remove(id: number): Promise<Restaurant> {
    const restaurant = await this.findOne(id);

    restaurant.deletedAt = new Date();
    return await this.restaurantRepository.save(restaurant);
  }

  async findNearestRestaurantsByName(
    userLat: number,
    userLng: number,
    // keyword: string,
    limit = 10,
  ): Promise<(Restaurant & { distance: number })[]> {
    const query = this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.address', 'address')
      // .where('restaurant.name LIKE :keyword', { keyword: `%${keyword}%` })
      .andWhere(
        'address.latitude IS NOT NULL AND address.longitude IS NOT NULL',
      )
      .andWhere('restaurant.deletedAt IS NULL')
      .andWhere('restaurant.isActive = :isActive', { isActive: 'accepted' })
      .andWhere('address.deletedAt IS NULL')
      .addSelect(
        `
        6371 * acos(
          cos(radians(:userLat)) * cos(radians(address.latitude)) *
          cos(radians(address.longitude) - radians(:userLng)) +
          sin(radians(:userLat)) * sin(radians(address.latitude))
        )
      `,
        'distance',
      )
      .orderBy('distance', 'ASC')
      .limit(limit)
      .setParameters({ userLat, userLng });

    const { entities, raw } = await query.getRawAndEntities();

    const result = entities.map((restaurant, index) => ({
      ...restaurant,
      distance: parseFloat(raw[index].distance),
    }));

    // await this.cacheClient.emit('restaurant.cache.set', {
    //   cacheKey,
    //   data: result,
    // });

    return result;
  }

  async findRestaurantsByOwnerId(userId: number) {
    const restaurants = await this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.owner', 'owner')
      .leftJoinAndSelect('restaurant.address', 'address')
      .where('owner.id = :userId', { userId })
      .andWhere('restaurant.deletedAt IS NULL')
      .getMany();

    if (!restaurants || restaurants.length === 0) {
      throw new NotFoundException(`No restaurants found for user ID ${userId}`);
    }

    return restaurants;
  }

  // find by categoryName
  // Show distance of restaurant from user location
  async findRestaurantsByCategoryName(
    categoryName: string,
    userLat: number,
    userLng: number,
    limit: number,
  ): Promise<(Restaurant & { distance: number })[]> {
    const query = await this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.categories', 'category')
      .leftJoinAndSelect('restaurant.address', 'address')
      // Use like to find restaurants with similar category names
      .where('category.name LIKE :categoryName', {
        categoryName: `%${categoryName}%`,
      })
      .andWhere(
        'address.latitude IS NOT NULL AND address.longitude IS NOT NULL',
      )
      .andWhere('restaurant.isActive = :isActive', { isActive: 'accepted' })
      .addSelect(
        `
        6371 * acos(
          cos(radians(:userLat)) * cos(radians(address.latitude)) *
          cos(radians(address.longitude) - radians(:userLng)) +
          sin(radians(:userLat)) * sin(radians(address.latitude))
        )
      `,
        'distance',
      )
      .orderBy('distance', 'ASC')
      .andWhere('restaurant.deletedAt IS NULL')
      .limit(limit)
      .setParameters({ userLat, userLng });

    const { entities, raw } = await query.getRawAndEntities();

    const result = entities.map((restaurant, index) => ({
      ...restaurant,
      distance: parseFloat(raw[index].distance),
    }));
    return result;
  }

  // Tìm kiếm nhà hàng có TỔNG lượt rating đơn hàng (trong bảng review với tham chiếu của review trỏ đến order, order trỏ đến restaurant, restaurant và review không có quan hệ gì) cao nhất
  async findTopRatedRestaurants(limit: number): Promise<Restaurant[]> {
    const restaurants = await this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.order', 'order')
      .leftJoinAndSelect('order.review', 'review')
      .select('restaurant')
      .addSelect('SUM(review.rating) AS totalRating')
      .groupBy('restaurant.id')
      .orderBy('totalRating', 'DESC')
      .limit(limit)
      .getMany();
    if (!restaurants || restaurants.length === 0) {
      throw new NotFoundException(`No restaurants found`);
    }

    return restaurants;
  }

  // Tìm kiếm nhà hàng có TÔNG đơn hàng nhiều nhất
  async findMostOrderedRestaurants(limit: number): Promise<Restaurant[]> {
    const restaurants = await this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.order', 'order')
      .select('restaurant')
      .addSelect('COUNT(order.id) AS totalOrders')
      .groupBy('restaurant.id')
      .orderBy('totalOrders', 'DESC')
      .limit(limit)
      .getMany();
    if (!restaurants || restaurants.length === 0) {
      throw new NotFoundException(`No restaurants found`);
    }

    return restaurants;
  }
}
