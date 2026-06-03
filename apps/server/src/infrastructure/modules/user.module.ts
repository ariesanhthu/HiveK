import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { UserController } from '@/presentation/controllers';
import { UserGetByIdHandler, UserGetListHandler } from '@/application/queries';
import { UserCreateCommandHandler, UserUpdateCommandHandler, UserUpdateProfileCommandHandler, UserSoftDeleteCommandHandler, UserHardDeleteCommandHandler, UserRestoreCommandHandler } from '@/application/commands';
import { USER_READ_SERVICE } from '@/application/interfaces';
import { USER_REPOSITORY } from '@/core/interfaces/repositories';
import { MongoUserReadService } from '@/infrastructure/mongo/read-services';
import { MongoUserRepository } from '@/infrastructure/mongo/repositories';
import {
  UserModel, UserSchema,
  AdminModel, AdminSchema,
  EnterpriseUserModel, EnterpriseUserSchema,
  KOLUserModel, KOLUserSchema
} from '@/infrastructure/mongo/schemas';

import { LinkUserAvatarHandler } from '@/application/events';
import { AuthModule } from './auth.module';

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      {
        name: UserModel.name,
        schema: UserSchema,
        discriminators: [
          { name: AdminModel.name, schema: AdminSchema },
          { name: EnterpriseUserModel.name, schema: EnterpriseUserSchema },
          { name: KOLUserModel.name, schema: KOLUserSchema },
        ]
      },
    ]),
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [
    UserGetByIdHandler,
    UserGetListHandler,
    UserCreateCommandHandler,
    UserUpdateCommandHandler,
    UserUpdateProfileCommandHandler,
    UserSoftDeleteCommandHandler,
    UserHardDeleteCommandHandler,
    UserRestoreCommandHandler,
    LinkUserAvatarHandler,
    {
      provide: USER_READ_SERVICE,
      useClass: MongoUserReadService,
    },
    {
      provide: USER_REPOSITORY,
      useClass: MongoUserRepository,
    },
  ],
  exports: [USER_READ_SERVICE, USER_REPOSITORY, MongooseModule],
})
export class UserModule { }
