import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

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
  @Prop({ required: true, type: MongooseSchema.Types.Date })
  timestamp: Date;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'CampaignParticipantModel' })
  participantId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, default: null })
  outputId: Types.ObjectId | null;

  @Prop({
    type: {
      views: { type: MongooseSchema.Types.Number, default: 0 },
      likes: { type: MongooseSchema.Types.Number, default: 0 },
      comments: { type: MongooseSchema.Types.Number, default: 0 },
      shares: { type: MongooseSchema.Types.Number, default: 0 },
    },
    _id: false,
  })
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };

  @Prop({ type: MongooseSchema.Types.Date, default: null })
  delete_at: Date | null;

  @Prop({ type: MongooseSchema.Types.String, default: null })
  delete_by: string | null;
}

export const KpiLogSchema = SchemaFactory.createForClass(KpiLogModel);
