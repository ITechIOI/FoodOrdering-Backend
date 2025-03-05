import { Module } from '@nestjs/common';
import { RevenueReportService } from './revenue_report.service';
import { RevenueReportResolver } from './revenue_report.resolver';

@Module({
  providers: [RevenueReportResolver, RevenueReportService],
})
export class RevenueReportModule {}
