import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IPlatformRepository } from '@/core/interfaces';
import { PlatformRoot } from '@/core/aggregate-roots';
import { PlatformModel, PlatformDocument } from '../schemas';
import { Nullable } from '@/shared/types';

@Injectable()
export class MongoPlatformRepository implements IPlatformRepository {
  constructor(
    @InjectModel(PlatformModel.name)
    private readonly platformModel: Model<PlatformDocument>,
  ) {}

  async findById(id: string): Promise<Nullable<PlatformRoot>> {
    const doc = await this.platformModel.findById(id).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByName(name: string): Promise<Nullable<PlatformRoot>> {
    const doc = await this.platformModel.findOne({ name: name.toLowerCase() }).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async save(platform: PlatformRoot): Promise<void> {
    const data = this.mapToPersistence(platform);
    
    if (!platform.id) {
      const created = new this.platformModel(data);
      const saved = await created.save();
      platform.setId(saved._id.toString());
    } else {
      await this.platformModel.findByIdAndUpdate(platform.id, data, { upsert: true }).exec();
    }
  }

  async delete(id: string): Promise<void> {
    await this.platformModel.findByIdAndDelete(id).exec();
  }

  private mapToDomain(doc: PlatformDocument): PlatformRoot {
    return PlatformRoot.instantiate(doc._id.toString(), {
      name: doc.name,
      baseUrl: doc.base_url,
      apiStatus: doc.api_status,
      iconUrl: doc.icon_url,
    });
  }

  private mapToPersistence(platform: PlatformRoot): any {
    return {
      name: platform.name,
      base_url: platform.baseUrl,
      api_status: platform.apiStatus,
      icon_url: platform.iconUrl,
    };
  }
}
