import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Schema, Types } from 'mongoose';
import { IKpiLogReadService } from '@/application/interfaces';
import { KpiLogDto } from '@/application/dtos';
import { KpiLogFilterDto } from '@/application/queries';
import { KpiLogModel, KpiLogDocument } from '../schemas/kpi-log.schema';
import { PaginatedResponseDto, SortOrder } from '@/application/dtos/pagination.dto';
import { Nullable } from '@/core/types';

@Injectable()
export class MongoKpiLogReadService implements IKpiLogReadService {
  constructor(
    @InjectModel(KpiLogModel.name)
    private readonly kpiLogModel: Model<KpiLogDocument>,
  ) { }

  async findById(id: string): Promise<Nullable<KpiLogDto>> {
    const doc = await this.kpiLogModel.findById(id).lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findAll(filters: KpiLogFilterDto = {} as any): Promise<PaginatedResponseDto<KpiLogDto>> {
    const { cursor, limit = 10, sort = SortOrder.DESC, participantId, outputId, startTime, endTime } = filters;
    const query: QueryFilter<KpiLogDocument> = {};
    if (participantId) {
      query.participantId = new Types.ObjectId(participantId);
    }

    if (outputId) {
      query.outputId = new Types.ObjectId(outputId);
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
      participantId: doc.participantId ? doc.participantId.toString() : null,
      metrics: {
        views: doc.metrics?.views || 0,
        likes: doc.metrics?.views || 0,
        comments: doc.metrics?.comments || 0,
        shares: doc.metrics?.shares || 0,
      },
    };
  }
}
