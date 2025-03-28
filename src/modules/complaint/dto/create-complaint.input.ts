import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateComplaintInput {
  @Field(() => String, { nullable: true })
  content?: string;

  @Field(() => String, { nullable: true })
  imageUrl?: string;

  @Field(() => String, { nullable: true })
  response?: string;

  @Field(() => Int)
  sellerId: number;

  @Field(() => Int)
  adminId: number;

  @Field(() => Number)
  reviewId: number;
}
