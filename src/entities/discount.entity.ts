import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Column, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Order } from './order.entity';

@Entity({ name: 'discounts' })
@ObjectType('Discount')
export class Discount extends AbstractEntity<Discount> {
  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  code: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  description: string;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'float', nullable: true })
  percentage: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  minOrderValue: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  count: number;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startTime: Date;

  @Field(() => Date, { nullable: true })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  endTime: Date;

  // Values in ['available', 'unavailable']
  @Field(() => String, { nullable: true })
  @Column({
    type: 'enum',
    enum: ['available', 'unavailable'],
    default: 'unavailable',
  })
  status: string;

  @Field(() => [Order], { nullable: true })
  @OneToMany(() => Order, (order) => order.discount)
  order: Order[];
}

// @Entity({ name: 'categories' })
// @ObjectType('Category')
// export class Category extends AbstractEntity<Category> {
//   @Field(() => String)
//   @Column({ nullable: false })
//   name: string;
