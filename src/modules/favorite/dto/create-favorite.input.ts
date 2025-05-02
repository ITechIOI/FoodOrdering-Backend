import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateFavoriteInput {
  @Field(() => Int)
  restaurantId?: number;

  @Field(() => Int)
  userId?: number;
}
