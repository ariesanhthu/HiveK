import { Field, ObjectType, ID, Float } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { UserType } from './user.type';
import { EnterpriseType } from './enterprise.type';
import { PlatformType } from './platform.type';
import { UploadedFileType } from './uploaded-file.type';

@ObjectType()
export class PlatformTargetItemType {
  @Field()
  platformId: string;

  @Field(() => PlatformType, { nullable: true })
  platform?: any;

  @Field(() => Float, { nullable: true })
  minFollowers?: number;

  @Field(() => Float, { nullable: true })
  maxFollowers?: number;

  @Field({ nullable: true })
  note?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  others?: Record<string, any>;
}

@ObjectType()
export class RawContentItemType {
  @Field()
  fileId: string;

  @Field(() => UploadedFileType, { nullable: true })
  file?: any;

  @Field({ nullable: true })
  rawContent?: string;
}

@ObjectType()
export class CampaignType {
  @Field(() => ID)
  id: string;

  @Field()
  ownerId: string;

  @Field(() => UserType, { nullable: true })
  owner?: any;

  @Field({ nullable: true })
  enterpriseId?: string;

  @Field(() => EnterpriseType, { nullable: true })
  enterprise?: any;

  @Field(() => Float)
  budget: number;

  @Field(() => GraphQLJSONObject)
  financialTarget: Record<string, any>;

  @Field()
  description: string;

  @Field(() => [PlatformTargetItemType])
  platformTarget: PlatformTargetItemType[];

  @Field()
  status: string;

  @Field(() => [String])
  collaboratorIds: string[];

  @Field(() => [UserType], { nullable: true })
  collaborators?: any[];

  @Field(() => [RawContentItemType])
  rawContents: RawContentItemType[];
}
