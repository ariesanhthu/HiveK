import { Command } from '@nestjs/cqrs';
import { PaymentCancelInputDto } from './payment-cancel.dto';

export class PaymentCancelCommand extends Command<void> {
  constructor(public readonly input: PaymentCancelInputDto) {
    super();
  }
}
