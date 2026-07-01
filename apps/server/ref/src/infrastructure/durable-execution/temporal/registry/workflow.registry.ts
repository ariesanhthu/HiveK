/**
 * Workflow Registry
 *
 * Maps application workflow tokens to Temporal workflow function names.
 * Used by TemporalDurableExecutionClient to resolve workflow tokens.
 */

// Payment workflows (commented out for testing)
import {
	PAYMENT_CREATE_WORKFLOW,
	PAYMENT_RETRY_WORKFLOW,
	PAYMENT_CAPTURE_WORKFLOW,
	PAYMENT_CANCEL_WORKFLOW,
	PAYMENT_REFUND_WORKFLOW,
	PAYMENT_HANDLE_WEBHOOK_WORKFLOW,
} from '@/application/workflows';

// Subscription workflows
import { SUBSCRIPTION_UPDATE_WORKFLOW } from '@/application/workflows';
import { EXAMPLE_WORKFLOW } from '@/application/workflows/example/example.token';

/**
 * Registry mapping workflow symbols to Temporal workflow function names
 */
const workflowRegistry = new Map<symbol, string>([
	// Payment workflows (commented out for testing)
	[PAYMENT_CREATE_WORKFLOW, 'paymentCreateTemporalWorkflow'],
	[PAYMENT_RETRY_WORKFLOW, 'paymentRetryTemporalWorkflow'],
	[PAYMENT_CAPTURE_WORKFLOW, 'paymentCaptureTemporalWorkflow'],
	[PAYMENT_CANCEL_WORKFLOW, 'paymentCancelTemporalWorkflow'],
	[PAYMENT_REFUND_WORKFLOW, 'paymentRefundTemporalWorkflow'],
	[PAYMENT_HANDLE_WEBHOOK_WORKFLOW, 'paymentHandleWebhookTemporalWorkflow'],

	// Subscription workflows
	[SUBSCRIPTION_UPDATE_WORKFLOW, 'subscriptionUpdateTemporalWorkflow'],

	[EXAMPLE_WORKFLOW, 'exampleWorkflow'],
]);

/**
 * Get Temporal workflow function name from workflow token
 */
export function getWorkflowName(token: symbol): string | undefined {
	return workflowRegistry.get(token);
}

/**
 * Get all registered workflow names (for worker registration)
 */
export function getAllWorkflowNames(): string[] {
	return Array.from(workflowRegistry.values());
}

/**
 * Check if a workflow token is registered
 */
export function isWorkflowRegistered(token: symbol): boolean {
	return workflowRegistry.has(token);
}
