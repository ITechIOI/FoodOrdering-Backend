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
import { TopRatedRestaurant } from './dto/output/TopRatedRestaurant';
import { raw } from 'express';
import { BestSellingRestaurant } from './dto/output/BestSellingRestaurant';
import { NearestRestaurant } from './dto/output/NearestRestaurant';

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

  async findRestaurantsByName(
    userLat: number,
    userLng: number,
    name: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<NearestRestaurant>> {
    const currentPage = Math.max(1, page);

    const query = this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.address', 'address')
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
      .where('restaurant.name LIKE :name', { name: `%${name}%` })
      .andWhere('restaurant.deletedAt IS NULL')
      .andWhere('address.deletedAt IS NULL')
      .setParameters({ userLat, userLng });

    const { raw, entities } = await query.getRawAndEntities();

    const total = entities.length;
    const start = (currentPage - 1) * limit;
    const paginatedEntities = entities.slice(start, start + limit);
    const paginatedRaw = raw.slice(start, start + limit);

    if (paginatedEntities.length === 0) {
      throw new NotFoundException(`No restaurants found with name ${name}`);
    }

    const result = paginatedEntities.map((restaurant, index) => ({
      ...restaurant,
      distance: parseFloat(paginatedRaw[index].distance),
    }));

    return { data: result, total };
  }

  async findNearestRestaurants(
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

  async findNearestRestaurantsByName(
    userLat: number,
    userLng: number,
    keyword: string,
    limit = 10,
  ): Promise<(Restaurant & { distance: number })[]> {
    const query = this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.address', 'address')
      .where('restaurant.name LIKE :keyword', { keyword: `%${keyword}%` })
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

  // Tìm kiếm nhà hàng có trung bình tổng lượt rating đơn hàng (trong bảng review với tham chiếu của review trỏ đến order, order trỏ đến restaurant, restaurant và review không có quan hệ gì) cao nhất
  async findTopRatedRestaurants(
    userLat: number,
    userLng: number,
    limit: number,
  ): Promise<TopRatedRestaurant[]> {
    const query = this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoin('restaurant.order', 'order')
      .leftJoin('order.review', 'review')
      .leftJoinAndSelect('restaurant.address', 'address')
      .select('restaurant')
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
      .addSelect('AVG(review.rating)', 'averageRating')
      .andWhere('restaurant.isActive = :isActive', { isActive: 'accepted' })
      .andWhere(
        'address.latitude IS NOT NULL AND address.longitude IS NOT NULL',
      )
      .groupBy('restaurant.id')
      .addGroupBy('address.id')
      .orderBy('averageRating', 'DESC')
      .addOrderBy('distance', 'ASC')
      .limit(limit)
      .setParameters({ userLat, userLng });

    const { raw, entities } = await query.getRawAndEntities();

    if (!entities || entities.length === 0) {
      throw new NotFoundException(`No restaurants found`);
    }

    const result: TopRatedRestaurant[] = entities.map((restaurant, index) => {
      const rawData = raw[index];

      return {
        restaurant,
        averageRating: rawData.averageRating
          ? parseFloat(rawData.averageRating)
          : 0,
        distance: rawData.distance ? parseFloat(rawData.distance) : 0,
      };
    });

    return result;
  }

  async findTopRatedRestaurantsByName(
    userLat: number,
    userLng: number,
    name: string,
    limit: number,
  ): Promise<TopRatedRestaurant[]> {
    const query = this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoin('restaurant.order', 'order')
      .leftJoin('order.review', 'review')
      .leftJoinAndSelect('restaurant.address', 'address')
      .select('restaurant')
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
      .addSelect('AVG(review.rating)', 'averageRating')
      .where('restaurant.name LIKE :name', { name: `%${name}%` })
      .andWhere('restaurant.isActive = :isActive', { isActive: 'accepted' })
      .andWhere(
        'address.latitude IS NOT NULL AND address.longitude IS NOT NULL',
      )
      .groupBy('restaurant.id')
      .addGroupBy('address.id')
      .orderBy('averageRating', 'DESC')
      .addOrderBy('distance', 'ASC')
      .limit(limit)
      .setParameters({ userLat, userLng });

    const { raw, entities } = await query.getRawAndEntities();

    if (!entities || entities.length === 0) {
      throw new NotFoundException(`No restaurants found`);
    }

    const result: TopRatedRestaurant[] = entities.map((restaurant, index) => {
      const rawData = raw[index];

      return {
        restaurant,
        averageRating: rawData.averageRating
          ? parseFloat(rawData.averageRating)
          : 0,
        distance: rawData.distance ? parseFloat(rawData.distance) : 0,
      };
    });

    return result;
  }

  // Tìm kiếm nhà hàng có TÔNG đơn hàng nhiều nhất
  async findMostOrderedRestaurants(
    userLat: number,
    userLng: number,
    limit: number,
  ): Promise<BestSellingRestaurant[]> {
    const { raw, entities } = await this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoin('restaurant.order', 'order')
      .leftJoinAndSelect('restaurant.address', 'address')
      .select('restaurant')
      .addSelect('COUNT(order.id)', 'totalOrders')
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

      .where('restaurant.isActive = :isActive', { isActive: 'accepted' })
      .groupBy('restaurant.id')
      .addGroupBy('address.id')
      .orderBy('totalOrders', 'DESC')
      .addOrderBy('distance', 'ASC')
      .limit(limit)
      .setParameters({ userLat, userLng })
      .getRawAndEntities();

    if (!entities || entities.length === 0) {
      throw new NotFoundException(`No restaurants found`);
    }

    const result = entities.map((restaurant, index) => ({
      restaurant,
      totalOrders: parseInt(raw[index].totalOrders, 10),
      distance: parseFloat(raw[index].distance),
    }));

    return result;
  }

  // Tìm kiếm nhà hàng có TÔNG đơn hàng nhiều nhất theo tên
  async findMostOrderedRestaurantsByName(
    userLat: number,
    userLng: number,
    name: string,
    limit: number,
  ): Promise<BestSellingRestaurant[]> {
    const { raw, entities } = await this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoin('restaurant.order', 'order')
      .leftJoinAndSelect('restaurant.address', 'address')
      .select('restaurant')
      .addSelect('COUNT(order.id)', 'totalOrders')
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
      .where('restaurant.name LIKE :name', { name: `%${name}%` })
      .where('restaurant.isActive = :isActive', { isActive: 'accepted' })
      .groupBy('restaurant.id')
      .addGroupBy('address.id')
      .orderBy('totalOrders', 'DESC')
      .addOrderBy('distance', 'ASC')
      .limit(limit)
      .setParameters({ userLat, userLng })
      .getRawAndEntities();

    if (!entities || entities.length === 0) {
      throw new NotFoundException(`No restaurants found`);
    }

    const result = entities.map((restaurant, index) => ({
      restaurant,
      totalOrders: parseInt(raw[index].totalOrders, 10),
      distance: parseFloat(raw[index].distance),
    }));

    return result;
  }
}
