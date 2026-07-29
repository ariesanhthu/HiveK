import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { IPaymentProviderRepository } from '@/core/interfaces/repositories';
import { PaymentProviderEntity } from '@/core/entities';
import { PaymentProviderModel, PaymentProviderDocument } from '../schemas';
import { Nullable } from '@/core/types';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
  CACHE_SERVICE,
} from '@/application/interfaces';
import type { ICacheService } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';
import { CacheKeyUtil } from '@/shared/utils/cache-key.util';

@Injectable()
export class MongoPaymentProviderRepository implements IPaymentProviderRepository {
  constructor(
    @InjectModel(PaymentProviderModel.name)
    private readonly providerModel: Model<PaymentProviderDocument>,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
    @Inject(CACHE_SERVICE)
    private readonly cacheService: ICacheService,
  ) {}

  private get session(): ClientSession | undefined {
    return (this.uow as MongoUnitOfWork).getSession() || undefined;
  }

  async findById(id: string): Promise<Nullable<PaymentProviderEntity>> {
    const doc = await this.providerModel
      .findOne({
        _id: id,
        $or: [{ deleted_at: null }, { deleted_at: { $exists: false } }],
      })
      .session(this.session)
      .exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async save(provider: PaymentProviderEntity): Promise<void> {
    const data = this.mapToPersistence(provider);

    if (!provider.id) {
      const created = new this.providerModel(data);
      const saved = await created.save({ session: this.session });
      provider.setId(saved._id.toString());
    } else {
      await this.providerModel
        .findByIdAndUpdate(provider.id, data, { upsert: true })
        .session(this.session)
        .exec();
    }

    await this.invalidateCache(provider.id, provider.code);
  }

  async saveMany(providers: PaymentProviderEntity[]): Promise<void> {
    await Promise.all(providers.map((p) => this.save(p)));
  }

  async delete(id: string): Promise<void> {
    const doc = await this.providerModel
      .findById(id)
      .session(this.session)
      .exec();
    if (doc) {
      await this.providerModel
        .findByIdAndDelete(id)
        .session(this.session)
        .exec();
      await this.invalidateCache(id, doc.code);
    }
  }

  private async invalidateCache(id: string, code: string): Promise<void> {
    const domain = 'payment-provider';
    const invalidations = [
      this.cacheService.del(CacheKeyUtil.id(domain, id)),
      this.cacheService.del(CacheKeyUtil.custom(domain, `code:${code}`)),
      this.cacheService.delByPattern(CacheKeyUtil.listPattern(domain)),
    ];
    await Promise.all(invalidations);
  }

  async findByCode(code: string): Promise<Nullable<PaymentProviderEntity>> {
    const doc = await this.providerModel
      .findOne({
        code,
        $or: [{ deleted_at: null }, { deleted_at: { $exists: false } }],
      })
      .session(this.session)
      .exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findAllActive(): Promise<PaymentProviderEntity[]> {
    const docs = await this.providerModel
      .find({
        is_active: true,
        $or: [{ deleted_at: null }, { deleted_at: { $exists: false } }],
      })
      .session(this.session)
      .exec();
    return docs.map((doc) => this.mapToDomain(doc));
  }

  private mapToDomain(doc: PaymentProviderDocument): PaymentProviderEntity {
    return PaymentProviderEntity.instantiate(doc._id.toString(), {
      code: doc.code,
      displayName: doc.display_name,
      supportedMethods: doc.supported_methods,
      supportedCurrencies: doc.supported_currencies,
      credentials: doc.credentials,
      isActive: doc.is_active,
      supportsWebhook: doc.supports_webhook,
      supportsRefund: doc.supports_refund,
      supportsPartialRefund: doc.supports_partial_refund,
      baseUrl: doc.base_url,
      testUrl: doc.test_url,
      webhookUrl: doc.webhook_url,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
      deletedAt: doc.deleted_at || undefined,
      deletedBy: doc.deleted_by || undefined,
    });
  }

  private mapToPersistence(
    data: PaymentProviderEntity,
  ): Omit<PaymentProviderModel, 'created_at' | 'updated_at'> {
    return {
      code: data.code,
      display_name: data.displayName,
      supported_methods: data.supportedMethods,
      supported_currencies: data.supportedCurrencies,
      credentials: data.credentials,
      is_active: data.isActive,
      supports_webhook: data.supportsWebhook,
      supports_refund: data.supportsRefund,
      supports_partial_refund: data.supportsPartialRefund,
      base_url: data.baseUrl,
      test_url: data.testUrl,
      webhook_url: data.webhookUrl,
      deleted_at: data.deletedAt ?? null,
      deleted_by: data.deletedBy ?? null,
    };
  }
}
