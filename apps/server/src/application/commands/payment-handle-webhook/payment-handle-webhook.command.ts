import { Command } from '@nestjs/cqrs';
import { PaymentHandleWebhookInputDto } from './payment-handle-webhook.dto';

export class PaymentHandleWebhookCommand extends Command<{ statusCode: number; payload?: Record<string, unknown> }> {
  constructor(public readonly input: PaymentHandleWebhookInputDto) {
    super();
  }
}
