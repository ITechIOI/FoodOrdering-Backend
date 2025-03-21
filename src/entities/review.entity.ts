import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Order } from './order.entity';
import { Complaint } from './complaint.entity';

@Entity({ name: 'reviews' })
@ObjectType('Review')
export class Review extends AbstractEntity<Review> {
  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  rating: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  content: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  imageUrl: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'enum',
    enum: ['true', 'false'],
    default: 'false',
  })
  isNegative: string;

  @Field(() => Order, { nullable: true })
  @ManyToOne(() => Order, (order) => order.review)
  order: Order;

  @Field(() => [Complaint], { nullable: true })
  @OneToMany(() => Complaint, (complaint) => complaint.review)
  complaint: Complaint[];
}

// @Entity({ name: 'revenue_report' })
// @ObjectType('RevenueReport')
// export class RevenueReport extends AbstractEntity<RevenueReport> {
//   @Field(() => Number, { nullable: true })
//   @Column({ nullable: true, default: 1 })
//   month: number;
