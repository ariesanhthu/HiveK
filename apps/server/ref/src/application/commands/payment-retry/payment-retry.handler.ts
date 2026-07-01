import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PaymentRetryCommand } from './payment-retry.command';
import { DURABLE_EXECUTION_CLIENT, type IDurableExecutionClient } from '@/shared/durable-execution';
import {
	PAYMENT_RETRY_WORKFLOW,
	type PaymentRetryWorkflowInput,
	type PaymentRetryWorkflowOutput,
} from '@/application/workflows';

@CommandHandler(PaymentRetryCommand)
export class PaymentRetryHandler implements ICommandHandler<PaymentRetryCommand> {
	constructor(
		@Inject(DURABLE_EXECUTION_CLIENT)
		private readonly executor: IDurableExecutionClient
	) {}

	async execute(command: PaymentRetryCommand): Promise<{ paymentUrl?: string }> {
		const { dto } = command;

		const input: PaymentRetryWorkflowInput = {
			paymentId: dto.paymentId,
			paymentProviderId: dto.paymentProviderId,
			idempotencyKey: dto.idempotencyKey,
			createdBy: dto.createdBy || 'system',
		};

		const result = await this.executor.execute<PaymentRetryWorkflowOutput>(
			PAYMENT_RETRY_WORKFLOW,
			input,
			{ workflowId: `payment-retry-${dto.paymentId}` }
		);

		return { paymentUrl: result.output.paymentUrl };
	}
}
