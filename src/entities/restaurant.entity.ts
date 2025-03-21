import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Address } from './address.entity';
import { AbstractEntity } from './abstract.entity';
import { RevenueReport } from './revenue_report.entity';
import { Category } from './category.entity';
import { Order } from './order.entity';
import { User } from './user.entity';

@Entity({ name: 'restaurants' })
@ObjectType('Restaurant')
export class Restaurant extends AbstractEntity<Restaurant> {
  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  description: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  phone: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'time', nullable: true })
  openTime: string;

  @Field(() => String, { nullable: true })
  @Column({ type: 'time', nullable: true })
  closeTime: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  rating: number;

  // Value in ['open', 'close]
  @Field(() => String, { nullable: true })
  @Column({
    type: 'enum',
    enum: ['open', 'close'],
    default: 'close',
  })
  status: string;

  @Field(() => Address, { nullable: true })
  @ManyToOne(() => Address, (address) => address.restaurant, { cascade: true })
  address: Address;

  @Field(() => [RevenueReport], { nullable: true })
  @OneToMany(() => RevenueReport, (revenueReport) => revenueReport.restaurant, {
    cascade: true,
  })
  revenueReport: RevenueReport[];

  @Field(() => [Category], { nullable: true })
  @OneToMany(() => Category, (category) => category.restaurant, {
    cascade: true,
  })
  categories: Category[];

  @Field(() => [Order], { nullable: true })
  @OneToMany(() => Order, (order) => order.restaurant, {
    cascade: true,
  })
  order: Order[];

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.restaurants)
  owner: User;
}
