import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { User } from './user.entity';

@Entity({ name: 'messages' })
@ObjectType('Message')
export class Message extends AbstractEntity<Message> {
  @Field(() => String, { nullable: false })
  @Column({ nullable: false })
  content: string;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  @Column({ nullable: true, default: false })
  isChecked: boolean;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.receiver_messages)
  receiver: User;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.sender_messages)
  sender: User;
}
