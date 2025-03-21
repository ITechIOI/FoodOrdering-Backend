import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateMapInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
