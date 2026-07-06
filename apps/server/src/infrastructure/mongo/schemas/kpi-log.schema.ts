import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type KpiLogDocument = KpiLogModel & Document;

@Schema({
  collection: 'kpi_logs',
  timeseries: {
    timeField: 'timestamp',
    metaField: 'participantId',
    granularity: 'minutes',
  },
  expireAfterSeconds: 60 * 60 * 24 * 365, // Retain for 1 year
  versionKey: false,
})
export class KpiLogModel {
  @Prop({ required: true, type: Date })
  timestamp: Date;

  @Prop({ required: true, type: Types.ObjectId, ref: 'CampaignParticipantModel' })
  participantId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, default: null })
  outputId: Types.ObjectId | null;

  @Prop({
    type: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
    },
    _id: false,
  })
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };

  @Prop({ type: Date, default: null })
  delete_at: Date | null;

  @Prop({ type: String, default: null })
  delete_by: string | null;
}

export const KpiLogSchema = SchemaFactory.createForClass(KpiLogModel);
