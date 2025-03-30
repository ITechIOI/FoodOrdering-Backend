import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { CategoryService } from './category.service';
import { Category } from 'src/entities/category.entity';
import { CreateCategoryInput } from './dto/create-category.input';
import { UpdateCategoryInput } from './dto/update-category.input';
import { createPaginatedType } from 'src/utils/paginated';
const PaginatedCategoryResponse = createPaginatedType(
  Category,
  'PaginatedCategoryResponse',
);
@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @Mutation(() => Category)
  async createCategory(
    @Args('createCategoryInput') createCategoryInput: CreateCategoryInput,
  ): Promise<Category> {
    return this.categoryService.create(createCategoryInput);
  }
  @Query(() => PaginatedCategoryResponse, { name: 'categories' }) // ✅ Phân trang
  async findAll(
    @Args('page', { type: () => Int, nullable: true }) page = 1,
    @Args('limit', { type: () => Int, nullable: true }) limit = 10,
  ) {
    return await this.categoryService.findAll(page, limit);
  }

  @Query(() => Category, { name: 'category' })
  async findOne(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Category> {
    return this.categoryService.findOne(id);
  }

  @Mutation(() => Category)
  async updateCategory(
    @Args('updateCategoryInput') updateCategoryInput: UpdateCategoryInput,
  ): Promise<Category> {
    return this.categoryService.update(
      updateCategoryInput.id,
      updateCategoryInput,
    );
  }

  @Mutation(() => Category)
  async removeCategory(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Category> {
    return this.categoryService.remove(id);
  }

  // find categories by restaurantId
  @Query(() => [Category])
  async findCategoriesByRestaurantId(
    @Args('restaurantId', { type: () => Int }) restaurantId: number,
  ): Promise<Category[]> {
    return this.categoryService.findCategoriesByRestaurantId(restaurantId);
  }
}
