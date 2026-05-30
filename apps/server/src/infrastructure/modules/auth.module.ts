import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import {
  AuthSignInCommandHandler,
  AuthSignUpCommandHandler,
  AuthSignOutCommandHandler,
  AuthResetPasswordCommandHandler,
  AuthRefreshTokenCommandHandler
} from '@/application/commands';
import { AuthGetProfileHandler } from '@/application/queries';
import { AUTH_JWT_SERVICE } from '@/application/interfaces';
import { USER_REPOSITORY } from '@/core/interfaces/repositories';
import { JwtAuthService } from '../auth/jwt.service';
import { JwtStrategy } from '../auth/jwt.strategy';
import { MongoUserRepository } from '../mongo/repositories';
import { UserModule } from './user.module';
import { RoleModule } from './role.module';
import { AuthController } from '@/presentation/controllers/auth.controller';

const Handlers = [
  AuthSignInCommandHandler,
  AuthSignUpCommandHandler,
  AuthSignOutCommandHandler,
  AuthResetPasswordCommandHandler,
  AuthRefreshTokenCommandHandler,
  AuthGetProfileHandler,
];

@Module({
  imports: [
    CqrsModule,
    UserModule,
    RoleModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
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
    JwtStrategy,
    {
      provide: AUTH_JWT_SERVICE,
      useClass: JwtAuthService,
    },
    {
      provide: USER_REPOSITORY,
      useClass: MongoUserRepository,
    },
  ],
  exports: [AUTH_JWT_SERVICE, USER_REPOSITORY, PassportModule, JwtStrategy],
})
export class AuthModule { }
