import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Controllers & Resolvers
import {
  PublicReviewAdminController,
  PublicReviewClientController,
  PublicReviewResolver,
} from '@/presentation/controllers';

// Commands
import {
  ReviewCreateCommandHandler,
  ReviewModerateCommandHandler,
  ReviewSoftDeleteCommandHandler,
  ReviewRestoreCommandHandler,
} from '@/application/commands';

// Queries
import {
  ReviewGetListHandler,
  ReviewGetByIdHandler,
} from '@/application/queries';

const COMMAND_HANDLERS = [
  ReviewCreateCommandHandler,
  ReviewModerateCommandHandler,
  ReviewSoftDeleteCommandHandler,
  ReviewRestoreCommandHandler,
];

const QUERY_HANDLERS = [ReviewGetListHandler, ReviewGetByIdHandler];

@Module({
  imports: [CqrsModule],
  controllers: [PublicReviewAdminController, PublicReviewClientController],
  providers: [PublicReviewResolver, ...COMMAND_HANDLERS, ...QUERY_HANDLERS],
  exports: [],
})
export class PublicReviewModule {}
