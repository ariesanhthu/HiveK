import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';
import { UserController } from '@/presentation/controllers';
import { GetUserQueryHandler } from '@/application/users/queries';
import { UpdateProfileCommandHandler } from '@/application/users/commands/handlers';
import { USER_READ_SERVICE } from '@/application/interfaces';
import { USER_REPOSITORY } from '@/core/interfaces';
import { MongoUserReadService } from '@/infrastructure/mongo/read-services';
import { MongoUserRepository } from '@/infrastructure/mongo/repositories';
import { 
  UserModel, UserSchema, 
  AdminModel, AdminSchema,
  EnterpriseUserModel, EnterpriseUserSchema,
  KOLUserModel, KOLUserSchema
} from '@/infrastructure/mongo/schemas';

@Module({
  imports: [
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
  ],
  // controllers: [UserController],
  providers: [
    GetUserQueryHandler,
    UpdateProfileCommandHandler,
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
export class UserModule {}
