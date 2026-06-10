import { Command } from '@nestjs/cqrs';
import { EnterpriseUpdateInputDto } from './enterprise-update.dto';
import { EnterpriseDto } from '@/application/dtos';

export class EnterpriseUpdateCommand extends Command<EnterpriseDto> {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly input: EnterpriseUpdateInputDto,
  ) {
    super();
  }
}
