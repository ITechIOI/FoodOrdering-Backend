import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity } from 'typeorm';
import { AbstractEntity } from './abstract.entity';

@Entity({name: 'users'})
@ObjectType("Users")
export class User extends AbstractEntity<User> {

  @Field(() => String)
  @Column({nullable: false})
  name: string;

  @Field(() => String)
  @Column({nullable: false})
  email: string;

  @Field(() => String)
  @Column({nullable: true})
  gender: string;

  @Field(() => String)
  @Column({nullable: true})
  address: string;

  @Field(() => String)
  @Column({nullable: true})
  phone: string;

  @Field(() => String)
  @Column({nullable: true})
  type: string;
}
