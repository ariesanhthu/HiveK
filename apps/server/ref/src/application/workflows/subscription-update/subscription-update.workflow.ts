/**
 * Subscription Update Workflow Definition
 *
 * Triggered by PaymentCompletedEvent after successful payment.
 * Updates subscription by adding new packages from bill and handling wallet operations.
 *
 * Steps:
 * 1. validate - Check bill/subscription exists, calculate credit operations
 * 2. refundCredit - Refund removed packages (Phase 1: returns 0)
 * 3. deductCredit - Deduct credit applied from bill
 * 4. updateSubscription - Add packages, recalculate quotas/permissions
 *
 * Idempotency: Wallet operations use idempotency keys
 * Atomicity: Temporal ensures all-or-nothing execution
 * Consistency: Optimistic locking on subscription updates
 */

import { type WorkflowDefinition } from '@/shared/durable-execution';
import {
	SUBSCRIPTION_UPDATE_WORKFLOW,
	VALIDATE_UPDATE_ACTIVITY,
	REFUND_CREDIT_ACTIVITY,
	DEDUCT_CREDIT_ACTIVITY,
	UPDATE_SUBSCRIPTION_ACTIVITY,
} from './subscription-update.token';

// Input/Output types
export interface SubscriptionUpdateWorkflowInput {
	billId: string;
}

export interface SubscriptionUpdateWorkflowOutput {
	success: boolean;
	subscriptionVersion: number;
}

// Context type (accumulates step outputs)
interface SubscriptionUpdateContext {
	input: SubscriptionUpdateWorkflowInput;
	validate: {
		subscriptionId: string;
		canUpdate: boolean;
		enterpriseId: string;
		creditToDeduct: number;
		currency: string;
	};
	refundCredit?: {
		refundedAmount: number;
		transactionId?: string;
	};
	deductCredit?: {
		deductedAmount: number;
		transactionId: string;
	};
	updateSubscription?: {
		success: boolean;
		newVersion: number;
	};
}

export const subscriptionUpdateWorkflowDefinition: WorkflowDefinition<
	SubscriptionUpdateWorkflowInput,
	SubscriptionUpdateWorkflowOutput,
	SubscriptionUpdateContext
> = {
	token: SUBSCRIPTION_UPDATE_WORKFLOW,
	name: 'subscription-update',

	steps: [
		{
			name: 'validate',
			activity: VALIDATE_UPDATE_ACTIVITY,
			input: (ctx) => ({
				billId: ctx.input.billId,
			}),
			outputKey: 'validate',
		},
		{
			name: 'refundCredit',
			activity: REFUND_CREDIT_ACTIVITY,
			when: (ctx) => ctx.validate?.canUpdate ?? false,
			input: (ctx) => ({
				subscriptionId: ctx.validate.subscriptionId,
				billId: ctx.input.billId,
				amount: ctx.validate.creditToDeduct,
				currency: ctx.validate.currency,
			}),
			outputKey: 'refundCredit',
		},
		{
			name: 'deductCredit',
			activity: DEDUCT_CREDIT_ACTIVITY,
			when: (ctx) => ctx.validate?.canUpdate ?? false,
			input: (ctx) => ({
				subscriptionId: ctx.validate.subscriptionId,
				billId: ctx.input.billId,
				creditToDeduct: ctx.validate.creditToDeduct,
				currency: ctx.validate.currency,
			}),
			outputKey: 'deductCredit',
		},
		{
			name: 'updateSubscription',
			activity: UPDATE_SUBSCRIPTION_ACTIVITY,
			when: (ctx) => ctx.validate?.canUpdate ?? false,
			input: (ctx) => ({
				subscriptionId: ctx.validate.subscriptionId,
				billId: ctx.input.billId,
			}),
			outputKey: 'updateSubscription',
		},
	],

	output: (ctx) => ({
		success: ctx.updateSubscription?.success ?? false,
		subscriptionVersion: ctx.updateSubscription?.newVersion ?? 0,
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
