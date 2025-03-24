import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { MenuService } from './menu.service';
import { Menu } from '../../entities/menu.entity';
import { CreateMenuInput } from './dto/create-menu.input';
import { UpdateMenuInput } from './dto/update-menu.input';

@Resolver(() => Menu)
export class MenuResolver {
  constructor(private readonly menuService: MenuService) {}

  @Mutation(() => Menu)
  async createMenu(
    @Args('createMenuInput') createMenuInput: CreateMenuInput,
  ): Promise<Menu> {
    return await this.menuService.create(createMenuInput);
  }

  @Query(() => [Menu], { name: 'menus' }) // ✅ Đổi name để tránh trùng với query findOne
  async findAll(): Promise<Menu[]> {
    return await this.menuService.findAll();
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

  @Mutation(() => Menu) // ✅ Trả về Menu thay vì Boolean
  async removeMenu(@Args('id', { type: () => Int }) id: number): Promise<Menu> {
    return await this.menuService.remove(id);
  }
}
