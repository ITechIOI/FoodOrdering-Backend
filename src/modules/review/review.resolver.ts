import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ReviewService } from './review.service';
import { Review } from '../../entities/review.entity';
import { CreateReviewInput } from './dto/create-review.input';
import { UpdateReviewInput } from './dto/update-review.input';
import { createPaginatedType } from 'src/utils/paginated';

const PaginatedReviewResponse = createPaginatedType(
  Review,
  'PaginatedReviewResponse',
);
@Resolver(() => Review)
export class ReviewResolver {
  constructor(private readonly reviewService: ReviewService) {}

  @Mutation(() => Review)
  async createReview(
    @Args('createReviewInput') createReviewInput: CreateReviewInput,
  ): Promise<Review> {
    return await this.reviewService.create(createReviewInput);
  }

  @Query(() => PaginatedReviewResponse, { name: 'review' })
  async findAll(
    @Args('page', { type: () => Int, nullable: true }) page = 1,
    @Args('limit', { type: () => Int, nullable: true }) limit = 10,
  ) {
    return await this.reviewService.findAll(page, limit);
  }

  @Query(() => Review, { name: 'review' })
  async findOne(@Args('id', { type: () => Int }) id: number): Promise<Review> {
    return await this.reviewService.findOne(id);
  }

  @Mutation(() => Review)
  async updateReview(
    @Args('updateReviewInput') updateReviewInput: UpdateReviewInput,
  ): Promise<Review> {
    return await this.reviewService.update(
      updateReviewInput.id,
      updateReviewInput,
    );
  }

  @Mutation(() => Review)
  async removeReview(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Review> {
    return this.reviewService.remove(id);
  }
}
