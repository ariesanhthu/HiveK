import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { ICampaignParticipantRepository } from '@/core/interfaces/repositories/campaign-participant.repository';
import { CampaignParticipantRoot } from '@/core/aggregate-roots/campaign-participant.aggregate';
import { CampaignParticipantModel, CampaignParticipantDocument, CampaignOutputModel } from '../schemas/campaign-participant.schema';
import { Nullable } from '@/core/types';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';

@Injectable()
export class MongoCampaignParticipantRepository implements ICampaignParticipantRepository {
  constructor(
    @InjectModel(CampaignParticipantModel.name)
    private readonly participantModel: Model<CampaignParticipantDocument>,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  private get session(): ClientSession | undefined {
    return (this.uow as MongoUnitOfWork).getSession() || undefined;
  }

  async findById(id: string): Promise<Nullable<CampaignParticipantRoot>> {
    const doc = await this.participantModel.findById(id).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByCampaignAndKol(
    campaignId: string,
    kolProfileId: string,
  ): Promise<Nullable<CampaignParticipantRoot>> {
    const doc = await this.participantModel
      .findOne({
        campaign_id: new Types.ObjectId(campaignId),
        kol_profile_id: new Types.ObjectId(kolProfileId),
      })
      .session(this.session)
      .exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByOutputId(outputId: string): Promise<Nullable<CampaignParticipantRoot>> {
    const doc = await this.participantModel
      .findOne({
        'outputs._id': new Types.ObjectId(outputId),
      })
      .session(this.session)
      .exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async save(participant: CampaignParticipantRoot): Promise<void> {
    const data = this.mapToPersistence(participant);

    if (!participant.id) {
      const created = new this.participantModel(data);
      const saved = await created.save({ session: this.session });
      participant.setId(saved._id.toString());
    } else {
      await this.participantModel
        .findByIdAndUpdate(participant.id, data, { upsert: true })
        .session(this.session)
        .exec();
    }
  }

  async delete(id: string): Promise<void> {
    await this.participantModel.findByIdAndDelete(id).session(this.session).exec();
  }

  private mapToDomain(doc: CampaignParticipantDocument): CampaignParticipantRoot {
    if (!doc._id) {
      throw new Error('CampaignParticipant document ID is missing');
    }
    return CampaignParticipantRoot.instantiate(doc._id.toString(), {
      campaignId: doc.campaign_id.toString(),
      kolProfileId: doc.kol_profile_id.toString(),
      status: doc.status,
      joinedAt: doc.joined_at,
      createdAt: doc.get('created_at') || new Date(),
      updatedAt: doc.get('updated_at') || new Date(),
      outputs: (doc.outputs || []).map((o) => ({
        id: o._id.toString(),
        platformId: o.platform_id.toString(),
        outputType: o.output_type,
        title: o.title,
        isScheduleForPost: o.is_schedule_for_post,
        fileId: o.file_id ? o.file_id.toString() : null,
        scheduledAt: o.scheduled_at,
        status: o.status,
        url: o.url,
        postedAt: o.posted_at,
      })),
      deleteAt: doc.delete_at || null,
      deleteBy: doc.delete_by || null,
    });
  }

  private mapToPersistence(root: CampaignParticipantRoot): Omit<CampaignParticipantModel, 'created_at' | 'updated_at'> {
    return {
      campaign_id: new Types.ObjectId(root.campaignId),
      kol_profile_id: new Types.ObjectId(root.kolProfileId),
      status: root.status,
      joined_at: root.joinedAt,
      outputs: (root.outputs || []).map((o) => {
        const item: CampaignOutputModel = {
          _id: new Types.ObjectId(o.id),
          platform_id: new Types.ObjectId(o.platformId),
          output_type: o.outputType,
          title: o.title,
          is_schedule_for_post: o.isScheduleForPost,
          file_id: o.fileId ? new Types.ObjectId(o.fileId) : null,
          scheduled_at: o.scheduledAt,
          status: o.status,
          url: o.url,
          posted_at: o.postedAt,
        };
        return item;
      }),
      delete_at: root.deleteAt,
      delete_by: root.deleteBy,
    };
  }
}
