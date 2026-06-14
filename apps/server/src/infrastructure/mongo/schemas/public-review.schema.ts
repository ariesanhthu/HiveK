import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { EReviewStatus } from '@/core/enums';
import { softDeletePlugin } from '../utils';

@Schema({ _id: false })
export class ReviewSecurityMetadataSubModel {
  @Prop({ required: true })
  ip_hash: string;

  @Prop({ required: true })
  browser_fingerprint: string;

  @Prop({ required: true, type: Number, min: 0, max: 1 })
  recaptcha_score: number;
}
export const ReviewSecurityMetadataSubSchema = SchemaFactory.createForClass(ReviewSecurityMetadataSubModel);

@Schema({
  collection: 'public_reviews',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class PublicReviewModel {
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'CampaignProposalModel' })
  proposal_id: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 100 })
  author_name: string;

  @Prop({ required: true, type: Number, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true, trim: true, maxlength: 2000 })
  comment: string;

  @Prop({ required: true, type: String, enum: Object.values(EReviewStatus), default: EReviewStatus.PENDING })
  status: EReviewStatus;

  @Prop({ type: ReviewSecurityMetadataSubSchema, required: true })
  security_metadata: ReviewSecurityMetadataSubModel;

  @Prop({ type: Date, default: null })
  delete_at: Date | null;

  @Prop({ type: String, default: null })
  delete_by: string | null;

  created_at: Date;
  updated_at: Date;
}

export type PublicReviewDocument = HydratedDocument<PublicReviewModel>;
export const PublicReviewSchema = SchemaFactory.createForClass(PublicReviewModel);
PublicReviewSchema.plugin(softDeletePlugin);
