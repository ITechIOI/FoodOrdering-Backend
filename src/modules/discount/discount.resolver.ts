import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { DiscountService } from './discount.service';
import { Discount } from '../../entities/discount.entity';
import { CreateDiscountInput } from './dto/create-discount.input';
import { UpdateDiscountInput } from './dto/update-discount.input';
import { createPaginatedType } from 'src/utils/paginated';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';

const PaginatedDiscount = createPaginatedType(Discount, 'PaginatedDiscount');

@Resolver(() => Discount)
export class DiscountResolver {
  constructor(private readonly discountService: DiscountService) {}

  @Mutation(() => Discount)
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('manager')
  async createDiscount(
    @Args('createDiscountInput') createDiscountInput: CreateDiscountInput,
  ) {
    return await this.discountService.create(createDiscountInput);
  }

  @Query(() => PaginatedDiscount)
  @UseGuards(AuthGuard)
  async findAllDiscounts(
    @Args('page', { type: () => Int, nullable: true }) page: number,
    @Args('limit', { type: () => Int, nullable: true }) limit: number,
  ) {
    return await this.discountService.findAll(page, limit);
  }

  @Query(() => Discount)
  @UseGuards(AuthGuard)
  async findDiscountById(@Args('id', { type: () => Int }) id: number) {
    return await this.discountService.findOneById(id);
  }

  @Query(() => Discount)
  @UseGuards(AuthGuard)
  async findDiscountByCode(@Args('code', { type: () => String }) code: string) {
    return await this.discountService.findOneByCode(code);
  }

  @Mutation(() => Discount)
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('manager', 'admin')
  async updateDiscount(
    @Args('updateDiscountInput') updateDiscountInput: UpdateDiscountInput,
  ) {
    return await this.discountService.update(
      updateDiscountInput.id,
      updateDiscountInput,
    );
  }

  @Mutation(() => Discount)
  @UseGuards(AuthGuard, RoleGuard)
  @Roles('manager', 'admin')
  async removeDiscount(@Args('id', { type: () => Int }) id: number) {
    return await this.discountService.remove(id);
  }
}
