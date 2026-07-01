/**
 * Payment Handle Webhook Temporal Workflow
 *
 * Uses the workflow interpreter to execute steps from WorkflowDefinition.
 */

import { createWorkflowExecutor } from '../../../workflows';
import { paymentHandleWebhookWorkflowDefinition } from '@/application/workflows/payment-handle-webhook/payment-handle-webhook.workflow';

/**
 * Payment Capture Workflow
 * Executed via the generic workflow interpreter
 */
export const paymentHandleWebhookTemporalWorkflow = createWorkflowExecutor(
	paymentHandleWebhookWorkflowDefinition
);
