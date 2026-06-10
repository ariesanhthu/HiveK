import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { USER_REPOSITORY, ENTERPRISE_REPOSITORY, type IUserRepository, type IEnterpriseRepository } from '@/core/interfaces/repositories';
import { EnterpriseAddUserCommand } from './enterprise-add-user.command';
import { EnterpriseUserRoot } from '@/core/aggregate-roots';
import { UserNotFoundException, InvalidUserTypeException, EnterpriseNotFoundException, EnterpriseForbiddenException } from '@/core/exceptions';
import { UserAddedToEnterpriseEvent } from '@/application/events';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { ERoleType } from '@/core/enums';

@CommandHandler(EnterpriseAddUserCommand)
export class EnterpriseAddUserCommandHandler implements ICommandHandler<EnterpriseAddUserCommand, void> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly enterpriseRepository: IEnterpriseRepository,
    private readonly eventBus: EventBus,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
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
        const foundIds = new Set(users.map(u => u.id));
        const missingIds = input.memberIds.filter(id => !foundIds.has(id));
        throw new UserNotFoundException(missingIds.join(', '));
      }

      const usersToUpdate: EnterpriseUserRoot[] = [];

      for (const user of users) {
        if (user.type !== ERoleType.ENTERPRISE || !(user instanceof EnterpriseUserRoot)) {
          throw new InvalidUserTypeException('User must be an enterprise user to be added to an enterprise');
        }

        if (!user.enterpriseIds.includes(enterpriseId)) {
          user.addEnterprise(enterpriseId);
          usersToUpdate.push(user);
        }
      }

      if (usersToUpdate.length > 0) {
        await this.userRepository.saveMany(usersToUpdate);
        for (const user of usersToUpdate) {
          this.eventBus.publish(new UserAddedToEnterpriseEvent(user.id!, enterpriseId));
        }
      }
    });
  }
}
