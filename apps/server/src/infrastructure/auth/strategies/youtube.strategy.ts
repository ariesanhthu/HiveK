import { Strategy } from 'passport-google-oauth20';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { VerifyPlatformAccountCommand } from '@/application/commands';

@Injectable()
export class YoutubeStrategy extends PassportStrategy(Strategy, 'youtube') {
  constructor(
    configService: ConfigService,
    private readonly commandBus: CommandBus,
  ) {
    super({
      clientID: configService.get<string>('YOUTUBE_CLIENT_ID') || 'dummy-id',
      clientSecret: configService.get<string>('YOUTUBE_CLIENT_SECRET') || 'dummy-secret',
      callbackURL: configService.get<string>('YOUTUBE_CALLBACK_URL') || 'http://localhost/dummy-callback',
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
      new VerifyPlatformAccountCommand(
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
