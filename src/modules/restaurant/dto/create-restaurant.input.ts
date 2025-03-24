import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateRestaurantInput {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String)
  phone: string;

  @Field(() => String)
  openTime: string;

  @Field(() => String)
  closeTime: string;

  @Field(() => String, { nullable: true })
  status?: 'open' | 'close';

  @Field(() => Number)
  addressId: number;

  @Field(() => Number)
  ownerId: number;
}
