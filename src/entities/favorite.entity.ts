import { ObjectType, Field, Int } from '@nestjs/graphql';
import { AbstractEntity } from './abstract.entity';
import { Restaurant } from './restaurant.entity';
import { Entity, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'favorite' })
@ObjectType('Favorite')
export class Favorite extends AbstractEntity<Favorite> {
  @Field(() => Restaurant, { nullable: true })
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.favorite)
  restaurant: Restaurant;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.favorite)
  user: User;
}
