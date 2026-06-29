import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { IRoleReadService, CACHE_SERVICE } from '@/application/interfaces';
import type { ICacheService } from '@/application/interfaces';
import { RoleDto, RoleFilterDto } from '@/application/dtos';
import { RoleDocument, RoleModel } from '../schemas/role.schema';
import { Nullable } from '@/core/types';
import { PaginatedResponseDto, SortOrder } from '@/application/dtos/pagination.dto';
import { MongoSanitizeUtil } from '../utils';
import { CacheKeyUtil } from '@/shared/utils/cache-key.util';

@Injectable()
export class MongoRoleReadService implements IRoleReadService {
  private readonly domain = 'role';

  constructor(
    @InjectModel(RoleModel.name)
    private readonly roleModel: Model<RoleDocument>,
    @Inject(CACHE_SERVICE)
    private readonly cacheService: ICacheService,
  ) { }

  async findById(id: string): Promise<Nullable<RoleDto>> {
    const cacheKey = CacheKeyUtil.id(this.domain, id);
    const cached = await this.cacheService.get<RoleDto>(cacheKey);
    if (cached) return cached;

    const doc = await this.roleModel.findById(id).lean().exec();
    if (!doc) return null;

    const dto = this.mapToDto(doc);
    await this.cacheService.set(cacheKey, dto, 3600);
    return dto;
  }

  async findByTitle(title: string): Promise<Nullable<RoleDto>> {
    const cacheKey = CacheKeyUtil.custom(this.domain, `title:${title.toLowerCase()}`);
    const cached = await this.cacheService.get<RoleDto>(cacheKey);
    if (cached) return cached;

    const doc = await this.roleModel.findOne({ title }).lean().exec();
    if (!doc) return null;

    const dto = this.mapToDto(doc);
    await this.cacheService.set(cacheKey, dto, 3600);
    return dto;
  }

  async findAll(filters: RoleFilterDto = {} as any): Promise<PaginatedResponseDto<RoleDto>> {
    const cacheKey = CacheKeyUtil.list(this.domain, filters);
    const cached = await this.cacheService.get<PaginatedResponseDto<RoleDto>>(cacheKey);
    if (cached) return cached;

    const { cursor, limit = 10, sort = SortOrder.DESC, title } = filters;
    const query: QueryFilter<RoleDocument> = {};

    if (title) {
      query.title = { $regex: MongoSanitizeUtil.escapeRegex(title), $options: 'i' };
    }

    if (cursor) {
      query._id = sort === SortOrder.DESC ? { $lt: cursor } : { $gt: cursor };
    }

    const docs = await this.roleModel
      .find(query)
      .sort({ _id: sort === SortOrder.DESC ? -1 : 1 })
      .limit(limit + 1)
      .lean()
      .exec();

    const hasNextPage = docs.length > limit;
    const results = hasNextPage ? docs.slice(0, limit) : docs;
    const nextCursor = hasNextPage ? results[results.length - 1]._id.toString() : null;

    const response = new PaginatedResponseDto(
      results.map((doc) => this.mapToDto(doc)),
      nextCursor,
      hasNextPage,
      limit,
    );

    await this.cacheService.set(cacheKey, response, 300);
    return response;
  }

  private mapToDto(doc: any): RoleDto {
    return {
      id: doc._id.toString(),
      title: doc.title,
      permissions: doc.permissions,
      type: doc.type,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    };
  }
}
