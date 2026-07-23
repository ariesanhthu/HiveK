import { KolProfileVerifyPlatformAccountCommand } from '@/application/commands';
import { AuthConfig } from '@/configs';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-twitter';

@Injectable()
export class TwitterStrategy extends PassportStrategy(Strategy, 'twitter') {
  constructor(
    authConfig: AuthConfig,
    private readonly commandBus: CommandBus,
  ) {
    super({
      consumerKey: authConfig.getTwitterConsumerKey(),
      consumerSecret: authConfig.getTwitterConsumerSecret(),
      callbackURL: authConfig.getTwitterCallbackUrl() || 'http://localhost/dummy-callback',
      includeEmail: true,
      passReqToCallback: true,
    });
  }

  async validate(req: any, token: string, tokenSecret: string, profile: any): Promise<any> {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('No authenticated user session found for verification');
    }

    const { id, username, displayName, emails } = profile;
    const email = emails?.[0]?.value || '';

    const result = await this.commandBus.execute(
      new KolProfileVerifyPlatformAccountCommand(
        userId,
        'twitter',
        id, // externalId
        username || id, // uniqueId
        displayName || username || 'Twitter Profile',
        email,
      ),
    );

    return result;
  }
}
