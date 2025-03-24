import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { RestaurantService } from './restaurant.service';
import { Restaurant } from '../../entities/restaurant.entity';
import { CreateRestaurantInput } from './dto/create-restaurant.input';
import { UpdateRestaurantInput } from './dto/update-restaurant.input';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(() => Restaurant)
  async createRestaurant(
    @Args('createRestaurantInput') createRestaurantInput: CreateRestaurantInput,
  ): Promise<Restaurant> {
    return await this.restaurantService.create(createRestaurantInput);
  }

  @Query(() => [Restaurant], { name: 'restaurants' }) // ✅ Đổi tên tránh trùng lặp
  async findAll(): Promise<Restaurant[]> {
    return await this.restaurantService.findAll();
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
}
