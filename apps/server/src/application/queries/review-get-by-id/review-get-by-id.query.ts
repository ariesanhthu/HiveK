import { Query } from '@nestjs/cqrs';
import { ReviewDto } from '@/application/dtos';

export class ReviewGetByIdQuery extends Query<ReviewDto> {
  constructor(
    public readonly id: string,
  ) {
    super();
  }
}
