import { Field, Float, ObjectType } from '@nestjs/graphql';
import { Restaurant } from 'src/entities/restaurant.entity';

@ObjectType()
export class NearestRestaurant extends Restaurant {
  @Field(() => Float)
  distance: number;
}
