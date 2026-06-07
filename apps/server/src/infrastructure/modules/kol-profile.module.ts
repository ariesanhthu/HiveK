import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Commands
import {
  KolProfileUpdateCommandHandler,
  KolProfileSoftDeleteCommandHandler,
  KolProfileHardDeleteCommandHandler,
  KolProfileRestoreCommandHandler,
  KolProfileVerifyPlatformAccountCommandHandler,
} from '@/application/commands';

// Queries
import { KolProfileGetListHandler, KolProfileGetByIdHandler, KolProfileGetHandlesDevHandler } from '@/application/queries';

// Presentation
import { KolProfileController } from '@/presentation/controllers/kol-profile.controller';
import { KolProfileResolver } from '@/presentation/resolvers/kol-profile.resolver';

const COMMAND_HANDLERS = [
  KolProfileUpdateCommandHandler,
  KolProfileSoftDeleteCommandHandler,
  KolProfileHardDeleteCommandHandler,
  KolProfileRestoreCommandHandler,
  KolProfileVerifyPlatformAccountCommandHandler,
];

const QUERY_HANDLERS = [
  KolProfileGetListHandler,
  KolProfileGetByIdHandler,
  KolProfileGetHandlesDevHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [KolProfileController],
  providers: [...COMMAND_HANDLERS, ...QUERY_HANDLERS, KolProfileResolver],
  exports: [],
})
export class KolProfileModule {}