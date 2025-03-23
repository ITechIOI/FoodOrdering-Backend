import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Repository } from 'typeorm';
import { Restaurant } from 'src/entities/restaurant.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
  ) {}

  async create(createCategoryInput: CreateCategoryInput): Promise<Category> {
    const { name, restaurantId } = createCategoryInput;

    let restaurant: Restaurant | null = null;
    if (restaurantId) {
      restaurant = await this.restaurantRepository.findOne({
        where: { id: restaurantId },
      });
      if (!restaurant) {
        throw new NotFoundException(
          `Restaurant with ID ${restaurantId} not found`,
        );
      }
    }

    const category = this.categoryRepository.create({
      name,
      restaurant: restaurant ?? undefined, // Chuyển `null` thành `undefined` nếu cần
    });

    return this.categoryRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({ relations: ['restaurant', 'menu'] });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
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
      const restaurant = await this.restaurantRepository.findOne({
        where: { id: updateCategoryInput.restaurantId },
      });
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
    await this.categoryRepository.remove(category);
    return category;
  }
}
