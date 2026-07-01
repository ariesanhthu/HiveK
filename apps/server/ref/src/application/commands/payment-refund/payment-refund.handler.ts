import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PaymentRefundCommand } from './payment-refund.command';
import { DURABLE_EXECUTION_CLIENT, type IDurableExecutionClient } from '@/shared/durable-execution';
import {
	PAYMENT_REFUND_WORKFLOW,
	type PaymentRefundWorkflowInput,
	type PaymentRefundWorkflowOutput,
} from '@/application/workflows';

@CommandHandler(PaymentRefundCommand)
export class PaymentRefundHandler implements ICommandHandler<PaymentRefundCommand> {
	constructor(
		@Inject(DURABLE_EXECUTION_CLIENT)
		private readonly executor: IDurableExecutionClient
	) {}

	async execute(command: PaymentRefundCommand): Promise<void> {
		const { dto } = command;

		const input: PaymentRefundWorkflowInput = {
			paymentId: dto.paymentId,
			amount: dto.amount,
			refundedBy: dto.refundedBy,
			idempotencyKey: dto.idempotencyKey,
		};

		await this.executor.execute<PaymentRefundWorkflowOutput>(PAYMENT_REFUND_WORKFLOW, input, {
			workflowId: `payment-refund-${dto.paymentId}`,
		});
	}
}
