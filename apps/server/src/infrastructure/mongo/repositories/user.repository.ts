import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession, Schema } from 'mongoose';
import { IUserRepository } from '@/core/interfaces/repositories';
import { UserRoot, AdminRoot, EnterpriseUserRoot, KOLUserRoot } from '@/core/aggregate-roots';
import { UserModel, UserDocument, EnterpriseUserModel, EnterpriseUserDocument } from '../schemas/user.schema';
import { Nullable } from '@/core/types';
import { ERoleType } from '@/core/enums';
import { PhoneNumberVO } from '@/core/value-objects/phone-number.value-object';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';

@Injectable()
export class MongoUserRepository implements IUserRepository {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(ERoleType.ADMIN)
    private readonly enterpriseUserModel: Model<EnterpriseUserDocument>,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) { }

  private get session(): ClientSession | undefined {
    return (this.uow as MongoUnitOfWork).getSession() || undefined;
  }

  async findById(id: string): Promise<Nullable<UserRoot>> {
    const doc = await this.userModel.findById(id).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByIds(ids: string[]): Promise<UserRoot[]> {
    const objectIds = ids.map(id => new Types.ObjectId(id));
    const docs = await this.userModel
      .find({ _id: { $in: objectIds } })
      .session(this.session)
      .exec();
    return docs.map(doc => this.mapToDomain(doc));
  }

  async findByEmail(email: string): Promise<Nullable<UserRoot>> {
    const doc = await this.userModel.findOne({ email }).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByEnterpriseId(enterpriseId: string): Promise<UserRoot[]> {
    const docs = await this.userModel.find({ enterprise_ids: new Types.ObjectId(enterpriseId) }).session(this.session).exec();
    return docs.map(doc => this.mapToDomain(doc));
  }

  async existsByRoleId(roleId: string): Promise<boolean> {
    const doc = await this.userModel.findOne(
      {
        role_id: new Schema.Types.ObjectId(roleId),
        delete_at: null,
      },
      { _id: 1 }
    ).session(this.session).lean().exec();
    return !!doc;
  }

  async save(user: UserRoot): Promise<void> {
    const data = this.mapToPersistence(user);
    const isEnterprise = user instanceof EnterpriseUserRoot || user.type === ERoleType.ENTERPRISE;
    console.log(data);
    if (!user.id) {
      if (isEnterprise) {
        const created = new this.enterpriseUserModel(data);
        const saved = await created.save({ session: this.session });
        user.setId(saved._id.toString());
      } else {
        const created = new this.userModel(data);
        const saved = await created.save({ session: this.session });
        user.setId(saved._id.toString());
      }
    } else {
      if (isEnterprise) {
        await this.enterpriseUserModel.findByIdAndUpdate(user.id, data).session(this.session).exec();
      } else {
        await this.userModel.findByIdAndUpdate(user.id, data).session(this.session).exec();
      }
    }
  }

  async delete(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id).session(this.session).exec();
  }

  private mapToDomain(doc: UserDocument): UserRoot {
    if (!doc._id) {
      throw new Error('User document ID is missing');
    }
    const props = {
      email: doc.email,
      phone: PhoneNumberVO.create({ value: doc.phone }),
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
        return AdminRoot.instantiate(id, {
          ...props,
          type: ERoleType.ADMIN,
        });
      case ERoleType.ENTERPRISE:
        return EnterpriseUserRoot.instantiate(id, {
          ...props,
          type: ERoleType.ENTERPRISE,
          enterpriseIds: (doc as any).enterprise_ids ? (doc as any).enterprise_ids.map((eid: any) => eid.toString()) : [],
        });
      case ERoleType.KOL:
        return KOLUserRoot.instantiate(id, {
          ...props,
          type: ERoleType.KOL,
        });
      default:
        throw new Error(`Unknown user type: ${doc.type}`);
    }
  }

  private mapToPersistence(user: UserRoot): any {
    const base = {
      _id: user.id ? new Types.ObjectId(user.id) : undefined,
      email: user.email,
      phone: user.phone.value,
      password_hash: user.passwordHash,
      full_name: user.fullName,
      avatar: user.avatar ? new Types.ObjectId(user.avatar) : null,
      role_id: new Types.ObjectId(user.roleId),
      is_email_verified: user.isEmailVerified,
      delete_at: user.deleteAt,
      delete_by: user.deleteBy,
      refresh_token: user.refreshToken,
      google_id: user.googleId,
    };

    if (user instanceof EnterpriseUserRoot || user.type === ERoleType.ENTERPRISE) {
      return {
        ...base,
        enterprise_ids: (user as EnterpriseUserRoot).enterpriseIds.map(id => new Types.ObjectId(id)),
      };
    }

    return base;
  }
}
