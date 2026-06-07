import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { USER_REPOSITORY, ENTERPRISE_REPOSITORY, type IUserRepository, type IEnterpriseRepository } from '@/core/interfaces/repositories';
import { EnterpriseRevokeUserCommand } from './enterprise-revoke-user.command';
import { EnterpriseUserRoot } from '@/core/aggregate-roots';
import { UserNotFoundException, InvalidUserTypeException, EnterpriseNotFoundException, EnterpriseForbiddenException } from '@/core/exceptions';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';

@CommandHandler(EnterpriseRevokeUserCommand)
export class EnterpriseRevokeUserCommandHandler implements ICommandHandler<EnterpriseRevokeUserCommand, void> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly enterpriseRepository: IEnterpriseRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: EnterpriseRevokeUserCommand): Promise<void> {
    await this.uow.execute(async () => {
      const { userId, enterpriseId } = command.input;
      const { requestedBy } = command;

      const enterprise = await this.enterpriseRepository.findById(enterpriseId);
      if (!enterprise) {
        throw new EnterpriseNotFoundException(enterpriseId);
      }

      if (enterprise.userId !== requestedBy) {
        throw new EnterpriseForbiddenException();
      }

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new UserNotFoundException(userId);
      }

      if (!(user instanceof EnterpriseUserRoot)) {
        throw new InvalidUserTypeException('User must be an enterprise user to be revoked from an enterprise');
      }

      user.revokeEnterprise(enterpriseId);
      await this.userRepository.save(user);
    });
  }
}
