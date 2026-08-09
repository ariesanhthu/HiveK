import { UserDto } from '@/application/dtos';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Model,
  Types,
  ProjectionType,
  PopulateOptions,
  QueryWithHelpers,
} from 'mongoose';
import {
  CampaignModel,
  CampaignDocument,
  PlatformTargetItemModel,
  RawContentItemModel,
  ScheduleDayModel,
  CampaignParticipantSubModel,
} from '../schemas/campaign.schema';
import { ICampaignReadService } from '@/application/interfaces';
import { Nullable } from '@/core/types';
import { CampaignDetailDto } from '@/application/dtos';
import { ERoleType } from '@/core/enums';
import { CampaignFilterDto } from '@/application/queries';
import {
  PaginatedResponseDto,
  SortOrder,
} from '@/application/dtos/pagination.dto';
import { parseMongoProjection, MongoSanitizeUtil } from '../utils';
import { QueryFilter } from 'mongoose';

interface PopulatedOwner {
  _id: Types.ObjectId;
  email: string;
  phone: string;
  fullName: string;
  roleId: Types.ObjectId;
  type: string;
  is_email_verified?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface PopulatedEnterprise {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  companyName: string;
  description?: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  taxId?: string;
  logoUrlId?: string;
  isVerified: boolean;
  members?: Array<{
    user_id: Types.ObjectId;
    role: string;
    mode: string;
  }>;
  knowledge_base?: {
    raw_text: string;
    external_links: string[];
    updated_at?: Date;
  };
  created_at?: Date;
  updated_at?: Date;
}

type PopulatedCampaign = Omit<
  CampaignDocument,
  'owner_id' | 'enterprise_id' | 'collaborator_ids'
> & {
  _id: Types.ObjectId;
  owner_id?: Types.ObjectId | PopulatedOwner;
  enterprise_id?: Types.ObjectId | PopulatedEnterprise;
  collaborator_ids?: string[] | Types.ObjectId[] | PopulatedOwner[];
  financial_target?: Map<string, unknown> | Record<string, unknown>;
  extras?: Map<string, unknown> | Record<string, unknown>;
};

@Injectable()
export class MongoCampaignReadService implements ICampaignReadService {
  constructor(
    @InjectModel(CampaignModel.name)
    private readonly campaignModel: Model<CampaignDocument>,
  ) {}

  async findAll(
    filters: CampaignFilterDto = {},
    projection?: Record<string, unknown>,
  ): Promise<PaginatedResponseDto<CampaignDetailDto>> {
    const {
      cursor,
      limit = 10,
      sort = SortOrder.DESC,
      name,
      ownerId,
      enterpriseId,
    } = filters;
    const query: QueryFilter<CampaignDocument> = {};

    if (name) {
      query.description = {
        $regex: MongoSanitizeUtil.escapeRegex(name),
        $options: 'i',
      };
    }

    if (ownerId) {
      query.owner_id = new Types.ObjectId(ownerId);
    }

    if (enterpriseId) {
      query.enterprise_id = new Types.ObjectId(enterpriseId);
    }

    if (cursor) {
      query._id = sort === SortOrder.DESC ? { $lt: cursor } : { $gt: cursor };
    }

    let queryBuilder = this.campaignModel
      .find(query)
      .sort({ _id: sort === SortOrder.DESC ? -1 : 1 })
      .limit(limit + 1) as QueryWithHelpers<
      PopulatedCampaign[],
      CampaignDocument
    >;

    if (projection) {
      const { select, populate } = parseMongoProjection(projection, {
        allowedFields: [
          'id',
          'ownerId',
          'enterpriseId',
          'budget',
          'financialTarget',
          'description',
          'platformTarget',
          'status',
          'collaboratorIds',
          'rawContents',
          'schedule',
          'participants',
        ],
        fieldMap: {
          ownerId: 'owner_id',
          enterpriseId: 'enterprise_id',
          collaboratorIds: 'collaborator_ids',
          rawContents: 'raw_contents',
          platformTarget: 'platform_target',
          financialTarget: 'financial_target',
        },
        populate: {
          owner: {
            path: 'owner_id',
            select: ['email', 'phone', 'fullName', 'roleId', 'type'],
            fieldMap: {
              fullName: 'full_name',
              roleId: 'role_id',
            },
          },
          enterprise: {
            path: 'enterprise_id',
            select: [
              'userId',
              'companyName',
              'description',
              'contactEmail',
              'contactPhone',
              'website',
              'taxId',
              'logoUrlId',
              'isVerified',
            ],
            fieldMap: {
              userId: 'user_id',
              companyName: 'company_name',
              contactEmail: 'contact_email',
              contactPhone: 'contact_phone',
              logoUrlId: 'logo_url_id',
              isVerified: 'is_verified',
            },
          },
          collaborators: {
            path: 'collaborator_ids',
            model: 'UserModel',
            select: ['email', 'phone', 'fullName', 'roleId', 'type'],
            fieldMap: {
              fullName: 'full_name',
              roleId: 'role_id',
            },
          },
        },
      });

      if (select) {
        queryBuilder = queryBuilder.select(select);
      }
      if (populate && populate.length > 0) {
        populate.forEach((opt: PopulateOptions) => {
          queryBuilder = queryBuilder.populate(opt);
        });
      }
    } else {
      queryBuilder = queryBuilder
        .populate('owner_id')
        .populate('enterprise_id');
    }

    const docs = (await queryBuilder
      .lean()
      .exec()) as unknown as PopulatedCampaign[];

    const hasNextPage = docs.length > limit;
    const results = hasNextPage ? docs.slice(0, limit) : docs;
    const nextCursor = hasNextPage
      ? results[results.length - 1]._id.toString()
      : null;

    return new PaginatedResponseDto(
      results.map((doc) => this.mapToDto(doc)),
      nextCursor,
      hasNextPage,
      limit,
    );
  }

  async findById(
    id: string,
    projection?: Record<string, unknown>,
  ): Promise<Nullable<CampaignDetailDto>> {
    let queryBuilder = this.campaignModel.findById(id) as QueryWithHelpers<
      PopulatedCampaign | null,
      CampaignDocument
    >;

    if (projection) {
      const { select, populate } = parseMongoProjection(projection, {
        allowedFields: [
          'id',
          'ownerId',
          'enterpriseId',
          'budget',
          'financialTarget',
          'description',
          'platformTarget',
          'status',
          'collaboratorIds',
          'rawContents',
          'schedule',
          'participants',
        ],
        fieldMap: {
          ownerId: 'owner_id',
          enterpriseId: 'enterprise_id',
          collaboratorIds: 'collaborator_ids',
          rawContents: 'raw_contents',
          platformTarget: 'platform_target',
          financialTarget: 'financial_target',
        },
        populate: {
          owner: {
            path: 'owner_id',
            select: ['email', 'phone', 'fullName', 'roleId', 'type'],
            fieldMap: {
              fullName: 'full_name',
              roleId: 'role_id',
            },
          },
          enterprise: {
            path: 'enterprise_id',
            select: [
              'userId',
              'companyName',
              'description',
              'contactEmail',
              'contactPhone',
              'website',
              'taxId',
              'logoUrlId',
              'isVerified',
            ],
            fieldMap: {
              userId: 'user_id',
              companyName: 'company_name',
              contactEmail: 'contact_email',
              contactPhone: 'contact_phone',
              logoUrlId: 'logo_url_id',
              isVerified: 'is_verified',
            },
          },
          collaborators: {
            path: 'collaborator_ids',
            model: 'UserModel',
            select: ['email', 'phone', 'fullName', 'roleId', 'type'],
            fieldMap: {
              fullName: 'full_name',
              roleId: 'role_id',
            },
          },
        },
      });

      if (select) {
        queryBuilder = queryBuilder.select(select);
      }
      if (populate && populate.length > 0) {
        populate.forEach((opt: PopulateOptions) => {
          queryBuilder = queryBuilder.populate(opt);
        });
      }
    } else {
      queryBuilder = queryBuilder
        .populate('owner_id')
        .populate('enterprise_id');
    }

    const doc = (await queryBuilder
      .lean()
      .exec()) as unknown as PopulatedCampaign | null;
    return doc ? this.mapToDto(doc) : null;
  }

  private mapToDto(doc: PopulatedCampaign): CampaignDetailDto {
    const owner =
      doc.owner_id && typeof doc.owner_id === 'object' && '_id' in doc.owner_id
        ? (doc.owner_id as PopulatedOwner)
        : null;
    const enterprise =
      doc.enterprise_id &&
      typeof doc.enterprise_id === 'object' &&
      '_id' in doc.enterprise_id
        ? (doc.enterprise_id as PopulatedEnterprise)
        : null;

    return {
      id: doc._id.toString(),
      ownerId: owner
        ? owner._id.toString()
        : doc.owner_id
          ? (doc.owner_id as Types.ObjectId).toString()
          : '',
      enterpriseId: enterprise
        ? enterprise._id.toString()
        : doc.enterprise_id
          ? (doc.enterprise_id as Types.ObjectId).toString()
          : null,
      budget: doc.budget,
      financialTarget:
        doc.financial_target instanceof Map
          ? Object.fromEntries(doc.financial_target)
          : doc.financial_target || {},
      description: doc.description || '',
      platformTarget: (doc.platform_target || []).map(
        (p: PlatformTargetItemModel) => ({
          platformId: p.platformId,
          minFollowers: p.minFollowers,
          maxFollowers: p.maxFollowers,
          note: p.note,
          extras:
            p.extras instanceof Map ? Object.fromEntries(p.extras) : p.extras,
        }),
      ),
      status: doc.status,
      extras:
        doc.extras instanceof Map ? Object.fromEntries(doc.extras) : doc.extras,
      collaboratorIds: Array.isArray(doc.collaborator_ids)
        ? doc.collaborator_ids.map((c) =>
            typeof c === 'object' && '_id' in c
              ? (c as PopulatedOwner)._id.toString()
              : c.toString(),
          )
        : [],
      rawContents: (doc.raw_contents || []).map((r: RawContentItemModel) => ({
        fileId: r.fileId,
        rawContent: r.rawContent,
      })),
      schedule: doc.schedule
        ? {
            timeline: (doc.schedule.timeline || []).map(
              (day: ScheduleDayModel) => ({
                date:
                  day.date instanceof Date
                    ? day.date.toISOString()
                    : String(day.date),
                label: day.label,
                posts: (day.posts || []).map((postId: Types.ObjectId) =>
                  String(postId.toString?.() || postId),
                ),
              }),
            ),
          }
        : undefined,
      participants: (doc.participants || []).map(
        (
          p: CampaignParticipantSubModel & {
            id?: Types.ObjectId;
            kolProfileId?: Types.ObjectId;
          },
        ) => ({
          id: p._id?.toString() || p.id?.toString(),
          kolProfileId:
            p.kol_profile_id?.toString() || p.kolProfileId?.toString(),
          status: p.status,
          joinedAt:
            p.joined_at instanceof Date
              ? p.joined_at.toISOString()
              : p.joined_at
                ? String(p.joined_at)
                : undefined,
        }),
      ),
      owner: owner
        ? ({
            id: owner._id.toString(),
            email: owner.email,
            phone: owner.phone,
            fullName: owner.fullName,
            roleId: owner.roleId?.toString(),
            isEmailVerified: owner.is_email_verified,
            type: owner.type as ERoleType,
            createdAt:
              owner.created_at?.toISOString() || new Date().toISOString(),
            updatedAt:
              owner.updated_at?.toISOString() || new Date().toISOString(),
          } as unknown as UserDto)
        : undefined,
      enterprise: enterprise
        ? {
            id: enterprise._id.toString(),
            userId: enterprise.userId?.toString(),
            companyName: enterprise.companyName,
            description: enterprise.description,
            contactEmail: enterprise.contactEmail,
            contactPhone: enterprise.contactPhone,
            website: enterprise.website,
            taxId: enterprise.taxId,
            logoUrlId: enterprise.logoUrlId?.toString(),
            isVerified: enterprise.isVerified,
            members: (enterprise.members || []).map(
              (m: { user_id: Types.ObjectId; role: string; mode: string }) => ({
                userId: m.user_id?.toString(),
                role: m.role,
                mode: m.mode,
              }),
            ),
            knowledgeBase: enterprise.knowledge_base
              ? {
                  rawText: enterprise.knowledge_base.raw_text,
                  externalLinks: enterprise.knowledge_base.external_links || [],
                  updatedAt:
                    enterprise.knowledge_base.updated_at?.toISOString() ||
                    new Date().toISOString(),
                }
              : undefined,
            createdAt:
              enterprise.created_at?.toISOString() || new Date().toISOString(),
            updatedAt:
              enterprise.updated_at?.toISOString() || new Date().toISOString(),
          }
        : undefined,
      collaborators:
        Array.isArray(doc.collaborator_ids) &&
        doc.collaborator_ids.length > 0 &&
        typeof doc.collaborator_ids[0] === 'object'
          ? (doc.collaborator_ids as PopulatedOwner[]).map(
              (u) =>
                ({
                  id: u._id.toString(),
                  email: u.email,
                  phone: u.phone,
                  fullName: u.fullName,
                  roleId: u.roleId?.toString(),
                  isEmailVerified: u.is_email_verified,
                  type: u.type as ERoleType,
                  createdAt:
                    u.created_at?.toISOString() || new Date().toISOString(),
                  updatedAt:
                    u.updated_at?.toISOString() || new Date().toISOString(),
                }) as unknown as UserDto,
            )
          : undefined,
    };
  }
}
