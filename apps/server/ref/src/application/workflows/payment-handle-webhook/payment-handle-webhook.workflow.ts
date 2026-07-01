/**
 * Payment Handle Webhook Workflow Definition
 *
 * Processes incoming payment provider webhooks with security validation,
 * idempotency handling, and immediate response to prevent timeouts.
 *
 * Steps:
 * 1. validate - Security checks, payment lookup, signature verification
 * 2. markReceived - Idempotency checkpoint (separate transaction)
 * 3. parse - Provider-specific webhook parsing
 * 4. processResult - Record transaction, update state, emit events
 *
 * Domain events (emitted in step 4) trigger subsequent workflows asynchronously:
 * - PaymentAuthorizedEvent → may trigger auto-capture
 * - PaymentCapturedEvent → update wallet, notifications
 * - PaymentRefundedEvent → update wallet balance
 * - PaymentCanceledEvent → release inventory
 */

import { type WorkflowDefinition } from '@/shared/durable-execution';
import {
	PAYMENT_HANDLE_WEBHOOK_WORKFLOW,
	VALIDATE_WEBHOOK_ACTIVITY,
	MARK_WEBHOOK_RECEIVED_ACTIVITY,
	PARSE_WEBHOOK_ACTIVITY,
	PROCESS_WEBHOOK_RESULT_ACTIVITY,
} from './payment-handle-webhook.token';
import {
	type EPaymentTransactionType,
	type EPaymentStatus,
	type EPaymentAttemptStatus,
} from '@/core';
import type { JsonRecord } from '@/shared/types';

// Input/Output types
export interface PaymentHandleWebhookWorkflowInput {
	code: string; // Provider code
	data: JsonRecord; // Webhook payload from provider
}

export interface PaymentHandleWebhookWorkflowOutput {
	success: boolean;
	statusCode: number; // HTTP status code to return to provider
	payload?: JsonRecord; // Response payload for provider
}

// Context type (accumulates step outputs)
interface PaymentHandleWebhookContext {
	input: PaymentHandleWebhookWorkflowInput;
	validate?: {
		isValid: boolean;
		attemptId: string;
		paymentId: string;
		providerCode: string;
		providerId: string;
	};
	markReceived?: {
		success: boolean;
		alreadyReceived: boolean;
		oldAttemptStatus: EPaymentAttemptStatus;
		newAttemptStatus: EPaymentAttemptStatus;
	};
	parse?: {
		action: 'payment' | 'refund' | 'cancel' | 'other';
		data: {
			transactionId?: string;
			isSuccess: boolean;
			status: string;
			errorMessage?: string;
		};
		amount: number;
		currency: string;
		transactionType: EPaymentTransactionType;
		metadata?: JsonRecord;
		rawPayload: JsonRecord;
		providerResponse: {
			statusCode: number;
			payload?: JsonRecord;
		};
	};
	processResult?: {
		success: boolean;
		oldPaymentStatus: EPaymentStatus;
		newPaymentStatus: EPaymentStatus;
		oldAttemptStatus: EPaymentAttemptStatus;
		newAttemptStatus: EPaymentAttemptStatus;
	};
}

export const paymentHandleWebhookWorkflowDefinition: WorkflowDefinition<
	PaymentHandleWebhookWorkflowInput,
	PaymentHandleWebhookWorkflowOutput,
	PaymentHandleWebhookContext
> = {
	token: PAYMENT_HANDLE_WEBHOOK_WORKFLOW,
	name: 'payment-handle-webhook',

	steps: [
		{
			name: 'validate',
			activity: VALIDATE_WEBHOOK_ACTIVITY,
			input: (ctx) => ({
				code: ctx.input.code,
				data: ctx.input.data,
			}),
			outputKey: 'validate',
		},
		{
			name: 'markReceived',
			activity: MARK_WEBHOOK_RECEIVED_ACTIVITY,
			input: (ctx) => ({
				paymentId: ctx.validate!.paymentId,
				attemptId: ctx.validate!.attemptId,
			}),
			outputKey: 'markReceived',
		},
		{
			name: 'parse',
			activity: PARSE_WEBHOOK_ACTIVITY,
			input: (ctx) => ({
				providerCode: ctx.validate!.providerCode,
				providerId: ctx.validate!.providerId,
				webhookData: ctx.input.data,
			}),
			outputKey: 'parse',
		},
		{
			name: 'processResult',
			activity: PROCESS_WEBHOOK_RESULT_ACTIVITY,
			input: (ctx) => ({
				paymentId: ctx.validate!.paymentId,
				attemptId: ctx.validate!.attemptId,
				transactionType: ctx.parse!.transactionType,
				amount: ctx.parse!.amount,
				currency: ctx.parse!.currency,
				data: ctx.parse!.data,
				rawPayload: ctx.parse!.rawPayload,
				metadata: ctx.parse!.metadata,
			}),
			outputKey: 'processResult',
		},
	],

	output: (ctx) => ({
		success: ctx.processResult?.success ?? false,
		statusCode: ctx.parse?.providerResponse?.statusCode ?? 200,
		payload: ctx.parse?.providerResponse?.payload,
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
