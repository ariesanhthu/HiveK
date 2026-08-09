import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { IJwtPayload } from '@/application/interfaces/auth-jwt.interface';
import type { AuthenticatedRequest } from '@/core/types/common.type';
import { CommandBus } from '@nestjs/cqrs';
import {
  type ILoggerService,
  LOGGER_SERVICE,
  UserCheckValidCommand,
} from '@/application';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly commandBus: CommandBus,
    @Inject(LOGGER_SERVICE)
    private readonly logger: ILoggerService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: AuthenticatedRequest) => {
          if (req && req.cookies) {
            return req.cookies['access_token'] || null;
          }
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'secret'),
    });
    this.logger.setContext(JwtStrategy.name);
  }

  async validate(payload: IJwtPayload) {
    const user = await this.commandBus.execute(
      new UserCheckValidCommand({ id: payload.sub }),
    );
    const jwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.roleId,
      type: user.type,
      isEmailVerified: user.isEmailVerified,
      ...(payload.enterpriseId && { enterpriseId: payload.enterpriseId }),
      ...(payload.ownerId && { ownerId: payload.ownerId }),
    };
    this.logger.debug(`Validating user`, undefined, jwtPayload);

    return jwtPayload;
  }
}
