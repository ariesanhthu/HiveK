import { Command } from '@nestjs/cqrs';
import { PaymentRetryInputDto } from './payment-retry.dto';

export class PaymentRetryCommand extends Command<{ paymentUrl?: string }> {
  constructor(public readonly input: PaymentRetryInputDto) {
    super();
  }
}
