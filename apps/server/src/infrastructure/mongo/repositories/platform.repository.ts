import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { IPlatformRepository } from '@/core/interfaces/repositories';
import { PlatformRoot } from '@/core/aggregate-roots';
import { PlatformModel, PlatformDocument } from '../schemas';
import { Nullable } from '@/core/types';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';

@Injectable()
export class MongoPlatformRepository implements IPlatformRepository {
  constructor(
    @InjectModel(PlatformModel.name)
    private readonly platformModel: Model<PlatformDocument>,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  private get session(): ClientSession | undefined {
    return (this.uow as MongoUnitOfWork).getSession() || undefined;
  }

  async findById(id: string): Promise<Nullable<PlatformRoot>> {
    const doc = await this.platformModel
      .findById(id)
      .session(this.session)
      .exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByName(name: string): Promise<Nullable<PlatformRoot>> {
    const doc = await this.platformModel
      .findOne({ name: name.toLowerCase() })
      .session(this.session)
      .exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async save(platform: PlatformRoot): Promise<void> {
    const data = this.mapToPersistence(platform);

    if (!platform.id) {
      const created = new this.platformModel(data);
      const saved = await created.save({ session: this.session });
      platform.setId(saved._id.toString());
    } else {
      await this.platformModel
        .findByIdAndUpdate(platform.id, data, { upsert: true })
        .session(this.session)
        .exec();
    }
  }

  async saveMany(platforms: PlatformRoot[]): Promise<void> {
    await Promise.all(platforms.map((p) => this.save(p)));
  }

  async delete(id: string): Promise<void> {
    await this.platformModel.findByIdAndDelete(id).session(this.session).exec();
  }

  private mapToDomain(doc: PlatformDocument): PlatformRoot {
    if (!doc._id) {
      throw new Error('Platform document ID is missing');
    }
    return PlatformRoot.instantiate(doc._id.toString(), {
      name: doc.name,
      baseUrl: doc.base_url,
      apiStatus: doc.api_status,
      icon: doc.icon ? doc.icon.toString() : null,
      deleteAt: doc.delete_at,
      deleteBy: doc.delete_by,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    });
  }

  private mapToPersistence(
    platform: PlatformRoot,
  ): Omit<PlatformModel, 'created_at' | 'updated_at'> {
    return {
      name: platform.name,
      base_url: platform.baseUrl,
      api_status: platform.apiStatus,
      icon: platform.icon ? new Types.ObjectId(platform.icon) : null,
      delete_at: platform.deleteAt,
      delete_by: platform.deleteBy,
    };
  }
}
