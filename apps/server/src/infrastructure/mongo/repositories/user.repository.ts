import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IUserRepository } from '@/core/interfaces/repositories';
import { UserRoot, AdminRoot, EnterpriseUserRoot, KOLUserRoot } from '@/core/aggregate-roots';
import { UserModel, UserDocument } from '../schemas/user.schema';
import { Nullable } from '@/core/types';
import { ERoleType } from '@/core/enums';

@Injectable()
export class MongoUserRepository implements IUserRepository {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserDocument>,
  ) { }

  async findById(id: string): Promise<Nullable<UserRoot>> {
    const doc = await this.userModel.findById(id).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByEmail(email: string): Promise<Nullable<UserRoot>> {
    const doc = await this.userModel.findOne({ email }).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async save(user: UserRoot): Promise<void> {
    const data = this.mapToPersistence(user);

    if (!user.id) {
      const created = new this.userModel(data);
      const saved = await created.save();
      user.setId(saved._id.toString());
    } else {
      await this.userModel.findByIdAndUpdate(user.id, data, { upsert: true }).exec();
    }
  }

  async delete(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id).exec();
  }

  private mapToDomain(doc: UserDocument): UserRoot {
    if (!doc._id) {
      throw new Error('User document ID is missing');
    }
    const props = {
      email: doc.email,
      phone: doc.phone,
      passwordHash: doc.password_hash,
      fullName: doc.full_name,
      avatar: doc.avatar ? doc.avatar.toString() : undefined,
      type: doc.type,
      roleId: doc.role_id ? doc.role_id.toString() : '',
      isEmailVerified: doc.is_email_verified,
      createdAt: doc.get('created_at'),
      updatedAt: doc.get('updated_at'),
      deleteAt: doc.delete_at,
      deleteBy: doc.delete_by,
      refreshToken: doc.refresh_token,
      googleId: doc.google_id,
    };

    const id = doc._id.toString();

    switch (doc.type) {
      case ERoleType.ADMIN:
        return AdminRoot.instantiate(id, props as any);
      case ERoleType.ENTERPRISE:
        return EnterpriseUserRoot.instantiate(id, {
          ...props,
          enterpriseId: (doc as any).enterprise_id ? (doc as any).enterprise_id.toString() : '',
        } as any);
      case ERoleType.KOL:
        return KOLUserRoot.instantiate(id, props as any);
      default:
        throw new Error(`Unknown user type: ${doc.type}`);
    }
  }

  private mapToPersistence(user: UserRoot): Omit<UserModel, 'created_at' | 'updated_at'> & { enterprise_id?: Types.ObjectId } {
    const base = {
      email: user.email,
      phone: (user.props as any).phone,
      password_hash: user.passwordHash,
      full_name: user.fullName,
      avatar: user.avatar ? new Types.ObjectId(user.avatar) as any : null,
      type: user.type,
      role_id: new Types.ObjectId(user.roleId) as any,
      is_email_verified: user.isEmailVerified,
      delete_at: user.deleteAt,
      delete_by: user.deleteBy,
      refresh_token: user.refreshToken,
      google_id: user.googleId,
    };

    if (user instanceof EnterpriseUserRoot) {
      return { ...base, enterprise_id: new Types.ObjectId(user.enterpriseId) };
    }

    return base as any;
  }
}
