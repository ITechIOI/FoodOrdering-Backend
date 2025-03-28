import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { RevenueReportService } from './revenue_report.service';
import { RevenueReport } from '../../entities/revenue_report.entity';
import { CreateRevenueReportInput } from './dto/create-revenue_report.input';
import { UpdateRevenueReportInput } from './dto/update-revenue_report.input';
import { createPaginatedType } from 'src/utils/paginated';

const PaginatedRevenueReportResponse = createPaginatedType(
  RevenueReport,
  'PaginatedRevenueReportResponse',
);
@Resolver(() => RevenueReport)
export class RevenueReportResolver {
  constructor(private readonly revenueReportService: RevenueReportService) {}

  @Mutation(() => RevenueReport)
  async createRevenueReport(
    @Args('createRevenueReportInput')
    createRevenueReportInput: CreateRevenueReportInput,
  ): Promise<RevenueReport> {
    return await this.revenueReportService.create(createRevenueReportInput);
  }

  @Query(() => PaginatedRevenueReportResponse, { name: 'revenueReports' })
  async findAll(
    @Args('page', { type: () => Int, nullable: true }) page = 1,
    @Args('limit', { type: () => Int, nullable: true }) limit = 10,
  ) {
    return await this.revenueReportService.findAll(page, limit);
  }

  @Query(() => RevenueReport, { name: 'revenueReport' })
  async findOne(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<RevenueReport> {
    return await this.revenueReportService.findOne(id);
  }

  @Mutation(() => RevenueReport)
  async updateRevenueReport(
    @Args('updateRevenueReportInput')
    updateRevenueReportInput: UpdateRevenueReportInput,
  ): Promise<RevenueReport> {
    return await this.revenueReportService.update(
      updateRevenueReportInput.id,
      updateRevenueReportInput,
    );
  }

  @Mutation(() => RevenueReport)
  async removeRevenueReport(@Args('id', { type: () => Int }) id: number) {
    return await this.revenueReportService.remove(id);
  }
}
