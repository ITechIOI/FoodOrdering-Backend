import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Cloudinary {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
