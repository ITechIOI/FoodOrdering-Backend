import { CreateMapInput } from './create-map.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateMapInput extends PartialType(CreateMapInput) {
  @Field(() => Int)
  id: number;
}
