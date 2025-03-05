import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { RevenueReportService } from './revenue_report.service';
import { RevenueReport } from '../../entities/revenue_report.entity';
import { CreateRevenueReportInput } from './dto/create-revenue_report.input';
import { UpdateRevenueReportInput } from './dto/update-revenue_report.input';

@Resolver(() => RevenueReport)
export class RevenueReportResolver {
  constructor(private readonly revenueReportService: RevenueReportService) {}

  @Mutation(() => RevenueReport)
  createRevenueReport(@Args('createRevenueReportInput') createRevenueReportInput: CreateRevenueReportInput) {
    return this.revenueReportService.create(createRevenueReportInput);
  }

  @Query(() => [RevenueReport], { name: 'revenueReport' })
  findAll() {
    return this.revenueReportService.findAll();
  }

  @Query(() => RevenueReport, { name: 'revenueReport' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.revenueReportService.findOne(id);
  }

  @Mutation(() => RevenueReport)
  updateRevenueReport(@Args('updateRevenueReportInput') updateRevenueReportInput: UpdateRevenueReportInput) {
    return this.revenueReportService.update(updateRevenueReportInput.id, updateRevenueReportInput);
  }

  @Mutation(() => RevenueReport)
  removeRevenueReport(@Args('id', { type: () => Int }) id: number) {
    return this.revenueReportService.remove(id);
  }
}
