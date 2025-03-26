import {
  InputType,
  Int,
  Field,
  Float,
  GraphQLISODateTime,
} from '@nestjs/graphql';

@InputType()
export class CreateDiscountInput {
  @Field(() => String, { nullable: true })
  code: string;

  @Field(() => String, { nullable: true })
  description: string;

  @Field(() => Float, { nullable: true })
  percentage: number;

  @Field(() => Int, { nullable: true })
  minOrderValue: number;

  @Field(() => Int, { nullable: true })
  count: number;

  @Field(() => GraphQLISODateTime, { nullable: true })
  startTime: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  endTime: Date;

  @Field(() => String, { nullable: true })
  status: string;
}
