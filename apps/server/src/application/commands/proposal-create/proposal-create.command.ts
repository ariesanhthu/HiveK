import { Command } from '@nestjs/cqrs';
import { ProposalCreateInputDto } from './proposal-create.dto';
import { ProposalDto } from '@/application/dtos';

export class ProposalCreateCommand extends Command<ProposalDto> {
  constructor(
    public readonly input: ProposalCreateInputDto,
    public readonly requestedBy: string,
  ) {
    super();
  }
}
