import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFavoriteInput } from './dto/create-favorite.input';
import { UpdateFavoriteInput } from './dto/update-favorite.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Favorite } from 'src/entities/favorite.entity';
import { Repository } from 'typeorm';
import { RestaurantService } from '../restaurant/restaurant.service';
import { UsersService } from '../users/users.service';
import { PaginatedResponse } from 'src/utils/paginatedType';

@Injectable()
export class FavoriteService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    private readonly restaurantService: RestaurantService,
    private readonly userService: UsersService,
  ) {}

  async create(createFavoriteInput: CreateFavoriteInput) {
    const restaurant = await this.restaurantService.findOne(
      createFavoriteInput.restaurantId || 1,
    );
    if (!restaurant) {
      throw new Error(
        `Restaurant with ID ${createFavoriteInput.restaurantId} not found`,
      );
    }

    const user = await this.userService.findOneById(
      createFavoriteInput.userId || 1,
    );
    if (!user) {
      throw new NotFoundException(
        `User with ID ${createFavoriteInput.userId} not found`,
      );
    }

    const favorite = this.favoriteRepository.create({
      ...createFavoriteInput,
      restaurant,
      user,
    });

    return await this.favoriteRepository.save(favorite);
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<Favorite>> {
    const [data, total] = await this.favoriteRepository
      .createQueryBuilder('favorite')
      .leftJoinAndSelect('favorite.restaurant', 'restaurant')
      .leftJoinAndSelect('favorite.user', 'user')
      .where('favorite.deletedAt IS NULL')
      .andWhere('restaurant.deletedAt IS NULL')
      .andWhere('user.deletedAt IS NULL')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    if (data.length === 0) {
      throw new NotFoundException('No favorites found');
    }

    return { data, total };
  }

  async findOne(id: number) {
    const favorite = await this.favoriteRepository
      .createQueryBuilder('favorite')
      .leftJoinAndSelect('favorite.restaurant', 'restaurant')
      .leftJoinAndSelect('favorite.user', 'user')
      .where('favorite.id = :id', { id })
      .andWhere('favorite.deletedAt IS NULL')
      .andWhere('restaurant.deletedAt IS NULL')
      .andWhere('user.deletedAt IS NULL')
      .getOne();

    if (!favorite) {
      throw new NotFoundException(`Favorite with ID ${id} not found`);
    }

    return favorite;
  }

  async update(id: number, updateFavoriteInput: UpdateFavoriteInput) {
    const favorite = await this.findOne(id);

    if (updateFavoriteInput.restaurantId) {
      const restaurant = await this.restaurantService.findOne(
        updateFavoriteInput.restaurantId,
      );
      if (!restaurant) {
        throw new NotFoundException(
          `Restaurant with ID ${updateFavoriteInput.restaurantId} not found`,
        );
      }
      favorite.restaurant = restaurant;
    }

    if (updateFavoriteInput.userId) {
      const user = await this.userService.findOneById(
        updateFavoriteInput.userId,
      );
      if (!user) {
        throw new NotFoundException(
          `User with ID ${updateFavoriteInput.userId} not found`,
        );
      }
      favorite.user = user;
    }

    return await this.favoriteRepository.save(favorite);
  }

  async remove(id: number) {
    const favorite = await this.findOne(id);
    if (!favorite) {
      throw new NotFoundException(`Favorite with ID ${id} not found`);
    }
    favorite.deletedAt = new Date();
    return await this.favoriteRepository.save(favorite);
  }

  async findFavoritesByUserId(
    userId: number,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<Favorite>> {
    const favorites = await this.favoriteRepository
      .createQueryBuilder('favorite')
      .leftJoinAndSelect('favorite.restaurant', 'restaurant')
      .where('favorite.userId = :userId', { userId })
      .andWhere('favorite.deletedAt IS NULL')
      .andWhere('restaurant.deletedAt IS NULL')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const [data, total] = favorites;
    if (data.length === 0) {
      throw new NotFoundException(`No favorites found for user ID ${userId}`);
    }
    return { data, total };
  }

  async findFavoriteByRestaurantIdAndUserId(
    restaurantId: number,
    userId: number,
  ): Promise<Favorite | null> {
    return this.favoriteRepository
      .createQueryBuilder('favorite')
      .leftJoinAndSelect('favorite.restaurant', 'restaurant')
      .where('favorite.restaurantId = :restaurantId', { restaurantId })
      .andWhere('favorite.userId = :userId', { userId })
      .andWhere('favorite.deletedAt IS NULL')
      .getOne();
  }
}
