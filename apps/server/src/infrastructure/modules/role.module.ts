import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoleModel, RoleSchema } from '@/infrastructure/mongo/schemas';
import { ROLE_READ_SERVICE } from '@/application/interfaces';
import { MongoRoleReadService } from '@/infrastructure/mongo/read-services';
import { RoleSeedService } from '@/infrastructure/mongo/seeding/role-seed.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RoleModel.name, schema: RoleSchema },
    ]),
  ],
  providers: [
    {
      provide: ROLE_READ_SERVICE,
      useClass: MongoRoleReadService,
    },
    RoleSeedService,
  ],
  exports: [ROLE_READ_SERVICE, MongooseModule],
})
export class RoleModule {}
