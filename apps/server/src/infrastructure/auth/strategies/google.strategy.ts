import { AuthGoogleSignInCommand } from '@/application/commands';
import { AuthConfig } from '@/configs';
import { ERoleType } from '@/core/enums';
import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    authConfig: AuthConfig,
    private readonly commandBus: CommandBus,
  ) {
    super({
      clientID: authConfig.getGoogleClientId() || 'dummy-id',
      clientSecret: authConfig.getGoogleClientSecret() || 'dummy-secret',
      callbackURL: authConfig.getGoogleCallbackUrl() || 'http://localhost/dummy-callback',
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(req: any, accessToken: string, refreshToken: string, profile: any): Promise<any> {
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
        if (Object.values(ERoleType).includes(stateStr as any)) {
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
