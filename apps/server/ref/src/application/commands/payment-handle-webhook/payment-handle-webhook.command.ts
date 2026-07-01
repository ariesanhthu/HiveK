import { Command } from '@nestjs/cqrs';
import { type PaymentHandleWebhookDto } from './payment-handle-webhook.dto';
import type { JsonRecord } from '@/shared/types';

export type PaymentHandleWebhookResult = { statusCode: number; payload?: JsonRecord };

export class PaymentHandleWebhookCommand extends Command<PaymentHandleWebhookResult> {
	constructor(public readonly dto: PaymentHandleWebhookDto) {
		super();
	}
}
