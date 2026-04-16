import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IEnterpriseReadService } from '@/application/interfaces';
import { EnterpriseModel, type EnterpriseDocument } from '../schemas/enterprise.schema';
import { Nullable } from '@/shared/types';
import { EnterpriseDto, EnterpriseFilterDto } from '@/application/enterprises/dtos';
import { PaginatedResponseDto, SortOrder } from '@/shared/dtos/pagination.dto';

@Injectable()
export class MongoEnterpriseReadService implements IEnterpriseReadService {
  constructor(
    @InjectModel(EnterpriseModel.name)
    private readonly enterpriseModel: Model<EnterpriseDocument>,
  ) {}

  async findById(id: string): Promise<Nullable<EnterpriseDto>> {
    const doc = await this.enterpriseModel.findById(id).lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findByUserId(userId: string): Promise<Nullable<EnterpriseDto>> {
    const doc = await this.enterpriseModel.findOne({ user_id: userId }).lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findAll(filters: EnterpriseFilterDto = {} as any): Promise<PaginatedResponseDto<EnterpriseDto>> {
    const { cursor, limit = 10, sort = SortOrder.DESC, companyName, contactEmail, taxId, isVerified } = filters;
    const query: any = {};

    if (companyName) {
      query.company_name = { $regex: companyName, $options: 'i' };
    }
    if (contactEmail) {
      query.contact_email = { $regex: contactEmail, $options: 'i' };
    }
    if (taxId) {
      query.tax_id = taxId;
    }
    if (isVerified !== undefined) {
      query.is_verified = isVerified;
    }

    if (cursor) {
      query._id = sort === SortOrder.DESC ? { $lt: cursor } : { $gt: cursor };
    }

    const docs = await this.enterpriseModel
      .find(query)
      .sort({ _id: sort === SortOrder.DESC ? -1 : 1 })
      .limit(limit + 1)
      .lean()
      .exec();

    const hasNextPage = docs.length > limit;
    const results = hasNextPage ? docs.slice(0, limit) : docs;
    const nextCursor = hasNextPage ? results[results.length - 1]._id.toString() : null;

    return new PaginatedResponseDto(
      results.map((doc) => this.mapToDto(doc)),
      nextCursor,
    );
  }

  private mapToDto(doc: any): EnterpriseDto {
    return {
      id: doc._id.toString(),
      userId: doc.user_id,
      companyName: doc.company_name,
      description: doc.description,
      contactEmail: doc.contact_email,
      contactPhone: doc.contact_phone,
      website: doc.website,
      taxId: doc.tax_id,
      logoUrl: doc.logo_url,
      isVerified: doc.is_verified,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    };
  }
}
