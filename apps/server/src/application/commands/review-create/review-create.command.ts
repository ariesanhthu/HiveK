import { Command } from '@nestjs/cqrs';
import { ReviewCreateInputDto } from './review-create.dto';
import { ReviewDto } from '@/application/dtos';

export class ReviewCreateCommand extends Command<ReviewDto> {
  constructor(
    public readonly input: ReviewCreateInputDto,
  ) {
    super();
  }
}
