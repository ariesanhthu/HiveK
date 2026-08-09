import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Model,
  QueryFilter,
  ProjectionType,
  QueryWithHelpers,
  PopulateOptions,
  Types,
} from 'mongoose';
import {
  IKolProfileReadService,
  type ILoggerService,
  LOGGER_SERVICE,
} from '@/application/interfaces';
import { KolProfileDetailDto, UserDto } from '@/application/dtos';
import { KolProfileFilterDto } from '@/application/queries';
import { KolProfileModel, KolProfileDocument } from '../schemas';
import { JsonObject, Nullable } from '@/core/types';
import {
  PaginatedResponseDto,
  SortOrder,
} from '@/application/dtos/pagination.dto';
import { parseMongoProjection, MongoSanitizeUtil } from '../utils';
import { FlattenMaps } from 'mongoose';
import { ERoleType } from '@/core/enums';

interface PopulatedPlatform {
  platform_id: {
    _id: Types.ObjectId;
    name: string;
    base_url?: string;
    baseUrl?: string;
    api_status?: string;
    apiStatus?: string;
    icon?: { url: string };
  };
  uniqueId: string;
  handle: string;
  url: string;
  external_id: string;
  follower_count: number;
  avg_engagement: number;
  top_tags: string[];
  categories?: string[];
}
interface PopulatedUser {
  _id: Types.ObjectId;
  email: string;
  phone: string;
  full_name: string;
  role_id: string;
  is_email_verified: boolean;
  type: ERoleType;
  created_at: Date;
  updated_at: Date;
}
interface RawKolProfileDoc extends Omit<
  FlattenMaps<KolProfileDocument>,
  'platforms' | 'user_id' | 'scores'
> {
  _id: Types.ObjectId;
  platforms?: PopulatedPlatform[];
  user_id: PopulatedUser;
  scores?: Record<string, unknown>;
}

@Injectable()
export class MongoKolProfileReadService implements IKolProfileReadService {
  constructor(
    @InjectModel(KolProfileModel.name)
    private readonly kolProfileModel: Model<KolProfileDocument>,
    @Inject(LOGGER_SERVICE)
    private readonly logger: ILoggerService,
  ) {}

  async findAll(
    filters: KolProfileFilterDto = {},
  ): Promise<PaginatedResponseDto<KolProfileDetailDto>> {
    const start = performance.now();
    const {
      cursor,
      limit = 10,
      sort = SortOrder.DESC,
      name,
      location,
      gender,
      isVerified,
      categories,
      tags,
    } = filters;
    const query: QueryFilter<KolProfileDocument> = {};

    if (name) {
      query.name = {
        $regex: MongoSanitizeUtil.escapeRegex(name),
        $options: 'i',
      };
    }
    if (location) {
      query.location = {
        $regex: MongoSanitizeUtil.escapeRegex(location),
        $options: 'i',
      };
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
      .populate('user_id')
      .lean()
      .exec();

    const hasNextPage = docs.length > limit;
    const results = hasNextPage ? docs.slice(0, limit) : docs;
    const nextCursor = hasNextPage
      ? results[results.length - 1]._id.toString()
      : null;

    const duration = performance.now() - start;
    // Log ra để quan sát trong lúc K6 đang bắn tải
    this.logger.log(`MongoDB Query executed in ${duration.toFixed(2)}ms`);

    return new PaginatedResponseDto(
      results.map((doc) => this.mapToDto(doc as unknown as RawKolProfileDoc)),
      nextCursor,
      hasNextPage,
      limit,
    );
  }

  async findById(
    id: string,
    projection?: Record<string, unknown>,
  ): Promise<Nullable<KolProfileDetailDto>> {
    let queryBuilder: QueryWithHelpers<KolProfileDocument, KolProfileDocument> =
      this.kolProfileModel.findById(id);

    if (projection) {
      const { select, populate } = parseMongoProjection(projection, {
        allowedFields: [
          'id',
          'userId',
          'verificationType',
          'name',
          'location',
          'gender',
          'bio',
          'email',
          'phone',
          'platforms',
          'isVerified',
          'scores',
        ],
        fieldMap: {
          userId: 'user_id',
          verificationType: 'verification_type',
          isVerified: 'is_verified',
        },
        populate: {
          user: {
            path: 'user_id',
            select: ['email', 'phone', 'fullName', 'roleId', 'type'],
            fieldMap: {
              fullName: 'full_name',
              roleId: 'role_id',
            },
          },
          platforms: {
            path: 'platforms.platform_id',
            select: ['name', 'baseUrl', 'apiStatus', 'icon'],
          },
        },
      });

      if (select) {
        queryBuilder = queryBuilder.select(select);
      }
      if (populate && populate.length > 0) {
        populate.forEach((opt) => {
          queryBuilder = queryBuilder.populate(opt);
        });
      }
    } else {
      queryBuilder = queryBuilder.populate('user_id');
    }

    const doc = await queryBuilder.lean().exec();
    return doc ? this.mapToDto(doc as unknown as RawKolProfileDoc) : null;
  }

  async findByEmail(email: string): Promise<Nullable<KolProfileDetailDto>> {
    const doc = await this.kolProfileModel
      .findOne({ email })
      .populate('user_id')
      .lean()
      .exec();
    return doc ? this.mapToDto(doc as unknown as RawKolProfileDoc) : null;
  }

  async findByName(name: string): Promise<KolProfileDetailDto[]> {
    const docs = await this.kolProfileModel
      .find({
        name: { $regex: MongoSanitizeUtil.escapeRegex(name), $options: 'i' },
      })
      .populate('user_id')
      .lean()
      .exec();
    return docs.map((doc) => this.mapToDto(doc as unknown as RawKolProfileDoc));
  }

  private mapToDto(doc: RawKolProfileDoc): KolProfileDetailDto {
    return {
      id: doc._id.toString(),
      userId:
        doc.user_id && typeof doc.user_id === 'object' && doc.user_id._id
          ? doc.user_id._id.toString()
          : (doc.user_id as unknown as string) || null,
      verificationType: doc.verification_type ?? null,
      name: doc.name,
      location: doc.location,
      gender: doc.gender,
      bio: doc.bio,
      email: doc.email,
      phone: doc.phone,
      isVerified: doc.is_verified,
      scores: doc.scores || {},
      platforms: (doc.platforms || []).map((p: PopulatedPlatform) => ({
        platformId:
          p.platform_id &&
          typeof p.platform_id === 'object' &&
          p.platform_id._id
            ? p.platform_id._id.toString()
            : (p.platform_id as unknown as string) || '',
        platform:
          p.platform_id &&
          typeof p.platform_id === 'object' &&
          p.platform_id._id
            ? {
                id: p.platform_id._id.toString(),
                name: p.platform_id.name,
                baseUrl: p.platform_id.base_url || p.platform_id.baseUrl || '',
                apiStatus:
                  p.platform_id.api_status || p.platform_id.apiStatus || '',
                icon: p.platform_id.icon
                  ? (p.platform_id.icon as unknown as string)
                  : null,
              }
            : undefined,
        uniqueId: p.uniqueId ?? p.handle ?? '',
        externalId: p.external_id,
        followerCount: p.follower_count,
        avgEngagement: p.avg_engagement,
        topTags: p.top_tags,
        categories: p.categories,
      })),
      user:
        doc.user_id && typeof doc.user_id === 'object' && doc.user_id._id
          ? ({
              id: doc.user_id._id.toString(),
              email: doc.user_id.email,
              phone: doc.user_id.phone,
              fullName: doc.user_id.full_name,
              roleId: doc.user_id.role_id ? doc.user_id.role_id.toString() : '',
              isEmailVerified: doc.user_id.is_email_verified,
              type: doc.user_id.type,
              createdAt: doc.user_id.created_at?.toISOString(),
              updatedAt: doc.user_id.updated_at?.toISOString(),
            } as unknown as UserDto)
          : undefined,
    };
  }
}
