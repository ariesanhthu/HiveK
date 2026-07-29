import { Injectable } from '@nestjs/common';
import { PipelineStage } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CampaignModel, CampaignDocument } from '../schemas/campaign.schema';
import { ICampaignParticipantReadService } from '@/application/interfaces';
import { Nullable } from '@/core/types';
import {
  EParticipantStatus,
  EOutputType,
  EOutputStatus,
  ECampaignStatus,
} from '@/core/enums';
import { CampaignParticipantDto } from '@/application/dtos';
import { CampaignParticipantFilterDto } from '@/application/queries/campaign-participant-get-list/campaign-participant-get-list.dto';
import {
  PaginatedResponseDto,
  SortOrder,
} from '@/application/dtos/pagination.dto';

interface PopulatedKolProfilePlatform {
  platform_id?: Types.ObjectId;
  uniqueId?: string;
  handle?: string;
  external_id?: string;
  follower_count?: number;
  avg_engagement?: number;
  top_tags?: string[];
  categories?: string[];
}

interface AggregateCampaignParticipant {
  _id: Types.ObjectId;
  owner_id: Types.ObjectId;
  enterprise_id: Types.ObjectId;
  budget: number;
  financial_target?: Record<string, unknown> | Map<string, unknown>;
  description?: string;
  status: EOutputStatus | string;
  extras?: Record<string, unknown> | Map<string, unknown>;
  collaborator_ids?: Types.ObjectId[];
  platform_target?: Array<{
    platformId: string;
    minFollowers?: number;
    maxFollowers?: number;
    note?: string;
    extras?: Record<string, unknown> | Map<string, unknown>;
  }>;
  raw_contents?: Array<{ fileId: string; rawContent?: string }>;
  schedule?: {
    timeline?: Array<{
      date: Date | string;
      label?: string;
      posts: Types.ObjectId[];
    }>;
  };
  participants: {
    _id: Types.ObjectId;
    kol_profile_id: Types.ObjectId;
    status: EOutputStatus | string;
    joined_at?: Date | string;
    created_at?: Date | string;
    updated_at?: Date | string;
  };
  outputs?: Array<{
    _id: Types.ObjectId;
    platform_id: Types.ObjectId;
    output_type: EOutputType;
    title: string;
    is_schedule_for_post: boolean;
    file_id?: Types.ObjectId;
    scheduled_at?: Date | string;
    status: EOutputStatus | string;
    url?: string;
    posted_at?: Date | string;
  }>;
  outputPlatforms?: Array<{
    _id: Types.ObjectId;
    name: string;
    base_url?: string;
    api_status?: string;
    icon?: Types.ObjectId;
  }>;
  outputFiles?: Array<{
    _id: Types.ObjectId;
    user_id?: Types.ObjectId;
    filename: string;
    url: string;
    size: number;
    mime_type?: string;
  }>;
  kolProfile?: {
    _id: Types.ObjectId;
    user_id?: Types.ObjectId;
    verification_type?: string;
    name: string;
    location: string;
    gender: string;
    bio: string;
    email: string;
    phone: string;
    is_verified: boolean;
    scores?: Record<string, number>;
    platforms?: PopulatedKolProfilePlatform[];
  };
}

@Injectable()
export class MongoCampaignParticipantReadService implements ICampaignParticipantReadService {
  constructor(
    @InjectModel(CampaignModel.name)
    private readonly campaignModel: Model<CampaignDocument>,
  ) {}

  async findById(
    id: string,
    projection?: Record<string, unknown>,
  ): Promise<Nullable<CampaignParticipantDto>> {
    const pipeline: PipelineStage[] = [
      { $match: { 'participants._id': new Types.ObjectId(id) } },
      { $unwind: '$participants' },
      { $match: { 'participants._id': new Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'kol_profiles',
          localField: 'participants.kol_profile_id',
          foreignField: '_id',
          as: 'kolProfile',
        },
      },
      { $unwind: { path: '$kolProfile', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          outputs: {
            $reduce: {
              input: { $ifNull: ['$schedule.timeline', []] },
              initialValue: [],
              in: {
                $concatArrays: [
                  '$$value',
                  {
                    $reduce: {
                      input: { $ifNull: ['$$this.posts', []] },
                      initialValue: [],
                      in: {
                        $concatArrays: [
                          '$$value',
                          {
                            $filter: {
                              input: {
                                $ifNull: ['$$this.campaign_kol_outputs', []],
                              },
                              as: 'out',
                              cond: {
                                $eq: [
                                  '$$out.campaign_participant_id',
                                  new Types.ObjectId(id),
                                ],
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'platforms',
          localField: 'outputs.platform_id',
          foreignField: '_id',
          as: 'outputPlatforms',
        },
      },
      {
        $lookup: {
          from: 'uploaded_files',
          localField: 'outputs.file_id',
          foreignField: '_id',
          as: 'outputFiles',
        },
      },
    ];

    if (projection) {
      pipeline.push({ $project: projection });
    }

    const results = (await this.campaignModel.aggregate(pipeline).collation({
      locale: 'en',
      strength: 2,
    })) as AggregateCampaignParticipant[];

    return results.length > 0 ? this.mapAggregateToDto(results[0]) : null;
  }

  async findAll(
    filters: CampaignParticipantFilterDto,
    projection?: Record<string, unknown>,
  ): Promise<PaginatedResponseDto<CampaignParticipantDto>> {
    const {
      cursor,
      limit = 10,
      sort = SortOrder.DESC,
      campaignId,
      kolProfileId,
      status,
    } = filters;
    const pipeline: PipelineStage[] = [];

    // Optimize stage: if filtering by campaignId, match first
    if (campaignId) {
      pipeline.push({ $match: { _id: new Types.ObjectId(campaignId) } });
    }

    pipeline.push(
      { $unwind: '$participants' },
      {
        $match: {
          delete_at: null, // Only fetch from active campaigns
          ...(kolProfileId
            ? {
                'participants.kol_profile_id': new Types.ObjectId(kolProfileId),
              }
            : {}),
          ...(status ? { 'participants.status': status } : {}),
        },
      },
    );

    if (cursor) {
      pipeline.push({
        $match: {
          'participants._id':
            sort === SortOrder.DESC
              ? { $lt: new Types.ObjectId(cursor) }
              : { $gt: new Types.ObjectId(cursor) },
        },
      });
    }

    pipeline.push({
      $sort: { 'participants._id': sort === SortOrder.DESC ? -1 : 1 },
    });

    pipeline.push({
      $limit: limit + 1,
    });

    pipeline.push(
      {
        $lookup: {
          from: 'kol_profiles',
          localField: 'participants.kol_profile_id',
          foreignField: '_id',
          as: 'kolProfile',
        },
      },
      { $unwind: { path: '$kolProfile', preserveNullAndEmptyArrays: true } },
    );

    pipeline.push({
      $addFields: {
        outputs: {
          $reduce: {
            input: { $ifNull: ['$schedule.timeline', []] },
            initialValue: [],
            in: {
              $concatArrays: [
                '$$value',
                {
                  $reduce: {
                    input: { $ifNull: ['$$this.posts', []] },
                    initialValue: [],
                    in: {
                      $concatArrays: [
                        '$$value',
                        {
                          $filter: {
                            input: {
                              $ifNull: ['$$this.campaign_kol_outputs', []],
                            },
                            as: 'out',
                            cond: {
                              $eq: [
                                '$$out.campaign_participant_id',
                                '$participants._id',
                              ],
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            },
          },
        },
      },
    });

    pipeline.push(
      {
        $lookup: {
          from: 'platforms',
          localField: 'outputs.platform_id',
          foreignField: '_id',
          as: 'outputPlatforms',
        },
      },
      {
        $lookup: {
          from: 'uploaded_files',
          localField: 'outputs.file_id',
          foreignField: '_id',
          as: 'outputFiles',
        },
      },
    );

    const results = (await this.campaignModel.aggregate(pipeline).collation({
      locale: 'en',
      strength: 2,
    })) as AggregateCampaignParticipant[];

    const hasNextPage = results.length > limit;
    const finalResults = hasNextPage ? results.slice(0, limit) : results;
    const nextCursor = hasNextPage
      ? finalResults[finalResults.length - 1].participants._id.toString()
      : null;

    return new PaginatedResponseDto(
      finalResults.map((doc: AggregateCampaignParticipant) =>
        this.mapAggregateToDto(doc),
      ),
      nextCursor,
      hasNextPage,
      limit,
    );
  }

  private mapAggregateToDto(
    doc: AggregateCampaignParticipant,
  ): CampaignParticipantDto {
    const outputs = (doc.outputs || []).map((o) => {
      const platformDoc = (doc.outputPlatforms || []).find(
        (p) => p._id.toString() === o.platform_id.toString(),
      );
      const fileDoc = (doc.outputFiles || []).find(
        (f) => f._id.toString() === o.file_id?.toString(),
      );

      return {
        id: o._id.toString(),
        platformId: o.platform_id.toString(),
        outputType: o.output_type,
        title: o.title,
        isScheduleForPost: o.is_schedule_for_post,
        fileId: o.file_id ? o.file_id.toString() : null,
        scheduledAt: o.scheduled_at
          ? o.scheduled_at instanceof Date
            ? o.scheduled_at.toISOString()
            : o.scheduled_at
          : null,
        status: o.status as EOutputStatus,
        url: o.url || null,
        postedAt: o.posted_at
          ? o.posted_at instanceof Date
            ? o.posted_at.toISOString()
            : o.posted_at
          : null,
        platform: platformDoc
          ? {
              id: platformDoc._id.toString(),
              name: platformDoc.name,
              baseUrl: platformDoc.base_url || '',
              apiStatus: platformDoc.api_status || '',
              icon: platformDoc.icon ? platformDoc.icon.toString() : null,
            }
          : undefined,
        file: fileDoc
          ? {
              id: fileDoc._id.toString(),
              userId: fileDoc.user_id ? fileDoc.user_id.toString() : '',
              filename: fileDoc.filename,
              url: fileDoc.url,
              size: fileDoc.size,
              mimeType: fileDoc.mime_type || '',
            }
          : undefined,
      };
    });

    const kolProfileDoc = doc.kolProfile;

    return {
      id: doc.participants._id.toString(),
      campaignId: doc._id.toString(),
      kolProfileId: doc.participants.kol_profile_id.toString(),
      status: doc.participants.status as EParticipantStatus,
      joinedAt: doc.participants.joined_at
        ? doc.participants.joined_at instanceof Date
          ? doc.participants.joined_at.toISOString()
          : doc.participants.joined_at
        : null,
      createdAt: doc.participants.created_at
        ? doc.participants.created_at instanceof Date
          ? doc.participants.created_at.toISOString()
          : doc.participants.created_at
        : new Date().toISOString(),
      updatedAt: doc.participants.updated_at
        ? doc.participants.updated_at instanceof Date
          ? doc.participants.updated_at.toISOString()
          : doc.participants.updated_at
        : new Date().toISOString(),
      outputs,
      campaign: {
        id: doc._id.toString(),
        ownerId: doc.owner_id.toString(),
        enterpriseId: doc.enterprise_id.toString(),
        budget: doc.budget,
        financialTarget:
          doc.financial_target instanceof Map
            ? Object.fromEntries(doc.financial_target)
            : doc.financial_target || {},
        description: doc.description || '',
        platformTarget: (doc.platform_target || []).map((p) => ({
          platformId: p.platformId,
          minFollowers: p.minFollowers,
          maxFollowers: p.maxFollowers,
          note: p.note,
          extras:
            p.extras instanceof Map ? Object.fromEntries(p.extras) : p.extras,
        })),
        status: doc.status as ECampaignStatus,
        extras:
          doc.extras instanceof Map
            ? Object.fromEntries(doc.extras)
            : doc.extras,
        collaboratorIds: Array.isArray(doc.collaborator_ids)
          ? doc.collaborator_ids.map((id) => id.toString())
          : [],
        rawContents: (doc.raw_contents || []).map((r) => ({
          fileId: r.fileId,
          rawContent: r.rawContent,
        })),
        participants: [],
        schedule: doc.schedule
          ? {
              timeline: (doc.schedule.timeline || []).map((day) => ({
                date:
                  day.date instanceof Date ? day.date.toISOString() : day.date,
                label: day.label,
                posts: (day.posts || []).map(
                  (postId) => postId.toString?.() || postId.toString(),
                ), // ScheduledPost IDs
              })),
            }
          : undefined,
      },
      kolProfile: kolProfileDoc
        ? {
            id: kolProfileDoc._id.toString(),
            userId: kolProfileDoc.user_id
              ? kolProfileDoc.user_id.toString()
              : null,
            verificationType: kolProfileDoc.verification_type ?? null,
            name: kolProfileDoc.name,
            location: kolProfileDoc.location,
            gender: kolProfileDoc.gender,
            bio: kolProfileDoc.bio,
            email: kolProfileDoc.email,
            phone: kolProfileDoc.phone,
            isVerified: kolProfileDoc.is_verified,
            scores: kolProfileDoc.scores || {},
            platforms: (kolProfileDoc.platforms || []).map((p) => ({
              platformId: p.platform_id?.toString() || '',
              uniqueId: p.uniqueId ?? p.handle ?? '',
              externalId: p.external_id || '',
              followerCount: p.follower_count || 0,
              avgEngagement: p.avg_engagement || 0,
              topTags: p.top_tags || [],
              categories: p.categories || [],
            })),
          }
        : undefined,
    };
  }
}
