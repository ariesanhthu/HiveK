import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ICampaignRepository } from '@/core/interfaces/repositories';
import { CampaignRoot } from '@/core/aggregate-roots';
import { CampaignModel, CampaignDocument } from '../schemas';
import { Nullable } from '@/core/types';

@Injectable()
export class MongoCampaignRepository implements ICampaignRepository {
  constructor(
    @InjectModel(CampaignModel.name)
    private readonly campaignModel: Model<CampaignDocument>,
  ) { }

  async findById(id: string): Promise<Nullable<CampaignRoot>> {
    const doc = await this.campaignModel.findById(id).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async save(campaign: CampaignRoot): Promise<void> {
    const data = this.mapToPersistence(campaign);

    if (!campaign.id) {
      const created = new this.campaignModel(data);
      const saved = await created.save();
      campaign.setId(saved._id.toString());
    } else {
      await this.campaignModel.findByIdAndUpdate(campaign.id, data, { upsert: true }).exec();
    }
  }

  async delete(id: string): Promise<void> {
    await this.campaignModel.findByIdAndDelete(id).exec();
  }

  private mapToDomain(doc: CampaignDocument): CampaignRoot {
    if (!doc._id) {
      throw new Error('Campaign document ID is missing');
    }
    return CampaignRoot.instantiate(doc._id.toString(), {
      ownerId: doc.owner_id.toString(),
      enterpriseId: doc.enterprise_id ? doc.enterprise_id.toString() : null,
      budget: doc.budget,
      financialTarget: doc.financial_target instanceof Map ? Object.fromEntries(doc.financial_target) : doc.financial_target || {},
      description: doc.description,
      platformTarget: (doc.platform_target || []).map((p) => ({
        platformId: p.platformId,
        minFollowers: p.minFollowers,
        maxFollowers: p.maxFollowers,
        note: p.note,
        others: p.others instanceof Map ? Object.fromEntries(p.others) : p.others,
      })),
      status: doc.status,
      collaboratorIds: doc.collaborator_ids || [],
      rawContents: (doc.raw_contents || []).map((r) => ({
        fileId: r.fileId,
        rawContent: r.rawContent,
      })),
      deleteAt: doc.delete_at,
      deleteBy: doc.delete_by,
    });
  }

  private mapToPersistence(campaign: CampaignRoot): Omit<CampaignModel, 'created_at' | 'updated_at'> {
    return {
      owner_id: new Types.ObjectId(campaign.ownerId) as any,
      enterprise_id: campaign.enterpriseId ? new Types.ObjectId(campaign.enterpriseId) as any : null,
      budget: campaign.budget,
      financial_target: campaign.financialTarget,
      description: campaign.description,
      platform_target: campaign.platformTarget.map((p) => ({
        platformId: p.platformId,
        minFollowers: p.minFollowers,
        maxFollowers: p.maxFollowers,
        note: p.note,
        others: p.others,
      })),
      status: campaign.status,
      collaborator_ids: campaign.collaboratorIds,
      raw_contents: campaign.rawContents.map((r) => ({
        fileId: r.fileId,
        rawContent: r.rawContent,
      })),
      delete_at: campaign.deleteAt,
      delete_by: campaign.deleteBy,
    };
  }
}
