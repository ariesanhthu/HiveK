import { Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CreditWalletDocument = HydratedDocument<CreditWalletModel>;

@Schema({ _id: false })
class CreditBalanceSchema {
  @Prop({ type: String, required: true })
  credit_type: string;

  @Prop({ type: Number, required: true })
  total: number;

  @Prop({ type: Number, required: true })
  used: number;
}

@Schema({
  collection: 'credit_wallets',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
export class CreditWalletModel {
  @Prop({ type: String, required: true, unique: true, index: true })
  enterprise_id: string;

  @Prop({ type: [CreditBalanceSchema], required: false, default: [] })
  balances: CreditBalanceSchema[];

  _id?: string;

  @Virtual({
    get: function (this: { _id?: Types.ObjectId }) {
      return this._id == null ? undefined : String(this._id);
    },
  })
  id?: string;
}

export const CreditWalletSchema = SchemaFactory.createForClass(CreditWalletModel);
CreditWalletSchema.virtual('id').get(function (this: { _id?: Types.ObjectId }) {
  return this._id == null ? undefined : this._id;
});
