import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('RevenueByYear')
export class RevenueByYear {
  @Field(() => Number)
  month: number;

  @Field(() => Number)
  totalRevenue: number;
}
