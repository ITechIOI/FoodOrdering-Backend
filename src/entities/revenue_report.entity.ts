import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Restaurant } from './restaurant.entity';

@Entity({ name: 'revenue_report' })
@ObjectType('RevenueReport')
export class RevenueReport extends AbstractEntity<RevenueReport> {
  @Field(() => Int, { nullable: true })
  @Column({ nullable: true, default: 1 })
  month: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true, default: 2025 })
  year: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true, default: 0 })
  totalOrders: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true, default: 0 })
  totalRevenue: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true, default: 0 })
  cancalledOrders: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true, default: 0 })
  averageRating: number;

  @Field(() => Restaurant, { nullable: true })
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.revenueReport)
  restaurant: Restaurant;
}

// @Entity({ name: 'address' })
// @ObjectType('Address')
// export class Address extends AbstractEntity<Address> {
//   @Field(() => Int, { nullable: true })
//   @Column({ nullable: true })
//   exampleField: number;
