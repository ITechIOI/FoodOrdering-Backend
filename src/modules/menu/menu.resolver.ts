import { Resolver, Query, Mutation, Args, Int, Float } from '@nestjs/graphql';
import { MenuService } from './menu.service';
import { Menu } from '../../entities/menu.entity';
import { CreateMenuInput } from './dto/create-menu.input';
import { UpdateMenuInput } from './dto/update-menu.input';
import { NearbyMenuItem } from './dto/output/NearbyMenuItem';
import { FileUpload, GraphQLUpload, Upload } from 'graphql-upload-minimal';

import { createPaginatedType } from 'src/utils/paginated';
const PaginatedMenuResponse = createPaginatedType(
  Menu,
  'PaginatedMenuResponse',
);
@Resolver(() => Menu)
export class MenuResolver {
  constructor(private readonly menuService: MenuService) {}

  @Mutation(() => Menu)
  async createMenu(
    @Args('createMenuInput') createMenuInput: CreateMenuInput,
  ): Promise<Menu> {
    return await this.menuService.create(createMenuInput);
  }

  @Query(() => PaginatedMenuResponse, { name: 'menus' }) // ✅ Phân trang
  async findAll(
    @Args('page', { type: () => Int, nullable: true }) page = 1,
    @Args('limit', { type: () => Int, nullable: true }) limit = 10,
  ) {
    return await this.menuService.findAll(page, limit);
  }

  @Query(() => [Menu])
  async findAllNotPaginate(): Promise<Menu[]> {
    return await this.menuService.findAllNotPaginate();
  }

  @Query(() => Menu, { name: 'menu' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<Menu> {
    return await this.menuService.findOne(id);
  }

  @Mutation(() => Menu)
  async updateMenu(
    @Args('updateMenuInput') updateMenuInput: UpdateMenuInput,
  ): Promise<Menu> {
    return await this.menuService.update(updateMenuInput.id, updateMenuInput);
  }

  @Mutation(() => Menu) // Trả về Menu thay vì Boolean
  async removeMenu(@Args('id', { type: () => Int }) id: number): Promise<Menu> {
    return await this.menuService.remove(id);
  }

  // find menus by categoryId
  @Query(() => [Menu])
  async findMenusByCategoryId(
    @Args('categoryId', { type: () => Int }) categoryId: number,
  ): Promise<Menu[]> {
    return this.menuService.findByCategoryId(categoryId);
  }

  @Query(() => [NearbyMenuItem])
  async searchNearbyMenuItems(
    @Args('latitude', { type: () => Float }) latitude: number,
    @Args('longitude', { type: () => Float }) longitude: number,
    @Args('keyword') keyword: string,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
  ): Promise<NearbyMenuItem[]> {
    return this.menuService.findMenuItemsNearbyByKeyword(
      latitude,
      longitude,
      keyword,
      limit,
    );
  }

  @Query(() => [Menu])
  async findMenusByImageUrl(
    @Args('file', { type: () => GraphQLUpload }) file: FileUpload,
    @Args({ name: 'limit', type: () => Int }) limit: number,
  ): Promise<Menu[]> {
    return this.menuService.findMenuByImage(file, limit);
  }
}
