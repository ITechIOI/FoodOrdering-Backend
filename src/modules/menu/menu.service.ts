import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMenuInput } from './dto/create-menu.input';
import { UpdateMenuInput } from './dto/update-menu.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from 'src/entities/menu.entity';
import { Category } from 'src/entities/category.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createMenuInput: CreateMenuInput): Promise<Menu> {
    const { name, description, price, imageUrl, available, categoryId } =
      createMenuInput;

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
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
      where: { id },
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
      const category = await this.categoryRepository.findOne({
        where: { id: updateMenuInput.categoryId },
      });
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
    const menu = await this.menuRepository.findOne({ where: { id } }); // 🔍 Tìm menu trước khi xóa
    if (!menu) {
      throw new Error(`Menu với ID ${id} không tồn tại!`);
    }
    await this.menuRepository.delete(id);
    return menu;
  }
}
