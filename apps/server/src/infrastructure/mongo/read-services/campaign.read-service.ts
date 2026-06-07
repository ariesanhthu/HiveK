import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { CampaignDocument, CampaignModel } from '../schemas';
import { ICampaignReadService } from '@/application/interfaces';
import { Nullable } from '@/core/types';
import { CampaignDetailDto } from '@/application/dtos';
import { CampaignFilterDto } from '@/application/queries';
import { PaginatedResponseDto, SortOrder } from '@/shared/dtos/pagination.dto';
import { Schema } from 'mongoose';
import { parseMongoProjection, MongoSanitizeUtil } from '../utils';

@Injectable()
export class MongoCampaignReadService implements ICampaignReadService {
  constructor(
    @InjectModel(CampaignModel.name)
    private readonly campaignModel: Model<CampaignDocument>,
  ) { }

  async findAll(filters: CampaignFilterDto = {} as any, projection?: any): Promise<PaginatedResponseDto<CampaignDetailDto>> {
    const { cursor, limit = 10, sort = SortOrder.DESC, name, ownerId, enterpriseId } = filters;
    const query: QueryFilter<CampaignDocument> = {};

    if (name) {
      query.description = { $regex: MongoSanitizeUtil.escapeRegex(name), $options: 'i' };
    }

    if (ownerId) {
      query.owner_id = new Schema.Types.ObjectId(ownerId);
    }

    if (enterpriseId) {
      query.enterprise_id = new Schema.Types.ObjectId(enterpriseId);
    }

    if (cursor) {
      query._id = sort === SortOrder.DESC ? { $lt: cursor } : { $gt: cursor };
    }

    let queryBuilder: any = this.campaignModel
      .find(query)
      .sort({ _id: sort === SortOrder.DESC ? -1 : 1 })
      .limit(limit + 1);

    if (projection) {
      const { select, populate } = parseMongoProjection(projection, {
        allowedFields: [
          'id', 'ownerId', 'enterpriseId', 'budget', 'financialTarget',
          'description', 'platformTarget', 'status', 'collaboratorIds', 'rawContents'
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
              'userId', 'companyName', 'description', 'contactEmail',
              'contactPhone', 'website', 'taxId', 'logoUrlId', 'isVerified'
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
        populate.forEach((opt) => {
          queryBuilder = queryBuilder.populate(opt);
        });
      }
    } else {
      queryBuilder = queryBuilder.populate('owner_id').populate('enterprise_id');
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

  async findById(id: string, projection?: any): Promise<Nullable<CampaignDetailDto>> {
    let queryBuilder: any = this.campaignModel.findById(id);

    if (projection) {
      const { select, populate } = parseMongoProjection(projection, {
        allowedFields: [
          'id', 'ownerId', 'enterpriseId', 'budget', 'financialTarget',
          'description', 'platformTarget', 'status', 'collaboratorIds', 'rawContents'
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
              'userId', 'companyName', 'description', 'contactEmail',
              'contactPhone', 'website', 'taxId', 'logoUrlId', 'isVerified'
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
        populate.forEach((opt) => {
          queryBuilder = queryBuilder.populate(opt);
        });
      }
    } else {
      queryBuilder = queryBuilder.populate('owner_id').populate('enterprise_id');
    }

    const doc = await queryBuilder.lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  private mapToDto(doc: any): CampaignDetailDto {
    return {
      id: doc._id.toString(),
      ownerId: doc.owner_id && typeof doc.owner_id === 'object' && doc.owner_id._id ? doc.owner_id._id.toString() : doc.owner_id?.toString() || '',
      enterpriseId: doc.enterprise_id && typeof doc.enterprise_id === 'object' && doc.enterprise_id._id ? doc.enterprise_id._id.toString() : doc.enterprise_id?.toString() || null,
      budget: doc.budget,
      financialTarget: doc.financial_target instanceof Map ? Object.fromEntries(doc.financial_target) : doc.financial_target || {},
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
      owner: doc.owner_id && typeof doc.owner_id === 'object' && doc.owner_id._id ? {
        id: doc.owner_id._id.toString(),
        email: doc.owner_id.email,
        phone: doc.owner_id.phone,
        fullName: doc.owner_id.full_name,
        roleId: doc.owner_id.role_id ? doc.owner_id.role_id.toString() : '',
        isEmailVerified: doc.owner_id.is_email_verified,
        type: doc.owner_id.type,
        createdAt: doc.owner_id.created_at,
        updatedAt: doc.owner_id.updated_at,
      } as any : undefined,
      enterprise: doc.enterprise_id && typeof doc.enterprise_id === 'object' && doc.enterprise_id._id ? {
        id: doc.enterprise_id._id.toString(),
        userId: doc.enterprise_id.user_id ? doc.enterprise_id.user_id.toString() : '',
        companyName: doc.enterprise_id.company_name,
        description: doc.enterprise_id.description,
        contactEmail: doc.enterprise_id.contact_email,
        contactPhone: doc.enterprise_id.contact_phone,
        website: doc.enterprise_id.website,
        taxId: doc.enterprise_id.tax_id,
        logoUrlId: doc.enterprise_id.logo_url_id,
        isVerified: doc.enterprise_id.is_verified,
        createdAt: doc.enterprise_id.created_at,
        updatedAt: doc.enterprise_id.updated_at,
      } : undefined,
      collaborators: Array.isArray(doc.collaborator_ids) && doc.collaborator_ids.length > 0 && typeof doc.collaborator_ids[0] === 'object' ? doc.collaborator_ids.map((u: any) => ({
        id: u._id.toString(),
        email: u.email,
        phone: u.phone,
        fullName: u.full_name,
        roleId: u.role_id ? u.role_id.toString() : '',
        isEmailVerified: u.is_email_verified,
        type: u.type,
        createdAt: u.created_at,
        updatedAt: u.updated_at,
      })) : undefined,
    };
  }
}
