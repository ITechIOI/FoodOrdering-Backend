import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateMessageInput {
  @Field(() => String)
  content: string;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  isChecked: boolean;

  @Field(() => Int)
  receiverId: number;

  @Field(() => Int)
  senderId: number;
}
