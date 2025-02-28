import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => String)
  username: string;

  @Field(() => String)
  password: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  gender: string;

  @Field(() => String)
  address: string;

  @Field(() => String)
  phone: string;

  @Field(() => Int)
  type: number;

  @Field(() => Int)
  roleId: number;
}
