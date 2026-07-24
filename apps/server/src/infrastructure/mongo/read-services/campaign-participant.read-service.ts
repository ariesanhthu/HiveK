import { CampaignParticipantDto } from '@/application/dtos';
import { PaginatedResponseDto, SortOrder } from '@/application/dtos/pagination.dto';
import { ICampaignParticipantReadService } from '@/application/interfaces';
import { CampaignParticipantFilterDto } from '@/application/queries/campaign-participant-get-list/campaign-participant-get-list.dto';
import { Nullable } from '@/core/types';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CampaignDocument, CampaignModel } from '../schemas/campaign.schema';

@Injectable()
export class MongoCampaignParticipantReadService implements ICampaignParticipantReadService {
  constructor(
    @InjectModel(CampaignModel.name) private readonly campaignModel: Model<CampaignDocument>,
  ) {}

  async findById(
    id: string,
    projection?: any,
  ): Promise<Nullable<CampaignParticipantDto>> {
    const pipeline: any[] = [
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

    const docs = await this.campaignModel.aggregate(pipeline).exec();
    return docs.length > 0 ? this.mapAggregateToDto(docs[0]) : null;
  }

  async findAll(
    filters: CampaignParticipantFilterDto,
    projection?: any,
  ): Promise<PaginatedResponseDto<CampaignParticipantDto>> {
    const {
      cursor,
      limit = 10,
      sort = SortOrder.DESC,
      campaignId,
      kolProfileId,
      status,
    } = filters;
    const pipeline: any[] = [];

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
          'participants._id': sort === SortOrder.DESC
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

    const docs = await this.campaignModel.aggregate(pipeline).exec();

    const hasNextPage = docs.length > limit;
    const results = hasNextPage ? docs.slice(0, limit) : docs;
    const nextCursor = hasNextPage
      ? results[results.length - 1].participants._id.toString()
      : null;

    return new PaginatedResponseDto(
      results.map((doc: any) => this.mapAggregateToDto(doc)),
      nextCursor,
      hasNextPage,
      limit,
    );
  }

  private mapAggregateToDto(doc: any): CampaignParticipantDto {
    const outputs = (doc.outputs || []).map((o: any) => {
      const platformDoc = (doc.outputPlatforms || []).find(
        (p: any) => p._id.toString() === o.platform_id.toString(),
      );
      const fileDoc = (doc.outputFiles || []).find(
        (f: any) => f._id.toString() === o.file_id?.toString(),
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
        status: o.status,
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
      status: doc.participants.status,
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
        financialTarget: doc.financial_target instanceof Map
          ? Object.fromEntries(doc.financial_target)
          : doc.financial_target || {},
        description: doc.description || '',
        platformTarget: (doc.platform_target || []).map((p: any) => ({
          platformId: p.platformId,
          minFollowers: p.minFollowers,
          maxFollowers: p.maxFollowers,
          note: p.note,
          others: p.others instanceof Map ? Object.fromEntries(p.others) : p.others,
        })),
        status: doc.status,
        collaboratorIds: doc.collaborator_ids || [],
        rawContents: (doc.raw_contents || []).map((r: any) => ({
          fileId: r.fileId,
          rawContent: r.rawContent,
        })),
        participants: (doc.participants || []).map((p: any) => ({
          id: p._id?.toString() || p.id?.toString(),
          kolProfileId: p.kolProfileId?.toString(),
          status: p.status,
          joinedAt: p.joinedAt,
        })),
        schedule: doc.schedule
          ? {
            timeline: (doc.schedule.timeline || []).map((day: any) => ({
              date: day.date,
              label: day.label,
              posts: (day.posts || []).map((post: any) => ({
                scheduledTime: post.scheduledTime,
                platformId: post.platformId,
                status: post.status,
                campaignKOLOutputs: (post.campaignKOLOutputs || []).map(
                  (o: any) => ({
                    id: o._id?.toString() || o.id?.toString(),
                    campaignParticipantId: o.campaignParticipantId?.toString(),
                    platformId: o.platformId?.toString(),
                    uniqueId: o.uniqueId,
                    outputType: o.outputType,
                    title: o.title,
                    isScheduleForPost: o.isScheduleForPost,
                    scheduledAt: o.scheduledAt,
                    fileId: o.fileId?.toString() || null,
                    status: o.status,
                    url: o.url,
                    postedAt: o.postedAt,
                    isTrackingActive: o.isTrackingActive,
                  }),
                ),
                campaignEnterpriseOutputs: (
                  post.campaignEnterpriseOutputs || []
                ).map((o: any) => ({
                  id: o._id?.toString() || o.id?.toString(),
                  platformId: o.platformId?.toString(),
                  uniqueId: o.uniqueId,
                  outputType: o.outputType,
                  title: o.title,
                  isScheduleForPost: o.isScheduleForPost,
                  scheduledAt: o.scheduledAt,
                  fileId: o.fileId?.toString() || null,
                  status: o.status,
                  url: o.url,
                  postedAt: o.postedAt,
                  isTrackingActive: o.isTrackingActive,
                })),
              })),
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
          platforms: (kolProfileDoc.platforms || []).map((p: any) => ({
            platformId: p.platform_id?.toString() || '',
            uniqueId: p.uniqueId ?? p.handle ?? '',
            externalId: p.external_id,
            followerCount: p.follower_count,
            avgEngagement: p.avg_engagement,
            topTags: p.top_tags,
            categories: p.categories,
          })),
        }
        : undefined,
    };
  }
}
