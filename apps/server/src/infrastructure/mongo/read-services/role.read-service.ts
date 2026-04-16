import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IRoleReadService } from '@/application/interfaces';
import { RoleDto, RoleFilterDto } from '@/application/role/dtos';
import { RoleDocument, RoleModel } from '../schemas/role.schema';
import { Nullable, JsonRecord } from '@/shared/types';
import { PaginatedResponseDto, SortOrder } from '@/shared/dtos/pagination.dto';

@Injectable()
export class MongoRoleReadService implements IRoleReadService {
  constructor(
    @InjectModel(RoleModel.name)
    private readonly roleModel: Model<RoleDocument>,
  ) {}

  async findById(id: string): Promise<Nullable<RoleDto>> {
    const doc = await this.roleModel.findById(id).lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findByTitle(title: string): Promise<Nullable<RoleDto>> {
    const doc = await this.roleModel.findOne({ title }).lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findAll(filters: RoleFilterDto = {} as any): Promise<PaginatedResponseDto<RoleDto>> {
    const { cursor, limit = 10, sort = SortOrder.DESC, title, isBlocked } = filters;
    const query: any = {};

    if (title) {
      query.title = { $regex: title, $options: 'i' };
    }
    if (isBlocked !== undefined) {
      query.is_blocked = isBlocked;
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

    return new PaginatedResponseDto(
      results.map((doc) => this.mapToDto(doc)),
      nextCursor,
    );
  }

  private mapToDto(doc: any): RoleDto {
    return {
      id: doc._id.toString(),
      title: doc.title,
      permissions: doc.permissions,
      isBlocked: doc.is_blocked,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    };
  }
}
