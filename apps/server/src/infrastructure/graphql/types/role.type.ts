import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType()
export class RoleType {
  @Field(() => ID)
  id: string;

  @Field()
  title: string;

  @Field(() => [String])
  permissions: string[];

  @Field()
  type: string;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;
}
