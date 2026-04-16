import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IKolProfileReadService } from '@/application/interfaces';
import { KolProfileDto, KolProfileFilterDto } from '@/application/kol-profiles/dtos';
import { KolProfileModel, KolProfileDocument } from '../schemas';
import { JsonRecord, Nullable } from '@/shared/types';
import { PaginatedResponseDto, SortOrder } from '@/shared/dtos/pagination.dto';

@Injectable()
export class MongoKolProfileReadService implements IKolProfileReadService {
  constructor(
    @InjectModel(KolProfileModel.name)
    private readonly kolProfileModel: Model<KolProfileDocument>,
  ) {}

  async findAll(filters: KolProfileFilterDto = {} as any): Promise<PaginatedResponseDto<KolProfileDto>> {
    const { cursor, limit = 10, sort = SortOrder.DESC, name, location, gender, isVerified, categories, tags } = filters;
    const query: any = {};

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (gender) {
      query.gender = gender;
    }
    if (isVerified !== undefined) {
      query.is_verified = isVerified;
    }
    if (categories && categories.length > 0) {
      query['platforms.categories'] = { $in: categories };
    }
    if (tags && tags.length > 0) {
      query['platforms.top_tags'] = { $in: tags };
    }

    if (cursor) {
      query._id = sort === SortOrder.DESC ? { $lt: cursor } : { $gt: cursor };
    }

    const docs = await this.kolProfileModel
      .find(query)
      .sort({ _id: sort === SortOrder.DESC ? -1 : 1 })
      .limit(limit + 1)
      .lean()
      .exec();

    const hasNextPage = docs.length > limit;
    const results = hasNextPage ? docs.slice(0, limit) : docs;
    const nextCursor = hasNextPage ? results[results.length - 1]._id.toString() : null;

    return new PaginatedResponseDto(
      results.map((doc) => this.mapToDto(doc)),
      nextCursor,
    );
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
