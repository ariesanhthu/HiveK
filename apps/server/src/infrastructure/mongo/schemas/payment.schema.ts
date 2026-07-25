import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  ECurrency,
  EPaymentStatus,
  EPaymentAttemptStatus,
  ETransactionStatus,
  EPaymentTransactionType,
  ETransactionSource,
  EFailureType,
} from '@/core/enums';

// --- Embedded Schemas ---
@Schema({ timestamps: false })
class PaymentTransactionSchema {
  @Prop({ type: String, required: true, enum: EPaymentTransactionType })
  transaction_type: EPaymentTransactionType;

  @Prop({ type: String, required: true, enum: ETransactionSource })
  transaction_source: ETransactionSource;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String, required: true, enum: ECurrency })
  currency: ECurrency;

  @Prop({ type: String, required: true, enum: ETransactionStatus })
  status: ETransactionStatus;

  @Prop({ type: String, required: false })
  description?: string;

  @Prop({ type: String, required: false })
  provider_transaction_id?: string;

  @Prop({ type: Object, required: false })
  provider_request?: Record<string, unknown>;

  @Prop({ type: Object, required: false })
  provider_request_headers?: Record<string, string>;

  @Prop({ type: Date, required: false })
  provider_request_timestamp?: Date;

  @Prop({ type: Object, required: false })
  provider_response?: Record<string, unknown>;

  @Prop({ type: Object, required: false })
  provider_response_headers?: Record<string, string>;

  @Prop({ type: Date, required: false })
  provider_response_timestamp?: Date;

  @Prop({ type: Object, required: false })
  metadata?: Record<string, unknown>;

  @Prop({ type: Date, required: true })
  created_at: Date;

  _id?: string;

  @Virtual({
    get: function (this: { _id?: Types.ObjectId }) {
      return this._id;
    },
  })
  id?: string;
}
const PaymentTransactionSchemaFactory = SchemaFactory.createForClass(PaymentTransactionSchema);
PaymentTransactionSchemaFactory.virtual('id').get(function (this: { _id?: Types.ObjectId }) {
  return this._id;
});

@Schema({ timestamps: false })
class PaymentAttemptSchema {
  @Prop({ type: String, required: true })
  payment_provider_id: string;

  @Prop({ type: String, required: true })
  idempotency_key: string;

  @Prop({ type: String, required: false })
  payment_url?: string;

  @Prop({ type: Number, required: true })
  attempt_number: number;

  @Prop({ type: String, required: true, enum: EPaymentAttemptStatus })
  status: EPaymentAttemptStatus;

  @Prop({ type: String, required: false })
  provider_transaction_id?: string;

  @Prop({ type: String, required: false })
  failure_reason?: string;

  @Prop({ type: String, enum: EFailureType, required: false })
  failure_type?: EFailureType;

  @Prop({ type: Number, required: false })
  total_refunded_amount?: number;

  @Prop({ type: [PaymentTransactionSchemaFactory], default: [] })
  transactions: PaymentTransactionSchema[];

  @Prop({ type: Date, required: true })
  created_at: Date;

  @Prop({ type: Date, required: true })
  updated_at: Date;

  _id?: string;

  @Virtual({
    get: function (this: { _id?: Types.ObjectId }) {
      return this._id?.toString();
    },
  })
  id?: string;
}
const PaymentAttemptSchemaFactory = SchemaFactory.createForClass(PaymentAttemptSchema);
PaymentAttemptSchemaFactory.virtual('id').get(function (this: { _id?: Types.ObjectId }) {
  return this._id;
});

// --- Main Schema ---

export type PaymentDocument = HydratedDocument<PaymentModel>;

@Schema({ collection: 'payments', timestamps: false })
export class PaymentModel {
  @Prop({ type: String, required: true })
  enterprise_id: string;

  @Prop({ type: String, required: false, default: null })
  user_id: string | null;

  @Prop({ type: String, required: true })
  bill_id: string;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String, required: true, enum: ECurrency })
  currency: ECurrency;

  @Prop({ type: String, required: true, enum: EPaymentStatus })
  status: EPaymentStatus;

  @Prop({ type: String, required: false })
  description?: string;

  @Prop({ type: String, required: true })
  idempotency_key: string;

  @Prop({ type: Number, required: true })
  version: number;

  @Prop({ type: Date, required: false })
  expires_at?: Date;

  @Prop({ type: Date, required: false })
  canceled_at?: Date;

  @Prop({ type: String, required: false })
  canceled_by?: string;

  @Prop({ type: String, required: false })
  cancel_reason?: string;

  @Prop({ type: Object, required: false })
  metadata?: Record<string, unknown>;

  @Prop({ type: [PaymentAttemptSchemaFactory], default: [] })
  payment_attempts: PaymentAttemptSchema[];

  @Prop({ type: Date, required: true })
  created_at: Date;

  @Prop({ type: Date, required: true })
  updated_at: Date;

  @Prop({ type: Date, required: false, default: null })
  deleted_at: Date | null;

  @Prop({ type: String, required: false })
  deleted_by?: string;
}

export const PaymentSchema = SchemaFactory.createForClass(PaymentModel);

// Indexes
PaymentSchema.index({ enterprise_id: 1 });
PaymentSchema.index({ user_id: 1 });
PaymentSchema.index({ bill_id: 1 });
PaymentSchema.index({ bill_id: 1, status: 1 }); // For active payment queries
PaymentSchema.index({ idempotency_key: 1 }, { unique: true, sparse: true });
