import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserReadService } from '@/application/interfaces/user.read-service.interface';
import { UserDto } from '@/application/users/dtos/user.dto';
import { UserDocument, UserModel } from '../schemas/user.schema';
import { Nullable, JsonRecord } from '@/shared/types/utility.type';
import { UserType } from '@/core/enums/user-type.enum';

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

  async findAll(filters?: JsonRecord): Promise<UserDto[]> {
    const docs = await this.userModel.find(filters || {}).lean().exec();
    return docs.map((doc) => this.mapToDto(doc));
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
