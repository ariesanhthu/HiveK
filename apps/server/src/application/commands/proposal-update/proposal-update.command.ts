import { ProposalDto } from '@/application/dtos';
import { Command } from '@nestjs/cqrs';
import { ProposalUpdateInputDto } from './proposal-update.dto';

export class ProposalUpdateCommand extends Command<ProposalDto> {
  constructor(
    public readonly id: string,
    public readonly input: ProposalUpdateInputDto,
    public readonly requestedBy: string,
  ) {
    super();
  }
}
