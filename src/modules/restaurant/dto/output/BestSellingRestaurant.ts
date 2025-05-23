import { ObjectType, Field, Float } from '@nestjs/graphql';
import { Restaurant } from 'src/entities/restaurant.entity';

@ObjectType()
export class BestSellingRestaurant {
  @Field(() => Restaurant)
  restaurant: Restaurant;

  @Field(() => Float)
  totalOrders: number;

  @Field(() => Float)
  distance: number;
}
