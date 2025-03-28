import { Module } from '@nestjs/common';
import { RevenueReportService } from './revenue_report.service';
import { RevenueReportResolver } from './revenue_report.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantModule } from '../restaurant/restaurant.module';
import { RevenueReport } from 'src/entities/revenue_report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RevenueReport]), RestaurantModule],
  providers: [RevenueReportResolver, RevenueReportService],
  exports: [RevenueReportService],
})
export class RevenueReportModule {}
