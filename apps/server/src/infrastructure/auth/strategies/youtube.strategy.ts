import { KolProfileVerifyPlatformAccountCommand } from '@/application/commands';
import { AuthConfig } from '@/configs';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

@Injectable()
export class YoutubeStrategy extends PassportStrategy(Strategy, 'youtube') {
  constructor(
    authConfig: AuthConfig,
    private readonly commandBus: CommandBus,
  ) {
    super({
      clientID: authConfig.getYoutubeClientId(),
      clientSecret: authConfig.getYoutubeClientSecret(),
      callbackURL: authConfig.getYoutubeCallbackUrl() || 'http://localhost/dummy-callback',
      scope: ['email', 'profile', 'https://www.googleapis.com/auth/youtube.readonly'],
      passReqToCallback: true,
    });
  }

  async validate(req: any, accessToken: string, refreshToken: string, profile: any): Promise<any> {
    const userId = req.query.state;
    if (!userId) {
      throw new UnauthorizedException('No user state provided for verification');
    }

    const { id, emails, displayName } = profile;
    const email = emails?.[0]?.value || '';

    const result = await this.commandBus.execute(
      new KolProfileVerifyPlatformAccountCommand(
        userId,
        'youtube',
        id, // externalId
        email || id, // uniqueId
        displayName || 'YouTube Channel',
        email,
      ),
    );

    return result;
  }
}
