import { Test, TestingModule } from '@nestjs/testing';
import { RevenueReportService } from './revenue_report.service';

describe('RevenueReportService', () => {
  let service: RevenueReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RevenueReportService],
    }).compile();

    service = module.get<RevenueReportService>(RevenueReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
