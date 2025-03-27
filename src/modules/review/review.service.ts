import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreateReviewInput } from './dto/create-review.input';
import { UpdateReviewInput } from './dto/update-review.input';
import { OrderService } from '../order/order.service';
import { Review } from 'src/entities/review.entity';
import { PaginatedResponse } from 'src/utils/paginatedType';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly orderService: OrderService,
  ) {}

  async create(createReviewInput: CreateReviewInput): Promise<Review> {
    const { orderId, ...reviewData } = createReviewInput;

    const order = await this.orderService.findOne(orderId);
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const review = this.reviewRepository.create({
      ...reviewData,
      order,
    });

    return this.reviewRepository.save(review);
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<Review>> {
    const [data, total] = await this.reviewRepository.findAndCount({
      relations: ['order'],
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  async findOne(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['order'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  async update(
    id: number,
    updateReviewInput: UpdateReviewInput,
  ): Promise<Review> {
    const review = await this.findOne(id);
    Object.assign(review, updateReviewInput);
    return this.reviewRepository.save(review);
  }

  async remove(id: number): Promise<Review> {
    const review = await this.findOne(id);
    review.deletedAt = new Date();
    return await this.reviewRepository.save(review);
  }
}
