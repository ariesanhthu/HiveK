import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

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

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId })
  participantId: MongooseSchema.Types.ObjectId;

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
}

export const KpiLogSchema = SchemaFactory.createForClass(KpiLogModel);
