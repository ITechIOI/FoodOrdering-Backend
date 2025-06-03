import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { FavoriteService } from './favorite.service';
import { Favorite } from '../../entities/favorite.entity';
import { CreateFavoriteInput } from './dto/create-favorite.input';
import { UpdateFavoriteInput } from './dto/update-favorite.input';

import { createPaginatedType } from 'src/utils/paginated';
import { PaginatedResponse } from 'src/utils/paginatedType';
const PaginatedFavoriteResponse = createPaginatedType(
  Favorite,
  'PaginatedFavoriteResponse',
);

@Resolver(() => Favorite)
export class FavoriteResolver {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Mutation(() => Favorite)
  async createFavorite(
    @Args('createFavoriteInput') createFavoriteInput: CreateFavoriteInput,
  ) {
    return await this.favoriteService.create(createFavoriteInput);
  }

  @Query(() => PaginatedFavoriteResponse)
  async findAllFavorites(
    @Args('page', { type: () => Int, nullable: true }) page = 1,
    @Args('limit', { type: () => Int, nullable: true }) limit = 10,
  ) {
    return await this.favoriteService.findAll(page, limit);
  }

  @Query(() => Favorite)
  async findFavoriteById(@Args('id', { type: () => Int }) id: number) {
    return await this.favoriteService.findOne(id);
  }

  @Mutation(() => Favorite)
  async updateFavorite(
    @Args('updateFavoriteInput') updateFavoriteInput: UpdateFavoriteInput,
  ) {
    return await this.favoriteService.update(
      updateFavoriteInput.id,
      updateFavoriteInput,
    );
  }

  @Mutation(() => Favorite)
  async removeFavorite(@Args('id', { type: () => Int }) id: number) {
    return await this.favoriteService.remove(id);
  }

  @Query(() => PaginatedFavoriteResponse)
  async findFavoritesByUserId(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ): Promise<PaginatedResponse<Favorite>> {
    return this.favoriteService.findFavoritesByUserId(userId, page, limit);
  }
}
