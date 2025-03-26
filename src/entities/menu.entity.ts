import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Category } from './category.entity';
import { OrderDetail } from './order_detail.entity';

@Entity({ name: 'menu' })
@ObjectType('Menu')
export class Menu extends AbstractEntity<Menu> {
  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  description: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  price: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  quantity: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  imageUrl: string;

  // value in ['available', 'unavailable']
  @Field(() => String, { nullable: true })
  @Column({
    type: 'enum',
    enum: ['available', 'unavailable'],
    default: 'unavailable',
  })
  available: string;

  @Field(() => Category, { nullable: true })
  @ManyToOne(() => Category, (category) => category.menu)
  category: Category;

  @Field(() => [OrderDetail], { nullable: true })
  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.menu)
  orderDetail: OrderDetail[];
}

// @Entity({ name: 'address' })
// @ObjectType('Address')
// export class Address extends AbstractEntity<Address> {
//   @Field(() => Int, { nullable: true })
//   @Column({ nullable: true })
//   exampleField: number;
