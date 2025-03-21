import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AddressService } from './address.service';
import { Address } from '../../entities/address.entity';
import { CreateAddressInput } from './dto/create-address.input';
import { UpdateAddressInput } from './dto/update-address.input';
import { createPaginatedType } from 'src/utils/paginated';

const PaginatedAddress = createPaginatedType(Address, 'PaginatedAddress');

@Resolver(() => Address)
export class AddressResolver {
  constructor(private readonly addressService: AddressService) {}

  @Mutation(() => Address)
  async createAddress(
    @Args('createAddressInput') createAddressInput: CreateAddressInput,
  ): Promise<Address> {
    return this.addressService.createAddress(createAddressInput);
  }

  @Query(() => PaginatedAddress)
  async findAllAddresses(
    @Args('page', { type: () => Int, nullable: true }) page: number,
    @Args('limit', { type: () => Int, nullable: true }) limit: number,
  ) {
    return this.addressService.findAllAddress(page, limit);
  }

  // thuộc tính name trong @Query() sẽ là tên của query trong GraphQL
  @Query(() => String, { name: 'findOneAddress' })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return this.addressService.findOneAddress(id);
  }

  @Mutation(() => Address, { name: 'updateAddress' })
  async updateAddress(
    @Args('updateAddressInput') updateAddressInput: UpdateAddressInput,
  ) {
    return this.addressService.update(
      updateAddressInput.id,
      updateAddressInput,
    );
  }

  @Mutation(() => Address)
  removeAddress(@Args('id', { type: () => Int }) id: number) {
    return this.addressService.remove(id);
  }
}
