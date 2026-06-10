import { Module, Global } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
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
} from '@/application/commands';

// Queries
import { AuthGetProfileHandler } from '@/application/queries';

// Interfaces
import { AUTH_JWT_SERVICE } from '@/application/interfaces';

// Infrastructure
import { AuthService } from '@/application/services/auth.service';
import { 
  JwtAuthService, 
  JwtStrategy, 
  GoogleStrategy, 
  YoutubeStrategy, 
  FacebookStrategy, 
  TwitterStrategy 
} from '@infrastructure/auth';

// Modules

// AdminControllers
import { AuthAdminController, AuthClientController, OAuthController } from '@/presentation/controllers'

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
];

const QUERY_HANDLERS = [
  AuthGetProfileHandler,
];

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
    ...STRATEGIES,JwtStrategy,
    AuthService,
    {
      provide: AUTH_JWT_SERVICE,  
      useClass: JwtAuthService,
    },
  ],
  exports: [JwtStrategy,  AUTH_JWT_SERVICE, AuthService],
})
export class AuthModule {
  constructor(
  ) {}
}
