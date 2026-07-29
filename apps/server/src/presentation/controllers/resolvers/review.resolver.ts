import { Resolver, Query, Args } from '@nestjs/graphql';
import { QueryBus } from '@nestjs/cqrs';
import { PublicReviewType } from '@/infrastructure/graphql/types/review.type';
import {
  PublicReviewFilterInput,
  PublicReviewResponse,
} from '@/infrastructure/graphql/types/pagination.type';
import { ReviewGetByIdQuery, ReviewGetListQuery } from '@/application/queries';
import { Public } from '@presentation/decorators/public.decorator';

@Resolver(() => PublicReviewType)
export class PublicReviewResolver {
  constructor(private readonly queryBus: QueryBus) {}

  @Public()
  @Query(() => PublicReviewType, { name: 'review' })
  async getReview(@Args('id') id: string) {
    return this.queryBus.execute(new ReviewGetByIdQuery(id));
  }

  @Public()
  @Query(() => PublicReviewResponse, { name: 'reviews' })
  async getReviews(
    @Args('filters', { type: () => PublicReviewFilterInput, nullable: true })
    filters?: PublicReviewFilterInput,
  ) {
    return this.queryBus.execute(new ReviewGetListQuery(filters as any));
  }
}
