import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { RoleModel, RoleSchema } from '@/infrastructure/mongo/schemas';
import { ROLE_READ_SERVICE } from '@/application/interfaces';
import { ROLE_REPOSITORY } from '@/core/interfaces/repositories';
import { MongoRoleReadService } from '@/infrastructure/mongo/read-services';
import { MongoRoleRepository } from '@/infrastructure/mongo/repositories';
import { RoleSeedService } from '@/infrastructure/mongo/seeding/role-seed.service';
import { RoleSoftDeleteCommandHandler, RoleHardDeleteCommandHandler, RoleRestoreCommandHandler } from '@/application/commands';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      { name: RoleModel.name, schema: RoleSchema },
    ]),
  ],
  providers: [
    {
      provide: ROLE_READ_SERVICE,
      useClass: MongoRoleReadService,
    },
    {
      provide: ROLE_REPOSITORY,
      useClass: MongoRoleRepository,
    },
    RoleSeedService,
    RoleSoftDeleteCommandHandler,
    RoleHardDeleteCommandHandler,
    RoleRestoreCommandHandler,
  ],
  exports: [ROLE_READ_SERVICE, ROLE_REPOSITORY, MongooseModule],
})
export class RoleModule { }
