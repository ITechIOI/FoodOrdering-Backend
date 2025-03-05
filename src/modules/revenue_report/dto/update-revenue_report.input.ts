import { CreateRevenueReportInput } from './create-revenue_report.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateRevenueReportInput extends PartialType(CreateRevenueReportInput) {
  @Field(() => Int)
  id: number;
}
