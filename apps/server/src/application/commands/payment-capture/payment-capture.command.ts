import { Command } from '@nestjs/cqrs';
import { PaymentCaptureInputDto } from './payment-capture.dto';

export class PaymentCaptureCommand extends Command<void> {
  constructor(public readonly input: PaymentCaptureInputDto) {
    super();
  }
}
