import { Field, ObjectType, ID, Float, Int } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';
import { CampaignType } from './campaign.type';
import { UploadedFileType } from './uploaded-file.type';

@ObjectType()
export class MediaSlideType {
  @Field()
  type: string;

  @Field()
  fileId: string;

  @Field(() => UploadedFileType, { nullable: true })
  file?: any;

  @Field(() => Int)
  displayOrder: number;
}

@ObjectType()
export class ProductItemType {
  @Field()
  productId: string;

  @Field()
  name: string;

  @Field(() => Float)
  price: number;

  @Field()
  currency: string;

  @Field()
  imageId: string;

  @Field(() => GraphQLJSONObject)
  affiliateUrls: Record<string, string>;
}

@ObjectType()
export class VoucherItemType {
  @Field()
  code: string;

  @Field()
  platform: string;

  @Field()
  discountValue: string;

  @Field()
  description: string;

  @Field()
  expirationDate: string;
}

@ObjectType()
export class CampaignProposalType {
  @Field(() => ID)
  id: string;

  @Field()
  campaignId: string;

  @Field(() => CampaignType, { nullable: true })
  campain?: any;

  @Field()
  slug: string;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => [MediaSlideType])
  mediaSlides: MediaSlideType[];

  @Field(() => [ProductItemType])
  products: ProductItemType[];

  @Field(() => [VoucherItemType])
  vouchers: VoucherItemType[];

  @Field()
  status: string;

  @Field(() => GraphQLJSONObject)
  metrics: Record<string, number>;

  @Field()
  createdAt: string;

  @Field()
  updatedAt: string;
}
