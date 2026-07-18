import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { IPackageRepository } from '@/core/interfaces/repositories';
import { PackageRoot } from '@/core/aggregate-roots';
import { PackageVariantEntity } from '@/core/entities';
import { PackageModel, PackageDocument } from '../schemas';
import { GrantVO } from '@/core/value-objects';
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

  async findById(id: string): Promise<Nullable<PackageRoot>> {
    const doc = await this.packageModel.findById(id).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async save(pkg: PackageRoot): Promise<void> {
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

  async saveMany(packages: PackageRoot[]): Promise<void> {
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

  async findByCode(code: string): Promise<PackageRoot[]> {
    const docs = await this.packageModel.find({ code }).session(this.session).exec();
    return docs.map(doc => this.mapToDomain(doc));
  }

  async findByType(type: EPackageType): Promise<PackageRoot[]> {
    const docs = await this.packageModel.find({
      type,
      status: EVersionStatus.ACTIVE,
    }).session(this.session).exec();
    return docs.map(doc => this.mapToDomain(doc));
  }

  async findPublicPackages(): Promise<PackageRoot[]> {
    const docs = await this.packageModel.find({
      scope: EPackageScope.PUBLIC,
      status: EVersionStatus.ACTIVE,
    }).session(this.session).exec();
    return docs.map(doc => this.mapToDomain(doc));
  }

  async findByEnterpriseId(enterpriseId: string): Promise<PackageRoot[]> {
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

  private mapToDomain(doc: PackageDocument): PackageRoot {
    return PackageRoot.instantiate(
      doc._id.toString(),
      {
        code: doc.code,
        name: doc.name,
        description: doc.description,
        type: doc.type,
        scope: doc.scope,
        enterpriseId: doc.enterprise_id,
        status: doc.status,
        features: doc.features || [],
        baseGrants: (doc.base_grants || []).map(
          (g) =>
            new GrantVO({
              type: g.type,
              key: g.key,
              value: g.value,
              resetCycle: g.reset_cycle || undefined,
              creditFallback: g.credit_fallback
                ? {
                    creditType: g.credit_fallback.credit_type,
                    creditsPerUnit: g.credit_fallback.credits_per_unit,
                  }
                : g.credit_fallback === null
                ? null
                : undefined,
            })
        ),
        variants: (doc.variants || []).map((v: PackageDocument['variants'][0]) => {
          return PackageVariantEntity.instantiate(
            v._id.toString(),
            {
              title: v.title,
              durationMonths: v.duration_months,
              price: v.price,
              priceAfterDiscount: v.price_after_discount,
              tax: v.tax,
              currency: v.currency,
              extraGrants: (v.extra_grants || []).map(
                (g) =>
                  new GrantVO({
                    type: g.type,
                    key: g.key,
                    value: g.value,
                    resetCycle: g.reset_cycle || undefined,
                    creditFallback: g.credit_fallback
                      ? {
                          creditType: g.credit_fallback.credit_type,
                          creditsPerUnit: g.credit_fallback.credits_per_unit,
                        }
                      : g.credit_fallback === null
                      ? null
                      : undefined,
                  })
              ),
            }
          );
        }),
        createdAt: doc.get('created_at'),
        updatedAt: doc.get('updated_at'),
        activatedAt: doc.activated_at || undefined,
      }
    );
  }

  private mapToPersistence(data: PackageRoot): Omit<PackageModel, 'created_at' | 'updated_at'> {
    const includeVariantIds = Boolean(data.id);
    return {
      code: data.code,
      name: data.name,
      description: data.description,
      type: data.type,
      scope: data.scope,
      enterprise_id: data.enterpriseId ?? null,
      status: data.status,
      features: data.features,
      base_grants: data.baseGrants.map((g) => ({
        type: g.type,
        key: g.key,
        value: g.value,
        reset_cycle: g.resetCycle ?? null,
        credit_fallback: g.creditFallback
          ? {
              credit_type: g.creditFallback.creditType,
              credits_per_unit: g.creditFallback.creditsPerUnit,
            }
          : g.creditFallback === null
          ? null
          : null,
      })),
      variants: data.variants.map((v) => ({
        _id: new Types.ObjectId(v.id),
        title: v.title,
        duration_months: v.durationMonths,
        price: v.price,
        currency: v.currency,
        price_after_discount: v.priceAfterDiscount,
        tax: v.tax,
        extra_grants: v.extraGrants.map((g) => ({
          type: g.type,
          key: g.key,
          value: g.value,
          reset_cycle: g.resetCycle ?? null,
          credit_fallback: g.creditFallback
            ? {
                credit_type: g.creditFallback.creditType,
                credits_per_unit: g.creditFallback.creditsPerUnit,
              }
            : g.creditFallback === null
            ? null
            : null,
        })),
      })),
      activated_at: data.activatedAt ?? null,
    };
  }
}
