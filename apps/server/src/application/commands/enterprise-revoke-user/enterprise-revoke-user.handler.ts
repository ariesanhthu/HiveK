import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { USER_REPOSITORY, ENTERPRISE_REPOSITORY, type IUserRepository, type IEnterpriseRepository } from '@/core/interfaces/repositories';
import { EnterpriseRevokeUserCommand } from './enterprise-revoke-user.command';
import { EnterpriseUserRoot } from '@/core/aggregate-roots';
import { UserNotFoundException, InvalidUserTypeException, EnterpriseNotFoundException, EnterpriseForbiddenException } from '@/core/exceptions';
import { type IUnitOfWork, UNIT_OF_WORK, EVENT_SERVICE } from '@/application/interfaces';
import type { IEventService } from '@/application/interfaces';
import { ERoleType } from '@/core/enums';

@CommandHandler(EnterpriseRevokeUserCommand)
export class EnterpriseRevokeUserCommandHandler implements ICommandHandler<EnterpriseRevokeUserCommand, void> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly enterpriseRepository: IEnterpriseRepository,
    @Inject(EVENT_SERVICE)
    private readonly eventService: IEventService,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: EnterpriseRevokeUserCommand): Promise<void> {
    await this.uow.execute(async () => {
      const { input, enterpriseId, requestedBy } = command;
      const { memberIds } = input;

      const enterprise = await this.enterpriseRepository.findById(enterpriseId);
      if (!enterprise) {
        throw new EnterpriseNotFoundException(enterpriseId);
      }

      if (enterprise.userId !== requestedBy) {
        throw new EnterpriseForbiddenException();
      }

      const users = await this.userRepository.findByIds(memberIds);
      if (users.length !== memberIds.length) {
        const foundIds = new Set(users.map(u => u.id));
        const missingIds = memberIds.filter(id => !foundIds.has(id));
        throw new UserNotFoundException(missingIds.join(', '));
      }

      const usersToUpdate: EnterpriseUserRoot[] = [];

      for (const user of users) {
        if (user.type !== ERoleType.ENTERPRISE || !(user instanceof EnterpriseUserRoot)) {
          throw new InvalidUserTypeException('User must be an enterprise user to be revoked from an enterprise');
        }
        
        if (user.enterpriseIds.includes(enterpriseId)) {
          user.revokeEnterprise(enterpriseId);
          usersToUpdate.push(user);
        }
      }

      if (usersToUpdate.length > 0) {
        await this.userRepository.saveMany(usersToUpdate);

        await this.eventService.publishEvents(usersToUpdate);
      }
    });
  }
}
