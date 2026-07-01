/**
 * Payment Refund Workflow Definition
 *
 * Refunds a captured payment.
 * Multi-step workflow with validation, provider execution, and result processing.
 *
 * Steps:
 * 1. validate - Pre-flight checks (can refund, amount valid, idempotency)
 * 2. executeRefund - Call provider.refund() gateway
 * 3. processResult - Record transaction + transition status + publish events
 */

import { type WorkflowDefinition } from '@/shared/durable-execution';
import {
	PAYMENT_REFUND_WORKFLOW,
	VALIDATE_REFUND_ACTIVITY,
	EXECUTE_REFUND_ACTIVITY,
	PROCESS_REFUND_ACTIVITY,
} from './payment-refund.token';
import type { JsonRecord } from '@/shared/types';

// Input/Output types
export interface PaymentRefundWorkflowInput {
	paymentId: string;
	amount?: number; // Optional for partial refund
	refundedBy: string;
	idempotencyKey?: string; // Optional for duplicate detection
}

export interface PaymentRefundWorkflowOutput {
	success: boolean;
	alreadyRefunded: boolean;
}

// Context type (accumulates step outputs)
interface PaymentRefundContext {
	input: PaymentRefundWorkflowInput;
	validate?: {
		canRefund: boolean;
		alreadyRefunded: boolean;
		attemptId?: string;
		paymentProviderId?: string;
		providerTransactionId?: string;
		refundAmount?: number;
		currency?: string;
	};
	providerResult?: {
		isSuccess: boolean;
		data: JsonRecord | undefined;
		requestPayload?: JsonRecord | undefined;
		responsePayload?: JsonRecord | undefined;
		requestHeaders?: JsonRecord | undefined;
		responseHeaders?: JsonRecord | undefined;
		requestTimestamp?: Date | undefined;
		responseTimestamp?: Date | undefined;
	};
	processResult?: {
		success: boolean;
	};
}

// Workflow definition
export const paymentRefundWorkflowDefinition: WorkflowDefinition<
	PaymentRefundWorkflowInput,
	PaymentRefundWorkflowOutput,
	PaymentRefundContext
> = {
	token: PAYMENT_REFUND_WORKFLOW,
	name: 'payment-refund',

	steps: [
		{
			name: 'validate',
			activity: VALIDATE_REFUND_ACTIVITY,
			input: (ctx) => ({
				paymentId: ctx.input.paymentId,
				amount: ctx.input.amount,
				idempotencyKey: ctx.input.idempotencyKey,
			}),
			outputKey: 'validate',
		},
		{
			name: 'executeRefund',
			activity: EXECUTE_REFUND_ACTIVITY,
			when: (ctx) => !!(ctx.validate?.canRefund && !ctx.validate?.alreadyRefunded),
			input: (ctx) => ({
				paymentProviderId: ctx.validate!.paymentProviderId!,
				providerTransactionId: ctx.validate!.providerTransactionId!,
				refundAmount: ctx.validate!.refundAmount!,
				currency: ctx.validate!.currency!,
			}),
			outputKey: 'providerResult',
		},
		{
			name: 'processResult',
			activity: PROCESS_REFUND_ACTIVITY,
			when: (ctx) => !!(ctx.validate?.canRefund && !ctx.validate?.alreadyRefunded),
			input: (ctx) => ({
				paymentId: ctx.input.paymentId,
				attemptId: ctx.validate!.attemptId!,
				refundAmount: ctx.validate!.refundAmount!,
				currency: ctx.validate!.currency!,
				result: ctx.providerResult!,
				refundedBy: ctx.input.refundedBy,
			}),
			outputKey: 'processResult',
		},
	],

	output: (ctx) => ({
		success: ctx.processResult?.success ?? false,
		alreadyRefunded: ctx.validate?.alreadyRefunded ?? false,
	}),

	defaultActivityOptions: {
		retryPolicy: {
			maxAttempts: 3,
			initialInterval: 1000,
			maxInterval: 10000,
			backoffCoefficient: 2,
		},
	},
};
