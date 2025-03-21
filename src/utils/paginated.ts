import { ObjectType, Field, Int } from '@nestjs/graphql';

export function createPaginatedType<T>(classRef: T, name: string) {
  @ObjectType(`${name}`)
  class PaginatedType {
    @Field(() => Int)
    total: number;

    @Field(() => [classRef])
    data: T[];
  }
  return PaginatedType;
}
