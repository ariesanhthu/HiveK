/**
 * Payment Create Temporal Workflow
 *
 * Uses the workflow interpreter to execute steps from WorkflowDefinition.
 */

import { paymentCreateWorkflowDefinition } from '@/application/workflows/payment-create/payment-create.workflow';
import { createWorkflowExecutor } from '../../../workflows';

/**
 * Payment Create Workflow
 * Executed via the generic workflow interpreter
 */
export const paymentCreateTemporalWorkflow = createWorkflowExecutor(
	paymentCreateWorkflowDefinition
);
