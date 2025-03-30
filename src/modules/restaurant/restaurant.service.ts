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
    keyword: string,
    limit = 10,
  ): Promise<(Restaurant & { distance: number })[]> {
    // const cacheKey = `nearest_restaurants:${userLat}:${userLng}:${keyword}:${limit}`;

    // const cacheRestaurantString = await this.cacheService.getCache(cacheKey);
    // if (cacheRestaurantString) {
    //   console.log('[CACHE] recommended restaurant HIT:', cacheKey);
    //   return JSON.parse(cacheRestaurantString);
    // }

    // console.log('Cache recommended restaurant miss:', cacheKey);

    const query = this.restaurantRepository
      .createQueryBuilder('restaurant')
      .leftJoinAndSelect('restaurant.address', 'address')
      .where('restaurant.name LIKE :keyword', { keyword: `%${keyword}%` })
      .andWhere(
        'address.latitude IS NOT NULL AND address.longitude IS NOT NULL',
      )
      .andWhere('restaurant.deletedAt IS NULL')
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
}
