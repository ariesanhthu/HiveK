import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, ClientSession } from 'mongoose';
import {
  PUBLIC_REVIEW_REPOSITORY,
  type IPublicReviewRepository,
} from '@/core/interfaces/repositories';
import { PublicReviewRoot } from '@/core/aggregate-roots';
import { ReviewSecurityMetadataVO } from '@/core/value-objects';
import { PublicReviewModel, PublicReviewDocument } from '../schemas';
import { Nullable } from '@/core/types';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { MongoUnitOfWork } from '../mongo-uow';
import { EReviewStatus } from '@/core/enums';

@Injectable()
export class MongoPublicReviewRepository implements IPublicReviewRepository {
  constructor(
    @InjectModel(PublicReviewModel.name)
    private readonly reviewModel: Model<PublicReviewDocument>,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  private get session(): ClientSession | undefined {
    return (this.uow as unknown as MongoUnitOfWork).getSession() || undefined;
  }

  async findById(id: string): Promise<Nullable<PublicReviewRoot>> {
    const doc = await this.reviewModel
      .findById(id)
      .session(this.session)
      .exec();
    return doc ? this.mapToDomain(doc) : null;
  }

  async findByProposalId(proposalId: string): Promise<PublicReviewRoot[]> {
    const docs = await this.reviewModel
      .find({
        proposal_id: new Types.ObjectId(proposalId),
      } as Record<string, unknown>)
      .session(this.session)
      .exec();
    return docs.map((doc) => this.mapToDomain(doc));
  }

  async findByProposalIdAndStatus(
    proposalId: string,
    status: EReviewStatus,
  ): Promise<PublicReviewRoot[]> {
    const docs = await this.reviewModel
      .find({
        proposal_id: new Types.ObjectId(proposalId),
        status,
      } as Record<string, unknown>)
      .session(this.session)
      .exec();
    return docs.map((doc) => this.mapToDomain(doc));
  }

  async save(review: PublicReviewRoot): Promise<void> {
    const data = this.mapToPersistence(review);

    if (!review.id) {
      const created = new this.reviewModel(data);
      const saved = await created.save({ session: this.session });
      review.setId(saved._id.toString());
    } else {
      await this.reviewModel
        .findByIdAndUpdate(review.id, data, { upsert: true })
        .session(this.session)
        .exec();
    }
  }

  async saveMany(reviews: PublicReviewRoot[]): Promise<void> {
    await Promise.all(reviews.map((r) => this.save(r)));
  }

  async delete(id: string): Promise<void> {
    await this.reviewModel.findByIdAndDelete(id).session(this.session).exec();
  }

  private mapToDomain(doc: PublicReviewDocument): PublicReviewRoot {
    if (!doc._id) {
      throw new Error('PublicReview document ID is missing');
    }
    return PublicReviewRoot.instantiate(doc._id.toString(), {
      proposalId: doc.proposal_id.toString(),
      authorName: doc.author_name,
      rating: doc.rating,
      comment: doc.comment,
      status: doc.status,
      securityMetadata: ReviewSecurityMetadataVO.create({
        ipHash: doc.security_metadata.ip_hash,
        browserFingerprint: doc.security_metadata.browser_fingerprint,
        recaptchaScore: doc.security_metadata.recaptcha_score,
      }),
      deleteAt: doc.delete_at,
      deleteBy: doc.delete_by,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    });
  }

  private mapToPersistence(review: PublicReviewRoot): Record<string, unknown> {
    return {
      proposal_id: new Types.ObjectId(review.proposalId),
      author_name: review.authorName,
      rating: review.rating,
      comment: review.comment,
      status: review.status,
      security_metadata: {
        ip_hash: review.securityMetadata.ipHash,
        browser_fingerprint: review.securityMetadata.browserFingerprint,
        recaptcha_score: review.securityMetadata.recaptchaScore,
      },
      delete_at: review.deleteAt,
      delete_by: review.deleteBy,
    };
  }
}
