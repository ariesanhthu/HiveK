import { EVENT_SERVICE, type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import type { IEventService } from '@/application/interfaces';
import { EnterpriseUserRoot } from '@/core/aggregate-roots';
import { ERoleType } from '@/core/enums';
import {
  EnterpriseForbiddenException,
  EnterpriseNotFoundException,
  InvalidUserTypeException,
  UserNotFoundException,
} from '@/core/exceptions';
import {
  ENTERPRISE_REPOSITORY,
  type IEnterpriseRepository,
  type IUserRepository,
  USER_REPOSITORY,
} from '@/core/interfaces/repositories';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EnterpriseAddUserCommand } from './enterprise-add-user.command';

@CommandHandler(EnterpriseAddUserCommand)
export class EnterpriseAddUserCommandHandler implements
  ICommandHandler<
    EnterpriseAddUserCommand,
    void
  >
{
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(ENTERPRISE_REPOSITORY) private readonly enterpriseRepository: IEnterpriseRepository,
    @Inject(EVENT_SERVICE) private readonly eventService: IEventService,
    @Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: EnterpriseAddUserCommand): Promise<void> {
    await this.uow.execute(async () => {
      const { requestedBy, input, enterpriseId } = command;

      const enterprise = await this.enterpriseRepository.findById(enterpriseId);
      if (!enterprise) {
        throw new EnterpriseNotFoundException(enterpriseId);
      }

      if (enterprise.userId !== requestedBy) {
        throw new EnterpriseForbiddenException();
      }

      const users = await this.userRepository.findByIds(input.memberIds);
      if (users.length !== input.memberIds.length) {
        const foundIds = new Set(users.map((u) => u.id));
        const missingIds = input.memberIds.filter((id) => !foundIds.has(id));
        throw new UserNotFoundException(missingIds.join(', '));
      }

      const usersToUpdate: EnterpriseUserRoot[] = [];

      for (const user of users) {
        if (
          user.type !== ERoleType.ENTERPRISE
          || !(user instanceof EnterpriseUserRoot)
        ) {
          throw new InvalidUserTypeException(
            'User must be an enterprise user to be added to an enterprise',
          );
        }

        if (!user.enterpriseIds.includes(enterpriseId)) {
          user.addEnterprise(enterpriseId);
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
