import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
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
import { AuthGetProfileHandler } from '@/application/queries';
import { AUTH_JWT_SERVICE } from '@/application/interfaces';
import { USER_REPOSITORY, OTP_REPOSITORY } from '@/core/interfaces/repositories';
import { OtpModel, OtpSchema } from '../mongo/schemas/otp.schema';
import { MongoOtpRepository } from '../mongo/repositories/otp.repository';
import { JwtAuthService } from '../auth/jwt.service';
import { AuthService } from '@/application/services/auth.service';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { MongoUserRepository } from '../mongo/repositories';
import { UserModule } from './user.module';
import { RoleModule } from './role.module';
import { AuthController } from '@/presentation/controllers/auth.controller';
import { GoogleStrategy } from '../auth/strategies/google.strategy';
import { YoutubeStrategy } from '../auth/strategies/youtube.strategy';
import { FacebookStrategy } from '../auth/strategies/facebook.strategy';
import { TwitterStrategy } from '../auth/strategies/twitter.strategy';

const Handlers = [
  AuthSignInCommandHandler,
  AuthSignUpCommandHandler,
  AuthSignOutCommandHandler,
  AuthResetPasswordCommandHandler,
  AuthRefreshTokenCommandHandler,
  AuthGetProfileHandler,
  AuthGoogleSignInCommandHandler,
  AuthSendOtpCommandHandler,
  AuthChangePasswordCommandHandler,
  AuthVerifyOtpCommandHandler,
];

@Module({
  imports: [
    CqrsModule,
    UserModule,
    RoleModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([{ name: OtpModel.name, schema: OtpSchema }]),
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
    GoogleStrategy,
    YoutubeStrategy,
    FacebookStrategy,
    TwitterStrategy,
    AuthService,
    {
      provide: AUTH_JWT_SERVICE,
      useClass: JwtAuthService,
    },
    {
      provide: USER_REPOSITORY,
      useClass: MongoUserRepository,
    },
    {
      provide: OTP_REPOSITORY,
      useClass: MongoOtpRepository,
    },
  ],
  exports: [AUTH_JWT_SERVICE, AuthService, USER_REPOSITORY, OTP_REPOSITORY, PassportModule, JwtStrategy],
})
export class AuthModule { }
