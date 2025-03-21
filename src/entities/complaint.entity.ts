import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { User } from './user.entity';
import { Review } from './review.entity';

@Entity({ name: 'complaints' })
@ObjectType('Complaint')
export class Complaint extends AbstractEntity<Complaint> {
  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  content: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  imageUrl: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  response: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.sellerComplaint)
  seller: User;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.adminComplaint)
  admin: User;

  @Field(() => Review, { nullable: true })
  @ManyToOne(() => Review, (review) => review.complaint)
  review: Review;
}

// @Entity({ name: 'discounts' })
// @ObjectType('Discount')
// export class Discount extends AbstractEntity<Discount> {
//   @Field(() => String, { nullable: true })
//   @Column({ nullable: true })
//   code: string;
