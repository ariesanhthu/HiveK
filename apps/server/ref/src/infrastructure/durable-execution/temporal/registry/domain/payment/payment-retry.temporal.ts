/**
 * Payment Retry Temporal Workflow
 *
 * Uses the workflow interpreter to execute steps from WorkflowDefinition.
 */

import { paymentRetryWorkflowDefinition } from '@/application/workflows/payment-retry/payment-retry.workflow';
import { createWorkflowExecutor } from '../../../workflows';

/**
 * Payment Retry Workflow
 * Executed via the generic workflow interpreter
 */
export const paymentRetryTemporalWorkflow = createWorkflowExecutor(paymentRetryWorkflowDefinition);
