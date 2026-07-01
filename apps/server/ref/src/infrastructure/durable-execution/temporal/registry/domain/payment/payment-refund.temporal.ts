/**
 * Payment Refund Temporal Workflow
 *
 * Uses the workflow interpreter to execute steps from WorkflowDefinition.
 */

import { paymentRefundWorkflowDefinition } from '@/application/workflows/payment-refund/payment-refund.workflow';
import { createWorkflowExecutor } from '../../../workflows';

/**
 * Payment Refund Workflow
 * Executed via the generic workflow interpreter
 */
export const paymentRefundTemporalWorkflow = createWorkflowExecutor(
	paymentRefundWorkflowDefinition
);
