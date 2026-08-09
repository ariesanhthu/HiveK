import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import {
  EnterpriseNotFoundException,
  EnterpriseForbiddenException,
} from '@/core/exceptions';
import {
  ENTERPRISE_REPOSITORY,
  type IEnterpriseRepository,
} from '@/core/interfaces/repositories';
import { EnterpriseUpdateCommand } from './enterprise-update.command';
import { EnterpriseDto } from '@/application/dtos';
import { EnterpriseMapper } from '@/application/mappers';
import { PhoneNumberVO } from '@/core/value-objects/phone-number.value-object';

@CommandHandler(EnterpriseUpdateCommand)
export class EnterpriseUpdateCommandHandler implements ICommandHandler<
  EnterpriseUpdateCommand,
  EnterpriseDto
> {
  constructor(
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly enterpriseRepository: IEnterpriseRepository,
  ) {}

  async execute(command: EnterpriseUpdateCommand): Promise<EnterpriseDto> {
    const { id, userId, input } = command;

    const enterprise = await this.enterpriseRepository.findById(id);
    if (!enterprise) {
      throw new EnterpriseNotFoundException(id);
    }

    if (!enterprise.isOwner(userId) && !enterprise.isSubOwner(userId)) {
      throw new EnterpriseForbiddenException();
    }

    enterprise.update({
      companyName: input.companyName,
      description: input.description,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone
        ? PhoneNumberVO.create({ value: input.contactPhone })
        : undefined,
      website: input.website,
      taxId: input.taxId,
      knowledgeBase: input.knowledgeBase
        ? {
            rawText: input.knowledgeBase.rawText,
            externalLinks: input.knowledgeBase.externalLinks || [],
            updatedAt: new Date(),
          }
        : undefined,
    });

    await this.enterpriseRepository.save(enterprise);

    return EnterpriseMapper.toDto(enterprise);
  }
}
