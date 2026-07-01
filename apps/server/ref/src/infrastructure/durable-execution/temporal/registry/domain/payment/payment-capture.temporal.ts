/**
 * Payment Capture Temporal Workflow
 *
 * Uses the workflow interpreter to execute steps from WorkflowDefinition.
 */

import { paymentCaptureWorkflowDefinition } from '@/application/workflows/payment-capture/payment-capture.workflow';
import { createWorkflowExecutor } from '../../../workflows';

/**
 * Payment Capture Workflow
 * Executed via the generic workflow interpreter
 */
export const paymentCaptureTemporalWorkflow = createWorkflowExecutor(
	paymentCaptureWorkflowDefinition
);
