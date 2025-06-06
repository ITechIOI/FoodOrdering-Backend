import { Resolver, Query, Mutation, Args, Int, Float } from '@nestjs/graphql';
import { RestaurantService } from './restaurant.service';
import { Restaurant } from '../../entities/restaurant.entity';
import { CreateRestaurantInput } from './dto/create-restaurant.input';
import { UpdateRestaurantInput } from './dto/update-restaurant.input';
import { NearestRestaurant } from './dto/output/NearestRestaurant';
import { createPaginatedType } from 'src/utils/paginated';
import { TopRatedRestaurant } from './dto/output/TopRatedRestaurant';
import { PaginatedResponse } from 'src/utils/paginatedType';
import { BestSellingRestaurant } from './dto/output/BestSellingRestaurant';
const PaginatedRestaurantResponse = createPaginatedType(
  Restaurant,
  'PaginatedRestaurantResponse',
);

const PaginatedResponseNearestRestaurant = createPaginatedType(
  NearestRestaurant,
  'PaginatedResponseNearestRestaurant',
);

const PaginatedResponseTopRatedRestaurant = createPaginatedType(
  TopRatedRestaurant,
  'PaginatedResponseTopRatedRestaurant',
);

const PaginatedResponseFindNearestRestaurants = createPaginatedType(
  NearestRestaurant,
  'PaginatedResponseFindNearestRestaurants',
);

const PaginatedResponseBestSellingRestaurant = createPaginatedType(
  BestSellingRestaurant,
  'PaginatedResponseBestSellingRestaurant',
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

  @Query(() => NearestRestaurant)
  async findRestaurantById(
    @Args('id', { type: () => Int }) id: number,
    @Args('latitude', { type: () => Float }) latitude: number,
    @Args('longitude', { type: () => Float }) longitude: number,
  ): Promise<NearestRestaurant> {
    return await this.restaurantService.findOneById(id, latitude, longitude);
  }

  @Query(() => Restaurant)
  async findByIdNotLocation(
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

  @Query(() => PaginatedResponseFindNearestRestaurants)
  async searchNearestRestaurants(
    @Args('latitude', { type: () => Float }) latitude: number,
    @Args('longitude', { type: () => Float }) longitude: number,
    @Args('page', { type: () => Int, defaultValue: 0 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ): Promise<
    PaginatedResponse<
      Restaurant & { distance: number } & { averageRating: number }
    >
  > {
    return this.restaurantService.findNearestRestaurants(
      latitude,
      longitude,
      page,
      limit,
    );
  }

  @Query(() => PaginatedResponseFindNearestRestaurants)
  async searchNearestRestaurantsByName(
    @Args('latitude', { type: () => Float }) latitude: number,
    @Args('longitude', { type: () => Float }) longitude: number,
    @Args('keyword', { type: () => String }) keyword: string,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ): Promise<
    PaginatedResponse<Restaurant & { distance: number; averageRating: number }>
  > {
    return this.restaurantService.findNearestRestaurantsByName(
      latitude,
      longitude,
      keyword,
      page,
      limit,
    );
  }

  @Query(() => [Restaurant])
  async findRestaurantsByOwnerId(
    @Args('ownerId', { type: () => Int }) ownerId: number,
  ): Promise<Restaurant[]> {
    return this.restaurantService.findRestaurantsByOwnerId(ownerId);
  }

  @Query(() => PaginatedResponseFindNearestRestaurants)
  async findRestaurantsByCategory(
    @Args('categoryName', { type: () => String }) categoryName: string,
    @Args('latitude', { type: () => Float }) latitude: number,
    @Args('longitude', { type: () => Float }) longitude: number,
    @Args('page', { type: () => Int, nullable: true }) page = 1,
    @Args('limit', { type: () => Int, nullable: true }) limit = 10,
  ): Promise<
    PaginatedResponse<Restaurant & { distance: number; averageRating: number }>
  > {
    return this.restaurantService.findRestaurantsByCategoryName(
      categoryName,
      latitude,
      longitude,
      page,
      limit,
    );
  }

  @Query(() => PaginatedResponseNearestRestaurant)
  async findRestaurantsByName(
    @Args('latitude', { type: () => Float }) latitude: number,
    @Args('longitude', { type: () => Float }) longitude: number,
    @Args('name', { type: () => String }) name: string,
    @Args('page', { type: () => Int, nullable: true }) page: number = 1,
    @Args('limit', { type: () => Int, nullable: true }) limit: number = 10,
  ): Promise<Promise<PaginatedResponse<NearestRestaurant>>> {
    return this.restaurantService.findRestaurantsByName(
      longitude,
      latitude,
      name,
      page,
      limit,
    );
  }

  // Tìm kiếm nhà hàng có TỔNG lượt rating đơn hàng cao nhất
  @Query(() => PaginatedResponseTopRatedRestaurant)
  async findTopRatedRestaurants(
    @Args('latitude', { type: () => Float }) latitude: number,
    @Args('longitude', { type: () => Float }) longitude: number,
    @Args('page', { type: () => Int, nullable: true }) page = 1,
    @Args('limit', { type: () => Int, nullable: true }) limit = 10,
  ): Promise<PaginatedResponse<TopRatedRestaurant & { distance: number }>> {
    return this.restaurantService.findTopRatedRestaurants(
      latitude,
      longitude,
      page,
      limit,
    );
  }

  @Query(() => PaginatedResponseTopRatedRestaurant)
  async findTopRatedRestaurantsByName(
    @Args('latitude', { type: () => Float }) latitude: number,
    @Args('longitude', { type: () => Float }) longitude: number,
    @Args('name', { type: () => String }) name: string,
    @Args('page', { type: () => Int, nullable: true }) page = 1,
    @Args('limit', { type: () => Int, nullable: true }) limit = 10,
  ): Promise<PaginatedResponse<TopRatedRestaurant & { distance: number }>> {
    return this.restaurantService.findTopRatedRestaurantsByName(
      latitude,
      longitude,
      name,
      page,
      limit,
    );
  }

  // Tìm kiếm nhà hàng có TÔNG đơn hàng nhiều nhất
  @Query(() => PaginatedResponseBestSellingRestaurant)
  async findMostOrderedRestaurants(
    @Args('latitude', { type: () => Float }) latitude: number,
    @Args('longitude', { type: () => Float }) longitude: number,
    @Args('page', { type: () => Int, nullable: true }) page = 1,
    @Args('limit', { type: () => Int, nullable: true }) limit = 10,
  ): Promise<PaginatedResponse<BestSellingRestaurant>> {
    return this.restaurantService.findMostOrderedRestaurants(
      latitude,
      longitude,
      page,
      limit,
    );
  }

  @Query(() => PaginatedResponseBestSellingRestaurant)
  async findMostOrderedRestaurantsByName(
    @Args('latitude', { type: () => Float }) latitude: number,
    @Args('longitude', { type: () => Float }) longitude: number,
    @Args('name', { type: () => String }) name: string,
    @Args('page', { type: () => Int, nullable: true }) page = 1,
    @Args('limit', { type: () => Int, nullable: true }) limit = 10,
  ): Promise<PaginatedResponse<BestSellingRestaurant>> {
    return this.restaurantService.findMostOrderedRestaurantsByName(
      latitude,
      longitude,
      name,
      page,
      limit,
    );
  }
}
