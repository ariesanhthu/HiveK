/**
 * Payment Cancel Workflow Definition
 *
 * Cancels a pending payment.
 * Multi-step workflow with validation, provider notification, and state update.
 *
 * Steps:
 * 1. validate - Pre-flight checks (can cancel, not terminal, not processing)
 * 2. cancelAtProvider - Notify gateway (empty for now, future-proof)
 * 3. cancelPayment - Update state and publish events inside transaction
 */

import { type WorkflowDefinition } from '@/shared/durable-execution';
import {
	PAYMENT_CANCEL_WORKFLOW,
	VALIDATE_CANCEL_ACTIVITY,
	CANCEL_AT_PROVIDER_ACTIVITY,
	CANCEL_PAYMENT_ACTIVITY,
} from './payment-cancel.token';

// Input/Output types
export interface PaymentCancelWorkflowInput {
	paymentId: string;
	reason: string;
	canceledBy: string;
}

export interface PaymentCancelWorkflowOutput {
	success: boolean;
	alreadyCanceled: boolean;
}

// Context type (accumulates step outputs)
interface PaymentCancelContext {
	input: PaymentCancelWorkflowInput;
	validate?: {
		canCancel: boolean;
		alreadyCanceled: boolean;
	};
	cancelAtProvider?: {
		notified: boolean;
	};
	cancelPayment?: {
		success: boolean;
	};
}

// Workflow definition
export const paymentCancelWorkflowDefinition: WorkflowDefinition<
	PaymentCancelWorkflowInput,
	PaymentCancelWorkflowOutput,
	PaymentCancelContext
> = {
	token: PAYMENT_CANCEL_WORKFLOW,
	name: 'payment-cancel',

	steps: [
		{
			name: 'validate',
			activity: VALIDATE_CANCEL_ACTIVITY,
			input: (ctx) => ({
				paymentId: ctx.input.paymentId,
			}),
			outputKey: 'validate',
		},
		{
			name: 'cancelAtProvider',
			activity: CANCEL_AT_PROVIDER_ACTIVITY,
			when: (ctx) => !!(ctx.validate?.canCancel && !ctx.validate?.alreadyCanceled),
			input: (ctx) => ({
				paymentId: ctx.input.paymentId,
			}),
			outputKey: 'cancelAtProvider',
			activityOptions: {
				timeout: 30000, // 30 seconds timeout
				retryPolicy: {
					maxAttempts: 2,
				},
			},
		},
		{
			name: 'cancelPayment',
			activity: CANCEL_PAYMENT_ACTIVITY,
			when: (ctx) => !!(ctx.validate?.canCancel && !ctx.validate?.alreadyCanceled),
			input: (ctx) => ({
				paymentId: ctx.input.paymentId,
				reason: ctx.input.reason,
				canceledBy: ctx.input.canceledBy,
			}),
			outputKey: 'cancelPayment',
		},
	],

	output: (ctx) => ({
		success: ctx.cancelPayment?.success ?? false,
		alreadyCanceled: ctx.validate?.alreadyCanceled ?? false,
	}),

	defaultActivityOptions: {
		retryPolicy: {
			maxAttempts: 1,
			initialInterval: 1000,
			maxInterval: 10000,
			backoffCoefficient: 2,
		},
	},
};
