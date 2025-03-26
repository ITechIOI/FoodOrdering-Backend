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

    if (updateMenuInput.quantity) {
      menu.quantity = updateMenuInput.quantity;
    }

    return this.menuRepository.save(menu);
  }

  async remove(id: number): Promise<Menu> {
    const menu = await this.findOne(id);
    menu.deletedAt = new Date();
    await this.menuRepository.save(menu);
    return menu;
  }

  // find menus by categoryId
  async findByCategoryId(categoryId: number): Promise<Menu[]> {
    const menu = this.menuRepository
      .createQueryBuilder('menu')
      .leftJoinAndSelect('menu.category', 'category')
      .where('menu.categoryId = :categoryId', { categoryId })
      .andWhere('menu.deletedAt IS NULL')
      .getMany();
    if (!menu) {
      throw new NotFoundException(
        `Menu with categoryId ${categoryId} not found`,
      );
    }
    return menu;
  }

  async findMenuItemsNearbyByKeyword(
    userLat: number,
    userLng: number,
    keyword: string,
    limit = 20,
  ): Promise<
    (Menu & {
      distance: number;
      restaurantName: string;
      categoryName: string;
    })[]
  > {
    const query = this.menuRepository
      .createQueryBuilder('menu')
      .innerJoin('menu.category', 'category')
      .innerJoin('category.restaurant', 'restaurant')
      .innerJoin('restaurant.address', 'address')
      .where('menu.name LIKE :keyword', { keyword: `%${keyword}%` })
      .andWhere(
        'address.latitude IS NOT NULL AND address.longitude IS NOT NULL',
      )
      .andWhere('menu.deletedAt IS NULL')
      .andWhere('category.deletedAt IS NULL')
      .andWhere('restaurant.deletedAt IS NULL')
      .andWhere('address.deletedAt IS NULL')
      .addSelect([
        'restaurant.name AS restaurantName',
        'category.name AS categoryName',
        `
        6371 * acos(
          cos(radians(:userLat)) * cos(radians(address.latitude)) *
          cos(radians(address.longitude) - radians(:userLng)) +
          sin(radians(:userLat)) * sin(radians(address.latitude))
        ) AS distance
        `,
      ])
      .orderBy('distance', 'ASC')
      .limit(limit)
      .setParameters({ userLat, userLng });

    const { entities, raw } = await query.getRawAndEntities();

    return entities.map((menuItem, index) => ({
      ...menuItem,
      restaurantName: raw[index].restaurantName,
      categoryName: raw[index].categoryName,
      distance: parseFloat(raw[index].distance),
    }));
  }
}
