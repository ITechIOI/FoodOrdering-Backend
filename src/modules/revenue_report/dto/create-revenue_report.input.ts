import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateRevenueReportInput {
  @Field(() => Int, { nullable: true })
  month?: number;

  @Field(() => Int, { nullable: true })
  year?: number;

  @Field(() => Int, { nullable: true })
  totalOrders?: number;

  @Field(() => Int, { nullable: true })
  totalRevenue?: number;

  @Field(() => Int, { nullable: true })
  cancalledOrders?: number;

  @Field(() => Int, { nullable: true })
  averageRating?: number;

  @Field(() => Int)
  restaurantId: number;
}
