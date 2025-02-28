import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, ManyToMany, ManyToOne } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { Role } from './role.entity';

@Entity({ name: 'users' })
@ObjectType('Users')
export class User extends AbstractEntity<User> {
  @Field(() => String, { nullable: true })
  @Column()
  name: string;

  @Field(() => String)
  @Column({ nullable: false })
  username: string;

  @Field(() => String)
  @Column({ nullable: false })
  password: string;

  @Field(() => String)
  @Column({ nullable: false, unique: true })
  email: string;

  @Field(() => String)
  @Column({ nullable: true })
  gender: string;

  @Field(() => String)
  @Column({ nullable: true })
  address: string;

  @Field(() => String)
  @Column({ nullable: true })
  phone: string;

  @Field(() => Int)
  @Column({ nullable: true })
  type: number;

  @ManyToOne(() => Role, (role) => role.users)
  @Field(() => Role)
  role: Role;
}
