import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { IPackageRepository } from '@/core/interfaces/repositories';
import { PackageEntity } from '@/core/aggregate-roots';
import { PackageVariantEntity } from '@/core/entities';
import { PackageModel, PackageDocument, QuotaItemSchema } from '../schemas';
import { PackageFeatureVO, QuotaVO } from '@/core/value-objects';
import { EVersionStatus, EPackageType, EPackageScope } from '@/core/enums';
import { Nullable } from '@/core/types';
import { type IUnitOfWork, UNIT_OF_WORK, CACHE_SERVICE } from '@/application/interfaces';
import type { ICacheService } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';
import { CacheKeyUtil } from '@/shared/utils/cache-key.util';

@Injectable()
export class MongoPackageRepository implements IPackageRepository {
  constructor(
    @InjectModel(PackageModel.name)
    private readonly packageModel: Model<PackageDocument>,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
    @Inject(CACHE_SERVICE)
    private readonly cacheService: ICacheService,
  ) {}

  private get session(): ClientSession | undefined {
    return (this.uow as MongoUnitOfWork).getSession() || undefined;
  }

  async findById(id: string): Promise<Nullable<PackageEntity>> {
    const doc = await this.packageModel.findById(id).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async save(pkg: PackageEntity): Promise<void> {
    const data = this.mapToPersistence(pkg);

    if (!pkg.id) {
      const created = new this.packageModel(data);
      const saved = await created.save({ session: this.session });
      pkg.setId(saved._id.toString());
    } else {
      await this.packageModel.findByIdAndUpdate(pkg.id, data, { upsert: true }).session(this.session).exec();
    }

    await this.invalidateCache(pkg.id!, pkg.code, pkg.enterpriseId);
  }

  async saveMany(packages: PackageEntity[]): Promise<void> {
    await Promise.all(packages.map(p => this.save(p)));
  }

  async delete(id: string): Promise<void> {
    const doc = await this.packageModel.findById(id).session(this.session).exec();
    if (doc) {
      await this.packageModel.findByIdAndDelete(id).session(this.session).exec();
      await this.invalidateCache(id, doc.code, doc.enterprise_id);
    }
  }

  private async invalidateCache(id: string, code: string, enterpriseId: string | null): Promise<void> {
    const domain = 'package';
    const invalidations = [
      this.cacheService.del(CacheKeyUtil.id(domain, id)),
      this.cacheService.del(CacheKeyUtil.custom(domain, `code:${code}`)),
      this.cacheService.delByPattern(CacheKeyUtil.listPattern(domain)),
    ];
    if (enterpriseId) {
      invalidations.push(this.cacheService.del(CacheKeyUtil.custom(domain, `enterpriseId:${enterpriseId}`)));
    }
    await Promise.all(invalidations);
  }

  async findByCode(code: string): Promise<PackageEntity[]> {
    const docs = await this.packageModel.find({ code }).session(this.session).exec();
    return docs.map(doc => this.mapToDomain(doc));
  }

  async findByType(type: EPackageType): Promise<PackageEntity[]> {
    const docs = await this.packageModel.find({
      type,
      status: EVersionStatus.ACTIVE,
    }).session(this.session).exec();
    return docs.map(doc => this.mapToDomain(doc));
  }

  async findPublicPackages(): Promise<PackageEntity[]> {
    const docs = await this.packageModel.find({
      scope: EPackageScope.PUBLIC,
      status: EVersionStatus.ACTIVE,
    }).session(this.session).exec();
    return docs.map(doc => this.mapToDomain(doc));
  }

  async findByEnterpriseId(enterpriseId: string): Promise<PackageEntity[]> {
    const docs = await this.packageModel.find({
      enterprise_id: enterpriseId,
      status: EVersionStatus.ACTIVE,
    }).session(this.session).exec();
    return docs.map(doc => this.mapToDomain(doc));
  }

  async deleteByCode(code: string): Promise<void> {
    const docs = await this.packageModel.find({ code }).session(this.session).exec();
    await this.packageModel.deleteMany({ code }).session(this.session).exec();
    await Promise.all(docs.map(doc => this.invalidateCache(doc._id.toString(), doc.code, doc.enterprise_id)));
  }

  private mapToDomain(doc: PackageDocument): PackageEntity {
    const baseQuotasRecord = (doc.base_quotas || []).reduce<Record<string, number>>(
      (acc, curr) => {
        acc[curr.code] = curr.limit;
        return acc;
      },
      {}
    );

    return PackageEntity.instantiate(
      doc._id.toString(),
      {
        code: doc.code,
        name: doc.name,
        description: doc.description,
        type: doc.type,
        scope: doc.scope,
        enterpriseId: doc.enterprise_id,
        status: doc.status,
        features: (doc.features || []).map(
          (f) => new PackageFeatureVO({ code: f.code, permissions: f.permissions })
        ),
        baseQuotas: new QuotaVO(baseQuotasRecord),
        variants: (doc.variants || []).map((v) => {
          const extraQuotasRecord = ((v.extra_quotas || [])).reduce<Record<string, number>>(
            (acc, curr: QuotaItemSchema) => {
              acc[curr.code] = curr.limit;
              return acc;
            },
            {}
          );

          return PackageVariantEntity.instantiate(
            v._id ? v._id.toString() : new Types.ObjectId().toString(),
            {
              title: v.title,
              durationMonths: v.duration_months,
              price: v.price,
              priceAfterDiscount: v.price_after_discount,
              tax: v.tax,
              currency: v.currency,
              extraQuotas: new QuotaVO(extraQuotasRecord),
            }
          );
        }),
        createdAt: doc.get('created_at'),
        updatedAt: doc.get('updated_at'),
        activatedAt: doc.activated_at || undefined,
      }
    );
  }

  private mapToPersistence(data: PackageEntity): Omit<PackageModel, 'created_at' | 'updated_at'> {
    const includeVariantIds = Boolean(data.id);
    return {
      code: data.code,
      name: data.name,
      description: data.description,
      type: data.type,
      scope: data.scope,
      enterprise_id: data.enterpriseId ?? null,
      status: data.status,
      features: data.features.map((f) => ({
        code: f.code,
        permissions: f.permissions,
      })),
      base_quotas: Object.entries(data.baseQuotas.unmarshal).map(([code, limit]) => ({
        code,
        limit: Number(limit),
      })),
      variants: data.variants.map((v) => ({
        ...(includeVariantIds && v.id ? { _id: new Types.ObjectId(v.id).toString() } : {}),
        title: v.title,
        duration_months: v.durationMonths,
        price: v.price,
        currency: v.currency,
        price_after_discount: v.priceAfterDiscount,
        tax: v.tax,
        extra_quotas: Object.entries(v.extraQuotas.unmarshal).map(([code, limit]) => ({
          code,
          limit: Number(limit),
        })),
      })),
      activated_at: data.activatedAt ?? null,
    };
  }
}
