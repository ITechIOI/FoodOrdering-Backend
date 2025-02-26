import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateAuthInput {
  @Field(() => String, )
  username: number;

  @Field(() => String, )
  password: string;
}
