import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UploadedFileType } from './uploaded-file.type';

@ObjectType()
export class PlatformType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  baseUrl: string;

  @Field()
  apiStatus: string;

  @Field(() => UploadedFileType, { nullable: true })
  icon?: any;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;
}
