import { SortOrder } from '@/application/dtos/pagination.dto';
import { Field, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { CampaignParticipantType } from './campaign-participant.type';
import { CampaignType } from './campaign.type';
import { KolProfileType } from './kol-profile.type';
import { CampaignProposalType } from './proposal.type';
import { PublicReviewType } from './review.type';

registerEnumType(SortOrder, {
  name: 'SortOrder',
});

@InputType()
export class BasePaginationInput {
  @Field({ nullable: true })
  cursor?: string;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  limit?: number;

  @Field(() => SortOrder, { nullable: true, defaultValue: SortOrder.DESC })
  sort?: SortOrder;
}

@InputType()
export class KolProfileFilterInput extends BasePaginationInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  gender?: string;

  @Field({ nullable: true })
  isVerified?: boolean;

  @Field(() => [String], { nullable: true })
  categories?: string[];

  @Field(() => [String], { nullable: true })
  tags?: string[];
}

@InputType()
export class CampaignFilterInput extends BasePaginationInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  ownerId?: string;

  @Field({ nullable: true })
  enterpriseId?: string;
}

@InputType()
export class CampaignParticipantFilterInput extends BasePaginationInput {
  @Field({ nullable: true })
  campaignId?: string;

  @Field({ nullable: true })
  kolProfileId?: string;

  @Field({ nullable: true })
  status?: string;
}

@ObjectType()
export class KolProfileResponse {
  @Field({ nullable: true })
  cursor: string | null;

  @Field(() => [KolProfileType])
  data: KolProfileType[];
}

@ObjectType()
export class CampaignResponse {
  @Field({ nullable: true })
  cursor: string | null;

  @Field(() => [CampaignType])
  data: CampaignType[];
}

@ObjectType()
export class CampaignParticipantResponse {
  @Field({ nullable: true })
  cursor: string | null;

  @Field(() => [CampaignParticipantType])
  data: CampaignParticipantType[];
}

@InputType()
export class CampaignProposalFilterInput extends BasePaginationInput {
  @Field({ nullable: true })
  campaignId?: string;

  @Field({ nullable: true })
  status?: string;
}

@ObjectType()
export class CampaignProposalResponse {
  @Field({ nullable: true })
  cursor: string | null;

  @Field(() => [CampaignProposalType])
  data: CampaignProposalType[];
}

@InputType()
export class PublicReviewFilterInput extends BasePaginationInput {
  @Field({ nullable: true })
  proposalId?: string;

  @Field({ nullable: true })
  status?: string;
}

@ObjectType()
export class PublicReviewResponse {
  @Field({ nullable: true })
  cursor: string | null;

  @Field(() => [PublicReviewType])
  data: PublicReviewType[];
}
