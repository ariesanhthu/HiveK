import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { ISocialPageRepository } from '@/core/interfaces/repositories';
import { SocialPageRoot } from '@/core/aggregate-roots';
import { SocialPageModel, SocialPageDocument } from '../schemas';
import { Nullable } from '@/core/types';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';
import { encrypt, decrypt } from '@/shared/utils/crypto.util';

@Injectable()
export class MongoSocialPageRepository implements ISocialPageRepository {
  private readonly encryptionKey: string;

  constructor(
    @InjectModel(SocialPageModel.name)
    private readonly socialPageModel: Model<SocialPageDocument>,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {
    this.encryptionKey = process.env.SOCIAL_PAGE_TOKEN_SECRET || 'fallback-token-secret-must-be-32-bytes-long!';
  }

  private get session(): ClientSession | undefined {
    return (this.uow as MongoUnitOfWork).getSession() || undefined;
  }

  async findById(id: string): Promise<Nullable<SocialPageRoot>> {
    const doc = await this.socialPageModel.findById(id).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByPageId(platformCode: string, pageId: string): Promise<Nullable<SocialPageRoot>> {
    const doc = await this.socialPageModel.findOne({
      platform_code: platformCode,
      page_id: pageId,
    }).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByEnterpriseId(enterpriseId: string): Promise<SocialPageRoot[]> {
    const docs = await this.socialPageModel.find({
      enterprise_id: new Types.ObjectId(enterpriseId),
    }).session(this.session).exec();
    return docs.map(doc => this.mapToDomain(doc));
  }

  async findByWebhookVerifyToken(verifyToken: string): Promise<Nullable<SocialPageRoot>> {
    const doc = await this.socialPageModel.findOne({
      webhook_verify_token: verifyToken,
    }).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async save(socialPage: SocialPageRoot): Promise<void> {
    const data = this.mapToPersistence(socialPage);

    if (!socialPage.id) {
      const created = new this.socialPageModel(data);
      const saved = await created.save({ session: this.session });
      socialPage.setId(saved._id.toString());
    } else {
      await this.socialPageModel.findByIdAndUpdate(socialPage.id, data, { upsert: true }).session(this.session).exec();
    }
  }

  async saveMany(socialPages: SocialPageRoot[]): Promise<void> {
    await Promise.all(socialPages.map(sp => this.save(sp)));
  }

  async delete(id: string): Promise<void> {
    await this.socialPageModel.findByIdAndDelete(id).session(this.session).exec();
  }

  private mapToDomain(doc: SocialPageDocument): SocialPageRoot {
    if (!doc._id) {
      throw new Error('SocialPage document ID is missing');
    }
    // Decrypt access token transparently
    const decryptedToken = decrypt(doc.encrypted_token, this.encryptionKey);

    return SocialPageRoot.instantiate(doc._id.toString(), {
      enterpriseId: doc.enterprise_id.toString(),
      platformId: doc.platform_id.toString(),
      platformCode: doc.platform_code,
      pageId: doc.page_id,
      pageName: doc.page_name,
      pictureUrl: doc.picture_url,
      followerCount: doc.follower_count,
      encryptedToken: decryptedToken, // Keep decrypted inside core root
      tokenExpiresAt: doc.token_expires_at,
      webhookVerifyToken: doc.webhook_verify_token,
      isActive: doc.is_active,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
      deleteAt: doc.delete_at,
      deleteBy: doc.delete_by,
    });
  }

  private mapToPersistence(socialPage: SocialPageRoot): Omit<SocialPageModel, 'created_at' | 'updated_at'> {
    // Encrypt access token transparently
    const encryptedToken = encrypt(socialPage.encryptedToken, this.encryptionKey);

    return {
      enterprise_id: new Types.ObjectId(socialPage.enterpriseId),
      platform_id: new Types.ObjectId(socialPage.platformId),
      platform_code: socialPage.platformCode,
      page_id: socialPage.pageId,
      page_name: socialPage.pageName,
      picture_url: socialPage.pictureUrl,
      follower_count: socialPage.followerCount,
      encrypted_token: encryptedToken,
      token_expires_at: socialPage.tokenExpiresAt,
      webhook_verify_token: socialPage.webhookVerifyToken,
      is_active: socialPage.isActive,
      delete_at: socialPage.deleteAt,
      delete_by: socialPage.deleteBy,
    };
  }
}
