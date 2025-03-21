import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { AbstractEntity } from './abstract.entity';
import { Menu } from './menu.entity';

@Entity({ name: 'categories' })
@ObjectType('Category')
export class Category extends AbstractEntity<Category> {
  @Field(() => String)
  @Column({ nullable: false })
  name: string;

  @Field(() => Restaurant, { nullable: true })
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.categories)
  restaurant: Restaurant;

  @Field(() => [Menu], { nullable: true })
  @OneToMany(() => Menu, (menu) => menu.category)
  menu: Menu[];
}

// @Entity({ name: 'address' })
// @ObjectType('Address')
// export class Address extends AbstractEntity<Address> {
//   @Field(() => String, { nullable: true })
//   @Column({ nullable: true })
//   label: string;
