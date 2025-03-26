import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { AbstractEntity } from './abstract.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { Order } from './order.entity';
import { User } from './user.entity';

@Entity({ name: 'address' })
@ObjectType('Address')
export class Address extends AbstractEntity<Address> {
  // restaurant/order/user
  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  label: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  province: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  district: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  ward: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  street: string;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  placeId: string;

  @Field(() => [Restaurant], { nullable: true })
  @OneToMany(() => Restaurant, (restaurant) => restaurant.address)
  restaurant: Restaurant[];

  @Field(() => [Order], { nullable: true })
  @OneToMany(() => Order, (order) => order.address)
  order: Order[];

  @Field(() => [User], { nullable: true })
  @OneToMany(() => User, (user) => user.address)
  user: User[];
}
