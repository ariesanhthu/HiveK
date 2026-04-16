import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserRepository } from '@core/interfaces';
import { UserRoot, AdminRoot, EnterpriseUserRoot, KOLUserRoot } from '@/core/aggregate-roots';
import { UserModel, UserDocument } from '../schemas/user.schema';
import { Nullable } from '@/shared/types';
import { UserType } from '@/core/enums';

@Injectable()
export class MongoUserRepository implements IUserRepository {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

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
    const props = {
      email: doc.email,
      phone: doc.phone,
      passwordHash: doc.password_hash,
      fullName: doc.full_name,
      type: doc.type,
      roleId: doc.role_id,
      isEmailVerified: doc.is_email_verified,
      createdAt: doc.get('created_at'),
      updatedAt: doc.get('updated_at'),
    };

    const id = doc._id.toString();

    switch (doc.type) {
      case UserType.ADMIN:
        return AdminRoot.instantiate(id, props as any);
      case UserType.ENTERPRISE:
        return EnterpriseUserRoot.instantiate(id, {
          ...props,
          enterpriseId: (doc as any).enterprise_id,
        } as any);
      case UserType.KOL:
        return KOLUserRoot.instantiate(id, props as any);
      default:
        throw new Error(`Unknown user type: ${doc.type}`);
    }
  }

  private mapToPersistence(user: UserRoot): any {
    const base = {
      email: user.email,
      phone: (user.props as any).phone,
      password_hash: user.passwordHash,
      full_name: user.fullName,
      type: user.type,
      role_id: user.roleId,
      is_email_verified: user.isEmailVerified,
    };

    if (user instanceof EnterpriseUserRoot) {
      return { ...base, enterprise_id: user.enterpriseId };
    }

    return base;
  }
}
