import { ObjectType, Field, Float } from '@nestjs/graphql';
import { Restaurant } from 'src/entities/restaurant.entity';

@ObjectType()
export class TopRatedRestaurant {
  @Field(() => Restaurant)
  restaurant: Restaurant;

  @Field(() => Float)
  averageRating: number;
}
