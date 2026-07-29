import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FlattenMaps, Model, QueryFilter } from 'mongoose';
import { BillDocument, BillModel } from '../schemas';
import { IBillReadService } from '@/application/interfaces';
import { BillFilterDto } from '@/application/queries';
import { Nullable } from '@/core/types';
import { BillResponseDto, BillItemResponseDto } from '@/application/dtos';
import {
  PaginatedResponseDto,
  SortOrder,
} from '@/application/dtos/pagination.dto';
import { EBillLineType, EPurchaseType } from '@/core/enums';
import { Types } from 'mongoose';

interface RawBillItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  currency: string;
  line_type: EBillLineType;
  package_id?: string | Types.ObjectId;
  package_variant_id?: string | Types.ObjectId;
  credit_type?: string;
  credit_amount?: number;
  tax_percent?: number;
  purchase_type?: EPurchaseType;
}
interface RawBillDoc extends Omit<FlattenMaps<BillDocument>, 'items'> {
  _id: Types.ObjectId;
  items?: RawBillItem[];
}

@Injectable()
export class MongoBillReadService implements IBillReadService {
  constructor(
    @InjectModel(BillModel.name)
    private readonly model: Model<BillDocument>,
  ) {}

  async findAll(
    filters: BillFilterDto = {},
  ): Promise<PaginatedResponseDto<BillResponseDto>> {
    const {
      cursor,
      limit = 10,
      sort = SortOrder.DESC,
      enterpriseId,
      status,
    } = filters;
    const query: QueryFilter<BillDocument> = {};

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
    const nextCursor = hasNextPage
      ? results[results.length - 1]._id.toString()
      : null;

    return new PaginatedResponseDto(
      results.map((doc) => this.mapToDto(doc as unknown as RawBillDoc)),
      nextCursor,
      hasNextPage,
      limit,
    );
  }

  async findById(id: string): Promise<Nullable<BillResponseDto>> {
    const doc = await this.model.findById(id).lean().exec();
    return doc ? this.mapToDto(doc as unknown as RawBillDoc) : null;
  }

  async findByBillCode(billCode: string): Promise<Nullable<BillResponseDto>> {
    const doc = await this.model
      .findOne({ bill_code: billCode } as QueryFilter<BillDocument>)
      .lean()
      .exec();
    return doc ? this.mapToDto(doc as unknown as RawBillDoc) : null;
  }

  async findByEnterpriseId(enterpriseId: string): Promise<BillResponseDto[]> {
    const docs = await this.model
      .find({ enterprise_id: enterpriseId } as QueryFilter<BillDocument>)
      .lean()
      .exec();
    return docs.map((doc) => this.mapToDto(doc as unknown as RawBillDoc));
  }

  async findUnpaidBills(enterpriseId: string): Promise<BillResponseDto[]> {
    const docs = await this.model
      .find({
        enterprise_id: enterpriseId,
        status: 'pending',
      } as QueryFilter<BillDocument>)
      .lean()
      .exec();
    return docs.map((doc) => this.mapToDto(doc as unknown as RawBillDoc));
  }

  private mapToDto(doc: RawBillDoc): BillResponseDto {
    const items: BillItemResponseDto[] = (doc.items || []).map(
      (item: RawBillItem) => ({
        lineType: item.line_type,
        packageId: item.package_id?.toString(),
        packageVariantId: item.package_variant_id?.toString(),
        creditType: item.credit_type ?? null,
        creditAmount: item.credit_amount ?? null,
        price: item.price,
        taxPercent: item.tax_percent,
        purchaseType: item.purchase_type,
      }),
    );

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
      expiresAt: doc.expires_at?.toISOString() || null,
      createdAt: doc.created_at.toISOString(),
    };
  }
}
