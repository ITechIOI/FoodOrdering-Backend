import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export abstract class PaginatedResponse<T> {
  @Field(() => Int)
  total: number;

  @Field(() => [Object])
  data: T[];
}
