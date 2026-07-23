import { EnterpriseDto } from '@/application/dtos';
import { Command } from '@nestjs/cqrs';
import { EnterpriseCreateInputDto } from './enterprise-create.dto';

export class EnterpriseCreateCommand extends Command<EnterpriseDto> {
  constructor(
    public readonly userId: string,
    public readonly input: EnterpriseCreateInputDto,
  ) {
    super();
  }
}
