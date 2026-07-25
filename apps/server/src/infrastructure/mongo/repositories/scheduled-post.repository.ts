import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { IScheduledPostRepository } from '@/core/interfaces/repositories';
import { ScheduledPostRoot } from '@/core/aggregate-roots';
import { ScheduledPostModel, ScheduledPostDocument } from '../schemas';
import { Nullable } from '@/core/types';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';
import { EPostStatus } from '@/core/enums/post-status.enum';

@Injectable()
export class MongoScheduledPostRepository implements IScheduledPostRepository {
  constructor(
    @InjectModel(ScheduledPostModel.name)
    private readonly scheduledPostModel: Model<ScheduledPostDocument>,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  private get session(): ClientSession | undefined {
    return (this.uow as MongoUnitOfWork).getSession() || undefined;
  }

  async findById(id: string): Promise<Nullable<ScheduledPostRoot>> {
    const doc = await this.scheduledPostModel.findById(id).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findDueForPublishing(now: Date, limit: number): Promise<ScheduledPostRoot[]> {
    const docs = await this.scheduledPostModel.find({
      status: EPostStatus.SCHEDULED,
      scheduled_at: { $lte: now },
    })
      .limit(limit)
      .session(this.session)
      .exec();
    return docs.map(doc => this.mapToDomain(doc));
  }

  async findByEnterpriseId(enterpriseId: string): Promise<ScheduledPostRoot[]> {
    const docs = await this.scheduledPostModel.find({
      enterprise_id: new Types.ObjectId(enterpriseId),
    }).session(this.session).exec();
    return docs.map(doc => this.mapToDomain(doc));
  }

  async save(scheduledPost: ScheduledPostRoot): Promise<void> {
    const data = this.mapToPersistence(scheduledPost);

    if (!scheduledPost.id) {
      const created = new this.scheduledPostModel(data);
      const saved = await created.save({ session: this.session });
      scheduledPost.setId(saved._id.toString());
    } else {
      await this.scheduledPostModel.findByIdAndUpdate(scheduledPost.id, data, { upsert: true }).session(this.session).exec();
    }
  }

  async saveMany(scheduledPosts: ScheduledPostRoot[]): Promise<void> {
    await Promise.all(scheduledPosts.map(sp => this.save(sp)));
  }

  async delete(id: string): Promise<void> {
    await this.scheduledPostModel.findByIdAndDelete(id).session(this.session).exec();
  }

  private mapToDomain(doc: ScheduledPostDocument): ScheduledPostRoot {
    if (!doc._id) {
      throw new Error('ScheduledPost document ID is missing');
    }
    return ScheduledPostRoot.instantiate(doc._id.toString(), {
      enterpriseId: doc.enterprise_id.toString(),
      socialPageId: doc.social_page_id.toString(),
      campaignId: doc.campaign_id?.toString(),
      platformCode: doc.platform_code,
      content: doc.content,
      mediaFileIds: doc.media_file_ids,
      scheduledAt: doc.scheduled_at,
      status: doc.status,
      publishedAt: doc.published_at,
      platformPostId: doc.platform_post_id,
      failReason: doc.fail_reason,
      createdBy: doc.created_by.toString(),
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    });
  }

  private mapToPersistence(scheduledPost: ScheduledPostRoot): Omit<ScheduledPostModel, 'created_at' | 'updated_at'> {
    return {
      enterprise_id: new Types.ObjectId(scheduledPost.enterpriseId),
      social_page_id: new Types.ObjectId(scheduledPost.socialPageId),
      campaign_id: scheduledPost.campaignId ? new Types.ObjectId(scheduledPost.campaignId) : undefined,
      platform_code: scheduledPost.platformCode,
      content: scheduledPost.content,
      media_file_ids: scheduledPost.mediaFileIds,
      scheduled_at: scheduledPost.scheduledAt,
      status: scheduledPost.status,
      published_at: scheduledPost.publishedAt,
      platform_post_id: scheduledPost.platformPostId,
      fail_reason: scheduledPost.failReason,
      created_by: new Types.ObjectId(scheduledPost.createdBy),
      delete_at: null, // Soft delete not explicitly needed for standalone scheduling posts but schema supports it
      delete_by: null,
    };
  }
}
