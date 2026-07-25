import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { ICampaignRepository } from '@/core/interfaces/repositories';
import {
  CampaignRoot,
} from '@/core/aggregate-roots';
import {
  CampaignParticipantEntity,
  CampaignKOLOutputEntity,
  CampaignEnterpriseOutputEntity,
} from '@/core/entities';
import { CampaignModel, CampaignDocument } from '../schemas';
import { Nullable } from '@/core/types';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';
import { ECampaignStatus } from '@/core/enums';

@Injectable()
export class MongoCampaignRepository implements ICampaignRepository {
  constructor(
    @InjectModel(CampaignModel.name)
    private readonly campaignModel: Model<CampaignDocument>,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) { }

  private get session(): ClientSession | undefined {
    return (this.uow as MongoUnitOfWork).getSession() || undefined;
  }

  async findById(id: string): Promise<Nullable<CampaignRoot>> {
    const doc = await this.campaignModel.findById(id).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByEnterpriseId(enterpriseId: string): Promise<CampaignRoot[]> {
    const docs = await this.campaignModel.find({ enterprise_id: new Types.ObjectId(enterpriseId) }).session(this.session).exec();
    return docs.map(doc => this.mapToDomain(doc));
  }

  async findByParticipantId(participantId: string): Promise<Nullable<CampaignRoot>> {
    const doc = await this.campaignModel
      .findOne({ 'participants._id': new Types.ObjectId(participantId) })
      .session(this.session)
      .exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByOutputId(outputId: string): Promise<Nullable<CampaignRoot>> {
    // Search both KOL and Enterprise outputs
    const doc = await this.campaignModel
      .findOne({
        $or: [
          { 'schedule.timeline.posts.campaign_kol_outputs._id': new Types.ObjectId(outputId) },
          { 'schedule.timeline.posts.campaign_enterprise_outputs._id': new Types.ObjectId(outputId) }
        ]
      })
      .session(this.session)
      .exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByCampaignAndKol(
    campaignId: string,
    kolProfileId: string,
  ): Promise<Nullable<CampaignRoot>> {
    const doc = await this.campaignModel
      .findOne({
        _id: new Types.ObjectId(campaignId),
        'participants.kol_profile_id': new Types.ObjectId(kolProfileId),
      })
      .session(this.session)
      .exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async hasActiveCampaigns(enterpriseId: string): Promise<boolean> {
    const doc = await this.campaignModel.findOne(
      {
        enterprise_id: new Types.ObjectId(enterpriseId),
        status: { $nin: [ECampaignStatus.COMPLETED, ECampaignStatus.CANCELLED] },
        delete_at: null,
      },
      { _id: 1 }
    ).session(this.session).lean().exec();
    return !!doc;
  }

  async save(campaign: CampaignRoot): Promise<void> {
    const data = this.mapToPersistence(campaign);

    if (!campaign.id) {
      const created = new this.campaignModel(data);
      const saved = await created.save({ session: this.session });
      campaign.setId(saved._id.toString());
    } else {
      await this.campaignModel.findByIdAndUpdate(campaign.id, data, { upsert: true }).session(this.session).exec();
    }
  }

  async saveMany(campaigns: CampaignRoot[]): Promise<void> {
    await Promise.all(campaigns.map(c => this.save(c)));
  }

  async delete(id: string): Promise<void> {
    await this.campaignModel.findByIdAndDelete(id).session(this.session).exec();
  }

  private mapToDomain(doc: CampaignDocument): CampaignRoot {
    if (!doc._id) {
      throw new Error('Campaign document ID is missing');
    }
    if (!doc.enterprise_id) {
        throw new Error('Campaign enterprise ID is missing');
    }

    return CampaignRoot.instantiate(doc._id.toString(), {
      ownerId: doc.owner_id.toString(),
      enterpriseId: doc.enterprise_id.toString(),
      budget: doc.budget,
      financialTarget: doc.financial_target instanceof Map ? Object.fromEntries(doc.financial_target) : doc.financial_target || {},
      description: doc.description,
      platformTarget: (doc.platform_target || []).map((p) => ({
        platformId: p.platformId,
        minFollowers: p.minFollowers,
        maxFollowers: p.maxFollowers,
        note: p.note,
        extras: p.extras instanceof Map ? Object.fromEntries(p.extras) : p.extras,
      })),
      status: doc.status,
      extras: doc.extras instanceof Map ? Object.fromEntries(doc.extras) : doc.extras,
      collaboratorIds: doc.collaborator_ids || [],
      rawContents: (doc.raw_contents || []).map((r) => ({
        fileId: r.fileId,
        rawContent: r.rawContent,
      })),
      deleteAt: doc.delete_at,
      deleteBy: doc.delete_by,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
      participants: (doc.participants || []).map((p: CampaignDocument['participants'][0]) =>
        CampaignParticipantEntity.instantiate(p._id.toString(), {
          kolProfileId: p.kol_profile_id.toString(),
          status: p.status,
          joinedAt: p.joined_at,
          deleteAt: p.delete_at,
          deleteBy: p.delete_by,
          createdAt: p.created_at || new Date(),
          updatedAt: p.updated_at || new Date(),
        })
      ),
      schedule: doc.schedule ? {
        timeline: (doc.schedule.timeline || []).map((day: CampaignDocument['schedule']['timeline'][0]) => ({
          date: day.date,
          label: day.label,
          posts: (day.posts || []).map((postId) => postId.toString()),  // ScheduledPost IDs
        })),
        createdAt: doc.schedule.created_at || new Date(),
        updatedAt: doc.schedule.updated_at || new Date(),
      } : undefined,
    });
  }

  private mapToPersistence(campaign: CampaignRoot): Omit<CampaignModel, 'created_at' | 'updated_at'> {
    return {
      owner_id: new Types.ObjectId(campaign.ownerId),
      enterprise_id: new Types.ObjectId(campaign.enterpriseId),
      budget: campaign.budget,
      financial_target: campaign.financialTarget,
      description: campaign.description,
      platform_target: campaign.platformTarget?.map((p) => ({
        platformId: p.platformId,
        minFollowers: p.minFollowers,
        maxFollowers: p.maxFollowers,
        note: p.note,
        extras: p.extras,
      })),
      status: campaign.status,
      extras: campaign.extras,
      collaborator_ids: campaign.collaboratorIds,
      raw_contents: campaign.rawContents?.map((r) => ({
        fileId: r.fileId,
        rawContent: r.rawContent,
      })),
      delete_at: campaign.deleteAt,
      delete_by: campaign.deleteBy,
      participants: (campaign.participants || []).map((p) => ({
        _id: new Types.ObjectId(p.id),
        kol_profile_id: new Types.ObjectId(p.kolProfileId),
        status: p.status,
        joined_at: p.joinedAt,
        delete_at: p.deleteAt,
        delete_by: p.deleteBy,
        created_at: p.createdAt,
        updated_at: p.updatedAt,
      })),
      schedule: campaign.schedule ? {
        timeline: (campaign.schedule.timeline || []).map((day) => ({
          date: day.date,
          label: day.label,
          posts: (day.posts || []).map((postId) => new Types.ObjectId(postId)),  // ScheduledPost IDs
        })),
        created_at: new Date(),
        updated_at: new Date(),
      } : undefined,
    };
  }
}
