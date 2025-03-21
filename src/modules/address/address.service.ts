import { Injectable } from '@nestjs/common';
import { CreateAddressInput } from './dto/create-address.input';
import { UpdateAddressInput } from './dto/update-address.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from 'src/entities/address.entity';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    private readonly configService: ConfigService,
  ) {}

  async createAddress(
    createAddressInput: CreateAddressInput,
  ): Promise<Address> {
    const newAddress = this.addressRepository.create(createAddressInput);
    return await this.addressRepository.save(newAddress);
  }

  async findAllAddress(
    page = 1,
    limit = 10,
  ): Promise<{ total: number; data: Address[] }> {
    const [data, total] = await this.addressRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
    });
    return { total, data };
  }

  // async findOne(id: number): Promise<Address> {
  //   return await this.addressRepository
  //     .createQueryBuilder('address')
  //     .where('address.id = :id', { id })
  //     .getOneOrFail();
  // }

  //   async updateUser(id: number, updateUserInput: UpdateUserInput) {
  //     try {
  //       const user = await this.findOneById(id);
  //       if (!user) {
  //         throw new NotFoundException('User not found');
  //       }

  //       const updatedUser = await this.userRepository.save({
  //         ...user,
  //         ...updateUserInput,
  //       });
  //       return updatedUser;
  //     } catch (error) {
  //       throw new InternalServerErrorException(error.message);
  //     }
  //   }

  async findOneAddress(id: number): Promise<Address> {
    return await this.addressRepository
      .createQueryBuilder('address')
      .where('address.id = :id', { id })
      .andWhere('address.isDeleted is null')
      .getOneOrFail();
  }

  async update(id: number, updateAddressInput: UpdateAddressInput) {
    const address = await this.findOneAddress(id);
    const updatedAddress = await this.addressRepository.save({
      ...address,
      ...updateAddressInput,
    });
    return updatedAddress;
  }

  async remove(id: number): Promise<Address> {
    const address = await this.findOneAddress(id);
    address.deletedAt = new Date();
    return await this.addressRepository.save(address);
  }
}
