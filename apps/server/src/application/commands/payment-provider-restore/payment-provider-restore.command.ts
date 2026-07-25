import { Command } from '@nestjs/cqrs';
import { PaymentProviderRestoreInputDto } from './payment-provider-restore.dto';

export class PaymentProviderRestoreCommand extends Command<void> {
  constructor(public readonly input: PaymentProviderRestoreInputDto) {
    super();
  }
}
