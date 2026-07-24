import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PublicReviewType {
  @Field(() => ID)
  id: string;

  @Field()
  proposalId: string;

  @Field()
  authorName: string;

  @Field(() => Int)
  rating: number;

  @Field()
  comment: string;

  @Field()
  status: string;

  @Field()
  createdAt: string;
}
