import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRevenueReportInput } from './dto/create-revenue_report.input';
import { UpdateRevenueReportInput } from './dto/update-revenue_report.input';
import { IsNull, Repository } from 'typeorm';
import { RevenueReport } from 'src/entities/revenue_report.entity';
import { RestaurantService } from '../restaurant/restaurant.service';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResponse } from 'src/utils/paginatedType';

@Injectable()
export class RevenueReportService {
  constructor(
    @InjectRepository(RevenueReport)
    private readonly revenueReportRepository: Repository<RevenueReport>,
    private readonly restaurantService: RestaurantService,
  ) {}

  async create(
    createRevenueReportInput: CreateRevenueReportInput,
  ): Promise<RevenueReport> {
    const { restaurantId, ...data } = createRevenueReportInput;
    const restaurant = await this.restaurantService.findOne(restaurantId);
    if (!restaurant) {
      throw new NotFoundException(`Address with ID ${restaurantId} not found`);
    }
    const revenueReport = this.revenueReportRepository.create({
      ...data,
      restaurant,
    });
    return await this.revenueReportRepository.save(revenueReport);
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<RevenueReport>> {
    const [data, total] = await this.revenueReportRepository.findAndCount({
      relations: ['restaurant'],
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async findOne(id: number): Promise<RevenueReport> {
    const revenueReport = await this.revenueReportRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['restaurant'],
    });

    if (!revenueReport)
      throw new NotFoundException(`Revenue report with ID ${id} not found`);
    return revenueReport;
  }

  async update(
    id: number,
    updateRevenueReportInput: UpdateRevenueReportInput,
  ): Promise<RevenueReport> {
    const revenueReport = await this.findOne(id);

    if (updateRevenueReportInput.restaurantId) {
      const restaurant = await this.restaurantService.findOne(
        updateRevenueReportInput.restaurantId,
      );
      if (!restaurant) {
        throw new NotFoundException(
          `Address with ID ${updateRevenueReportInput.restaurantId} not found`,
        );
      }
      revenueReport.restaurant = restaurant;
    }
    Object.assign(revenueReport, updateRevenueReportInput);
    return await this.revenueReportRepository.save(revenueReport);
  }

  async remove(id: number): Promise<RevenueReport> {
    const revenueReport = await this.findOne(id);

    revenueReport.deletedAt = new Date();
    return await this.revenueReportRepository.save(revenueReport);
  }
}
