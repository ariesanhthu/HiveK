/**
 * Payment Capture Workflow Definition
 *
 * Captures an authorized payment (typically triggered by IPN/webhook).
 * Multi-step workflow with validation, provider execution, result processing, and compensation.
 *
 * Steps:
 * 1. validate - Pre-flight checks (can capture, amount valid, idempotency)
 * 2. executeCapture - Call provider.capture() gateway
 * 3. processResult - Record transaction + transition status + publish events
 *    └─ compensation: refund-failed-capture (if capture succeeded but processing failed)
 */

import { type WorkflowDefinition } from '@/shared/durable-execution';
import {
	PAYMENT_CAPTURE_WORKFLOW,
	VALIDATE_CAPTURE_ACTIVITY,
	EXECUTE_CAPTURE_ACTIVITY,
	PROCESS_CAPTURE_ACTIVITY,
	REFUND_FAILED_CAPTURE_ACTIVITY,
} from './payment-capture.token';
import type { JsonRecord } from '@/shared/types';

// Input/Output types
export interface PaymentCaptureWorkflowInput {
	paymentId: string;
	amount?: number;
	capturedBy: string;
	idempotencyKey?: string; // Optional for duplicate detection
}

export interface PaymentCaptureWorkflowOutput {
	success: boolean;
	alreadyCaptured: boolean;
}

// Context type (accumulates step outputs)
interface PaymentCaptureContext {
	input: PaymentCaptureWorkflowInput;
	validate?: {
		canCapture: boolean;
		alreadyCaptured: boolean;
		attemptId?: string;
		paymentProviderId?: string;
		providerTransactionId?: string;
		captureAmount?: number;
		currency?: string;
	};
	providerResult?: {
		isSuccess: boolean;
		data: JsonRecord | undefined;
		requestPayload: JsonRecord | undefined;
		responsePayload: JsonRecord | undefined;
		requestHeaders: JsonRecord | undefined;
		responseHeaders: JsonRecord | undefined;
		requestTimestamp: Date;
		responseTimestamp: Date;
	};
	processResult?: {
		success: boolean;
	};
}

// Workflow definition
export const paymentCaptureWorkflowDefinition: WorkflowDefinition<
	PaymentCaptureWorkflowInput,
	PaymentCaptureWorkflowOutput,
	PaymentCaptureContext
> = {
	token: PAYMENT_CAPTURE_WORKFLOW,
	name: 'payment-capture',

	steps: [
		{
			name: 'validate',
			activity: VALIDATE_CAPTURE_ACTIVITY,
			input: (ctx) => ({
				paymentId: ctx.input.paymentId,
				amount: ctx.input.amount,
				idempotencyKey: ctx.input.idempotencyKey,
			}),
			outputKey: 'validate',
		},
		{
			name: 'executeCapture',
			activity: EXECUTE_CAPTURE_ACTIVITY,
			when: (ctx) => !!(ctx.validate?.canCapture && !ctx.validate?.alreadyCaptured),
			input: (ctx) => ({
				paymentProviderId: ctx.validate!.paymentProviderId!,
				providerTransactionId: ctx.validate!.providerTransactionId!,
				attemptId: ctx.validate!.attemptId!,
				captureAmount: ctx.validate!.captureAmount!,
				currency: ctx.validate!.currency!,
			}),
			outputKey: 'providerResult',
			compensation: {
				activity: REFUND_FAILED_CAPTURE_ACTIVITY,
				input: (ctx) => ({
					paymentId: ctx.input.paymentId,
					attemptId: ctx.validate!.attemptId!,
					refundAmount: ctx.validate!.captureAmount!,
					currency: ctx.validate!.currency!,
					providerCaptureSucceeded: ctx.providerResult?.isSuccess === true,
				}),
			},
		},
		{
			name: 'processResult',
			activity: PROCESS_CAPTURE_ACTIVITY,
			when: (ctx) => !!(ctx.validate?.canCapture && !ctx.validate?.alreadyCaptured),
			input: (ctx) => ({
				paymentId: ctx.input.paymentId,
				attemptId: ctx.validate!.attemptId!,
				captureAmount: ctx.validate!.captureAmount!,
				currency: ctx.validate!.currency!,
				result: ctx.providerResult!,
			}),
			outputKey: 'processResult',
		},
	],

	output: (ctx) => ({
		success: ctx.processResult?.success ?? false,
		alreadyCaptured: ctx.validate?.alreadyCaptured ?? false,
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
