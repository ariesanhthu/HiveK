/**
 * Subscription Update Temporal Workflow
 *
 * Uses the workflow interpreter to execute steps from WorkflowDefinition.
 */

import { subscriptionUpdateWorkflowDefinition } from '@/application/workflows/subscription-update/subscription-update.workflow';
import { createWorkflowExecutor } from '../../../workflows';

/**
 * Subscription Update Workflow
 * Executed via the generic workflow interpreter
 *
 * Triggered by PaymentCompletedEvent, this workflow:
 * 1. Validates the bill and subscription
 * 2. Refunds credit for removed packages (future)
 * 3. Deducts applied credit from wallet
 * 4. Updates subscription with new packages
 */
export const subscriptionUpdateTemporalWorkflow = createWorkflowExecutor(
	subscriptionUpdateWorkflowDefinition
);
