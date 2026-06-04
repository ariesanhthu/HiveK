import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CampaignParticipantDocument, CampaignParticipantModel } from '../schemas/campaign-participant.schema';
import { ICampaignParticipantReadService } from '@/application/interfaces';
import { Nullable } from '@/core/types';
import { CampaignParticipantDto } from '@/application/dtos';
import { CampaignParticipantFilterDto } from '@/application/queries/campaign-participant-get-list/campaign-participant-get-list.dto';
import { PaginatedResponseDto, SortOrder } from '@/shared/dtos/pagination.dto';

@Injectable()
export class MongoCampaignParticipantReadService implements ICampaignParticipantReadService {
  constructor(
    @InjectModel(CampaignParticipantModel.name)
    private readonly participantModel: Model<CampaignParticipantDocument>,
  ) {}

  async findById(id: string): Promise<Nullable<CampaignParticipantDto>> {
    const doc = await this.participantModel.findById(id).lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findAll(filters: CampaignParticipantFilterDto = {} as any): Promise<PaginatedResponseDto<CampaignParticipantDto>> {
    const { cursor, limit = 10, sort = SortOrder.DESC, campaignId, kolProfileId, status } = filters;
    const query: any = {};

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
      query._id = sort === SortOrder.DESC ? { $lt: cursor } : { $gt: cursor };
    }

    const docs = await this.participantModel
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

  private mapToDto(doc: any): CampaignParticipantDto {
    return {
      id: doc._id.toString(),
      campaignId: doc.campaign_id.toString(),
      kolProfileId: doc.kol_profile_id.toString(),
      status: doc.status,
      joinedAt: doc.joined_at ? doc.joined_at.toISOString() : null,
      createdAt: doc.created_at ? doc.created_at.toISOString() : new Date().toISOString(),
      updatedAt: doc.updated_at ? doc.updated_at.toISOString() : new Date().toISOString(),
      outputs: (doc.outputs || []).map((o: any) => ({
        id: o._id.toString(),
        platformId: o.platform_id.toString(),
        outputType: o.output_type,
        title: o.title,
        isScheduleForPost: o.is_schedule_for_post,
        fileId: o.file_id ? o.file_id.toString() : null,
        scheduledAt: o.scheduled_at ? o.scheduled_at.toISOString() : null,
        status: o.status,
        url: o.url || null,
        postedAt: o.posted_at ? o.posted_at.toISOString() : null,
      })),
    };
  }
}
