import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FlattenMaps, Model, QueryFilter } from 'mongoose';
import { UploadedFileDocument, UploadedFileModel } from '../schemas';
import { IUploadedFileReadService } from '@/application/interfaces';
import { Nullable } from '@/core/types';
import { UploadedFileDto } from '@/application/dtos';
import { UploadedFileFilterDto } from '@/application/queries/uploaded-file-get-list/uploaded-file-get-list.dto';
import { PaginatedResponseDto, SortOrder } from '@/application/dtos/pagination.dto';

@Injectable()
export class MongoUploadedFileReadService implements IUploadedFileReadService {
  constructor(
    @InjectModel(UploadedFileModel.name)
    private readonly model: Model<UploadedFileDocument>,
  ) {}

  async findAll(filters: UploadedFileFilterDto = {}): Promise<PaginatedResponseDto<UploadedFileDto>> {
    const { cursor, limit = 10, sort = SortOrder.DESC, targetId, format, size, minSize, maxSize } = filters;
    const query: QueryFilter<UploadedFileDocument> = { delete_at: null };

    if (targetId) {
      query.target_id = targetId;
    }

    if (format) {
      query.format = format;
    }

    if (size !== undefined) {
      query.size = size;
    } else if (minSize !== undefined || maxSize !== undefined) {
      query.size = {};
      if (minSize !== undefined) {
        query.size.$gte = minSize;
      }
      if (maxSize !== undefined) {
        query.size.$lte = maxSize;
      }
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
    const nextCursor = hasNextPage ? results[results.length - 1]._id.toString() : null;

    return new PaginatedResponseDto(
      results.map((doc) => this.mapToDto(doc)),
      nextCursor,
      hasNextPage,
      limit,
    );
  }

  async findById(id: string): Promise<Nullable<UploadedFileDto>> {
    const doc = await this.model.findOne({ _id: id, delete_at: null }).lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  private mapToDto(doc: FlattenMaps<UploadedFileDocument>): UploadedFileDto {
    return {
      id: doc._id.toString(),
      url: doc.url,
      publicId: doc.public_id,
      size: doc.size,
      format: doc.format,
      title: doc.title,
      targetType: doc.target_type,
      targetId: doc.target_id,
      targetField: doc.target_field,
      createdAt: doc.created_at.toISOString(),
      updatedAt: doc.updated_at.toISOString(),
    };
  }
}
