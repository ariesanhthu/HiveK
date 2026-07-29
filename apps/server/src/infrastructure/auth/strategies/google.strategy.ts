import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { AuthGoogleSignInCommand } from '@/application/commands';
import { ERoleType } from '@/core/enums';
import type { Profile as GoogleProfile } from 'passport-google-oauth20';
import { Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly commandBus: CommandBus,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: Express.Request & { query?: { state?: string } },
    accessToken: string,
    refreshToken: string,
    profile: GoogleProfile,
  ): Promise<unknown> {
    const { id, emails, displayName, photos } = profile;
    const email = emails[0].value;

    const stateStr = req.query?.state;
    let type = ERoleType.KOL; // Default
    if (stateStr) {
      try {
        const state = JSON.parse(stateStr);
        if (state.type) {
          type = state.type as ERoleType;
        }
      } catch (e) {
        if (Object.values(ERoleType).includes(stateStr as ERoleType)) {
          type = stateStr as ERoleType;
        }
      }
    }

    const result = await this.commandBus.execute(
      new AuthGoogleSignInCommand({
        googleId: id,
        email,
        displayName: displayName || undefined,
        avatarUrl: photos?.[0]?.value || null,
        type,
      }),
    );

    return result;
  }
}
