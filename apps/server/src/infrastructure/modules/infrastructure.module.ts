import { Module } from '@nestjs/common';
import { MongoModule } from '../mongo/mongo.module';
import { EnterpriseModule } from './enterprise.module';
import { UserModule } from './user.module';

@Module({
  imports: [MongoModule, EnterpriseModule, UserModule],
  exports: [MongoModule, EnterpriseModule, UserModule],
})
export class InfrastructureModule {}
