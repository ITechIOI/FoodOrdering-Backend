import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { User } from './user.entity';
import { Order } from './order.entity';

@Entity({ name: 'notifications' })
@ObjectType('Notification')
export class Notification extends AbstractEntity<Notification> {
  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  title: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  content: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'enum',
    enum: ['push', 'email'],
    default: 'push',
  })
  type: string;

  @Field(() => String, { nullable: true })
  @Column({
    type: 'enum',
    enum: ['read', 'unread'],
    default: 'unread',
  })
  isRead: string;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.notification)
  receiver: User;

  // @Field(() => Order, { nullable: true })
  // @ManyToOne(() => Order, (order) => order.notification)
  // order: Order;
}
