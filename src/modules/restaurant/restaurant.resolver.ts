import { Resolver, Query, Mutation, Args, Int, Float } from '@nestjs/graphql';
import { RestaurantService } from './restaurant.service';
import { Restaurant } from '../../entities/restaurant.entity';
import { CreateRestaurantInput } from './dto/create-restaurant.input';
import { UpdateRestaurantInput } from './dto/update-restaurant.input';
import { NearestRestaurant } from './dto/output/NearestRestaurant';
import { createPaginatedType } from 'src/utils/paginated';
import { TopRatedRestaurant } from './dto/output/TopRatedRestaurant';
const PaginatedRestaurantResponse = createPaginatedType(
  Restaurant,
  'PaginatedRestaurantResponse',
);
@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(() => Restaurant)
  async createRestaurant(
    @Args('createRestaurantInput') createRestaurantInput: CreateRestaurantInput,
  ): Promise<Restaurant> {
    return await this.restaurantService.create(createRestaurantInput);
  }

  @Query(() => PaginatedRestaurantResponse, { name: 'restaurants' }) // ✅ Phân trang
  async findAll(
    @Args('page', { type: () => Int, nullable: true }) page = 1,
    @Args('limit', { type: () => Int, nullable: true }) limit = 10,
  ) {
    return await this.restaurantService.findAll(page, limit);
  }
  @Query(() => Restaurant, { name: 'restaurant' })
  async findOne(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Restaurant> {
    return await this.restaurantService.findOne(id);
  }

  @Mutation(() => Restaurant)
  async updateRestaurant(
    @Args('updateRestaurantInput') updateRestaurantInput: UpdateRestaurantInput,
  ): Promise<Restaurant> {
    return await this.restaurantService.update(
      updateRestaurantInput.id,
      updateRestaurantInput,
    );
  }

  @Mutation(() => Restaurant)
  async removeRestaurant(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Restaurant> {
    return await this.restaurantService.remove(id);
  }

  @Query(() => [NearestRestaurant])
  async searchNearestRestaurants(
    @Args('latitude', { type: () => Float }) latitude: number,
    @Args('longitude', { type: () => Float }) longitude: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ): Promise<NearestRestaurant[]> {
    return this.restaurantService.findNearestRestaurantsByName(
      latitude,
      longitude,
      limit,
    );
  }

  @Query(() => [Restaurant])
  async findRestaurantsByOwnerId(
    @Args('ownerId', { type: () => Int }) ownerId: number,
  ): Promise<Restaurant[]> {
    return this.restaurantService.findRestaurantsByOwnerId(ownerId);
  }

  @Query(() => [NearestRestaurant])
  async findRestaurantsByCategory(
    @Args('categoryName', { type: () => String }) categoryName: string,
    @Args('latitude', { type: () => Float }) latitude: number,
    @Args('longitude', { type: () => Float }) longitude: number,
    @Args('limit', { type: () => Int, nullable: true }) limit = 10,
  ): Promise<NearestRestaurant[]> {
    return this.restaurantService.findRestaurantsByCategoryName(
      categoryName,
      latitude,
      longitude,
      limit,
    );
  }

  // Tìm kiếm nhà hàng có TỔNG lượt rating đơn hàng cao nhất
  @Query(() => [TopRatedRestaurant])
  async findTopRatedRestaurants(
    @Args('limit', { type: () => Int, nullable: true }) limit = 10,
  ): Promise<TopRatedRestaurant[]> {
    return this.restaurantService.findTopRatedRestaurants(limit);
  }

  // Tìm kiếm nhà hàng có TÔNG đơn hàng nhiều nhất
  @Query(() => [Restaurant])
  async findMostOrderedRestaurants(
    @Args('limit', { type: () => Int, nullable: true }) limit = 10,
  ): Promise<Restaurant[]> {
    return this.restaurantService.findMostOrderedRestaurants(limit);
  }
}
