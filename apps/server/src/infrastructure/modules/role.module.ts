import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { RoleModel, RoleSchema } from '@/infrastructure/mongo/schemas';
import { ROLE_READ_SERVICE } from '@/application/interfaces';
import { ROLE_REPOSITORY } from '@/core/interfaces/repositories';
import { MongoRoleReadService } from '@/infrastructure/mongo/read-services';
import { MongoRoleRepository } from '@/infrastructure/mongo/repositories';
import {
  RoleCreateCommandHandler,
  RoleUpdateCommandHandler,
  RoleSoftDeleteCommandHandler,
  RoleHardDeleteCommandHandler,
  RoleRestoreCommandHandler,
} from '@/application/commands';
import { RoleGetByIdQueryHandler, RoleGetListQueryHandler } from '@/application/queries';
import { RoleController } from '@/presentation/controllers';
import { UserModel, UserSchema } from '../mongo';
import { RoleSeedService } from '../mongo/seeding/role-seed.service';
import { UserModule } from './user.module';

@Module({
  imports: [
    UserModule,
    CqrsModule,
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserSchema },
      { name: RoleModel.name, schema: RoleSchema },
    ]),
  ],
  controllers: [RoleController],
  providers: [
    {
      provide: ROLE_READ_SERVICE,
      useClass: MongoRoleReadService,
    },
    {
      provide: ROLE_REPOSITORY,
      useClass: MongoRoleRepository,
    },
    RoleCreateCommandHandler,
    RoleUpdateCommandHandler,
    RoleSoftDeleteCommandHandler,
    RoleHardDeleteCommandHandler,
    RoleRestoreCommandHandler,
    RoleGetByIdQueryHandler,
    RoleGetListQueryHandler,
    RoleSeedService
  ],
  exports: [ROLE_READ_SERVICE, ROLE_REPOSITORY, MongooseModule],
})
export class RoleModule { }
