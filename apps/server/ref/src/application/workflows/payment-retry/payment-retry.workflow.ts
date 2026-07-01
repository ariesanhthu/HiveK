/**
 * Payment Retry Workflow Definition
 *
 * Retries a failed payment with a new provider attempt.
 * Multi-step workflow with SAGA compensation pattern.
 *
 * Steps:
 * 1. validate - Pre-flight checks (payment can retry, provider active)
 * 2. createAttempt - Create new payment attempt
 * 3. requestPaymentUrl - Get payment URL from provider (with compensation)
 */

import { type WorkflowDefinition } from '@/shared/durable-execution';
import {
	PAYMENT_RETRY_WORKFLOW,
	VALIDATE_RETRY_ACTIVITY,
	CREATE_ATTEMPT_ACTIVITY,
	REQUEST_PAYMENT_URL_ACTIVITY,
	CANCEL_ATTEMPT_ACTIVITY,
} from './payment-retry.token';

// Input/Output types
export interface PaymentRetryWorkflowInput {
	paymentId: string;
	paymentProviderId: string;
	idempotencyKey: string;
	createdBy: string;
}

export interface PaymentRetryWorkflowOutput {
	attemptId: string;
	paymentUrl?: string;
	isSuccess: boolean;
}

// Context type (accumulates step outputs)
interface PaymentRetryContext {
	input: PaymentRetryWorkflowInput;
	validate?: {
		valid: boolean;
		alreadyExists: boolean;
		existingAttemptId?: string;
	};
	createAttempt?: {
		attemptId: string;
		existingAttemptPaymentUrl?: string;
	};
	urlResult?: {
		isSuccess: boolean;
		paymentUrl?: string;
	};
}

// Workflow definition
export const paymentRetryWorkflowDefinition: WorkflowDefinition<
	PaymentRetryWorkflowInput,
	PaymentRetryWorkflowOutput,
	PaymentRetryContext
> = {
	token: PAYMENT_RETRY_WORKFLOW,
	name: 'payment-retry',

	steps: [
		{
			name: 'validate',
			activity: VALIDATE_RETRY_ACTIVITY,
			input: (ctx) => ({
				paymentId: ctx.input.paymentId,
				paymentProviderId: ctx.input.paymentProviderId,
				idempotencyKey: ctx.input.idempotencyKey,
			}),
			outputKey: 'validate',
		},
		{
			name: 'createAttempt',
			activity: CREATE_ATTEMPT_ACTIVITY,
			when: (ctx) => !ctx.validate?.alreadyExists,
			input: (ctx) => ({
				paymentId: ctx.input.paymentId,
				paymentProviderId: ctx.input.paymentProviderId,
				idempotencyKey: ctx.input.idempotencyKey,
			}),
			compensation: {
				activity: CANCEL_ATTEMPT_ACTIVITY,
				input: (ctx) => ({
					paymentId: ctx.input.paymentId,
					attemptId: ctx.createAttempt!.attemptId,
					reason: 'Provider request failed during payment retry',
				}),
			},
			outputKey: 'createAttempt',
		},
		{
			name: 'requestPaymentUrl',
			activity: REQUEST_PAYMENT_URL_ACTIVITY,
			when: (ctx) => !ctx.validate?.alreadyExists,
			input: (ctx) => ({
				paymentId: ctx.input.paymentId,
				attemptId: ctx.createAttempt!.attemptId,
			}),
			activityOptions: {
				timeout: 30000, // 30 seconds timeout
				retryPolicy: {
					maxAttempts: 2,
				},
			},
			outputKey: 'urlResult',
		},
	],

	output: (ctx) => ({
		attemptId: ctx.validate?.existingAttemptId || ctx.createAttempt!.attemptId,
		paymentUrl: ctx.validate?.alreadyExists
			? ctx.createAttempt?.existingAttemptPaymentUrl // Already processed, no new URL
			: ctx.urlResult?.paymentUrl,
		isSuccess: ctx.validate?.alreadyExists
			? true // Existing attempt considered success
			: (ctx.urlResult?.isSuccess ?? false),
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
