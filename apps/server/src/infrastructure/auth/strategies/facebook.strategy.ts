import { KolProfileVerifyPlatformAccountCommand } from '@/application/commands';
import { AuthConfig } from '@/configs';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    authConfig: AuthConfig,
    private readonly commandBus: CommandBus,
  ) {
    super({
      clientID: authConfig.getFacebookAppId(),
      clientSecret: authConfig.getFacebookAppSecret(),
      callbackURL: authConfig.getFacebookCallbackUrl()
        || 'http://localhost/dummy-callback',
      profileFields: ['id', 'displayName', 'emails'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const userId = req.query.state || req.user?.sub || req.user?.id;
    if (!userId) {
      throw new UnauthorizedException(
        'No user state or user session provided for verification',
      );
    }

    const { id, displayName, emails } = profile;
    const email = emails?.[0]?.value || '';

    const result = await this.commandBus.execute(
      new KolProfileVerifyPlatformAccountCommand(
        userId,
        'facebook',
        id, // externalId
        email || id, // uniqueId
        displayName || 'Facebook Profile',
        email,
      ),
    );

    return result;
  }
}
