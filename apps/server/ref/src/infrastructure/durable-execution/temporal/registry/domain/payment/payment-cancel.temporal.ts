/**
 * Payment Cancel Temporal Workflow
 *
 * Uses the workflow interpreter to execute steps from WorkflowDefinition.
 */

import { paymentCancelWorkflowDefinition } from '@/application/workflows/payment-cancel/payment-cancel.workflow';
import { createWorkflowExecutor } from '../../../workflows';

/**
 * Payment Cancel Workflow
 * Executed via the generic workflow interpreter
 */
export const paymentCancelTemporalWorkflow = createWorkflowExecutor(
	paymentCancelWorkflowDefinition
);
