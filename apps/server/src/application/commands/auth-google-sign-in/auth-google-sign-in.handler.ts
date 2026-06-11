import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthGoogleSignInCommand } from './auth-google-sign-in.command';
import { AuthGoogleSignInOutputDto } from './auth-google-sign-in.dto';
import { Inject } from '@nestjs/common';
import { USER_REPOSITORY, ROLE_REPOSITORY } from '@/core/interfaces/repositories';
import type { IUserRepository, IRoleRepository } from '@/core/interfaces/repositories';
import { ERoleType } from '@/core/enums';
import { KOLUserRoot } from '@/core/aggregate-roots';
import { AuthService } from '@/application/services/auth.service';
import { UserDeletedException, RoleNotFoundException } from '@/core/exceptions';
import { PhoneNumberVO } from '@/core/value-objects/phone-number.value-object';
import { OutboxService } from '@/application/services/outbox.service';
import { EventMapper } from '@/application/mappers';

@CommandHandler(AuthGoogleSignInCommand)
export class AuthGoogleSignInCommandHandler implements ICommandHandler<AuthGoogleSignInCommand, AuthGoogleSignInOutputDto> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    private readonly authService: AuthService,
    private readonly outboxService: OutboxService,
  ) { }

  async execute(command: AuthGoogleSignInCommand): Promise<AuthGoogleSignInOutputDto> {
    const { input } = command;

    const normalizedEmail = this.authService.normalizeEmail(input.email);
    let user = await this.userRepository.findByEmail(normalizedEmail);

    if (user) {
      if (user.deleteAt) {
        throw new UserDeletedException();
      }
      if (!user.googleId) {
        user.updateGoogleId(input.googleId);
      }
    } else {
      const defaultRole = await this.roleRepository.findByTitle(ERoleType.KOL);
      if (!defaultRole) {
        throw new RoleNotFoundException(ERoleType.KOL);
      }

      user = KOLUserRoot.create({
        email: normalizedEmail,
        phone: PhoneNumberVO.create({ value: '+0000000000' }),
        passwordHash: '',
        fullName: input.displayName || 'Google User',
        type: ERoleType.KOL,
        roleId: defaultRole.id!,
        googleId: input.googleId,
      });
    }

    const payload = {
      sub: user.id!,
      email: user.email,
      role: user.roleId,
      type: user.type,
    };

    const { accessToken, refreshToken } = await this.authService.generateTokens(payload);

    user.updateRefreshToken(refreshToken);
    await this.userRepository.save(user);

    const events = EventMapper.mapToIntegrationEvents(user.domainEvents);
    if (events.length > 0) {
      await this.outboxService.enqueueMany(events.map(event => ({
        eventType: event.eventType,
        payload: event.payload,
        metadata: event.metadata,
        transport: event.transport,
        maxRetry: 5,
      })));
    }

    return { accessToken, refreshToken };
  }
}
