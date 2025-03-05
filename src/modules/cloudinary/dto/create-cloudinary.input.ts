import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateCloudinaryInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
