import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UploadedFileType {
  @Field(() => ID)
  id: string;

  @Field()
  url: string;

  @Field()
  publicId: string;

  @Field(() => Int)
  size: number;

  @Field()
  format: string;

  @Field({ nullable: true })
  title?: string;

  @Field()
  targetType: string;

  @Field()
  targetId: string;

  @Field()
  targetField: string;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;
}
