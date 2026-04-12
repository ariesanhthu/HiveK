import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { 
  SignInCommandHandler, 
  SignUpCommandHandler, 
  SignOutCommandHandler, 
  ResetPasswordCommandHandler 
} from '@/application/auth/commands/handlers';
import { GetProfileQueryHandler } from '@/application/auth/queries/get-profile.query';
import { AUTH_JWT_SERVICE, USER_REPOSITORY } from '@/application/interfaces';
import { JwtAuthService } from '../auth/jwt.service';
import { MongoUserRepository } from '../mongo/repositories';
import { UserModule } from './user.module';
import { RoleModule } from './role.module';
import { AuthController } from '@/presentation/controllers/auth.controller';

const Handlers = [
  SignInCommandHandler,
  SignUpCommandHandler,
  SignOutCommandHandler,
  ResetPasswordCommandHandler,
  GetProfileQueryHandler,
];

@Module({
  imports: [
    CqrsModule,
    UserModule,
    RoleModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'secret'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    ...Handlers,
    {
      provide: AUTH_JWT_SERVICE,
      useClass: JwtAuthService,
    },
    {
      provide: USER_REPOSITORY,
      useClass: MongoUserRepository,
    },
  ],
  exports: [AUTH_JWT_SERVICE, USER_REPOSITORY],
})
export class AuthModule {}
