import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';

export enum EOutboxStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  DONE = 'DONE',
  FAILED = 'FAILED',
}

@Schema({
  collection: 'outboxes',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class OutboxModel {
  @Prop({ type: String, required: true })
  event_type: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  metadata?: Record<string, unknown>;

  @Prop({ type: MongooseSchema.Types.Mixed, required: false })
  transport?: Record<string, unknown>;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  payload: unknown;

  @Prop({ type: String, required: true, enum: EOutboxStatus, default: EOutboxStatus.PENDING })
  status: EOutboxStatus;

  @Prop({ type: Number, required: true, default: 0 })
  retry_count: number;

  @Prop({ type: Number, required: true, default: 5 })
  max_retry: number;

  @Prop({ type: String, required: false })
  error_reason?: string;

  @Prop({ type: Date, required: true, default: Date.now })
  created_at: Date;

  @Prop({ type: Date, required: false })
  processed_at?: Date;

  updated_at: Date;
}

export type OutboxDocument = HydratedDocument<OutboxModel>;
export const OutboxSchema = SchemaFactory.createForClass(OutboxModel);

// Index for polling pending messages efficiently
OutboxSchema.index({ status: 1, created_at: 1 });
