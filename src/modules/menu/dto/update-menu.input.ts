import { CreateMenuInput } from './create-menu.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateMenuInput extends PartialType(CreateMenuInput) {
  @Field(() => Int, { description: 'ID món ăn cần cập nhật' })
  id: number;
}
