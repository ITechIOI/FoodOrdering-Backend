import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CreateReviewInput } from './dto/create-review.input';
import { UpdateReviewInput } from './dto/update-review.input';
import { OrderService } from '../order/order.service';
import { Review } from 'src/entities/review.entity';

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

  async findAll(): Promise<Review[]> {
    return this.reviewRepository.find({ relations: ['order', 'complaint'] });
  }

  async findOne(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['order', 'complaint'],
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

  async remove(id: number): Promise<boolean> {
    const review = await this.findOne(id);
    review.deletedAt = new Date(); // Đánh dấu thời điểm bị xóa
    await this.reviewRepository.save(review);
    return true;
  }
}
