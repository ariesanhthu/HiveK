import { ReviewDto, ReviewFilterDto } from '@/application/dtos';
import { PaginatedResponseDto, SortOrder } from '@/application/dtos/pagination.dto';
import { IPublicReviewReadService } from '@/application/interfaces/read-service/review.read-service.interface';
import { Nullable } from '@/core/types';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';
import { PublicReviewDocument, PublicReviewModel } from '../schemas/public-review.schema';

@Injectable()
export class MongoPublicReviewReadService implements IPublicReviewReadService {
  constructor(
    @InjectModel(PublicReviewModel.name) private readonly reviewModel: Model<PublicReviewDocument>,
  ) {}

  async findById(id: string): Promise<Nullable<ReviewDto>> {
    const doc = await this.reviewModel.findById(id).lean().exec();
    return doc ? this.mapToDto(doc) : null;
  }

  async findByProposalId(proposalId: string): Promise<ReviewDto[]> {
    const docs = await this.reviewModel.find({
      proposal_id: new Types.ObjectId(proposalId) as any,
    }).lean().exec();
    return docs.map((doc) => this.mapToDto(doc));
  }

  async findAll(filters: ReviewFilterDto = {} as any): Promise<PaginatedResponseDto<ReviewDto>> {
    const { cursor, limit = 10, sort = SortOrder.DESC, proposalId, status } = filters;
    const query: QueryFilter<PublicReviewDocument> = {};

    if (proposalId) {
      query.proposal_id = new Types.ObjectId(proposalId) as any;
    }

    if (status) {
      query.status = status as any;
    }

    if (cursor) {
      query._id = sort === SortOrder.DESC ? { $lt: cursor } : { $gt: cursor };
    }

    const docs = await this.reviewModel
      .find(query)
      .sort({ _id: sort === SortOrder.DESC ? -1 : 1 })
      .limit(limit + 1)
      .lean()
      .exec();

    const hasNextPage = docs.length > limit;
    const results = hasNextPage ? docs.slice(0, limit) : docs;
    const nextCursor = hasNextPage ? results[results.length - 1]._id.toString() : null;

    return new PaginatedResponseDto(
      results.map((doc) => this.mapToDto(doc)),
      nextCursor,
      hasNextPage,
      limit,
    );
  }

  private mapToDto(doc: any): ReviewDto {
    return {
      id: doc._id.toString(),
      proposalId: doc.proposal_id?.toString() || '',
      authorName: doc.author_name,
      rating: doc.rating,
      comment: doc.comment,
      status: doc.status,
      createdAt: doc.created_at || doc.createdAt,
    };
  }
}
