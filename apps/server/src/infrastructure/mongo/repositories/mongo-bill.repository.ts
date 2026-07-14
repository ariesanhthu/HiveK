import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { IBillRepository } from '@/core/interfaces/repositories';
import { BillEntity } from '@/core/aggregate-roots';
import { BillModel, BillDocument } from '../schemas';
import { BillItemVO } from '@/core/value-objects';
import { EBillStatus } from '@/core/enums';
import { Nullable } from '@/core/types';
import { type IUnitOfWork, UNIT_OF_WORK, CACHE_SERVICE } from '@/application/interfaces';
import type { ICacheService } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';
import { CacheKeyUtil } from '@/shared/utils/cache-key.util';

@Injectable()
export class MongoBillRepository implements IBillRepository {
  constructor(
    @InjectModel(BillModel.name)
    private readonly billModel: Model<BillDocument>,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
    @Inject(CACHE_SERVICE)
    private readonly cacheService: ICacheService,
  ) {}

  private get session(): ClientSession | undefined {
    return (this.uow as MongoUnitOfWork).getSession() || undefined;
  }

  async findById(id: string): Promise<Nullable<BillEntity>> {
    const doc = await this.billModel.findById(id).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async save(bill: BillEntity): Promise<void> {
    const data = this.mapToPersistence(bill);

    if (!bill.id) {
      const created = new this.billModel(data);
      const saved = await created.save({ session: this.session });
      bill.setId(saved._id.toString());
    } else {
      await this.billModel.findByIdAndUpdate(bill.id, data, { upsert: true }).session(this.session).exec();
    }

    await this.invalidateCache(bill.id!, bill.enterpriseId);
  }

  async saveMany(bills: BillEntity[]): Promise<void> {
    await Promise.all(bills.map(b => this.save(b)));
  }

  async delete(id: string): Promise<void> {
    const doc = await this.billModel.findById(id).session(this.session).exec();
    if (doc) {
      await this.billModel.findByIdAndDelete(id).session(this.session).exec();
      await this.invalidateCache(id, doc.enterprise_id);
    }
  }

  private async invalidateCache(id: string, enterpriseId: string): Promise<void> {
    const domain = 'bill';
    const invalidations = [
      this.cacheService.del(CacheKeyUtil.id(domain, id)),
      this.cacheService.delByPattern(CacheKeyUtil.listPattern(domain)),
    ];
    if (enterpriseId) {
      invalidations.push(this.cacheService.del(CacheKeyUtil.custom(domain, `enterpriseId:${enterpriseId}`)));
    }
    await Promise.all(invalidations);
  }

  async findByBillCode(billCode: string): Promise<Nullable<BillEntity>> {
    const doc = await this.billModel.findOne({ bill_code: billCode }).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByEnterpriseId(enterpriseId: string): Promise<BillEntity[]> {
    const docs = await this.billModel.find({ enterprise_id: enterpriseId }).session(this.session).exec();
    return docs.map(doc => this.mapToDomain(doc));
  }

  async findUnpaidBills(enterpriseId: string): Promise<BillEntity[]> {
    const docs = await this.billModel.find({
      enterprise_id: enterpriseId,
      status: EBillStatus.PENDING,
    }).session(this.session).exec();
    return docs.map(doc => this.mapToDomain(doc));
  }

  private mapToDomain(doc: BillDocument): BillEntity {
    return BillEntity.instantiate(
      doc._id.toString(),
      {
        billCode: doc.bill_code,
        enterpriseId: doc.enterprise_id,
        type: doc.type,
        status: doc.status,
        items: (doc.items || []).map(
          (item) =>
            new BillItemVO({
              lineType: item.line_type,
              packageId: item.package_id,
              packageVariantId: item.package_variant_id,
              creditType: item.credit_type,
              creditAmount: item.credit_amount,
              price: item.price,
              taxPercent: item.tax_percent,
              purchaseType: item.purchase_type,
            })
        ),
        totalAmount: doc.total_amount,
        taxAmount: doc.tax_amount,
        finalAmount: doc.final_amount,
        currency: doc.currency,
        expiresAt: doc.expires_at || null,
        createdAt: doc.get('created_at'),
      }
    );
  }

  private mapToPersistence(data: BillEntity): Omit<BillModel, 'created_at'> {
    return {
      bill_code: data.billCode,
      enterprise_id: data.enterpriseId,
      type: data.type,
      status: data.status,
      items: data.items.map((item) => ({
        line_type: item.lineType,
        package_id: item.packageId,
        package_variant_id: item.packageVariantId,
        credit_type: item.creditType,
        credit_amount: item.creditAmount,
        price: item.price,
        tax_percent: item.taxPercent,
        purchase_type: item.purchaseType,
      })),
      total_amount: data.totalAmount,
      tax_amount: data.taxAmount,
      final_amount: data.finalAmount,
      currency: data.currency,
      expires_at: data.expiresAt,
    };
  }
}
