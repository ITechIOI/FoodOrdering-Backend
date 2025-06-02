import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthPayloadContainedId {
  @Field()
  id: number;

  @Field()
  token: string;
}
