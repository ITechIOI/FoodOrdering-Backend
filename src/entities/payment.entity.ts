import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Order } from './order.entity';

@Entity({ name: 'payments' })
@ObjectType('Payment')
export class Payment extends AbstractEntity<Payment> {
  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  transactionId: string;

  // value in ['cod', 'wallet']
  @Field(() => String, { nullable: true })
  @Column({
    type: 'enum',
    enum: ['cod', 'paypal'],
    default: 'cod',
  })
  paymentMethod: string;

  // value in ['pending', 'completed', 'cancelled']
  @Field(() => String, { nullable: true })
  @Column({
    type: 'enum',
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Field(() => Order, { nullable: true })
  @ManyToOne(() => Order, (order) => order.payment)
  order: Order;
}

// @Entity({ name: 'orders' })
// @ObjectType('Order')
// export class Order extends AbstractEntity<Order> {
//   @Field(() => Number, { nullable: true })
//   @Column({ nullable: true, default: 0 })
//   totalPrice: number;
