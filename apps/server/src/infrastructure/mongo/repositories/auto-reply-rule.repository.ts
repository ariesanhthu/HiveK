import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { IAutoReplyRuleRepository } from '@/core/interfaces/repositories';
import { AutoReplyRuleRoot } from '@/core/aggregate-roots';
import { AutoReplyRuleModel, AutoReplyRuleDocument } from '../schemas';
import { Nullable } from '@/core/types';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';

@Injectable()
export class MongoAutoReplyRuleRepository implements IAutoReplyRuleRepository {
  constructor(
    @InjectModel(AutoReplyRuleModel.name)
    private readonly autoReplyRuleModel: Model<AutoReplyRuleDocument>,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  private get session(): ClientSession | undefined {
    return (this.uow as MongoUnitOfWork).getSession() || undefined;
  }

  async findById(id: string): Promise<Nullable<AutoReplyRuleRoot>> {
    const doc = await this.autoReplyRuleModel
      .findById(id)
      .session(this.session)
      .exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findActiveByPageId(socialPageId: string): Promise<AutoReplyRuleRoot[]> {
    const docs = await this.autoReplyRuleModel
      .find({
        social_page_id: new Types.ObjectId(socialPageId),
        is_enabled: true,
      })
      .session(this.session)
      .exec();
    return docs.map((doc) => this.mapToDomain(doc));
  }

  async findByPageId(socialPageId: string): Promise<AutoReplyRuleRoot[]> {
    const docs = await this.autoReplyRuleModel
      .find({
        social_page_id: new Types.ObjectId(socialPageId),
      })
      .session(this.session)
      .exec();
    return docs.map((doc) => this.mapToDomain(doc));
  }

  async save(autoReplyRule: AutoReplyRuleRoot): Promise<void> {
    const data = this.mapToPersistence(autoReplyRule);

    if (!autoReplyRule.id) {
      const created = new this.autoReplyRuleModel(data);
      const saved = await created.save({ session: this.session });
      autoReplyRule.setId(saved._id.toString());
    } else {
      await this.autoReplyRuleModel
        .findByIdAndUpdate(autoReplyRule.id, data, { upsert: true })
        .session(this.session)
        .exec();
    }
  }

  async saveMany(autoReplyRules: AutoReplyRuleRoot[]): Promise<void> {
    await Promise.all(autoReplyRules.map((arr) => this.save(arr)));
  }

  async delete(id: string): Promise<void> {
    await this.autoReplyRuleModel
      .findByIdAndDelete(id)
      .session(this.session)
      .exec();
  }

  private mapToDomain(doc: AutoReplyRuleDocument): AutoReplyRuleRoot {
    if (!doc._id) {
      throw new Error('AutoReplyRule document ID is missing');
    }
    return AutoReplyRuleRoot.instantiate(doc._id.toString(), {
      enterpriseId: doc.enterprise_id.toString(),
      socialPageId: doc.social_page_id.toString(),
      name: doc.name,
      isEnabled: doc.is_enabled,
      keywords: doc.keywords,
      replyContent: doc.reply_content,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    });
  }

  private mapToPersistence(
    autoReplyRule: AutoReplyRuleRoot,
  ): Omit<AutoReplyRuleModel, 'created_at' | 'updated_at'> {
    return {
      enterprise_id: new Types.ObjectId(autoReplyRule.enterpriseId),
      social_page_id: new Types.ObjectId(autoReplyRule.socialPageId),
      name: autoReplyRule.name,
      is_enabled: autoReplyRule.isEnabled,
      keywords: autoReplyRule.keywords,
      reply_content: autoReplyRule.replyContent,
      delete_at: null,
      delete_by: null,
    };
  }
}
