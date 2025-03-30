import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Role } from './role.entity';
import { Order } from './order.entity';
import { Complaint } from './complaint.entity';
import { Notification } from './notification.entity';
import { OrderDetail } from './order_detail.entity';
import { Restaurant } from './restaurant.entity';
import { Address } from './address.entity';
@Entity({ name: 'users' })
@ObjectType('Users')
export class User extends AbstractEntity<User> {
  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  username: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  password: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true, unique: true })
  email: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  gender: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  phone: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  status: string;

  @Field(() => String, { nullable: true })
  @Column({
    nullable: true,
  })
  fcmToken: string;

  @ManyToOne(() => Role, (role) => role.users)
  @Field(() => Role)
  role: Role;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  avatar: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  otpCode: string;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  otpExpiresAt: Date;

  @Field(() => [Order], { nullable: true })
  @OneToMany(() => Order, (order) => order.user)
  order: Order[];

  @Field(() => [Complaint], { nullable: true })
  @OneToMany(() => Complaint, (complaint) => complaint.seller)
  sellerComplaint: Complaint[];

  @Field(() => [Complaint], { nullable: true })
  @OneToMany(() => Complaint, (complaint) => complaint.admin)
  adminComplaint: Complaint[];

  @Field(() => [Notification], { nullable: true })
  @OneToMany(() => Notification, (notification) => notification.receiver)
  notification: Notification[];

  // @Field(() => [OrderDetail], { nullable: true })
  // @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.user)
  // orderDetail: OrderDetail[];

  @Field(() => [Restaurant], { nullable: true })
  @OneToMany(() => Restaurant, (restaurant) => restaurant.owner)
  restaurants: Restaurant[];

  @Field(() => Address, { nullable: true })
  @ManyToOne(() => Address, (address) => address.user)
  address: Address;
}
