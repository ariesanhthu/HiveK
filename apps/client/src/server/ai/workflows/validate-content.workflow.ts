import { createAgentRunSummary } from '@/server/ai/services/agent-run.service';
import { validateContentHeuristically } from '@/server/ai/services/content-validation.service';
import type {
  ContentValidationRequest,
  ContentValidationResult,
} from '@/server/ai/types/agent.types';

export async function validateContentWorkflow(
  request: ContentValidationRequest,
): Promise<ContentValidationResult> {
  const startedAt = Date.now();
  const validation = validateContentHeuristically(request.platform, request.content);

  createAgentRunSummary({
    workflowName: 'validate-content',
    agentName: 'validator-agent',
    inputSummary: `${request.platform}:${request.content.length}`,
    outputSummary: validation.finalDecision,
    startedAt,
  });

  return validation;
}
