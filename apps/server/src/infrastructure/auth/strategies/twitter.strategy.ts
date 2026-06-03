import { Strategy } from 'passport-twitter';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { KolProfileVerifyPlatformAccountCommand } from '@/application/commands';

@Injectable()
export class TwitterStrategy extends PassportStrategy(Strategy, 'twitter') {
  constructor(
    configService: ConfigService,
    private readonly commandBus: CommandBus,
  ) {
    super({
      consumerKey: configService.get<string>('TWITTER_CONSUMER_KEY') || 'dummy-key',
      consumerSecret: configService.get<string>('TWITTER_CONSUMER_SECRET') || 'dummy-secret',
      callbackURL: configService.get<string>('TWITTER_CALLBACK_URL') || 'http://localhost/dummy-callback',
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
