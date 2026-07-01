/**
 * Payment Cancel Temporal Workflow
 *
 * Uses the workflow interpreter to execute steps from WorkflowDefinition.
 */

import { exampleWorkflowDefinition } from '@/application/workflows/example/example.workflow';
import { createWorkflowExecutor } from '../../../workflows';

/**
 * Example Workflow
 * Executed via the generic workflow interpreter
 */
export const exampleWorkflow = createWorkflowExecutor(exampleWorkflowDefinition);
