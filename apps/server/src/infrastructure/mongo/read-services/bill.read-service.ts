import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { BillDocument, BillModel } from '../schemas';
import { IBillReadService } from '@/application/interfaces';
import { BillFilterDto } from '@/application/queries';
import { Nullable } from '@/core/types';
import { BillResponseDto, BillItemResponseDto } from '@/application/dtos';
import { PaginatedResponseDto, SortOrder } from '@/application/dtos/pagination.dto';

@Injectable()
export class MongoBillReadService implements IBillReadService {
  constructor(
    @InjectModel(BillModel.name)
    private readonly model: Model<BillDocument>,
  ) {}

  async findAll(filters: BillFilterDto = {} as any): Promise<PaginatedResponseDto<BillResponseDto>> {
    const { cursor, limit = 10, sort = SortOrder.DESC, enterpriseId, status } = filters;
    const query: any = {};

    if (enterpriseId) query.enterprise_id = enterpriseId;
    if (status) query.status = status;

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
    const nextCursor = hasNextPage ? results[results.length - 1]._id.toString() : null;

    return new PaginatedResponseDto(
      results.map((doc) => this.mapToDto(doc)),
      nextCursor,
      hasNextPage,
      limit,
    );
  }

  async findById(id: string): Promise<Nullable<BillResponseDto>> {
    const doc = await this.model.findById(id).lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findByBillCode(billCode: string): Promise<Nullable<BillResponseDto>> {
    const doc = await this.model.findOne({ bill_code: billCode } as any).lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findByEnterpriseId(enterpriseId: string): Promise<BillResponseDto[]> {
    const docs = await this.model.find({ enterprise_id: enterpriseId } as any).lean().exec();
    return docs.map((doc) => this.mapToDto(doc));
  }

  async findUnpaidBills(enterpriseId: string): Promise<BillResponseDto[]> {
    const docs = await this.model.find({ enterprise_id: enterpriseId, status: 'pending' } as any).lean().exec();
    return docs.map((doc) => this.mapToDto(doc));
  }

  private mapToDto(doc: any): BillResponseDto {
    const items: BillItemResponseDto[] = (doc.items || []).map((item: any) => ({
      packageId: item.package_id,
      packageVariantId: item.package_variant_id,
      price: item.price,
      taxPercent: item.tax_percent,
      purchaseType: item.purchase_type,
    }));

    return {
      id: doc._id.toString(),
      billCode: doc.bill_code,
      enterpriseId: doc.enterprise_id,
      type: doc.type,
      status: doc.status,
      items,
      totalAmount: doc.total_amount,
      taxAmount: doc.tax_amount,
      finalAmount: doc.final_amount,
      currency: doc.currency,
      expiresAt: doc.expires_at || null,
      createdAt: doc.created_at || new Date(),
    };
  }
}
