import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { User } from './user.entity';
import { Address } from './address.entity';
import { Restaurant } from './restaurant.entity';
import { Discount } from './discount.entity';
import { Payment } from './payment.entity';
import { Review } from './review.entity';
import { Notification } from './notification.entity';
import { OrderDetail } from './order_detail.entity';

@Entity({ name: 'orders' })
@ObjectType('Order')
export class Order extends AbstractEntity<Order> {
  @Field(() => Number, { nullable: true })
  @Column({ nullable: true, default: 0 })
  totalPrice: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true, default: 0 })
  shippingFee: number;

  // Values in ['pending', 'completed', 'cancelled']
  @Field(() => String, { nullable: true })
  @Column({
    type: 'enum',
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.order)
  user: User;

  @Field(() => Address, { nullable: true })
  @ManyToOne(() => Address, (address) => address.order)
  address: Address;

  @Field(() => Restaurant, { nullable: true })
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.order)
  restaurant: Restaurant;

  // Discount
  @Field(() => Discount, { nullable: true })
  @ManyToOne(() => Discount, (discount) => discount.order)
  discount: Discount;

  // Payment
  @Field(() => [Payment], { nullable: true })
  @OneToMany(() => Payment, (payment) => payment.order)
  payment: Payment[];

  @Field(() => [Review], { nullable: true })
  @OneToMany(() => Review, (review) => review.order)
  review: Review[];

  @Field(() => [OrderDetail], { nullable: true })
  @OneToMany(() => OrderDetail, (details) => details.order)
  orderDetail: OrderDetail[];

  // @Field(() => [Notification], { nullable: true })
  // @OneToMany(() => Notification, (review) => review.order)
  // notification: Notification[];
}
