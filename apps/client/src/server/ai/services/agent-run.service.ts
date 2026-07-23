import type { AgentRunStatus, AgentRunSummary } from '@/server/ai/types/agent.types';
import { serverEnv } from '@/server/config/env';

type AgentRunParams = {
  workflowName: string;
  agentName: string;
  inputSummary: string;
  outputSummary: string;
  startedAt: number;
  status?: AgentRunStatus;
  error?: string;
};

export function createAgentRunSummary({
  workflowName,
  agentName,
  inputSummary,
  outputSummary,
  startedAt,
  status = 'success',
  error,
}: AgentRunParams): AgentRunSummary {
  return {
    runId: `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    workflowName,
    agentName,
    inputSummary,
    outputSummary,
    model: serverEnv.aiAgentProvider === 'gemini' ? 'gemini-env-configured' : 'mock-agent',
    promptVersion: 'mock-v1',
    latencyMs: Date.now() - startedAt,
    status,
    error,
  };
}
