import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDiscountInput } from './dto/create-discount.input';
import { UpdateDiscountInput } from './dto/update-discount.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Discount } from 'src/entities/discount.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DiscountService {
  constructor(
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
  ) {}

  async create(createDiscountInput: CreateDiscountInput) {
    const discount: Discount = this.discountRepository.create({
      ...createDiscountInput,
    });
    return await this.discountRepository.save(discount);
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ total: number; data: Discount[] }> {
    const [data, total] = await this.discountRepository
      .createQueryBuilder('discount')
      .where('discount.deletedAt is null')
      .take(limit)
      .skip((page - 1) * limit)
      .getManyAndCount();
    return { total, data };
  }

  async findOneById(id: number): Promise<Discount> {
    const discount = await this.discountRepository
      .createQueryBuilder('discount')
      .where('discount.id = :id', { id })
      .andWhere('discount.deletedAt is null')
      .getOne();
    if (!discount) {
      throw new NotFoundException(`Discount with ID ${id} not found`);
    }
    return discount;
  }

  async findOneByCode(code: string): Promise<Discount> {
    const discount = await this.discountRepository
      .createQueryBuilder('discount')
      .where('discount.code = :code', { code })
      .andWhere('discount.deletedAt is null')
      .getOne();
    if (!discount) {
      throw new NotFoundException(`Discount with ID ${code} not found`);
    }
    return discount;
  }

  async update(id: number, updateDiscountInput: UpdateDiscountInput) {
    const discount = await this.findOneById(id);
    if (!discount) {
      throw new NotFoundException(`Discount with ID ${id} not found`);
    }
    const newDiscount = this.discountRepository.create({
      ...discount,
      ...updateDiscountInput,
    });
    return await this.discountRepository.save(newDiscount);
  }

  async remove(id: number) {
    const discount = await this.findOneById(id);
    if (!discount) {
      throw new NotFoundException(`Discount with ID ${id} not found`);
    }
    discount.deletedAt = new Date();
    return await this.discountRepository.save(discount);
  }
}
