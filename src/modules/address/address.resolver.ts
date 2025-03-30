import {
  Resolver,
  Query,
  Mutation,
  Args,
  Int,
  Float,
  ObjectType,
  Field,
} from '@nestjs/graphql';
import { AddressService } from './address.service';
import { Address } from '../../entities/address.entity';
import { CreateAddressInput } from './dto/create-address.input';
import { UpdateAddressInput } from './dto/update-address.input';
import { createPaginatedType } from 'src/utils/paginated';
import { Restaurant } from 'src/entities/restaurant.entity';

const PaginatedAddress = createPaginatedType(Address, 'PaginatedAddress');
@ObjectType()
class NearestAdress extends Address {
  @Field(() => Float)
  distance: number;
}

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
  @Query(() => Address, { name: 'findAddressById' })
  async findAddressById(@Args('id', { type: () => Int }) id: number) {
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

  // Tìm 20 cửa hàng gần người dùng nhất
  // @Query(() => [Address])
  // async nearestRestaurants(
  //   @Args('latitude', { type: () => Float }) latitude: number,
  //   @Args('longitude', { type: () => Float }) longitude: number,
  //   @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
  // ) {
  //   return this.addressService.findNearestRestaurants(
  //     latitude,
  //     longitude,
  //     limit,
  //   );
  // }

  @Query(() => [NearestAdress])
  async nearestRestaurants(
    @Args('latitude', { type: () => Float }) latitude: number,
    @Args('longitude', { type: () => Float }) longitude: number,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
  ): Promise<NearestAdress[]> {
    return this.addressService.findNearestRestaurants(
      latitude,
      longitude,
      limit,
    );
  }
}
