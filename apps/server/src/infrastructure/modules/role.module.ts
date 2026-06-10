import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  RoleCreateCommandHandler,
  RoleUpdateCommandHandler,
  RoleSoftDeleteCommandHandler,
  RoleHardDeleteCommandHandler,
  RoleRestoreCommandHandler,
} from '@/application/commands';

import { RoleGetByIdQueryHandler, RoleGetListQueryHandler } from '@/application/queries';
import { RoleAdminController, RoleClientController } from '@/presentation/controllers';
import { UserModule } from './user.module';

const COMMAND_HANDLERS = [
  RoleCreateCommandHandler,
  RoleUpdateCommandHandler,
  RoleSoftDeleteCommandHandler,
  RoleHardDeleteCommandHandler,
  RoleRestoreCommandHandler,
];

const QUERY_HANDLERS = [
  RoleGetByIdQueryHandler,
  RoleGetListQueryHandler,
];

@Module({
  imports: [UserModule, CqrsModule],
  controllers: [RoleAdminController, RoleClientController],
  providers: [...COMMAND_HANDLERS, ...QUERY_HANDLERS],
  exports: [],
})
export class RoleModule {}