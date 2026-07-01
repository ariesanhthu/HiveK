import { Command } from '@nestjs/cqrs';
import { PaymentProviderDeleteInputDto } from './payment-provider-delete.dto';

export class PaymentProviderDeleteCommand extends Command<void> {
  constructor(public readonly input: PaymentProviderDeleteInputDto) {
    super();
  }
}
