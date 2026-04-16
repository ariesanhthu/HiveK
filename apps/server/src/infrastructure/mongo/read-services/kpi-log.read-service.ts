import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IKpiLogReadService } from '@/application/interfaces';
import { KpiLogDto, KpiLogFilterDto } from '@/application/analytics/dtos/kpi-log.dto';
import { KpiLogModel, KpiLogDocument } from '../schemas/kpi-log.schema';
import { PaginatedResponseDto, SortOrder } from '@/shared/dtos/pagination.dto';
import { Nullable } from '@/shared/types';

@Injectable()
export class MongoKpiLogReadService implements IKpiLogReadService {
  constructor(
    @InjectModel(KpiLogModel.name)
    private readonly kpiLogModel: Model<KpiLogDocument>,
  ) {}

  async findById(id: string): Promise<Nullable<KpiLogDto>> {
    const doc = await this.kpiLogModel.findById(id).lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findAll(filters: KpiLogFilterDto = {} as any): Promise<PaginatedResponseDto<KpiLogDto>> {
    const { cursor, limit = 10, sort = SortOrder.DESC, participantId, startTime, endTime } = filters;
    const query: any = {};

    if (participantId) {
      query.participantId = participantId;
    }

    if (startTime || endTime) {
      query.timestamp = {};
      if (startTime) query.timestamp.$gte = startTime;
      if (endTime) query.timestamp.$lte = endTime;
    }

    if (cursor) {
      query._id = sort === SortOrder.DESC ? { $lt: cursor } : { $gt: cursor };
    }

    const docs = await this.kpiLogModel
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

  private mapToDto(doc: any): KpiLogDto {
    return {
      id: doc._id.toString(),
      timestamp: doc.timestamp,
      participantId: doc.participantId.toString(),
      metrics: {
        views: doc.metrics?.views || 0,
        likes: doc.metrics?.likes || 0,
        comments: doc.metrics?.comments || 0,
        shares: doc.metrics?.shares || 0,
      },
    };
  }
}
