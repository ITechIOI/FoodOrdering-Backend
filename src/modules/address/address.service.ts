import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findOneAddress(id: number): Promise<Address> {
    const address = await this.addressRepository
      .createQueryBuilder('address')
      .where('address.id = :id', { id })
      .andWhere('address.deletedAt is null')
      .getOne();

    if (!address) {
      throw new NotFoundException(`Address with ID ${id} not found`);
    }
    return address;
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

  // async findNearestRestaurants(
  //   userLat: number,
  //   userLng: number,
  //   limit = 20,
  // ): Promise<Address[]> {
  //   return this.addressRepository
  //     .createQueryBuilder('address')
  //     .where('address.label = :label', { label: 'restaurant' })
  //     .andWhere(
  //       'address.latitude IS NOT NULL AND address.longitude IS NOT NULL',
  //     )
  //     .addSelect(
  //       `
  //       6371 * acos(
  //         cos(radians(:userLat)) * cos(radians(address.latitude)) *
  //         cos(radians(address.longitude) - radians(:userLng)) +
  //         sin(radians(:userLat)) * sin(radians(address.latitude))
  //       )
  //     `,
  //       'distance',
  //     )
  //     .orderBy('distance', 'ASC')
  //     .limit(limit)
  //     .setParameters({ userLat, userLng })
  //     .getMany();
  // }

  async findNearestRestaurants(
    userLat: number,
    userLng: number,
    limit = 20,
  ): Promise<(Address & { distance: number })[]> {
    const query = this.addressRepository
      .createQueryBuilder('address')
      .where('address.label = :label', { label: 'restaurant' })
      .andWhere(
        'address.latitude IS NOT NULL AND address.longitude IS NOT NULL',
      )
      .addSelect(
        `
        6371 * acos(
          cos(radians(:userLat)) * cos(radians(address.latitude)) *
          cos(radians(address.longitude) - radians(:userLng)) +
          sin(radians(:userLat)) * sin(radians(address.latitude))
        )
      `,
        'distance',
      )
      .orderBy('distance', 'ASC')
      .limit(limit)
      .setParameters({ userLat, userLng });

    const { entities, raw } = await query.getRawAndEntities();

    return entities.map((entity, i) => ({
      ...entity,
      distance: parseFloat(raw[i].distance),
    }));
  }
}
