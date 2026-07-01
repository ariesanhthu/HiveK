import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PaymentCreateCommand } from './payment-create.command';
import { DURABLE_EXECUTION_CLIENT, type IDurableExecutionClient } from '@/shared/durable-execution';
import {
	PAYMENT_CREATE_WORKFLOW,
	type PaymentCreateWorkflowInput,
	type PaymentCreateWorkflowOutput,
} from '@/application/workflows';
import { PaymentCreateResponseDto } from './payment-create.dto';

@CommandHandler(PaymentCreateCommand)
export class PaymentCreateHandler implements ICommandHandler<PaymentCreateCommand> {
	constructor(
		@Inject(DURABLE_EXECUTION_CLIENT)
		private readonly executor: IDurableExecutionClient
	) {}

	async execute(command: PaymentCreateCommand): Promise<PaymentCreateResponseDto> {
		const { dto } = command;

		const input: PaymentCreateWorkflowInput = {
			idempotencyKey: dto.idempotencyKey,
			enterpriseId: dto.enterpriseId,
			userId: dto.userId ?? null,
			billId: dto.billId,
			amount: dto.amount,
			currency: dto.currency,
			description: dto.description || '',
			metadata: dto.metadata || {},
			paymentProviderId: dto.paymentProviderId,
			createdBy: dto.createdBy || 'system',
		};

		const result = await this.executor.execute<PaymentCreateWorkflowOutput>(
			PAYMENT_CREATE_WORKFLOW,
			input,
			{ workflowId: `payment-create-${dto.idempotencyKey}` }
		);

		return {
			paymentId: result.output.paymentId,
			attemptId: result.output.attemptId,
			paymentUrl: result.output.paymentUrl,
		};
	}
}
