import { Command } from '@nestjs/cqrs';
import { PaymentVoidAuthorizationInputDto } from './payment-void-authorization.dto';

export class PaymentVoidAuthorizationCommand extends Command<void> {
  constructor(public readonly input: PaymentVoidAuthorizationInputDto) {
    super();
  }
}
