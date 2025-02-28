import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { User } from './user.entity';

@Entity({ name: 'roles' })
@ObjectType('Roles')
export class Role extends AbstractEntity<Role> {
  @Field(() => String)
  @Column()
  name: string;

  @OneToMany(() => User, (user) => user.role)
  @Field(() => [User])
  users: User[];
}
