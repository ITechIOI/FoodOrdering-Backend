import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { DiscountService } from './discount.service';
import { Discount } from '../../entities/discount.entity';
import { CreateDiscountInput } from './dto/create-discount.input';
import { UpdateDiscountInput } from './dto/update-discount.input';
import { createPaginatedType } from 'src/utils/paginated';

const PaginatedDiscount = createPaginatedType(Discount, 'PaginatedDiscount');

@Resolver(() => Discount)
export class DiscountResolver {
  constructor(private readonly discountService: DiscountService) {}

  @Mutation(() => Discount)
  async createDiscount(
    @Args('createDiscountInput') createDiscountInput: CreateDiscountInput,
  ) {
    return await this.discountService.create(createDiscountInput);
  }

  @Query(() => PaginatedDiscount)
  async findAllDiscounts(
    @Args('page', { type: () => Int, nullable: true }) page: number,
    @Args('limit', { type: () => Int, nullable: true }) limit: number,
  ) {
    return await this.discountService.findAll(page, limit);
  }

  @Query(() => Discount)
  async findDiscountById(@Args('id', { type: () => Int }) id: number) {
    return await this.discountService.findOneById(id);
  }

  @Query(() => Discount)
  async findDiscountByCode(@Args('code', { type: () => String }) code: string) {
    return await this.discountService.findOneByCode(code);
  }

  @Mutation(() => Discount)
  async updateDiscount(
    @Args('updateDiscountInput') updateDiscountInput: UpdateDiscountInput,
  ) {
    return await this.discountService.update(
      updateDiscountInput.id,
      updateDiscountInput,
    );
  }

  @Mutation(() => Discount)
  async removeDiscount(@Args('id', { type: () => Int }) id: number) {
    return await this.discountService.remove(id);
  }
}
