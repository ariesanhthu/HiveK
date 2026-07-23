import { KolProfileVerifyPlatformAccountCommand } from '@/application/commands';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    configService: ConfigService,
    private readonly commandBus: CommandBus,
  ) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID') || 'dummy-id',
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET') || 'dummy-secret',
      callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL')
        || 'http://localhost/dummy-callback',
      profileFields: ['id', 'displayName', 'emails'],
      passReqToCallback: true,
    });
  }

  async validate(req: any, accessToken: string, refreshToken: string, profile: any): Promise<any> {
    const userId = req.query.state || (req.user?.sub || req.user?.id);
    if (!userId) {
      throw new UnauthorizedException('No user state or user session provided for verification');
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
