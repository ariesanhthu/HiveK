import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  KolProfileModel,
  KolProfileDocument,
  PlatformModel,
  PlatformDocument,
} from '@/infrastructure/mongo/schemas';
import { KolProfileGetHandlesDevQuery } from './kol-profile-get-handles-dev.query';
import {
  PaginatedResponseDto,
  SortOrder,
} from '@/application/dtos/pagination.dto';

@QueryHandler(KolProfileGetHandlesDevQuery)
export class KolProfileGetHandlesDevHandler implements IQueryHandler<
  KolProfileGetHandlesDevQuery,
  PaginatedResponseDto<Record<string, unknown>>
> {
  constructor(
    @InjectModel(KolProfileModel.name)
    private readonly kolProfileModel: Model<KolProfileDocument>,
    @InjectModel(PlatformModel.name)
    private readonly platformModel: Model<PlatformDocument>,
  ) {}

  async execute(
    query: KolProfileGetHandlesDevQuery,
  ): Promise<PaginatedResponseDto<Record<string, unknown>>> {
    const {
      cursor,
      limit = 10,
      sort = SortOrder.DESC,
    } = query.pagination || {};

    const platforms = await this.platformModel.find({}).lean().exec();
    const platformIdToName = new Map<string, string>();
    for (const p of platforms) {
      platformIdToName.set(String(p._id), p.name);
    }

    const findQuery: Record<string, unknown> = {};
    if (cursor) {
      findQuery._id =
        sort === SortOrder.DESC ? { $lt: cursor } : { $gt: cursor };
    }

    const docs = await this.kolProfileModel
      .find(findQuery)
      .sort({ _id: sort === SortOrder.DESC ? -1 : 1 })
      .limit(limit + 1)
      .lean()
      .exec();

    const hasNextPage = docs.length > limit;
    const results = hasNextPage ? docs.slice(0, limit) : docs;
    const nextCursor = hasNextPage
      ? results[results.length - 1]._id.toString()
      : null;

    const mappedResults = results.map((doc) => {
      const mappedDoc: Record<string, unknown> = {
        _id: doc._id,
      };

      for (const p of doc.platforms || []) {
        const platformName =
          platformIdToName.get(String(p.platform_id)) || String(p.platform_id);
        mappedDoc[platformName] =
          p.uniqueId ?? (p as unknown as Record<string, unknown>).handle;
      }

      return mappedDoc;
    });

    return new PaginatedResponseDto(
      mappedResults,
      nextCursor,
      hasNextPage,
      mappedResults.length,
    );
  }
}
