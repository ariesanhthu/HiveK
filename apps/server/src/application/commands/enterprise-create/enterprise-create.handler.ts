import { EnterpriseDto } from '@/application/dtos';
import { type IUnitOfWork, UNIT_OF_WORK } from '@/application/interfaces';
import { EnterpriseMapper } from '@/application/mappers';
import { EnterpriseRoot, EnterpriseUserRoot } from '@/core/aggregate-roots';
import {
  EnterpriseConflictException,
  InvalidUserTypeException,
  UserNotFoundException,
} from '@/core/exceptions';
import {
  ENTERPRISE_REPOSITORY,
  type IEnterpriseRepository,
  type IUserRepository,
  USER_REPOSITORY,
} from '@/core/interfaces/repositories';
import { PhoneNumberVO } from '@/core/value-objects/phone-number.value-object';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EnterpriseCreateCommand } from './enterprise-create.command';

@CommandHandler(EnterpriseCreateCommand)
export class EnterpriseCreateCommandHandler
  implements ICommandHandler<EnterpriseCreateCommand, EnterpriseDto>
{
  constructor(
    @Inject(ENTERPRISE_REPOSITORY) private readonly enterpriseRepository: IEnterpriseRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: IUserRepository,
    @Inject(UNIT_OF_WORK) private readonly uow: IUnitOfWork,
  ) {}

  async execute(command: EnterpriseCreateCommand): Promise<EnterpriseDto> {
    return this.uow.execute(async () => {
      const { userId, input } = command;

      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new UserNotFoundException(userId);
      }

      if (!(user instanceof EnterpriseUserRoot)) {
        throw new InvalidUserTypeException(
          'User must be an enterprise user to create an enterprise profile',
        );
      }

      const existing = await this.enterpriseRepository.findByUserId(userId);
      if (existing) {
        throw new EnterpriseConflictException('User already has an enterprise profile');
      }

      const enterprise = EnterpriseRoot.create({
        userId,
        companyName: input.companyName,
        description: input.description,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone
          ? PhoneNumberVO.create({ value: input.contactPhone })
          : undefined,
        website: input.website ?? null,
        taxId: input.taxId ?? null,
        isVerified: false,
      });

      await this.enterpriseRepository.save(enterprise);

      user.addEnterprise(enterprise.id!);
      await this.userRepository.save(user);

      return EnterpriseMapper.toDto(enterprise);
    });
  }
}
