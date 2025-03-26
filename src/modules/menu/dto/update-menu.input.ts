import { Menu } from 'src/entities/menu.entity';
import { CreateMenuInput } from './create-menu.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateMenuInput extends PartialType(CreateMenuInput) {
  @Field(() => Int, { description: 'ID món ăn cần cập nhật' })
  id: number;

  static fromEntity(menu: Menu): UpdateMenuInput {
    const input = new UpdateMenuInput();
    input.id = menu.id;
    input.name = menu.name;
    input.description = menu.description;
    input.price = menu.price;
    input.quantity = menu.quantity;
    input.imageUrl = menu.imageUrl;
    if (menu.available === 'available' || menu.available === 'unavailable') {
      input.available = menu.available;
    } else {
      throw new Error(`Invalid available value: ${menu.available}`);
    }
    input.categoryId = menu.category.id;
    return input;
  }
}
