import { InputType, Int, Field, Float } from '@nestjs/graphql';

@InputType()
export class CreateAddressInput {
  @Field(() => String, { nullable: true })
  label: string;

  @Field(() => String, { nullable: true })
  province: string;

  @Field(() => String, { nullable: true })
  district: string;

  @Field(() => String, { nullable: true })
  ward: string;

  @Field(() => String, { nullable: true })
  street: string;

  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;

  @Field(() => String, { nullable: true })
  placeId: string;
}
