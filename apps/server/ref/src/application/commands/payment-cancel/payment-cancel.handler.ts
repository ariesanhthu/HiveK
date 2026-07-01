import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PaymentCancelCommand } from './payment-cancel.command';
import { DURABLE_EXECUTION_CLIENT, type IDurableExecutionClient } from '@/shared/durable-execution';
import {
	PAYMENT_CANCEL_WORKFLOW,
	type PaymentCancelWorkflowInput,
	type PaymentCancelWorkflowOutput,
} from '@/application/workflows';

@CommandHandler(PaymentCancelCommand)
export class PaymentCancelHandler implements ICommandHandler<PaymentCancelCommand> {
	constructor(
		@Inject(DURABLE_EXECUTION_CLIENT)
		private readonly executor: IDurableExecutionClient
	) {}

	async execute(command: PaymentCancelCommand): Promise<void> {
		const { dto } = command;

		const input: PaymentCancelWorkflowInput = {
			paymentId: dto.paymentId,
			reason: dto.reason,
			canceledBy: dto.canceledBy,
		};

		await this.executor.execute<PaymentCancelWorkflowOutput>(PAYMENT_CANCEL_WORKFLOW, input, {
			workflowId: `payment-cancel-${dto.paymentId}`,
		});
	}
}
