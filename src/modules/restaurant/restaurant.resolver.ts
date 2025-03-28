import { Resolver, Query, Mutation, Args, Int, Float } from '@nestjs/graphql';
import { RestaurantService } from './restaurant.service';
import { Restaurant } from '../../entities/restaurant.entity';
import { CreateRestaurantInput } from './dto/create-restaurant.input';
import { UpdateRestaurantInput } from './dto/update-restaurant.input';
import { NearestRestaurant } from './dto/output/NearestRestaurant';
import { createPaginatedType } from 'src/utils/paginated';
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
    @Args('keyword') keyword: string,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ): Promise<NearestRestaurant[]> {
    return this.restaurantService.findNearestRestaurantsByName(
      latitude,
      longitude,
      keyword,
      limit,
    );
  }
}
