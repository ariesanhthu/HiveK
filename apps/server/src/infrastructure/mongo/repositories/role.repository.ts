import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { IRoleRepository } from '@/core/interfaces/repositories';
import { RoleRoot } from '@/core/aggregate-roots';
import { RoleModel, RoleDocument } from '../schemas';
import { Nullable } from '@/core/types';
import {
  type IUnitOfWork,
  UNIT_OF_WORK,
  CACHE_SERVICE,
} from '@/application/interfaces';
import type { ICacheService } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';
import { CacheKeyUtil } from '@/shared/utils/cache-key.util';

@Injectable()
export class MongoRoleRepository implements IRoleRepository {
  constructor(
    @InjectModel(RoleModel.name)
    private readonly roleModel: Model<RoleDocument>,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
    @Inject(CACHE_SERVICE)
    private readonly cacheService: ICacheService,
  ) {}

  private get session(): ClientSession | undefined {
    return (this.uow as unknown as MongoUnitOfWork).getSession() || undefined;
  }

  async findById(id: string): Promise<Nullable<RoleRoot>> {
    const doc = await this.roleModel.findById(id).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByTitle(title: string): Promise<Nullable<RoleRoot>> {
    const doc = await this.roleModel
      .findOne({ title })
      .session(this.session)
      .exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async save(role: RoleRoot): Promise<void> {
    const data = this.mapToPersistence(role);

    if (!role.id) {
      const created = new this.roleModel(data);
      const saved = await created.save({ session: this.session });
      role.setId(saved._id.toString());
    } else {
      await this.roleModel
        .findByIdAndUpdate(role.id, data, { upsert: true })
        .session(this.session)
        .exec();
    }

    await this.invalidateCache(role.id, role.title);
  }

  async saveMany(roles: RoleRoot[]): Promise<void> {
    await Promise.all(roles.map((r) => this.save(r)));
  }

  async delete(id: string): Promise<void> {
    const doc = await this.roleModel.findById(id).session(this.session).exec();
    if (doc) {
      await this.roleModel.findByIdAndDelete(id).session(this.session).exec();
      await this.invalidateCache(id, doc.title);
    }
  }

  private async invalidateCache(id: string, title: string): Promise<void> {
    const domain = 'role';
    await Promise.all([
      this.cacheService.del(CacheKeyUtil.id(domain, id)),
      this.cacheService.del(
        CacheKeyUtil.custom(domain, `title:${title.toLowerCase()}`),
      ),
      this.cacheService.delByPattern(CacheKeyUtil.listPattern(domain)),
    ]);
  }

  private mapToDomain(doc: RoleDocument): RoleRoot {
    if (!doc._id) {
      throw new Error('Role document ID is missing');
    }
    return RoleRoot.instantiate(doc._id.toString(), {
      title: doc.title,
      permissions: doc.permissions,
      type: doc.type,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
      deleteAt: doc.delete_at,
      deleteBy: doc.delete_by,
    });
  }

  private mapToPersistence(
    role: RoleRoot,
  ): Omit<RoleModel, 'created_at' | 'updated_at'> {
    return {
      title: role.title,
      permissions: role.permissions,
      type: role.type,
      delete_at: role.deleteAt,
      delete_by: role.deleteBy,
    };
  }
}
