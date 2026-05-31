import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { EnterpriseConflictException } from '@/core/exceptions';
import { ENTERPRISE_REPOSITORY, type IEnterpriseRepository } from '@/core/interfaces/repositories';
import { EnterpriseRoot } from '@/core/aggregate-roots';
import { EnterpriseCreateCommand } from './enterprise-create.command';
import { EnterpriseDto } from '@/application/dtos';
import { EnterpriseMapper } from '@/application/mappers';

@CommandHandler(EnterpriseCreateCommand)
export class EnterpriseCreateCommandHandler implements ICommandHandler<EnterpriseCreateCommand, EnterpriseDto> {
  constructor(
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly enterpriseRepository: IEnterpriseRepository,
  ) {}

  async execute(command: EnterpriseCreateCommand): Promise<EnterpriseDto> {
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

    return EnterpriseMapper.toDto(enterprise);
  }
}
