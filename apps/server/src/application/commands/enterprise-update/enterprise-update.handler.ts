import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ENTERPRISE_REPOSITORY, type IEnterpriseRepository, UPLOADED_FILE_REPOSITORY, type IUploadedFileRepository } from '@/core/interfaces/repositories';
import { EnterpriseUpdateCommand } from './enterprise-update.command';
import { EnterpriseDto } from '@/application/dtos';
import { EnterpriseMapper } from '@/application/mappers';

@CommandHandler(EnterpriseUpdateCommand)
export class EnterpriseUpdateCommandHandler implements ICommandHandler<EnterpriseUpdateCommand, EnterpriseDto> {
  constructor(
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly enterpriseRepository: IEnterpriseRepository,
    @Inject(UPLOADED_FILE_REPOSITORY)
    private readonly uploadedFileRepository: IUploadedFileRepository,
  ) {}

  async execute(command: EnterpriseUpdateCommand): Promise<EnterpriseDto> {
    const { id, userId, input } = command;

    const enterprise = await this.enterpriseRepository.findById(id);
    if (!enterprise) {
      throw new NotFoundException(`Enterprise with ID ${id} not found`);
    }

    if (enterprise.userId !== userId) {
      throw new ForbiddenException('You do not own this enterprise profile');
    }

    if (input.logoUrlId) {
      const fileExists = await this.uploadedFileRepository.findById(input.logoUrlId);
      if (!fileExists) {
        throw new NotFoundException(`Logo file with ID ${input.logoUrlId} not found`);
      }
    }

    enterprise.update({
      companyName: input.companyName,
      description: input.description,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      website: input.website,
      taxId: input.taxId,
      logoUrlId: input.logoUrlId,
    });

    await this.enterpriseRepository.save(enterprise);

    return EnterpriseMapper.toDto(enterprise);
  }
}
