import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import { IKolProfileRepository } from '@/core/interfaces/repositories';
import { KolProfileEntity } from '@/core/entities/kol-profile.entity';
import { KolPlatformInfoVO } from '@/core/value-objects/kol-platform-info.value-object';
import { KolProfileModel, KolProfileDocument } from '../schemas';
import { Nullable } from '@/core/types';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';

@Injectable()
export class MongoKolProfileRepository implements IKolProfileRepository {
  constructor(
    @InjectModel(KolProfileModel.name)
    private readonly kolProfileModel: Model<KolProfileDocument>,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) { }

  private get session(): ClientSession | undefined {
    return (this.uow as MongoUnitOfWork).getSession() || undefined;
  }

  async findById(id: string): Promise<Nullable<KolProfileEntity>> {
    const doc = await this.kolProfileModel.findById(id).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByPlatformInfo(platformId: string, externalId: string): Promise<Nullable<KolProfileEntity>> {
    const doc = await this.kolProfileModel.findOne({
      'platforms.platform_id': platformId,
      'platforms.external_id': externalId,
    }).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByUserId(userId: string): Promise<Nullable<KolProfileEntity>> {
    const doc = await this.kolProfileModel.findOne({ user_id: new Types.ObjectId(userId) } as Record<string, unknown>).session(this.session).exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async existsByPlatformId(platformId: string): Promise<boolean> {
    const doc = await this.kolProfileModel.findOne(
      {
        'platforms.platform_id': platformId,
        delete_at: null,
      },
      { _id: 1 }
    ).session(this.session).lean().exec();
    return !!doc;
  }

  async save(entity: KolProfileEntity): Promise<void> {
    const data = this.mapToPersistence(entity);

    if (!entity.id) {
      const created = new this.kolProfileModel(data);
      const saved = await created.save({ session: this.session });
      entity.setId(saved._id.toString());
    } else {
      await this.kolProfileModel.findByIdAndUpdate(entity.id, data, { upsert: true }).session(this.session).exec();
    }
  }

  async saveMany(entities: KolProfileEntity[]): Promise<void> {
    await Promise.all(entities.map(e => this.save(e)));
  }

  async delete(id: string): Promise<void> {
    await this.kolProfileModel.findByIdAndDelete(id).session(this.session).exec();
  }

  private mapToDomain(doc: KolProfileDocument): KolProfileEntity {
    const platforms = (doc.platforms || []).map((p: KolProfileModel['platforms'][0]) =>
      KolPlatformInfoVO.create({
        platformId: p.platform_id.toString(),
        uniqueId: p.uniqueId,
        externalId: p.external_id,
        followerCount: p.follower_count,
        avgEngagement: p.avg_engagement,
        topTags: p.top_tags,
        categories: p.categories,
      })
    );

    if (!doc._id) {
      throw new Error('KolProfile document ID is missing');
    }
    return KolProfileEntity.instantiate(doc._id.toString(), {
      userId: doc.user_id ? doc.user_id.toString() : null,
      verificationType: doc.verification_type,
      name: doc.name,
      location: doc.location || undefined,
      gender: doc.gender || undefined,
      bio: doc.bio || undefined,
      email: doc.email,
      phone: doc.phone || undefined,
      platforms,
      isVerified: doc.is_verified,
      scores: doc.scores,
      deleteAt: doc.delete_at,
      deleteBy: doc.delete_by,
    });
  }

  private mapToPersistence(entity: KolProfileEntity): Omit<KolProfileModel, 'created_at' | 'updated_at'> {
    const platforms = (entity.platforms || []).map((p) => ({
      platform_id: new Types.ObjectId(p.platformId),
      uniqueId: p.uniqueId,
      external_id: p.externalId,
      follower_count: p.followerCount,
      avg_engagement: p.avgEngagement,
      top_tags: p.topTags,
      categories: p.categories,
    }));

    return {
      user_id: entity.userId ? new Types.ObjectId(entity.userId) : null,
      verification_type: entity.verificationType,
      name: entity.name,
      location: entity.location ?? null,
      gender: entity.gender ?? null,
      bio: entity.bio ?? null,
      email: entity.email,
      phone: entity.phone ?? null,
      platforms,
      is_verified: entity.isVerified,
      scores: entity.scores,
      delete_at: entity.deleteAt,
      delete_by: entity.deleteBy,
    };
  }
}
