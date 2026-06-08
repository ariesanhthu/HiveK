import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, QueryFilter } from 'mongoose';
import { CampaignParticipantDocument, CampaignParticipantModel } from '../schemas/campaign-participant.schema';
import { ICampaignParticipantReadService } from '@/application/interfaces';
import { Nullable } from '@/core/types';
import { CampaignParticipantDto } from '@/application/dtos';
import { CampaignParticipantFilterDto } from '@/application/queries/campaign-participant-get-list/campaign-participant-get-list.dto';
import { PaginatedResponseDto, SortOrder } from '@/application/dtos/pagination.dto';
import { parseMongoProjection } from '../utils';

@Injectable()
export class MongoCampaignParticipantReadService implements ICampaignParticipantReadService {
  constructor(
    @InjectModel(CampaignParticipantModel.name)
    private readonly participantModel: Model<CampaignParticipantDocument>,
  ) {}

  async findById(id: string, projection?: any): Promise<Nullable<CampaignParticipantDto>> {
    let queryBuilder: any = this.participantModel.findById(id);

    if (projection) {
      const { select, populate } = parseMongoProjection(projection, {
        allowedFields: [
          'id', 'campaignId', 'kolProfileId', 'status', 'joinedAt', 'createdAt', 'updatedAt', 'outputs'
        ],
        fieldMap: {
          campaignId: 'campaign_id',
          kolProfileId: 'kol_profile_id',
          joinedAt: 'joined_at',
        },
        populate: {
          campaign: {
            path: 'campaign_id',
            select: ['id', 'ownerId', 'enterpriseId', 'budget', 'financialTarget', 'description', 'platformTarget', 'status', 'collaboratorIds', 'rawContents'],
            fieldMap: {
              ownerId: 'owner_id',
              enterpriseId: 'enterprise_id',
              collaboratorIds: 'collaborator_ids',
              rawContents: 'raw_contents',
              platformTarget: 'platform_target',
              financialTarget: 'financial_target',
            },
          },
          kolProfile: {
            path: 'kol_profile_id',
            select: ['id', 'userId', 'verificationType', 'name', 'location', 'gender', 'bio', 'email', 'phone', 'platforms', 'isVerified', 'scores'],
            fieldMap: {
              userId: 'user_id',
              verificationType: 'verification_type',
              isVerified: 'is_verified',
            },
          },
          'outputs.platform': {
            path: 'outputs.platform_id',
            select: ['name', 'baseUrl', 'apiStatus', 'icon'],
          },
          'outputs.file': {
            path: 'outputs.file_id',
            select: ['id', 'userId', 'filename', 'url', 'size', 'mimeType'],
            fieldMap: {
              userId: 'user_id',
              mimeType: 'mime_type',
            },
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
      queryBuilder = queryBuilder.populate('campaign_id').populate('kol_profile_id');
    }

    const doc = await queryBuilder.lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findAll(filters: CampaignParticipantFilterDto, projection?: any): Promise<PaginatedResponseDto<CampaignParticipantDto>> {
    const { cursor, limit = 10, sort = SortOrder.DESC, campaignId, kolProfileId, status } = filters;
    const query: QueryFilter<CampaignParticipantDocument> = {};

    // Do not fetch soft-deleted items
    query.delete_at = null;

    if (campaignId) {
      query.campaign_id = new Types.ObjectId(campaignId);
    }

    if (kolProfileId) {
      query.kol_profile_id = new Types.ObjectId(kolProfileId);
    }

    if (status) {
      query.status = status;
    }

    if (cursor) {
      query._id = sort === SortOrder.DESC ? { $lt: new Types.ObjectId(cursor) } : { $gt: new Types.ObjectId(cursor) };
    }

    let queryBuilder: any = this.participantModel
      .find(query)
      .sort({ _id: sort === SortOrder.DESC ? -1 : 1 })
      .limit(limit + 1);

    if (projection) {
      const { select, populate } = parseMongoProjection(projection, {
        allowedFields: [
          'id', 'campaignId', 'kolProfileId', 'status', 'joinedAt', 'createdAt', 'updatedAt', 'outputs'
        ],
        fieldMap: {
          campaignId: 'campaign_id',
          kolProfileId: 'kol_profile_id',
          joinedAt: 'joined_at',
        },
        populate: {
          campaign: {
            path: 'campaign_id',
            select: ['id', 'ownerId', 'enterpriseId', 'budget', 'financialTarget', 'description', 'platformTarget', 'status', 'collaboratorIds', 'rawContents'],
            fieldMap: {
              ownerId: 'owner_id',
              enterpriseId: 'enterprise_id',
              collaboratorIds: 'collaborator_ids',
              rawContents: 'raw_contents',
              platformTarget: 'platform_target',
              financialTarget: 'financial_target',
            },
          },
          kolProfile: {
            path: 'kol_profile_id',
            select: ['id', 'userId', 'verificationType', 'name', 'location', 'gender', 'bio', 'email', 'phone', 'platforms', 'isVerified', 'scores'],
            fieldMap: {
              userId: 'user_id',
              verificationType: 'verification_type',
              isVerified: 'is_verified',
            },
          },
          'outputs.platform': {
            path: 'outputs.platform_id',
            select: ['name', 'baseUrl', 'apiStatus', 'icon'],
          },
          'outputs.file': {
            path: 'outputs.file_id',
            select: ['id', 'userId', 'filename', 'url', 'size', 'mimeType'],
            fieldMap: {
              userId: 'user_id',
              mimeType: 'mime_type',
            },
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
      queryBuilder = queryBuilder.populate('campaign_id').populate('kol_profile_id');
    }

    const docs = await queryBuilder.lean().exec();

    const hasNextPage = docs.length > limit;
    const results = hasNextPage ? docs.slice(0, limit) : docs;
    const nextCursor = hasNextPage ? results[results.length - 1]._id.toString() : null;

    return new PaginatedResponseDto(
      results.map((doc: any) => this.mapToDto(doc)),
      nextCursor,
    );
  }

  private mapToDto(doc: any): CampaignParticipantDto {
    const campaignDoc = doc.campaign_id;
    const kolProfileDoc = doc.kol_profile_id;

    return {
      id: doc._id.toString(),
      campaignId: campaignDoc && typeof campaignDoc === 'object' && campaignDoc._id ? campaignDoc._id.toString() : (doc.campaign_id ? doc.campaign_id.toString() : null),
      kolProfileId: kolProfileDoc && typeof kolProfileDoc === 'object' && kolProfileDoc._id ? kolProfileDoc._id.toString() : (doc.kol_profile_id ? doc.kol_profile_id.toString() : null),
      status: doc.status,
      joinedAt: doc.joined_at ? (doc.joined_at instanceof Date ? doc.joined_at.toISOString() : doc.joined_at) : null,
      createdAt: doc.created_at ? (doc.created_at instanceof Date ? doc.created_at.toISOString() : doc.created_at) : new Date().toISOString(),
      updatedAt: doc.updated_at ? (doc.updated_at instanceof Date ? doc.updated_at.toISOString() : doc.updated_at) : new Date().toISOString(),
      outputs: (doc.outputs || []).map((o: any) => {
        const platformDoc = o.platform_id;
        const fileDoc = o.file_id;

        return {
          id: o._id.toString(),
          platformId: platformDoc && typeof platformDoc === 'object' && platformDoc._id ? platformDoc._id.toString() : o.platform_id.toString(),
          outputType: o.output_type,
          title: o.title,
          isScheduleForPost: o.is_schedule_for_post,
          fileId: fileDoc && typeof fileDoc === 'object' && fileDoc._id ? fileDoc._id.toString() : (o.file_id ? o.file_id.toString() : null),
          scheduledAt: o.scheduled_at ? (o.scheduled_at instanceof Date ? o.scheduled_at.toISOString() : o.scheduled_at) : null,
          status: o.status,
          url: o.url || null,
          postedAt: o.posted_at ? (o.posted_at instanceof Date ? o.posted_at.toISOString() : o.posted_at) : null,
          platform: platformDoc && typeof platformDoc === 'object' && platformDoc._id ? {
            id: platformDoc._id.toString(),
            name: platformDoc.name,
            baseUrl: platformDoc.base_url || platformDoc.baseUrl || '',
            apiStatus: platformDoc.api_status || platformDoc.apiStatus || '',
            icon: platformDoc.icon ? platformDoc.icon.toString() : null,
          } : undefined,
          file: fileDoc && typeof fileDoc === 'object' && fileDoc._id ? {
            id: fileDoc._id.toString(),
            userId: fileDoc.user_id ? fileDoc.user_id.toString() : '',
            filename: fileDoc.filename,
            url: fileDoc.url,
            size: fileDoc.size,
            mimeType: fileDoc.mime_type || fileDoc.mimeType || '',
          } : undefined,
        };
      }),
      campaign: campaignDoc && typeof campaignDoc === 'object' && campaignDoc._id ? {
        id: campaignDoc._id.toString(),
        ownerId: campaignDoc.owner_id && typeof campaignDoc.owner_id === 'object' && campaignDoc.owner_id._id ? campaignDoc.owner_id._id.toString() : campaignDoc.owner_id?.toString() || '',
        enterpriseId: campaignDoc.enterprise_id && typeof campaignDoc.enterprise_id === 'object' && campaignDoc.enterprise_id._id ? campaignDoc.enterprise_id._id.toString() : campaignDoc.enterprise_id?.toString() || null,
        budget: campaignDoc.budget,
        financialTarget: campaignDoc.financial_target instanceof Map ? Object.fromEntries(campaignDoc.financial_target) : campaignDoc.financial_target || {},
        description: campaignDoc.description || '',
        platformTarget: (campaignDoc.platform_target || []).map((p: any) => ({
          platformId: p.platformId,
          minFollowers: p.minFollowers,
          maxFollowers: p.maxFollowers,
          note: p.note,
          others: p.others instanceof Map ? Object.fromEntries(p.others) : p.others,
        })),
        status: campaignDoc.status,
        collaboratorIds: campaignDoc.collaborator_ids || [],
        rawContents: (campaignDoc.raw_contents || []).map((r: any) => ({
          fileId: r.fileId,
          rawContent: r.rawContent,
        })),
      } : undefined,
      kolProfile: kolProfileDoc && typeof kolProfileDoc === 'object' && kolProfileDoc._id ? {
        id: kolProfileDoc._id.toString(),
        userId: kolProfileDoc.user_id && typeof kolProfileDoc.user_id === 'object' && kolProfileDoc.user_id._id ? kolProfileDoc.user_id._id.toString() : kolProfileDoc.user_id?.toString() || null,
        verificationType: kolProfileDoc.verification_type ?? null,
        name: kolProfileDoc.name,
        location: kolProfileDoc.location,
        gender: kolProfileDoc.gender,
        bio: kolProfileDoc.bio,
        email: kolProfileDoc.email,
        phone: kolProfileDoc.phone,
        isVerified: kolProfileDoc.is_verified,
        scores: kolProfileDoc.scores || {},
        platforms: (kolProfileDoc.platforms || []).map((p: any) => ({
          platformId: p.platform_id && typeof p.platform_id === 'object' && p.platform_id._id ? p.platform_id._id.toString() : p.platform_id?.toString() || '',
          uniqueId: p.uniqueId ?? p.handle ?? '',
          externalId: p.external_id,
          followerCount: p.follower_count,
          avgEngagement: p.avg_engagement,
          topTags: p.top_tags,
          categories: p.categories,
        })),
      } : undefined,
    };
  }
}
