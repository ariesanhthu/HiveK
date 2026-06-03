import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserReadService } from '@/application/interfaces';
import { UserDetailDto, UserFilterDto } from '@/application/dtos';
import { UserDocument, UserModel } from '../schemas';
import { Nullable } from '@/core/types';
import { ERoleType } from '@/core/enums';
import { PaginatedResponseDto, SortOrder } from '@/shared/dtos/pagination.dto';

@Injectable()
export class MongoUserReadService implements IUserReadService {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserDocument>,
  ) { }

  async findById(id: string): Promise<Nullable<UserDetailDto>> {
    const doc = await this.userModel.findById(id).populate('role_id').populate('avatar').lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findByEmail(email: string): Promise<Nullable<UserDetailDto>> {
    const doc = await this.userModel.findOne({ email }).populate('role_id').populate('avatar').lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findAll(filters: UserFilterDto = {} as any): Promise<PaginatedResponseDto<UserDetailDto>> {
    const { cursor, limit = 10, sort = SortOrder.DESC, email, phone, fullName, type, roleId, isEmailVerified } = filters;
    const query: any = {};

    if (email) {
      query.email = { $regex: email, $options: 'i' };
    }
    if (phone) {
      query.phone = { $regex: phone, $options: 'i' };
    }
    if (fullName) {
      query.full_name = { $regex: fullName, $options: 'i' };
    }
    if (type) {
      query.type = type;
    }
    if (roleId) {
      query.role_id = roleId;
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
    );
  }

  private mapToDto(doc: any): UserDetailDto {
    const baseFields = {
      id: doc._id.toString(),
      email: doc.email,
      phone: doc.phone,
      fullName: doc.full_name,
      roleId: doc.role_id && typeof doc.role_id === 'object' && doc.role_id._id ? doc.role_id._id.toString() : doc.role_id?.toString() || '',
      isEmailVerified: doc.is_email_verified,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
      role: doc.role_id && typeof doc.role_id === 'object' && doc.role_id._id ? {
        id: doc.role_id._id.toString(),
        title: doc.role_id.title,
        permissions: doc.role_id.permissions,
        type: doc.role_id.type,
        createdAt: doc.role_id.created_at,
        updatedAt: doc.role_id.updated_at,
      } : undefined,
      avatar: doc.avatar && typeof doc.avatar === 'object' && doc.avatar._id ? {
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
      } : null,
    };

    switch (doc.type) {
      case ERoleType.ENTERPRISE:
        return {
          ...baseFields,
          type: ERoleType.ENTERPRISE,
          enterpriseId: doc.enterprise_id,
        };
      case ERoleType.ADMIN:
        return {
          ...baseFields,
          type: ERoleType.ADMIN,
        };
      case ERoleType.KOL:
        return {
          ...baseFields,
          type: ERoleType.KOL,
        };
      default:
        throw new Error(`Unknown user type: ${doc.type}`);
    }
  }
}
