import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserReadService } from '@/application/interfaces';
import { UserDto, UserFilterDto } from '@/application/users/dtos';
import { UserDocument, UserModel } from '../schemas';
import { Nullable } from '@/shared/types';
import { UserType } from '@/core/enums';
import { PaginatedResponseDto, SortOrder } from '@/shared/dtos/pagination.dto';

@Injectable()
export class MongoUserReadService implements IUserReadService {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findById(id: string): Promise<Nullable<UserDto>> {
    const doc = await this.userModel.findById(id).lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findByEmail(email: string): Promise<Nullable<UserDto>> {
    const doc = await this.userModel.findOne({ email }).lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findAll(filters: UserFilterDto = {} as any): Promise<PaginatedResponseDto<UserDto>> {
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

  private mapToDto(doc: any): UserDto {
    const baseFields = {
      id: doc._id.toString(),
      email: doc.email,
      phone: doc.phone,
      fullName: doc.full_name,
      roleId: doc.role_id,
      isEmailVerified: doc.is_email_verified,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    };

    switch (doc.type) {
      case UserType.ENTERPRISE:
        return {
          ...baseFields,
          type: UserType.ENTERPRISE,
          enterpriseId: doc.enterprise_id,
        };
      case UserType.ADMIN:
        return {
          ...baseFields,
          type: UserType.ADMIN,
        };
      case UserType.KOL:
        return {
          ...baseFields,
          type: UserType.KOL,
        };
      default:
        throw new Error(`Unknown user type: ${doc.type}`);
    }
  }
}
