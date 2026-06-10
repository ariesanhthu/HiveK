import { Field, ObjectType, ID } from '@nestjs/graphql';
import { CampaignType } from './campaign.type';
import { KolProfileType } from './kol-profile.type';
import { PlatformType } from './platform.type';
import { UploadedFileType } from './uploaded-file.type';

@ObjectType()
export class CampaignOutputType {
  @Field(() => ID)
  id: string;

  @Field()
  platformId: string;

  @Field(() => PlatformType, { nullable: true })
  platform?: any;

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
}

@ObjectType()
export class CampaignParticipantType {
  @Field(() => ID)
  id: string;

  @Field()
  campaignId: string;

  @Field(() => CampaignType, { nullable: true })
  campaign?: any;

  @Field()
  kolProfileId: string;

  @Field(() => KolProfileType, { nullable: true })
  kolProfile?: any;

  @Field()
  status: string;

  @Field({ nullable: true })
  joinedAt?: string;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;

  @Field(() => [CampaignOutputType])
  outputs: CampaignOutputType[];
}
