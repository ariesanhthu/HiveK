import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EnterpriseAdminController, EnterpriseClientController } from '@/presentation/controllers';
import { EnterpriseGetByIdHandler, EnterpriseGetListHandler, EnterpriseGetInvitationsQueryHandler, EnterpriseGetMyListHandler, EnterpriseGetMyInvitationsQueryHandler } from '@/application/queries';

import {
  EnterpriseCreateCommandHandler,
  EnterpriseUpdateCommandHandler,
  EnterpriseSoftDeleteCommandHandler,
  EnterpriseHardDeleteCommandHandler,
  EnterpriseRestoreCommandHandler,
  EnterpriseInviteMemberCommandHandler,
  EnterpriseAcceptInvitationCommandHandler,
  EnterpriseRevokeMemberCommandHandler,
  EnterpriseRevokeInvitationCommandHandler,
  EnterpriseChangeMemberModeCommandHandler,
} from '@/application/commands';

import { UploadedFileModule } from './uploaded-file.module';
import { UserModule } from './user.module';
import { LinkEnterpriseLogoHandler } from '@/application/events';
import { EnterpriseUserRmqController } from '@/presentation/controllers';

const COMMAND_HANDLERS = [
  EnterpriseCreateCommandHandler,
  EnterpriseUpdateCommandHandler,
  EnterpriseSoftDeleteCommandHandler,
  EnterpriseHardDeleteCommandHandler,
  EnterpriseRestoreCommandHandler,
  EnterpriseInviteMemberCommandHandler,
  EnterpriseAcceptInvitationCommandHandler,
  EnterpriseRevokeMemberCommandHandler,
  EnterpriseRevokeInvitationCommandHandler,
  EnterpriseChangeMemberModeCommandHandler,
];

const QUERY_HANDLERS = [
  EnterpriseGetByIdHandler,
  EnterpriseGetListHandler,
  EnterpriseGetInvitationsQueryHandler,
  EnterpriseGetMyListHandler,
  EnterpriseGetMyInvitationsQueryHandler,
];

const EVENT_HANDLERS = [
  LinkEnterpriseLogoHandler,
]

@Module({
  imports: [CqrsModule, UploadedFileModule, UserModule],
  controllers: [EnterpriseAdminController, EnterpriseClientController],
  providers: [
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,
    ...EVENT_HANDLERS,
    EnterpriseUserRmqController,
  ],
  exports: [],
})
export class EnterpriseModule {}