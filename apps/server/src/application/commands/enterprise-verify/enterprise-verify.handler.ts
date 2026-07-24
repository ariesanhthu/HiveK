import { EnterpriseNotFoundException } from '@/core/exceptions';
import { ENTERPRISE_REPOSITORY, type IEnterpriseRepository } from '@/core/interfaces/repositories';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { EnterpriseVerifyCommand } from './enterprise-verify.command';

@CommandHandler(EnterpriseVerifyCommand)
export class EnterpriseVerifyCommandHandler implements
  ICommandHandler<
    EnterpriseVerifyCommand,
    void
  >
{
  constructor(
    @Inject(ENTERPRISE_REPOSITORY) private readonly enterpriseRepository: IEnterpriseRepository,
  ) {}

  async execute(command: EnterpriseVerifyCommand): Promise<any> {
    const { enterpriseId } = command.input;
    const ent = await this.enterpriseRepository.findById(enterpriseId);

    if (!ent) {
      throw new EnterpriseNotFoundException(enterpriseId);
    }

    ent.update({ isVerified: true });

    await this.enterpriseRepository.save(ent);
  }
}
