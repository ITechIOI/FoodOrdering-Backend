import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateComplaintInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
