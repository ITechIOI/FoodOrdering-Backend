import { ObjectType, Field, Int } from '@nestjs/graphql';
import { AbstractEntity } from './abstract.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Restaurant } from './restaurant.entity';
import { Order } from './order.entity';
import { User } from './user.entity';

@Entity({ name: 'address' })
@ObjectType('Address')
export class Address extends AbstractEntity<Address> {
  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  label: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  formattedAddress: string;

  @Field(() => Int, { nullable: true })
  @Column({ type: 'decimal', precision: 10, scale: 4 })
  latitude: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  longitude: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  googleId: string;

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
