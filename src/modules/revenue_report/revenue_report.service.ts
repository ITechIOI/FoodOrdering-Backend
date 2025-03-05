import { Injectable } from '@nestjs/common';
import { CreateRevenueReportInput } from './dto/create-revenue_report.input';
import { UpdateRevenueReportInput } from './dto/update-revenue_report.input';

@Injectable()
export class RevenueReportService {
  create(createRevenueReportInput: CreateRevenueReportInput) {
    return 'This action adds a new revenueReport';
  }

  findAll() {
    return `This action returns all revenueReport`;
  }

  findOne(id: number) {
    return `This action returns a #${id} revenueReport`;
  }

  update(id: number, updateRevenueReportInput: UpdateRevenueReportInput) {
    return `This action updates a #${id} revenueReport`;
  }

  remove(id: number) {
    return `This action removes a #${id} revenueReport`;
  }
}
