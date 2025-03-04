import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, ManyToMany, ManyToOne } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Role } from './role.entity';

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
  address: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  phone: string;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  type: number;

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
}
