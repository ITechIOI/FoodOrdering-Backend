import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateAddressInput {
  @Field(() => String, { nullable: true })
  label: string;

  @Field(() => String, { nullable: true })
  formatAdress: string;

  @Field(() => Number)
  latitude: number;

  @Field(() => Number)
  longitude: number;

  @Field(() => String, { nullable: true })
  googleId: string;
}
