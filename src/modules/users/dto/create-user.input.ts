import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => String, { nullable: true })
  username: string;

  @Field(() => String, { nullable: true })
  password: string;

  @Field(() => String, { nullable: true })
  email: string;

  @Field(() => String, { nullable: true })
  gender: string;

  @Field(() => Int, { nullable: true })
  addressId: number;

  @Field(() => String, { nullable: true })
  phone: string;

  @Field(() => Int, { nullable: true })
  type: number;

  @Field(() => Int)
  roleId: number;

  @Field(() => String, { nullable: true })
  avatar: string;

  @Field(() => String, { nullable: true })
  otpCode: string;

  @Field(() => Date, { nullable: true })
  otpExpiresAt: Date;
}
