import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { PlatformDocument, PlatformModel } from '../schemas';
import { IPlatformReadService } from '@/application/interfaces';
import { Nullable } from '@/core/types';
import { PlatformDetailDto } from '@/application/dtos';
import { PlatformFilterDto } from '@/application/queries';
import { PaginatedResponseDto, SortOrder } from '@/application/dtos/pagination.dto';
import { MongoSanitizeUtil } from '../utils';

@Injectable()
export class MongoPlatformReadService implements IPlatformReadService {
  constructor(
    @InjectModel(PlatformModel.name)
    private readonly platformModel: Model<PlatformDocument>,
  ) { }

  async findAll(filters: PlatformFilterDto = {} as any): Promise<PaginatedResponseDto<PlatformDetailDto>> {
    const { cursor, limit = 10, sort = SortOrder.DESC, name, apiStatus } = filters;
    const query: QueryFilter<PlatformDocument> = {};

    if (name) {
      query.name = { $regex: MongoSanitizeUtil.escapeRegex(name), $options: 'i' };
    }

    if (apiStatus) {
      query.api_status = apiStatus;
    }

    if (cursor) {
      query._id = sort === SortOrder.DESC ? { $lt: cursor } : { $gt: cursor };
    }

    const docs = await this.platformModel
      .find(query)
      .sort({ _id: sort === SortOrder.DESC ? -1 : 1 })
      .limit(limit + 1)
      .populate('icon')
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

  async findById(id: string): Promise<Nullable<PlatformDetailDto>> {
    const doc = await this.platformModel.findById(id).populate('icon').lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findByName(name: string): Promise<Nullable<PlatformDetailDto>> {
    const doc = await this.platformModel.findOne({ name: name.toLowerCase() }).populate('icon').lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  private mapToDto(doc: any): PlatformDetailDto {
    return {
      id: doc._id.toString(),
      name: doc.name,
      baseUrl: doc.base_url,
      apiStatus: doc.api_status,
      icon: doc.icon && typeof doc.icon === 'object' && doc.icon._id ? {
        id: doc.icon._id.toString(),
        url: doc.icon.url,
        publicId: doc.icon.public_id,
        size: doc.icon.size,
        format: doc.icon.format,
        title: doc.icon.title,
        targetType: doc.icon.target_type,
        targetId: doc.icon.target_id,
        targetField: doc.icon.target_field,
        createdAt: doc.icon.created_at,
        updatedAt: doc.icon.updated_at,
      } : null,
    };
  }
}