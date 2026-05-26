import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IRoleRepository } from '@/core/interfaces';
import { RoleRoot } from '@/core/aggregate-roots';
import { RoleModel, RoleDocument } from '../schemas';
import { Nullable } from '@/shared/types';

@Injectable()
export class MongoRoleRepository implements IRoleRepository {
  constructor(
    @InjectModel(RoleModel.name)
    private readonly roleModel: Model<RoleDocument>,
  ) {}

  async findById(id: string): Promise<Nullable<RoleRoot>> {
    const doc = await this.roleModel.findById(id).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByTitle(title: string): Promise<Nullable<RoleRoot>> {
    const doc = await this.roleModel.findOne({ title }).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async save(role: RoleRoot): Promise<void> {
    const data = this.mapToPersistence(role);

    if (!role.id) {
      const created = new this.roleModel(data);
      const saved = await created.save();
      role.setId(saved._id.toString());
    } else {
      await this.roleModel.findByIdAndUpdate(role.id, data, { upsert: true }).exec();
    }
  }

  async delete(id: string): Promise<void> {
    await this.roleModel.findByIdAndDelete(id).exec();
  }

  private mapToDomain(doc: RoleDocument): RoleRoot {
    return RoleRoot.instantiate(doc._id.toString(), {
      title: doc.title,
      permissions: doc.permissions,
      isBlocked: doc.is_blocked,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
      deleteAt: doc.delete_at,
      deleteBy: doc.delete_by,
    });
  }

  private mapToPersistence(role: RoleRoot): any {
    return {
      title: role.title,
      permissions: role.permissions,
      is_blocked: role.isBlocked,
      delete_at: role.deleteAt,
      delete_by: role.deleteBy,
    };
  }
}
