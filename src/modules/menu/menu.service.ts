import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Menu } from 'src/entities/menu.entity';
import { CreateMenuInput } from './dto/create-menu.input';
import { UpdateMenuInput } from './dto/update-menu.input';
import { CategoryService } from '../category/category.service';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,

    private readonly categoryService: CategoryService,
  ) {}

  async create(createMenuInput: CreateMenuInput): Promise<Menu> {
    const { name, description, price, imageUrl, available, categoryId } =
      createMenuInput;

    const category = await this.categoryService.findOne(categoryId);
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    const menu = this.menuRepository.create({
      name,
      description,
      price,
      imageUrl,
      available,
      category,
    });

    return this.menuRepository.save(menu);
  }

  async findAll(): Promise<Menu[]> {
    return this.menuRepository.find({ relations: ['category', 'orderDetail'] });
  }

  async findOne(id: number): Promise<Menu> {
    const menu = await this.menuRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['category', 'orderDetail'],
    });

    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }

    return menu;
  }

  async update(id: number, updateMenuInput: UpdateMenuInput): Promise<Menu> {
    const menu = await this.findOne(id);

    if (updateMenuInput.name) {
      menu.name = updateMenuInput.name;
    }
    if (updateMenuInput.description) {
      menu.description = updateMenuInput.description;
    }
    if (updateMenuInput.price !== undefined) {
      menu.price = updateMenuInput.price;
    }
    if (updateMenuInput.imageUrl) {
      menu.imageUrl = updateMenuInput.imageUrl;
    }
    if (updateMenuInput.available) {
      menu.available = updateMenuInput.available;
    }
    if (updateMenuInput.categoryId) {
      const category = await this.categoryService.findOne(
        updateMenuInput.categoryId,
      );
      if (!category) {
        throw new NotFoundException(
          `Category with ID ${updateMenuInput.categoryId} not found`,
        );
      }
      menu.category = category;
    }

    return this.menuRepository.save(menu);
  }

  async remove(id: number): Promise<Menu> {
    const menu = await this.findOne(id);
    menu.deletedAt = new Date();
    await this.menuRepository.save(menu);
    return menu;
  }
}
