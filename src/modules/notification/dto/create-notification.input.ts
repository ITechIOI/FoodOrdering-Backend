import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateNotificationInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  content: string;

  @Field(() => String)
  type: string;

  @Field(() => String)
  isRead: string;

  @Field(() => Int)
  userId: number;

  // @Field(() => Int)
  // orderId: number;
}
