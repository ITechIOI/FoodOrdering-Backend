import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Menu } from 'src/entities/menu.entity';
import { CreateMenuInput } from './dto/create-menu.input';
import { UpdateMenuInput } from './dto/update-menu.input';
import { CategoryService } from '../category/category.service';

import { ConfigService } from '@nestjs/config';
import { FileUpload } from 'graphql-upload-minimal';
import * as FormData from 'form-data';
import axios from 'axios';

import { PaginatedResponse } from 'src/utils/paginatedType';

@Injectable()
export class MenuService {
  private fastUrl;
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    private readonly configService: ConfigService,
    private readonly categoryService: CategoryService,
  ) {
    this.fastUrl = this.configService.get<string>('FASTAPI_URL') || '';
  }

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

  async findAll(page: number, limit: number): Promise<PaginatedResponse<Menu>> {
    const [data, total] = await this.menuRepository.findAndCount({
      relations: ['category', 'orderDetail'],
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async findAllNotPaginate(): Promise<Menu[]> {
    const menu = await this.menuRepository
      .createQueryBuilder('menu')
      .leftJoinAndSelect('menu.category', 'category')
      .where('menu.deletedAt IS NULL')
      .getMany();
    if (!menu) {
      throw new NotFoundException(`Menu not found`);
    }
    console.log('menu', menu);
    return menu;
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

  // get the list of menus by fast api that has the nearest distance to the user by limit
  async findMenuByImage(file: FileUpload, limit: number = 10): Promise<Menu[]> {
    const { createReadStream, filename, mimetype } = file;

    const stream = createReadStream();
    const formData = new FormData();

    formData.append('file', stream, {
      filename,
      contentType: mimetype,
    });

    formData.append('limit', limit.toString());

    try {
      const response = await axios.post(
        `${this.fastUrl}/menu/predict/score`,
        formData,
        {
          headers: formData.getHeaders(),
        },
      );

      let menu: Menu[] = [];
      for (let i = 0; i < response.data.length; i++) {
        const menuItem = await this.findOne(response.data[i].id);
        // console.log('menuItem', menuItem);
        menu.push(menuItem);
      }
      return menu;
    } catch (error) {
      console.error(
        '❌ Upload to FastAPI failed:',
        error?.response?.data || error.message,
      );
      throw new Error('FastAPI upload failed');
    }
  }
}
