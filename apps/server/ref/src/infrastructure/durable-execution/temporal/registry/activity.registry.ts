/**
 * Activity Registry
 *
 * Collects and binds activity classes from application layer for Temporal worker.
 * Uses NestJS ModuleRef to get activity instances with proper DI.
 *
 * Supports:
 * - Symbol tokens via @Activity decorator
 * - Legacy string names (backward compatibility)
 * - Automatic discovery from decorated classes
 */

import { type ModuleRef } from '@nestjs/core';
import {
	getActivityToken,
	getActivityName,
	hasActivityDecorator,
} from '@/shared/durable-execution/decorators';

// Payment Create Activities
import {
	ValidateCreateActivity,
	CreatePaymentEntryActivity,
	RequestPaymentUrlActivity,
	CancelAttemptActivity,
} from '@/application/workflows/payment-create/activities';

// Payment Retry Activities
import {
	ValidateRetryActivity,
	CreateAttemptActivity,
} from '@/application/workflows/payment-retry/activities';

// Payment Cancel Activities
import {
	ValidateCancelActivity,
	CancelAtProviderActivity,
	CancelPaymentActivity,
} from '@/application/workflows/payment-cancel/activities';

// Payment Capture Activities
import {
	ValidateCaptureActivity,
	ExecuteCaptureActivity,
	ProcessCaptureActivity,
	RefundFailedCaptureActivity,
} from '@/application/workflows/payment-capture/activities';

// Payment Refund Activities
import {
	ValidateRefundActivity,
	ExecuteRefundActivity,
	ProcessRefundActivity,
} from '@/application/workflows/payment-refund/activities';

// Payment Handle Webhook Activities
import {
	ValidateWebhookActivity,
	MarkWebhookReceivedActivity,
	ParseWebhookActivity,
	ProcessWebhookResultActivity,
} from '@/application/workflows/payment-handle-webhook/activities';

// Subscription Update Activities
import {
	ValidateUpdateActivity,
	DeductCreditActivity,
	RefundCreditActivity,
	UpdateSubscriptionActivity,
} from '@/application/workflows/subscription-update/activities';
import { StepOneActivity } from '@/application/workflows/example/activities/step-one.activity';
import { StepTwoActivity } from '@/application/workflows/example/activities/step-two.activity';
import { StepThreeActivity } from '@/application/workflows/example/activities/step-three.activity';
import { CompensatingStepOneActivity } from '@/application/workflows/example/activities/compensating-step-one.activity';
import { CompensatingStepTwoActivity } from '@/application/workflows/example/activities/compensating-step-two.activity';

/** Constructor type cho activity có DI — cast registry vì Nest DI không khớp `unknown[]`. */
interface ActivityWithExecute {
	execute: (...args: unknown[]) => Promise<unknown>;
}

type ActivityConstructor = abstract new (...args: never) => ActivityWithExecute;

/**
 * Activity class registry - maps class to its method name
 */
const activityClasses = [
	// Payment Create (4)
	ValidateCreateActivity,
	CreatePaymentEntryActivity,
	RequestPaymentUrlActivity,
	CancelAttemptActivity,
	// Payment Retry (4 total, 2 new + 2 reused from create)
	ValidateRetryActivity,
	CreateAttemptActivity,
	// Payment Cancel (3)
	ValidateCancelActivity,
	CancelAtProviderActivity,
	CancelPaymentActivity,
	// Payment Capture (4)
	ValidateCaptureActivity,
	ExecuteCaptureActivity,
	ProcessCaptureActivity,
	RefundFailedCaptureActivity,
	// Payment Refund (3)
	ValidateRefundActivity,
	ExecuteRefundActivity,
	ProcessRefundActivity,
	// Payment Handle Webhook (4)
	ValidateWebhookActivity,
	MarkWebhookReceivedActivity,
	ParseWebhookActivity,
	ProcessWebhookResultActivity,
	// Subscription Update (4)
	ValidateUpdateActivity,
	RefundCreditActivity,
	DeductCreditActivity,
	UpdateSubscriptionActivity,

	// Example
	StepOneActivity,
	StepTwoActivity,
	StepThreeActivity,
	CompensatingStepOneActivity,
	CompensatingStepTwoActivity,
] as unknown as ActivityConstructor[];

export type ActivityClass = ActivityConstructor;

/**
 * Activity metadata for registration
 */
export interface ActivityMetadata {
	/** Activity class constructor */
	activityClass: ActivityConstructor;
	/** Symbol token (if decorated) */
	token?: symbol;
	/** String name (token description or class name) */
	name: string;
	/** Bound execute function */
	executeFn: (...args: unknown[]) => Promise<unknown>;
}

/**
 * Build activity map for Temporal worker
 *
 * Creates a mapping of activity names to their execute functions.
 * Supports both symbol tokens and string names for backward compatibility.
 *
 * @param moduleRef - NestJS ModuleRef to get activity instances
 * @returns Object mapping activity names to bound execute functions
 */
export function buildActivityMap(
	moduleRef: ModuleRef
): Record<string, (...args: unknown[]) => Promise<unknown>> {
	const activityMap: Record<string, (...args: unknown[]) => Promise<unknown>> = {};
	const metadata = discoverActivities(moduleRef);

	for (const meta of metadata) {
		// Register by string name (required for Temporal)
		activityMap[meta.name] = meta.executeFn;
	}

	return activityMap;
}

/**
 * Discover all activities with metadata
 *
 * Extracts activity information including tokens, names, and bound functions.
 * This metadata can be used for debugging, logging, or building registries.
 *
 * @param moduleRef - NestJS ModuleRef to get activity instances
 * @returns Array of activity metadata
 */
export function discoverActivities(moduleRef: ModuleRef): ActivityMetadata[] {
	const metadata: ActivityMetadata[] = [];
	const activities = getActivityClasses();
	if (activities.length === 0) {
		console.warn('No activity classes registered in activityClasses array');
		return metadata;
	}
	for (const ActivityClass of activities) {
		try {
			const instance = moduleRef.get(ActivityClass, { strict: false });

			// Check if class has @Activity decorator
			const hasDecorator = hasActivityDecorator(ActivityClass);
			const token = hasDecorator ? getActivityToken(ActivityClass) : undefined;

			// Determine activity name
			// Priority: decorator name > token description > class name
			let name: string;
			if (hasDecorator) {
				const decoratorName = getActivityName(ActivityClass);
				name = decoratorName || token?.description || ActivityClass.name;
			} else {
				// Legacy: use class name
				name = ActivityClass.name;
			}

			const runnable = instance;
			const executeFn: (...args: unknown[]) => Promise<unknown> = (...args) =>
				runnable.execute(...args);
			metadata.push({
				activityClass: ActivityClass,
				token,
				name,
				executeFn,
			});
		} catch (error) {
			console.warn(`Activity ${ActivityClass.name} not found in module context:`, error);
		}
	}

	return metadata;
}

/**
 * Get activity metadata by token
 *
 * @param moduleRef - NestJS ModuleRef
 * @param token - Symbol token to lookup
 * @returns Activity metadata or undefined
 */
export function getActivityByToken(
	moduleRef: ModuleRef,
	token: symbol
): ActivityMetadata | undefined {
	const metadata = discoverActivities(moduleRef);
	return metadata.find((meta) => meta.token === token);
}

/**
 * Get activity metadata by name
 *
 * @param moduleRef - NestJS ModuleRef
 * @param name - String name to lookup
 * @returns Activity metadata or undefined
 */
export function getActivityByName(
	moduleRef: ModuleRef,
	name: string
): ActivityMetadata | undefined {
	const metadata = discoverActivities(moduleRef);
	return metadata.find((meta) => meta.name === name);
}

/**
 * Resolve activity identifier to function
 *
 * Supports both symbol tokens and string names.
 * This is used by workflow interpreter to find activities at runtime.
 *
 * @param moduleRef - NestJS ModuleRef
 * @param identifier - Symbol token or string name
 * @returns Bound execute function or undefined
 */
export function resolveActivity(
	moduleRef: ModuleRef,
	identifier: string | symbol
): ((...args: unknown[]) => Promise<unknown>) | undefined {
	if (typeof identifier === 'symbol') {
		const meta = getActivityByToken(moduleRef, identifier);
		return meta?.executeFn;
	} else {
		const meta = getActivityByName(moduleRef, identifier);
		return meta?.executeFn;
	}
}

/**
 * Get all activity classes for module registration
 */
export function getActivityClasses(): readonly ActivityConstructor[] {
	return activityClasses;
}

// Re-export activity classes for module registration
export {
	// Payment Create
	ValidateCreateActivity,
	CreatePaymentEntryActivity,
	RequestPaymentUrlActivity,
	CancelAttemptActivity,
	// Payment Retry
	ValidateRetryActivity,
	CreateAttemptActivity,
	// Payment Cancel
	ValidateCancelActivity,
	CancelAtProviderActivity,
	CancelPaymentActivity,
	// Payment Capture
	ValidateCaptureActivity,
	ExecuteCaptureActivity,
	ProcessCaptureActivity,
	RefundFailedCaptureActivity,
	// Payment Refund
	ValidateRefundActivity,
	ExecuteRefundActivity,
	ProcessRefundActivity,
	// Payment Handle Webhook
	ValidateWebhookActivity,
	MarkWebhookReceivedActivity,
	ParseWebhookActivity,
	ProcessWebhookResultActivity,
	// Subscription Update
	ValidateUpdateActivity,
	RefundCreditActivity,
	DeductCreditActivity,
	UpdateSubscriptionActivity,
	StepOneActivity,
	StepTwoActivity,
	StepThreeActivity,
	CompensatingStepOneActivity,
	CompensatingStepTwoActivity,
};
