import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { IsNull, Repository } from 'typeorm';
import { RestaurantService } from '../restaurant/restaurant.service';
import { Restaurant } from 'src/entities/restaurant.entity';
import { PaginatedResponse } from 'src/utils/paginatedType';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly restaurantService: RestaurantService,
  ) {}

  async create(createCategoryInput: CreateCategoryInput): Promise<Category> {
    const { name, restaurantId } = createCategoryInput;

    let restaurant: Restaurant | undefined = undefined;

    if (restaurantId) {
      restaurant = await this.restaurantService.findOne(restaurantId);
      if (!restaurant) {
        throw new NotFoundException(
          `Restaurant with ID ${restaurantId} not found`,
        );
      }
    }

    const category = this.categoryRepository.create({
      name,
      restaurant: restaurant ?? undefined,
    });

    return this.categoryRepository.save(category);
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<Category>> {
    const [data, total] = await this.categoryRepository.findAndCount({
      relations: ['restaurant', 'menu'],
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['restaurant', 'menu'],
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(
    id: number,
    updateCategoryInput: UpdateCategoryInput,
  ): Promise<Category> {
    const category = await this.findOne(id);

    if (updateCategoryInput.name) {
      category.name = updateCategoryInput.name;
    }

    if (updateCategoryInput.restaurantId) {
      const restaurant = await this.restaurantService.findOne(
        updateCategoryInput.restaurantId,
      );
      if (!restaurant) {
        throw new NotFoundException(
          `Restaurant with ID ${updateCategoryInput.restaurantId} not found`,
        );
      }
      category.restaurant = restaurant;
    }

    return this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<Category> {
    const category = await this.findOne(id);
    category.deletedAt = new Date();
    await this.categoryRepository.save(category);
    return category;
  }

  async findCategoriesByRestaurantId(
    restaurantId: number,
  ): Promise<Category[]> {
    const categories = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.restaurant', 'restaurant')
      .where('category.restaurantId = :restaurantId', { restaurantId })
      .andWhere('category.deletedAt IS NULL')
      .getMany();
    if (!categories) {
      throw new NotFoundException(
        `Categories with restaurant ID ${restaurantId} not found`,
      );
    }
    return categories;
  }
}
