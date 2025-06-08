import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ReviewService } from './review.service';
import { Review } from '../../entities/review.entity';
import { CreateReviewInput } from './dto/create-review.input';
import { UpdateReviewInput } from './dto/update-review.input';
import { createPaginatedType } from 'src/utils/paginated';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { PaginatedResponse } from 'src/utils/paginatedType';

const PaginatedReviewResponse = createPaginatedType(
  Review,
  'PaginatedReviewResponse',
);
@Resolver(() => Review)
export class ReviewResolver {
  constructor(private readonly reviewService: ReviewService) {}

  @Mutation(() => Review)
  @UseGuards(AuthGuard)
  async createReview(
    @Args('createReviewInput') createReviewInput: CreateReviewInput,
  ): Promise<Review> {
    return await this.reviewService.create(createReviewInput);
  }

  @Query(() => PaginatedReviewResponse)
  @UseGuards(AuthGuard)
  async findAllReviews(
    @Args('page', { type: () => Int, nullable: true }) page = 1,
    @Args('limit', { type: () => Int, nullable: true }) limit = 10,
  ) {
    return await this.reviewService.findAll(page, limit);
  }

  @Query(() => Review)
  async findOneReviewById(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Review> {
    return await this.reviewService.findOne(id);
  }

  @Mutation(() => Review)
  @UseGuards(AuthGuard)
  async updateReview(
    @Args('updateReviewInput') updateReviewInput: UpdateReviewInput,
  ): Promise<Review> {
    return await this.reviewService.update(
      updateReviewInput.id,
      updateReviewInput,
    );
  }

  @Mutation(() => Review)
  @UseGuards(AuthGuard)
  async removeReview(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Review> {
    return this.reviewService.remove(id);
  }

  @Query(() => Review)
  async findReviewByOrderIdAndUserId(
    @Args('orderId', { type: () => Int }) orderId: number,
    @Args('userId', { type: () => Int }) userId: number,
  ): Promise<Review> {
    return this.reviewService.findReviewByOrderIdAndUserId(orderId, userId);
  }

  @Query(() => PaginatedReviewResponse)
  async findReviewsByOrderId(
    @Args('orderId', { type: () => Int }) orderId: number,
    @Args('page', { type: () => Int, nullable: true }) page = 1,
    @Args('limit', { type: () => Int, nullable: true }) limit = 10,
  ): Promise<PaginatedResponse<Review>> {
    return this.reviewService.findReviewsByOrderId(orderId, page, limit);
  }

  @Query(() => PaginatedReviewResponse)
  async findReviewsByRestaurantId(
    @Args('restaurantId', { type: () => Int }) restaurantId: number,
    @Args('page', { type: () => Int, nullable: true }) page = 1,
    @Args('limit', { type: () => Int, nullable: true }) limit = 10,
  ): Promise<PaginatedResponse<Review>> {
    return this.reviewService.findReviewsByRestaurantId(
      restaurantId,
      page,
      limit,
    );
  }
}
