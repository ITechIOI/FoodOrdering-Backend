import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Map {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
