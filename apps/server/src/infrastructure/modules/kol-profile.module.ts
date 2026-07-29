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
import {
  KolProfileGetListHandler,
  KolProfileGetByIdHandler,
  KolProfileGetHandlesDevHandler,
} from '@/application/queries';

// Presentation
import {
  KolProfileAdminController,
  KolProfileClientController,
} from '@/presentation/controllers';
import { KolProfileResolver } from '@/presentation/controllers';
import { TestKOLController } from '@/presentation/controllers/http/test.controller';

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
  controllers: [
    KolProfileAdminController,
    KolProfileClientController,
    TestKOLController,
  ],
  providers: [...COMMAND_HANDLERS, ...QUERY_HANDLERS, KolProfileResolver],
  exports: [],
})
export class KolProfileModule {}
