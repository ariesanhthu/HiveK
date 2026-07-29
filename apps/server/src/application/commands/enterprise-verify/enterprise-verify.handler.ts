import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { EnterpriseVerifyCommand } from './enterprise-verify.command';
import { Inject } from '@nestjs/common';
import {
  ENTERPRISE_REPOSITORY,
  type IEnterpriseRepository,
} from '@/core/interfaces/repositories';
import { EnterpriseNotFoundException } from '@/core/exceptions';

@CommandHandler(EnterpriseVerifyCommand)
export class EnterpriseVerifyCommandHandler implements ICommandHandler<
  EnterpriseVerifyCommand,
  void
> {
  constructor(
    @Inject(ENTERPRISE_REPOSITORY)
    private readonly enterpriseRepository: IEnterpriseRepository,
  ) {}

  async execute(command: EnterpriseVerifyCommand): Promise<void> {
    const { enterpriseId } = command.input;
    const ent = await this.enterpriseRepository.findById(enterpriseId);

    if (!ent) {
      throw new EnterpriseNotFoundException(enterpriseId);
    }

    ent.update({ isVerified: true });

    await this.enterpriseRepository.save(ent);
  }
}
