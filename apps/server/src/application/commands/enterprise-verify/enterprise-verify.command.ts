import { Command } from '@nestjs/cqrs';
import { EnterpriseVerifyDto } from './enterprise-verify.dto';

export class EnterpriseVerifyCommand extends Command<void> {
  constructor(public readonly input: EnterpriseVerifyDto) {
    super();
  }
}
