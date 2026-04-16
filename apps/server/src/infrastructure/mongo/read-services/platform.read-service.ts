import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PlatformDocument, PlatformModel } from '../schemas';
import { IPlatformReadService } from '@/application/interfaces';
import { Nullable } from '@/shared/types';
import { PlatformDto, PlatformFilterDto } from '@/application/platforms/dtos';
import { PaginatedResponseDto, SortOrder } from '@/shared/dtos/pagination.dto';

@Injectable()
export class MongoPlatformReadService implements IPlatformReadService {
  constructor(
    @InjectModel(PlatformModel.name)
    private readonly platformModel: Model<PlatformDocument>,
  ) {}

  async findAll(filters: PlatformFilterDto = {} as any): Promise<PaginatedResponseDto<PlatformDto>> {
    const { cursor, limit = 10, sort = SortOrder.DESC, name, apiStatus } = filters;
    const query: any = {};

    if (name) {
      query.name = { $regex: name, $options: 'i' };
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

  async findById(id: string): Promise<Nullable<PlatformDto>> {
    const doc = await this.platformModel.findById(id).lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findByName(name: string): Promise<Nullable<PlatformDto>> {
    const doc = await this.platformModel.findOne({ name: name.toLowerCase() }).lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  private mapToDto(doc: any): PlatformDto {
    return {
      id: doc._id.toString(),
      name: doc.name,
      baseUrl: doc.base_url,
      apiStatus: doc.api_status,
      iconUrl: doc.icon_url,
    };
  }
}