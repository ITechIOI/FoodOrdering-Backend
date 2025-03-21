import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType('Location')
export class Location {
  @Field(() => Number)
  lat: number;

  @Field(() => Number)
  lng: number;
}
