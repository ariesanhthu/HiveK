import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import type { ICreditWalletRepository } from '@/core/interfaces/repositories';
import { CreditWalletRoot } from '@/core/aggregate-roots';
import { CreditWalletModel, CreditWalletDocument } from '../schemas';
import { CreditBalanceVO } from '@/core/value-objects';
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
export class MongoCreditWalletRepository implements ICreditWalletRepository {
  constructor(
    @InjectModel(CreditWalletModel.name)
    private readonly walletModel: Model<CreditWalletDocument>,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
    @Inject(CACHE_SERVICE)
    private readonly cacheService: ICacheService,
  ) {}

  private get session(): ClientSession | undefined {
    return (this.uow as MongoUnitOfWork).getSession() || undefined;
  }

  async findById(id: string): Promise<Nullable<CreditWalletRoot>> {
    const doc = await this.walletModel
      .findById(id)
      .session(this.session)
      .exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByEnterpriseId(
    enterpriseId: string,
  ): Promise<Nullable<CreditWalletRoot>> {
    const doc = await this.walletModel
      .findOne({ enterprise_id: enterpriseId })
      .session(this.session)
      .exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async save(wallet: CreditWalletRoot): Promise<void> {
    const data = this.mapToPersistence(wallet);

    if (!wallet.id) {
      const created = new this.walletModel(data);
      const saved = await created.save({ session: this.session });
      wallet.setId(saved._id.toString());
    } else {
      await this.walletModel
        .findByIdAndUpdate(wallet.id, data, { upsert: true })
        .session(this.session)
        .exec();
    }

    await this.invalidateCache(wallet.id, wallet.enterpriseId);
  }

  private async invalidateCache(
    id: string,
    enterpriseId: string,
  ): Promise<void> {
    const domain = 'credit-wallet';
    const invalidations = [
      this.walletModel.db.base ? Promise.resolve() : Promise.resolve(), // Mock/noop placeholder
      this.cacheService.del(CacheKeyUtil.id(domain, id)),
    ];
    if (enterpriseId) {
      invalidations.push(
        this.cacheService.del(
          CacheKeyUtil.custom(domain, `enterpriseId:${enterpriseId}`),
        ),
      );
    }
    await Promise.all(invalidations);
  }

  async saveMany(wallets: CreditWalletRoot[]): Promise<void> {
    await Promise.all(wallets.map((w) => this.save(w)));
  }

  async delete(id: string): Promise<void> {
    await this.walletModel.findByIdAndDelete(id).session(this.session).exec();
  }

  private mapToDomain(doc: CreditWalletDocument): CreditWalletRoot {
    return CreditWalletRoot.instantiate(doc._id.toString(), {
      enterpriseId: doc.enterprise_id,
      balances: (doc.balances || []).map(
        (b) =>
          new CreditBalanceVO({
            creditType: b.credit_type,
            total: b.total,
            used: b.used,
          }),
      ),
      createdAt: doc.get('created_at'),
      updatedAt: doc.get('updated_at'),
    });
  }

  private mapToPersistence(
    data: CreditWalletRoot,
  ): Omit<CreditWalletModel, 'created_at' | 'updated_at'> {
    return {
      enterprise_id: data.enterpriseId,
      balances: data.balances.map((b) => ({
        credit_type: b.creditType,
        total: b.total,
        used: b.used,
      })),
    };
  }
}
