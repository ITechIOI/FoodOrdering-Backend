import { CreateCloudinaryInput } from './create-cloudinary.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateCloudinaryInput extends PartialType(CreateCloudinaryInput) {
  @Field(() => Int)
  id: number;
}
