import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongoModule } from '@/infrastructure/mongo/mongo.module';
import { EnterpriseModule } from '@/infrastructure/modules/enterprise.module';
import { UserModule } from '@/infrastructure/modules/user.module';
import { RoleModule } from '@/infrastructure/modules/role.module';
import { AuthModule } from '@/infrastructure/modules/auth.module';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongoModule,
    UserModule,
    EnterpriseModule,
    RoleModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useValue: ZodValidationPipe
    }
  ],
})
export class AppModule {}
