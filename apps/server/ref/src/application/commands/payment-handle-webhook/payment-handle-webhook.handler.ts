import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PaymentHandleWebhookCommand } from './payment-handle-webhook.command';
import { DURABLE_EXECUTION_CLIENT, type IDurableExecutionClient } from '@/shared/durable-execution';
import {
	PAYMENT_HANDLE_WEBHOOK_WORKFLOW,
	type PaymentHandleWebhookWorkflowInput,
	type PaymentHandleWebhookWorkflowOutput,
} from '@/application/workflows';
import type { JsonRecord } from '@/shared/types';

@CommandHandler(PaymentHandleWebhookCommand)
export class PaymentHandleWebhookHandler implements ICommandHandler<PaymentHandleWebhookCommand> {
	constructor(
		@Inject(DURABLE_EXECUTION_CLIENT)
		private readonly executor: IDurableExecutionClient
	) {}

	async execute(
		command: PaymentHandleWebhookCommand
	): Promise<{ statusCode: number; payload?: JsonRecord }> {
		const { dto } = command;

		const input: PaymentHandleWebhookWorkflowInput = {
			code: dto.code,
			data: dto.data,
		};

		const result = await this.executor.execute<PaymentHandleWebhookWorkflowOutput>(
			PAYMENT_HANDLE_WEBHOOK_WORKFLOW,
			input,
			{
				workflowId: `payment-handle-webhook-${dto.code}-${Date.now()}`,
			}
		);

		return {
			statusCode: result.output.statusCode,
			payload: result.output.payload,
		};
	}
}
