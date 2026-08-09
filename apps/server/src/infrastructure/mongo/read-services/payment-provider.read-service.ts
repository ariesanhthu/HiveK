import { EPaymentMethod } from '@/core/enums';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FlattenMaps, Model, QueryFilter } from 'mongoose';
import { PaymentProviderDocument, PaymentProviderModel } from '../schemas';
import { IPaymentProviderReadService } from '@/application/interfaces';
import { PaymentProviderFilterDto } from '@/application/queries';
import { Nullable } from '@/core/types';
import { PaymentProviderResponseDto } from '@/application/dtos';
import {
  PaginatedResponseDto,
  SortOrder,
} from '@/application/dtos/pagination.dto';

@Injectable()
export class MongoPaymentProviderReadService implements IPaymentProviderReadService {
  constructor(
    @InjectModel(PaymentProviderModel.name)
    private readonly model: Model<PaymentProviderDocument>,
  ) {}

  async findAll(
    filters: PaymentProviderFilterDto = {},
  ): Promise<PaginatedResponseDto<PaymentProviderResponseDto>> {
    const {
      cursor,
      limit = 10,
      sort = SortOrder.DESC,
      methods,
      isActive,
    } = filters;
    const query: QueryFilter<PaymentProviderDocument> = { deleted_at: null };

    if (isActive !== undefined) {
      query.is_active = isActive;
    }
    if (methods && methods.length > 0) {
      query.supported_methods = {
        $in: methods as unknown as EPaymentMethod[],
      };
    }

    if (cursor) {
      query._id = sort === SortOrder.DESC ? { $lt: cursor } : { $gt: cursor };
    }

    const docs = await this.model
      .find(query)
      .sort({ _id: sort === SortOrder.DESC ? -1 : 1 })
      .limit(limit + 1)
      .lean()
      .exec();

    const hasNextPage = docs.length > limit;
    const results = hasNextPage ? docs.slice(0, limit) : docs;
    const nextCursor = hasNextPage
      ? results[results.length - 1]._id.toString()
      : null;

    return new PaginatedResponseDto(
      results.map((doc) => this.mapToDto(doc)),
      nextCursor,
      hasNextPage,
      limit,
    );
  }

  async findById(id: string): Promise<Nullable<PaymentProviderResponseDto>> {
    const doc = await this.model
      .findOne({
        _id: id,
        deleted_at: null,
      } as QueryFilter<PaymentProviderDocument>)
      .lean()
      .exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findByCode(
    code: string,
  ): Promise<Nullable<PaymentProviderResponseDto>> {
    const doc = await this.model
      .findOne({
        code,
        deleted_at: null,
      } as QueryFilter<PaymentProviderDocument>)
      .lean()
      .exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findAllActive(): Promise<PaymentProviderResponseDto[]> {
    const docs = await this.model
      .find({
        is_active: true,
        deleted_at: null,
      } as QueryFilter<PaymentProviderDocument>)
      .lean()
      .exec();
    return docs.map((doc) => this.mapToDto(doc));
  }

  private mapToDto(
    doc: FlattenMaps<PaymentProviderDocument>,
  ): PaymentProviderResponseDto {
    return {
      id: doc._id.toString(),
      code: doc.code,
      displayName: doc.display_name,
      supportedMethods: doc.supported_methods || [],
      supportedCurrencies: doc.supported_currencies || [],
      isActive: doc.is_active,
      supportsWebhook: doc.supports_webhook,
      supportsRefund: doc.supports_refund,
      supportsPartialRefund: doc.supports_partial_refund,
      credentials: doc.credentials || {},
      baseUrl: doc.base_url || undefined,
      testUrl: doc.test_url || undefined,
      webhookUrl: doc.webhook_url || undefined,
      createdAt: doc.created_at.toISOString() || new Date().toISOString(),
      updatedAt: doc.updated_at.toISOString() || new Date().toISOString(),
      deletedAt: doc.deleted_at?.toISOString() || null,
      deletedBy: doc.deleted_by || null,
    };
  }
}
