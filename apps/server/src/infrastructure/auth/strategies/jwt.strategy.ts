import { type ILoggerService, LOGGER_SERVICE, UserCheckValidCommand } from '@/application';
import type { IJwtPayload } from '@/application/interfaces/auth-jwt.interface';
import { AuthConfig } from '@/configs';
import { Inject, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    authConfig: AuthConfig,
    private readonly commandBus: CommandBus,
    @Inject(LOGGER_SERVICE) private readonly logger: ILoggerService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: any) => {
          if (req && req.cookies) {
            return req.cookies['access_token'] || null;
          }
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: authConfig.getJwtSecret(),
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
    };
    this.logger.debug(`Validating user`, undefined, jwtPayload);

    return jwtPayload;
  }
}
