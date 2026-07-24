import { ReviewDto } from '@/application/dtos';
import { Command } from '@nestjs/cqrs';
import { ReviewCreateInputDto } from './review-create.dto';

export class ReviewCreateCommand extends Command<ReviewDto> {
  constructor(public readonly input: ReviewCreateInputDto) {
    super();
  }
}
