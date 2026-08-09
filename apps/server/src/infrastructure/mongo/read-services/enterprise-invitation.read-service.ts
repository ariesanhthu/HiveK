import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FlattenMaps, Model, QueryFilter } from 'mongoose';
import {
  EnterpriseInvitationDocument,
  EnterpriseInvitationModel,
} from '../schemas';
import { IEnterpriseInvitationReadService } from '@/application/interfaces';
import { EnterpriseInvitationFilterDto } from '@/application/queries/enterprise-get-my-invitations/enterprise-get-my-invitations.dto';
import { Nullable } from '@/core/types';
import { EnterpriseInvitationDto } from '@/application/dtos';
import {
  PaginatedResponseDto,
  SortOrder,
} from '@/application/dtos/pagination.dto';
import { EEnterpriseInvitationStatus } from '@/core/enums';

@Injectable()
export class MongoEnterpriseInvitationReadService implements IEnterpriseInvitationReadService {
  constructor(
    @InjectModel(EnterpriseInvitationModel.name)
    private readonly model: Model<EnterpriseInvitationDocument>,
  ) {}

  async findAll(
    filters: EnterpriseInvitationFilterDto & { email?: string } = {},
  ): Promise<PaginatedResponseDto<EnterpriseInvitationDto>> {
    const {
      cursor,
      limit = 10,
      sort = SortOrder.DESC,
      isExpired,
      email,
    } = filters;
    const query: QueryFilter<EnterpriseInvitationDocument> = {};

    if (email) {
      query.email = email.toLowerCase();
    }

    if (isExpired !== undefined) {
      const now = new Date();
      if (isExpired) {
        // Expired/inactive invitations: either explicitly marked EXPIRED/REVOKED or past expiration date
        query.$or = [
          {
            status: {
              $in: [
                EEnterpriseInvitationStatus.EXPIRED,
                EEnterpriseInvitationStatus.REVOKED,
                EEnterpriseInvitationStatus.ACCEPTED,
              ],
            },
          },
          { expires_at: { $lt: now } },
        ];
      } else {
        // Active/pending invitations: must be pending and not expired
        query.status = EEnterpriseInvitationStatus.PENDING;
        query.expires_at = { $gte: now };
      }
    }

    if (cursor) {
      query._id = sort === SortOrder.DESC ? { $lt: cursor } : { $gt: cursor };
    }

    const docs = await this.model
      .find(query)
      .sort({ _id: sort === SortOrder.DESC ? -1 : 1 })
      .limit(limit + 1)
      .lean()
      .exec();

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

  async findById(id: string): Promise<Nullable<EnterpriseInvitationDto>> {
    const doc = await this.model.findById(id).lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  private mapToDto(
    doc: FlattenMaps<EnterpriseInvitationDocument>,
  ): EnterpriseInvitationDto {
    return {
      id: doc._id.toString(),
      enterpriseId: doc.enterprise_id.toString(),
      email: doc.email,
      mode: doc.mode,
      inviterId: doc.inviter_id.toString(),
      status: doc.status,
      expiresAt: doc.expires_at.toISOString(),
      createdAt: doc.created_at.toISOString(),
      updatedAt: doc.updated_at.toISOString(),
    };
  }
}
