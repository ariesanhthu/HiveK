/**
 * Payment Create Workflow Definition
 *
 * Creates a new payment with first attempt and requests payment URL.
 * Multi-step workflow with SAGA compensation pattern.
 *
 * Steps:
 * 1. validate - Pre-flight checks (idempotency, bill status, provider)
 * 2. createEntry - Create payment entity with first attempt
 * 3. requestPaymentUrl - Get payment URL from provider (with compensation)
 */

import { type WorkflowDefinition } from '@/shared/durable-execution';
import {
	PAYMENT_CREATE_WORKFLOW,
	VALIDATE_CREATE_ACTIVITY,
	CREATE_PAYMENT_ENTRY_ACTIVITY,
	REQUEST_PAYMENT_URL_ACTIVITY,
	CANCEL_ATTEMPT_ACTIVITY,
} from './payment-create.token';

// Input/Output types
export interface PaymentCreateWorkflowInput {
	idempotencyKey: string;
	enterpriseId: string;
	userId: string | null;
	billId: string;
	amount: number;
	currency: string;
	description: string;
	metadata: Record<string, unknown>;
	createdBy: string;
	paymentProviderId: string;
}

export interface PaymentCreateWorkflowOutput {
	paymentId: string;
	attemptId: string;
	paymentUrl?: string;
}

// Context type (accumulates step outputs)
interface PaymentCreateContext {
	input: PaymentCreateWorkflowInput;
	validate?: {
		valid: boolean;
		alreadyExists: boolean;
		existingPaymentId?: string;
		existingAttemptId?: string;
		billStatus?: string;
	};
	entry?: {
		paymentId: string;
		attemptId: string;
	};
	urlResult?: {
		isSuccess: boolean;
		paymentUrl?: string;
	};
}

// Workflow definition
export const paymentCreateWorkflowDefinition: WorkflowDefinition<
	PaymentCreateWorkflowInput,
	PaymentCreateWorkflowOutput,
	PaymentCreateContext
> = {
	token: PAYMENT_CREATE_WORKFLOW,
	name: 'payment-create',

	steps: [
		{
			name: 'validate',
			activity: VALIDATE_CREATE_ACTIVITY,
			input: (ctx) => ({
				idempotencyKey: ctx.input.idempotencyKey,
				billId: ctx.input.billId,
				enterpriseId: ctx.input.enterpriseId,
				paymentProviderId: ctx.input.paymentProviderId,
			}),
			outputKey: 'validate',
		},
		{
			name: 'createEntry',
			activity: CREATE_PAYMENT_ENTRY_ACTIVITY,
			when: (ctx) => !ctx.validate?.alreadyExists,
			input: (ctx) => ({
				idempotencyKey: ctx.input.idempotencyKey,
				enterpriseId: ctx.input.enterpriseId,
				userId: ctx.input.userId,
				billId: ctx.input.billId,
				amount: ctx.input.amount,
				currency: ctx.input.currency,
				description: ctx.input.description,
				metadata: ctx.input.metadata,
				createdBy: ctx.input.createdBy,
				paymentProviderId: ctx.input.paymentProviderId,
			}),
			compensation: {
				activity: CANCEL_ATTEMPT_ACTIVITY,
				input: (ctx) => ({
					paymentId: ctx.entry!.paymentId,
					attemptId: ctx.entry!.attemptId,
					reason: 'Provider request failed during payment creation',
				}),
			},
			outputKey: 'entry',
		},
		{
			name: 'requestPaymentUrl',
			activity: REQUEST_PAYMENT_URL_ACTIVITY,
			when: (ctx) => !ctx.validate?.alreadyExists,
			input: (ctx) => ({
				paymentId: ctx.entry!.paymentId,
				attemptId: ctx.entry!.attemptId,
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
		paymentId: ctx.validate?.existingPaymentId || ctx.entry!.paymentId,
		attemptId: ctx.validate?.existingAttemptId || ctx.entry!.attemptId,
		paymentUrl: ctx.validate?.alreadyExists
			? undefined // Already processed, no new URL
			: ctx.urlResult?.paymentUrl,
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
