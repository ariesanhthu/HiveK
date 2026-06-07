import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { EnterpriseConflictException, UserNotFoundException } from '@/core/exceptions';
import { ENTERPRISE_REPOSITORY, USER_REPOSITORY, type IEnterpriseRepository, type IUserRepository } from '@/core/interfaces/repositories';
import { EnterpriseRoot, EnterpriseUserRoot } from '@/core/aggregate-roots';
import { EnterpriseCreateCommand } from './enterprise-create.command';
import { EnterpriseDto } from '@/application/dtos';
import { EnterpriseMapper } from '@/application/mappers';
import { IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';

@CommandHandler(EnterpriseCreateCommand)
export class EnterpriseCreateCommandHandler implements ICommandHandler<EnterpriseCreateCommand, EnterpriseDto> {
  constructor(
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly enterpriseRepository: IEnterpriseRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(UNIT_OF_WORK)
    private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: EnterpriseCreateCommand): Promise<EnterpriseDto> {
    return this.uow.execute(async () => {
      const { userId, input } = command;

      const existing = await this.enterpriseRepository.findByUserId(userId);
      if (existing) {
        throw new EnterpriseConflictException('User already has an enterprise profile');
      }

      const enterprise = EnterpriseRoot.create({
        userId,
        companyName: input.companyName,
        description: input.description,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
        website: input.website ?? null,
        taxId: input.taxId ?? null,
        logoUrlId: null,
        isVerified: false,
      });

      await this.enterpriseRepository.save(enterprise);

      // Add enterprise to user's list
      const user = await this.userRepository.findById(userId);
      if (user && user instanceof EnterpriseUserRoot) {
        user.addEnterprise(enterprise.id!);
        await this.userRepository.save(user);
      }

      return EnterpriseMapper.toDto(enterprise);
    });
  }
}
