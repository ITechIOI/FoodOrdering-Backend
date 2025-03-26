import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Menu } from './menu.entity';
import { User } from './user.entity';
import { Order } from './order.entity';

@Entity({ name: 'order_details' })
@ObjectType('OrderDetail')
export class OrderDetail extends AbstractEntity<OrderDetail> {
  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  quantity: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  note: string;

  @Field(() => Menu, { nullable: true })
  @ManyToOne(() => Menu, (menu) => menu.orderDetail)
  menu: Menu;

  // @Field(() => User, { nullable: true })
  // @ManyToOne(() => User, (user) => user.orderDetail)
  // user: User;

  @Field(() => Order, { nullable: true })
  @ManyToOne(() => Order, (order) => order.orderDetail)
  order: Order;
}
