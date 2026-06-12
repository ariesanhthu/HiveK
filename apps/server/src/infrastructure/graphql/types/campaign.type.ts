import { Field, ObjectType, ID, Float } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { UserType } from './user.type';
import { EnterpriseType } from './enterprise.type';
import { PlatformType } from './platform.type';
import { UploadedFileType } from './uploaded-file.type';
import { CampaignParticipantType } from './campaign-participant.type';

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
export class CampaignKOLOutputType {
  @Field(() => ID)
  id: string;

  @Field()
  campaignParticipantId: string;

  @Field()
  platformId: string;

  @Field(() => PlatformType, { nullable: true })
  platform?: any;

  @Field({ nullable: true })
  uniqueId?: string;

  @Field()
  outputType: string;

  @Field()
  title: string;

  @Field()
  isScheduleForPost: boolean;

  @Field({ nullable: true })
  fileId?: string;

  @Field(() => UploadedFileType, { nullable: true })
  file?: any;

  @Field({ nullable: true })
  scheduledAt?: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  url?: string;

  @Field({ nullable: true })
  postedAt?: string;

  @Field()
  isTrackingActive: boolean;
}

@ObjectType()
export class CampaignEnterpriseOutputType {
  @Field(() => ID)
  id: string;

  @Field()
  platformId: string;

  @Field(() => PlatformType, { nullable: true })
  platform?: any;

  @Field({ nullable: true })
  uniqueId?: string;

  @Field()
  outputType: string;

  @Field()
  title: string;

  @Field()
  isScheduleForPost: boolean;

  @Field({ nullable: true })
  fileId?: string;

  @Field(() => UploadedFileType, { nullable: true })
  file?: any;

  @Field({ nullable: true })
  scheduledAt?: string;

  @Field()
  status: string;

  @Field({ nullable: true })
  url?: string;

  @Field({ nullable: true })
  postedAt?: string;

  @Field()
  isTrackingActive: boolean;
}

@ObjectType()
export class SchedulePostType {
  @Field()
  scheduledTime: string;

  @Field()
  platformId: string;

  @Field(() => PlatformType, { nullable: true })
  platform?: any;

  @Field()
  status: string;

  @Field(() => [CampaignKOLOutputType])
  campaignKOLOutputs: CampaignKOLOutputType[];

  @Field(() => [CampaignEnterpriseOutputType])
  campaignEnterpriseOutputs: CampaignEnterpriseOutputType[];
}

@ObjectType()
export class ScheduleDayType {
  @Field()
  date: string;

  @Field({ nullable: true })
  label?: string;

  @Field(() => [SchedulePostType])
  posts: SchedulePostType[];
}

@ObjectType()
export class CampaignScheduleType {
  @Field(() => [ScheduleDayType])
  timeline: ScheduleDayType[];
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

  @Field(() => CampaignScheduleType, { nullable: true })
  schedule?: CampaignScheduleType;

  @Field(() => [CampaignParticipantType], { nullable: true })
  participants?: any[];
}
