import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Menu } from 'src/entities/menu.entity';

@ObjectType()
export class TopOrderedMenu {
  @Field(() => Menu)
  menu: Menu;

  @Field(() => Int)
  totalOrders: number;
}
