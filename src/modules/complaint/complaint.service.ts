import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Complaint } from 'src/entities/complaint.entity';
import { CreateComplaintInput } from './dto/create-complaint.input';
import { UpdateComplaintInput } from './dto/update-complaint.input';
import { UsersService } from '../users/users.service';
import { ReviewService } from '../review/review.service';
import { PaginatedResponse } from 'src/utils/paginatedType';

@Injectable()
export class ComplaintService {
  constructor(
    @InjectRepository(Complaint)
    private readonly complaintRepository: Repository<Complaint>,
    private readonly userService: UsersService,
    private readonly reviewService: ReviewService,
  ) {}

  async create(createComplaintInput: CreateComplaintInput): Promise<Complaint> {
    const { sellerId, adminId, reviewId, ...data } = createComplaintInput;

    const seller = await this.userService.findOneById(sellerId);
    if (!seller) {
      throw new NotFoundException(`Seller with ID ${sellerId} not found`);
    }

    const admin = await this.userService.findOneById(adminId);
    if (!admin) {
      throw new NotFoundException(`Admin with ID ${adminId} not found`);
    }

    const review = await this.reviewService.findOne(reviewId);
    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    // Tạo complaint object
    const complaint = this.complaintRepository.create({
      ...data,
      seller,
      admin,
      review,
    });

    // Lưu vào database
    return await this.complaintRepository.save(complaint);
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<Complaint>> {
    const [data, total] = await this.complaintRepository.findAndCount({
      where: { deletedAt: IsNull() },
      relations: ['seller', 'admin', 'review'],
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total };
  }

  async findOne(id: number): Promise<Complaint> {
    const complaint = await this.complaintRepository.findOne({
      where: { id, deletedAt: IsNull() }, // Thêm điều kiện deletedAt = null
      relations: ['seller', 'admin', 'review'],
    });
    if (!complaint) {
      throw new NotFoundException(
        `Complaint with ID ${id} not found or has been deleted`,
      );
    }
    return complaint;
  }

  async update(
    id: number,
    updateComplaintInput: UpdateComplaintInput,
  ): Promise<Complaint> {
    const complaint = await this.findOne(id);
    if (updateComplaintInput.content) {
      complaint.content = updateComplaintInput.content;
    }
    if (updateComplaintInput.imageUrl) {
      complaint.imageUrl = updateComplaintInput.imageUrl;
    }
    if (updateComplaintInput.response) {
      complaint.response = updateComplaintInput.response;
    }
    return this.complaintRepository.save(complaint);
  }

  async remove(id: number): Promise<Complaint> {
    const complaint = await this.findOne(id);
    complaint.deletedAt = new Date();
    return this.complaintRepository.save(complaint);
  }
}
