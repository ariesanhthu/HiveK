import { ReviewDto } from '@/application/dtos';
import { Query } from '@nestjs/cqrs';

export class ReviewGetByIdQuery extends Query<ReviewDto> {
  constructor(public readonly id: string) {
    super();
  }
}
