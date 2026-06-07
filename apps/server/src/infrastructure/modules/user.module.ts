import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  UserCreateCommandHandler,
  UserUpdateCommandHandler,
  UserUpdateProfileCommandHandler,
  UserSoftDeleteCommandHandler,
  UserHardDeleteCommandHandler,
  UserRestoreCommandHandler,
  UserCheckValidCommandHandler,
} from '@/application/commands';

import { UserGetByIdHandler, UserGetListHandler } from '@/application/queries';
import { LinkUserAvatarHandler } from '@/application/events';
import { UserController } from '@/presentation/controllers';

const COMMAND_HANDLERS = [
  UserCreateCommandHandler,
  UserUpdateCommandHandler,
  UserUpdateProfileCommandHandler,
  UserSoftDeleteCommandHandler,
  UserHardDeleteCommandHandler,
  UserRestoreCommandHandler,
  UserCheckValidCommandHandler
];

const QUERY_HANDLERS = [
  UserGetByIdHandler,
  UserGetListHandler,
];

const EVENT_HANDLERS = [
  LinkUserAvatarHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [UserController],
  providers: [...COMMAND_HANDLERS, ...QUERY_HANDLERS, ...EVENT_HANDLERS],
  exports: [],
})
export class UserModule {}