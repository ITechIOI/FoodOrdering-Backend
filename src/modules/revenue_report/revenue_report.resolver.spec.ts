import { Test, TestingModule } from '@nestjs/testing';
import { RevenueReportResolver } from './revenue_report.resolver';
import { RevenueReportService } from './revenue_report.service';

describe('RevenueReportResolver', () => {
  let resolver: RevenueReportResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RevenueReportResolver, RevenueReportService],
    }).compile();

    resolver = module.get<RevenueReportResolver>(RevenueReportResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
