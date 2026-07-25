import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FlattenMaps, Model, QueryFilter } from 'mongoose';
import { PackageDocument, PackageModel, GrantSchema } from '../schemas';
import { IPackageReadService } from '@/application/interfaces';
import { PackageFilterDto } from '@/application/queries';
import { Nullable } from '@/core/types';
import { PackageResponseDto, PackageVariantDto, GrantDto } from '@/application/dtos';
import { PaginatedResponseDto, SortOrder } from '@/application/dtos/pagination.dto';

@Injectable()
export class MongoPackageReadService implements IPackageReadService {
  constructor(
    @InjectModel(PackageModel.name)
    private readonly model: Model<PackageDocument>,
  ) {}

  async findAll(filters: PackageFilterDto = {}): Promise<PaginatedResponseDto<PackageResponseDto>> {
    const { cursor, limit = 10, sort = SortOrder.DESC, code, status, type, scope, enterpriseId } = filters;
    const query: QueryFilter<PackageDocument> = {};

    if (code) query.code = code;
    if (status) query.status = status;
    if (type) query.type = type;
    if (scope) query.scope = scope;
    if (enterpriseId !== undefined) {
      query.enterprise_id = enterpriseId === null ? null : enterpriseId;
    }

    const docs = await this.model
      .find(query)
      .sort({ created_at: sort === SortOrder.ASC ? 1 : -1 })
      .limit(limit)
      .lean()
      .exec();

    const data = docs.map((doc) => this.mapToDto(doc));

    return new PaginatedResponseDto(data, null, false, limit);
  }

  async findById(id: string): Promise<Nullable<PackageResponseDto>> {
    const doc = await this.model.findById(id).lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findByCode(code: string): Promise<PackageResponseDto[]> {
    const docs = await this.model.find({ code, status: 'active' } as QueryFilter<PackageDocument>).lean().exec();
    return docs.map((doc) => this.mapToDto(doc));
  }

  async findByType(type: string): Promise<PackageResponseDto[]> {
    const docs = await this.model.find({ type, status: 'active' } as QueryFilter<PackageDocument>).lean().exec();
    return docs.map((doc) => this.mapToDto(doc));
  }

  async findPublicPackages(): Promise<PackageResponseDto[]> {
    const docs = await this.model.find({ scope: 'public', status: 'active' } as QueryFilter<PackageDocument>).lean().exec();
    return docs.map((doc) => this.mapToDto(doc));
  }

  async findByEnterpriseId(enterpriseId: string): Promise<PackageResponseDto[]> {
    const docs = await this.model.find({ enterprise_id: enterpriseId, status: 'active' } as QueryFilter<PackageDocument>).lean().exec();
    return docs.map((doc) => this.mapToDto(doc));
  }

  private mapToDto(doc: FlattenMaps<PackageDocument>): PackageResponseDto {
    const mapGrantsList = (grantsList: GrantSchema[] | null | undefined): GrantDto[] => {
      return (grantsList || []).map((g) => ({
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
      }));
    };

    const variants: PackageVariantDto[] = (doc.variants || []).map((v: FlattenMaps<PackageDocument>['variants'][number]) => {
      return {
        id: v._id ? v._id.toString() : '',
        title: v.title,
        durationMonths: v.duration_months,
        price: v.price,
        priceAfterDiscount: v.price_after_discount,
        tax: v.tax,
        currency: v.currency,
        extraGrants: mapGrantsList(v.extra_grants),
      };
    });

    return {
      id: doc._id.toString(),
      code: doc.code,
      name: doc.name,
      description: doc.description,
      type: doc.type,
      scope: doc.scope,
      enterpriseId: doc.enterprise_id || null,
      status: doc.status,
      features: doc.features || [],
      baseGrants: mapGrantsList(doc.base_grants),
      variants,
      createdAt: (doc.created_at || new Date()).toISOString(),
      updatedAt: (doc.updated_at || new Date()).toISOString(),
      activatedAt: doc.activated_at ? doc.activated_at.toISOString() : undefined,
    };
  }
}
