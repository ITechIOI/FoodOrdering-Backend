import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../../entities/restaurant.entity';
import { CreateRestaurantInput } from './dto/create-restaurant.input';
import { UpdateRestaurantInput } from './dto/update-restaurant.input';
import { Address } from '../../entities/address.entity';
import { User } from '../../entities/user.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,

    @InjectRepository(Address)
    private addressRepository: Repository<Address>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<Restaurant> {
    const { addressId, ownerId, ...data } = createRestaurantInput;

    // Kiểm tra xem address có tồn tại không
    const address = await this.addressRepository.findOne({
      where: { id: addressId },
    });
    if (!address)
      throw new NotFoundException(`Address with ID ${addressId} not found`);

    // Kiểm tra xem user (owner) có tồn tại không
    const owner = await this.userRepository.findOne({ where: { id: ownerId } });
    if (!owner)
      throw new NotFoundException(`Owner with ID ${ownerId} not found`);

    // Tạo nhà hàng mới
    const newRestaurant = this.restaurantRepository.create({
      ...data,
      address,
      owner,
    });

    return await this.restaurantRepository.save(newRestaurant);
  }

  async findAll(): Promise<Restaurant[]> {
    return await this.restaurantRepository.find({
      relations: ['address', 'owner'],
    });
  }

  async findOne(id: number): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
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
    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
    });
    if (!restaurant)
      throw new NotFoundException(`Restaurant with ID ${id} not found`);

    Object.assign(restaurant, updateRestaurantInput);
    return await this.restaurantRepository.save(restaurant);
  }

  async remove(id: number): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
    });
    if (!restaurant)
      throw new NotFoundException(`Restaurant with ID ${id} not found`);

    await this.restaurantRepository.remove(restaurant);
    return restaurant;
  }
}
