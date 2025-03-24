import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateCategoryInput {
  @Field(() => String, { description: 'Tên danh mục' })
  name: string;

  @Field(() => Int, { nullable: true, description: 'ID nhà hàng' })
  restaurantId?: number;
}
