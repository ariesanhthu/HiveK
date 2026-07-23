import { UserDetailDto, UserFilterDto } from '@/application/dtos';
import { PaginatedResponseDto, SortOrder } from '@/application/dtos/pagination.dto';
import { IUserReadService } from '@/application/interfaces';
import { ERoleType } from '@/core/enums';
import { Nullable } from '@/core/types';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { Schema } from 'mongoose';
import { UserDocument, UserModel } from '../schemas';
import { MongoSanitizeUtil } from '../utils';

@Injectable()
export class MongoUserReadService implements IUserReadService {
  constructor(
    @InjectModel(UserModel.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findById(id: string): Promise<Nullable<UserDetailDto>> {
    const doc = await this.userModel.findById(id).populate('role_id').populate('avatar').lean()
      .exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findByEmail(email: string): Promise<Nullable<UserDetailDto>> {
    const doc = await this.userModel.findOne({ email }).populate('role_id').populate('avatar')
      .lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findAll(filters: UserFilterDto = {} as any): Promise<PaginatedResponseDto<UserDetailDto>> {
    const {
      cursor,
      limit = 10,
      sort = SortOrder.DESC,
      email,
      phone,
      fullName,
      type,
      roleId,
      isEmailVerified,
    } = filters;
    const query: QueryFilter<UserDocument> = {};

    if (email) {
      query.email = { $regex: MongoSanitizeUtil.escapeRegex(email), $options: 'i' };
    }
    if (phone) {
      query.phone = { $regex: MongoSanitizeUtil.escapeRegex(phone), $options: 'i' };
    }
    if (fullName) {
      query.full_name = { $regex: MongoSanitizeUtil.escapeRegex(fullName), $options: 'i' };
    }
    if (type) {
      query.type = type;
    }
    if (roleId) {
      query.role_id = new Schema.Types.ObjectId(roleId);
    }
    if (isEmailVerified !== undefined) {
      query.is_email_verified = isEmailVerified;
    }

    if (cursor) {
      query._id = sort === SortOrder.DESC ? { $lt: cursor } : { $gt: cursor };
    }

    const docs = await this.userModel
      .find(query)
      .sort({ _id: sort === SortOrder.DESC ? -1 : 1 })
      .limit(limit + 1)
      .populate('role_id')
      .populate('avatar')
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

  private mapToDto(doc: any): UserDetailDto {
    const baseFields = {
      id: doc._id.toString(),
      email: doc.email,
      phone: doc.phone,
      fullName: doc.full_name,
      roleId: doc.role_id && typeof doc.role_id === 'object' && doc.role_id._id
        ? doc.role_id._id.toString()
        : doc.role_id?.toString() || '',
      isEmailVerified: doc.is_email_verified,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
      role: doc.role_id && typeof doc.role_id === 'object' && doc.role_id._id
        ? {
          id: doc.role_id._id.toString(),
          title: doc.role_id.title,
          permissions: doc.role_id.permissions,
          type: doc.role_id.type,
          createdAt: doc.role_id.created_at,
          updatedAt: doc.role_id.updated_at,
        }
        : undefined,
      avatar: doc.avatar && typeof doc.avatar === 'object' && doc.avatar._id
        ? {
          id: doc.avatar._id.toString(),
          url: doc.avatar.url,
          publicId: doc.avatar.public_id,
          size: doc.avatar.size,
          format: doc.avatar.format,
          title: doc.avatar.title,
          targetType: doc.avatar.target_type,
          targetId: doc.avatar.target_id,
          targetField: doc.avatar.target_field,
          createdAt: doc.avatar.created_at,
          updatedAt: doc.avatar.updated_at,
        }
        : null,
    };

    switch (doc.type) {
      case ERoleType.ENTERPRISE:
        return {
          ...baseFields,
          type: ERoleType.ENTERPRISE,
          enterpriseIds: doc.enterprise_ids
            ? doc.enterprise_ids.map((id: any) => id.toString())
            : [],
        } as any;
      case ERoleType.ADMIN:
        return {
          ...baseFields,
          type: ERoleType.ADMIN,
        } as any;
      case ERoleType.KOL:
        return {
          ...baseFields,
          type: ERoleType.KOL,
        } as any;
      default:
        throw new Error(`Unknown user type: ${doc.type}`);
    }
  }
}
