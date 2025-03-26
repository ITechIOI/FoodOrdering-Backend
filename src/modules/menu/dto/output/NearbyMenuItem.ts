import { Field, Float, ObjectType } from '@nestjs/graphql';
import { Menu } from 'src/entities/menu.entity';

@ObjectType()
export class NearbyMenuItem extends Menu {
  @Field(() => Float)
  distance: number;

  @Field()
  restaurantName: string;

  @Field()
  categoryName: string;
}
