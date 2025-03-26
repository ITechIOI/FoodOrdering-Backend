import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateMenuInput {
  @Field(() => String, { description: 'Tên món ăn' })
  name: string;

  @Field(() => String, { nullable: true, description: 'Mô tả món ăn' })
  description?: string;

  @Field(() => Int, { description: 'Giá món ăn' })
  price: number;

  @Field(() => Int, { description: 'Giá món ăn' })
  quantity: number;

  @Field(() => String, { nullable: true, description: 'URL hình ảnh' })
  imageUrl?: string;

  @Field(() => String, {
    description: "Trạng thái món ăn ('available' hoặc 'unavailable')",
  })
  available: 'available' | 'unavailable';

  @Field(() => Int, { description: 'ID danh mục' })
  categoryId: number;
}
