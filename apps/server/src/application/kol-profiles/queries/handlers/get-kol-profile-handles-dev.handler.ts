import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { KolProfileModel, KolProfileDocument, PlatformModel, PlatformDocument } from '@/infrastructure/mongo/schemas';
import { GetKolProfileHandlesDevQuery } from '../get-kol-profile-handles-dev.query';
import { PaginatedResponseDto, SortOrder } from '@/shared/dtos/pagination.dto';

@QueryHandler(GetKolProfileHandlesDevQuery)
export class GetKolProfileHandlesDevHandler implements IQueryHandler<GetKolProfileHandlesDevQuery, PaginatedResponseDto<any>> {
  constructor(
    @InjectModel(KolProfileModel.name)
    private readonly kolProfileModel: Model<KolProfileDocument>,
    @InjectModel(PlatformModel.name)
    private readonly platformModel: Model<PlatformDocument>,
  ) {}

  async execute(query: GetKolProfileHandlesDevQuery): Promise<PaginatedResponseDto<any>> {
    const { cursor, limit = 10, sort = SortOrder.DESC } = query.pagination || {};

    // 1. Load platforms map to map platform_id to platform name
    const platforms = await this.platformModel.find({}).lean().exec();
    const platformIdToName = new Map<string, string>();
    for (const p of platforms) {
      platformIdToName.set((p as any)._id.toString(), p.name);
    }

    // 2. Query influencers collection using cursor pagination
    const findQuery: any = {};
    if (cursor) {
      findQuery._id = sort === SortOrder.DESC ? { $lt: cursor } : { $gt: cursor };
    }

    const docs = await this.kolProfileModel
      .find(findQuery)
      .sort({ _id: sort === SortOrder.DESC ? -1 : 1 })
      .limit(limit + 1)
      .lean()
      .exec();

    const hasNextPage = docs.length > limit;
    const results = hasNextPage ? docs.slice(0, limit) : docs;
    const nextCursor = hasNextPage ? results[results.length - 1]._id.toString() : null;

    // 3. Transform to user-specified format:
    // { _id, youtube: ..., tiktok: ..., etc. }
    const mappedResults = results.map((doc: any) => {
      const mappedDoc: any = {
        _id: doc._id.toString(),
      };

      for (const p of doc.platforms || []) {
        const platformName = platformIdToName.get(p.platform_id) || p.platform_id;
        mappedDoc[platformName] = p.uniqueId ?? p.handle;
      }

      return mappedDoc;
    });

    return new PaginatedResponseDto(mappedResults, nextCursor);
  }
}
