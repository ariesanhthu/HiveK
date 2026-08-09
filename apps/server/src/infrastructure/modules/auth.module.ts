import { Module, Global } from '@nestjs/common';
import { CqrsModule, CommandBus } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

// Commands
import {
  AuthSignInCommandHandler,
  AuthSignUpCommandHandler,
  AuthSignOutCommandHandler,
  AuthResetPasswordCommandHandler,
  AuthRefreshTokenCommandHandler,
  AuthGoogleSignInCommandHandler,
  AuthSendOtpCommandHandler,
  AuthChangePasswordCommandHandler,
  AuthVerifyOtpCommandHandler,
  AuthSelectWorkspaceCommandHandler,
} from '@/application/commands';

// Queries
import { AuthGetProfileHandler } from '@/application/queries';

// Interfaces
import { AUTH_JWT_SERVICE } from '@/application/interfaces';
import { ENTITLEMENT_SERVICE } from '@/application/interfaces/entitlement-service.interface';
import { QUOTA_ENFORCEMENT_SERVICE } from '@/application/interfaces/quota-enforcement-service.interface';

// Infrastructure
import { AuthService } from '@/application/services/auth.service';
import { RequestContextService } from '@/application/services/request-context.service';
import {
  JwtAuthService,
  JwtStrategy,
  GoogleStrategy,
  YoutubeStrategy,
  FacebookStrategy,
  TwitterStrategy,
  GuardedCommandBus,
  EntitlementService,
  QuotaEnforcementService,
} from '@infrastructure/auth';

// AdminControllers
import {
  AuthAdminController,
  AuthClientController,
  OAuthController,
} from '@/presentation/controllers';
import { AuthUserRmqController } from '@/presentation/controllers';

const COMMAND_HANDLERS = [
  AuthSignInCommandHandler,
  AuthSignUpCommandHandler,
  AuthSignOutCommandHandler,
  AuthResetPasswordCommandHandler,
  AuthRefreshTokenCommandHandler,
  AuthGoogleSignInCommandHandler,
  AuthSendOtpCommandHandler,
  AuthChangePasswordCommandHandler,
  AuthVerifyOtpCommandHandler,
  AuthSelectWorkspaceCommandHandler,
];

const QUERY_HANDLERS = [AuthGetProfileHandler];

const STRATEGIES = [
  GoogleStrategy,
  YoutubeStrategy,
  FacebookStrategy,
  TwitterStrategy,
];

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'secret'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
    CqrsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AuthAdminController, AuthClientController, OAuthController],
  providers: [
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,
    ...STRATEGIES,
    JwtStrategy,
    AuthService,
    RequestContextService,
    {
      provide: AUTH_JWT_SERVICE,
      useClass: JwtAuthService,
    },
    {
      provide: ENTITLEMENT_SERVICE,
      useClass: EntitlementService,
    },
    {
      provide: QUOTA_ENFORCEMENT_SERVICE,
      useClass: QuotaEnforcementService,
    },
    {
      provide: CommandBus,
      useClass: GuardedCommandBus,
    },
    AuthUserRmqController,
  ],
  exports: [
    JwtStrategy,
    AUTH_JWT_SERVICE,
    AuthService,
    ENTITLEMENT_SERVICE,
    QUOTA_ENFORCEMENT_SERVICE,
    RequestContextService,
  ],
})
export class AuthModule {
  constructor() {}
}
