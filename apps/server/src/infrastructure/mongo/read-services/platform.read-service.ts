import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IPlatformReadService } from '@/application/interfaces';
import { PlatformDto } from '@/application/platforms/dtos';
import { PlatformModel, PlatformDocument } from '../schemas';
import { JsonRecord, Nullable } from '@/shared/types';

@Injectable()
export class MongoPlatformReadService implements IPlatformReadService {
  constructor(
    @InjectModel(PlatformModel.name)
    private readonly platformModel: Model<PlatformDocument>,
  ) {}

  async findAll(filters?: JsonRecord): Promise<PlatformDto[]> {
    const docs = await this.platformModel.find().lean().exec();
    return docs.map((doc) => this.mapToDto(doc));
  }

  async findById(id: string): Promise<Nullable<PlatformDto>> {
    const doc = await this.platformModel.findById(id).lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findByName(name: string): Promise<Nullable<PlatformDto>> {
    const doc = await this.platformModel.findOne({ name: name.toLowerCase() }).lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  private mapToDto(doc: any): PlatformDto {
    return {
      id: doc._id.toString(),
      name: doc.name,
      baseUrl: doc.base_url,
      apiStatus: doc.api_status,
      iconUrl: doc.icon_url,
    };
  }
}