import { Field, ObjectType, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import type { JsonObject } from '@/core/types/common.type';
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

  @Field(() => GraphQLJSONObject, { nullable: true })
  icon?: JsonObject;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;
}
