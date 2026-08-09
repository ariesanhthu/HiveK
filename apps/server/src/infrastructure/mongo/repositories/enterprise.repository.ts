import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { IEnterpriseRepository } from '@/core/interfaces/repositories';
import { EnterpriseRoot } from '@/core/aggregate-roots';
import { EnterpriseModel, EnterpriseDocument } from '../schemas';
import { Nullable } from '@/core/types';
import { PhoneNumberVO } from '@/core/value-objects/phone-number.value-object';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
  CACHE_SERVICE,
} from '@/application/interfaces';
import type { ICacheService } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';
import { CacheKeyUtil } from '@/shared/utils/cache-key.util';
import { EEnterpriseMemberMode } from '@/core/enums';

@Injectable()
export class MongoEnterpriseRepository implements IEnterpriseRepository {
  constructor(
    @InjectModel(EnterpriseModel.name)
    private readonly enterpriseModel: Model<EnterpriseDocument>,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
    @Inject(CACHE_SERVICE)
    private readonly cacheService: ICacheService,
  ) {}

  private get session(): ClientSession | undefined {
    return (this.uow as unknown as MongoUnitOfWork).getSession() || undefined;
  }

  async findById(id: string): Promise<Nullable<EnterpriseRoot>> {
    const doc = await this.enterpriseModel
      .findById(id)
      .session(this.session)
      .exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByUserId(userId: string): Promise<Nullable<EnterpriseRoot>> {
    const doc = await this.enterpriseModel
      .findOne({ user_id: new Types.ObjectId(userId) } as Record<
        string,
        unknown
      >)
      .session(this.session)
      .exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async save(enterprise: EnterpriseRoot): Promise<void> {
    const data = this.mapToPersistence(enterprise);

    if (!enterprise.id) {
      const created = new this.enterpriseModel(data);
      const saved = await created.save({ session: this.session });
      enterprise.setId(saved._id.toString());
    } else {
      await this.enterpriseModel
        .findByIdAndUpdate(enterprise.id, data, { upsert: true })
        .session(this.session)
        .exec();
    }

    await this.invalidateCache(enterprise.id, enterprise.userId);
  }

  async saveMany(enterprises: EnterpriseRoot[]): Promise<void> {
    await Promise.all(enterprises.map((e) => this.save(e)));
  }

  async delete(id: string): Promise<void> {
    const doc = await this.enterpriseModel
      .findById(id)
      .session(this.session)
      .exec();
    if (doc) {
      await this.enterpriseModel
        .findByIdAndDelete(id)
        .session(this.session)
        .exec();
      await this.invalidateCache(id, doc.user_id ? doc.user_id.toString() : '');
    }
  }

  private async invalidateCache(id: string, userId: string): Promise<void> {
    const domain = 'enterprise';
    const invalidations = [
      this.cacheService.del(CacheKeyUtil.id(domain, id)),
      this.cacheService.delByPattern(CacheKeyUtil.listPattern(domain)),
    ];
    if (userId) {
      invalidations.push(
        this.cacheService.del(CacheKeyUtil.custom(domain, `userId:${userId}`)),
      );
    }
    await Promise.all(invalidations);
  }

  private mapToDomain(doc: EnterpriseDocument): EnterpriseRoot {
    if (!doc._id) {
      throw new Error('Enterprise document ID is missing');
    }
    return EnterpriseRoot.instantiate(doc._id.toString(), {
      userId: doc.user_id ? doc.user_id.toString() : '',
      companyName: doc.company_name,
      description: doc.description || undefined,
      contactEmail: doc.contact_email,
      contactPhone: doc.contact_phone
        ? PhoneNumberVO.create({ value: doc.contact_phone })
        : undefined,
      website: doc.website || undefined,
      taxId: doc.tax_id || undefined,
      logoUrlId: doc.logo_url_id ? doc.logo_url_id.toString() : undefined,
      isVerified: doc.is_verified,
      members: (doc.members || []).map(
        (m: { user_id: Types.ObjectId; mode: EEnterpriseMemberMode }) => ({
          userId: m.user_id ? m.user_id.toString() : '',
          mode: m.mode,
        }),
      ),
      knowledgeBase: doc.knowledge_base
        ? {
            rawText: doc.knowledge_base.raw_text || undefined,
            externalLinks: doc.knowledge_base.external_links || [],
            updatedAt: doc.knowledge_base.updated_at,
          }
        : undefined,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
      deleteAt: doc.delete_at,
      deleteBy: doc.delete_by,
    });
  }

  private mapToPersistence(
    enterprise: EnterpriseRoot,
  ): Record<string, unknown> {
    return {
      user_id: new Types.ObjectId(enterprise.userId),
      company_name: enterprise.companyName,
      description: enterprise.description ?? null,
      contact_email: enterprise.contactEmail,
      contact_phone: enterprise.contactPhone?.value ?? null,
      website: enterprise.website ?? null,
      tax_id: enterprise.taxId ?? null,
      logo_url_id: enterprise.logoUrlId
        ? new Types.ObjectId(enterprise.logoUrlId)
        : null,
      is_verified: enterprise.isVerified,
      members: (enterprise.members || []).map((m) => ({
        user_id: new Types.ObjectId(m.userId),
        mode: m.mode,
      })),
      knowledge_base: enterprise.knowledgeBase
        ? {
            raw_text: enterprise.knowledgeBase.rawText ?? null,
            external_links: enterprise.knowledgeBase.externalLinks || [],
            updated_at: enterprise.knowledgeBase.updatedAt || new Date(),
          }
        : null,
      delete_at: enterprise.deleteAt,
      delete_by: enterprise.deleteBy,
    };
  }
}
