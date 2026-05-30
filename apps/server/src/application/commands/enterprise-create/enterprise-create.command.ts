import { Command } from '@nestjs/cqrs';
import { EnterpriseCreateInputDto } from './enterprise-create.dto';
import { EnterpriseDto } from '@/application/dtos';

export class EnterpriseCreateCommand extends Command<EnterpriseDto> {
  constructor(
    public readonly userId: string,
    public readonly input: EnterpriseCreateInputDto,
  ) {
    super();
  }
}
