import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ECurrency, EPaymentMethod } from '@/core/enums';

export type PaymentProviderDocument = HydratedDocument<PaymentProviderModel>;

@Schema({ collection: 'payment_providers', timestamps: false })
export class PaymentProviderModel {
  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: String, required: true })
  display_name: string;

  @Prop({ type: [String], enum: EPaymentMethod, required: true })
  supported_methods: EPaymentMethod[];

  @Prop({ type: [String], enum: ECurrency, required: true })
  supported_currencies: ECurrency[];

  @Prop({ type: Object, required: true })
  credentials: Record<string, unknown>;

  @Prop({ type: Boolean, required: true, default: true })
  is_active: boolean;

  @Prop({ type: Boolean, required: true, default: false })
  supports_webhook: boolean;

  @Prop({ type: Boolean, required: true, default: false })
  supports_refund: boolean;

  @Prop({ type: Boolean, required: true, default: false })
  supports_partial_refund: boolean;

  @Prop({ type: String, required: false })
  base_url?: string;

  @Prop({ type: String, required: false })
  test_url?: string;

  @Prop({ type: String, required: false })
  webhook_url?: string;

  @Prop({ type: Date, required: true })
  created_at: Date;

  @Prop({ type: Date, required: true })
  updated_at: Date;

  @Prop({ type: Date, required: false, default: null })
  deleted_at: Date | null;

  @Prop({ type: String, required: false, default: null })
  deleted_by: string | null;

  _id?: string;

  @Virtual({
    get: function (this: { _id?: Types.ObjectId }) {
      return this._id?.toString();
    },
  })
  id?: string;
}

export const PaymentProviderSchema = SchemaFactory.createForClass(PaymentProviderModel);

PaymentProviderSchema.virtual('id').get(function (this: { _id?: Types.ObjectId }) {
  return this._id;
});
