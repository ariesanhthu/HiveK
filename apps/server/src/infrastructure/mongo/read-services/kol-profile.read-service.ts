import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IKolProfileReadService } from '@/application/interfaces';
import { KolProfileDto } from '@/application/kol-profiles/dtos';
import { KolProfileModel, KolProfileDocument } from '../schemas';
import { JsonRecord, Nullable } from '@/shared/types';

@Injectable()
export class MongoKolProfileReadService implements IKolProfileReadService {
  constructor(
    @InjectModel(KolProfileModel.name)
    private readonly kolProfileModel: Model<KolProfileDocument>,
  ) {}

  async findAll(filters?: JsonRecord): Promise<KolProfileDto[]> {
    const docs = await this.kolProfileModel.find().lean().exec();
    return docs.map((doc) => this.mapToDto(doc));
  }

  async findById(id: string): Promise<Nullable<KolProfileDto>> {
    const doc = await this.kolProfileModel.findById(id).lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findByEmail(email: string): Promise<Nullable<KolProfileDto>> {
    const doc = await this.kolProfileModel.findOne({ email }).lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findByName(name: string): Promise<KolProfileDto[]> {
    const docs = await this.kolProfileModel
      .find({ name: { $regex: name, $options: 'i' } })
      .lean()
      .exec();
    return docs.map((doc) => this.mapToDto(doc));
  }

  private mapToDto(doc: any): KolProfileDto {
    return {
      id: doc._id.toString(),
      name: doc.name,
      location: doc.location,
      gender: doc.gender,
      bio: doc.bio,
      email: doc.email,
      phone: doc.phone,
      isVerified: doc.is_verified,
      platforms: (doc.platforms || []).map((p: any) => ({
        platformId: p.platform_id,
        handle: p.handle,
        externalId: p.external_id,
        followerCount: p.follower_count,
        avgEngagement: p.avg_engagement,
        topTags: p.top_tags,
        categories: p.categories,
      })),
    };
  }
}
