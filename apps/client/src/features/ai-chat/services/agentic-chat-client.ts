import type { BrandToneId, SocialPlatformId } from '@/features/ai-chat/types';
import { z } from 'zod';

export {
  getOrCreateChatIdentity,
  resetChatThreadId,
} from '@/features/ai-chat/services/ai-chat-storage';

const DEFAULT_BASE_URL = 'http://localhost:8100';

// A chat turn runs the whole agent workflow (route, load knowledge, compile
// context, generate, validate) against an LLM and regularly needs ~60s, so it
// gets far more room than the setup writes, which are single store round-trips.
const CHAT_TIMEOUT_MS = 90_000;
const DEFAULT_TIMEOUT_MS = 15_000;

/** The service could not be reached at all: offline, DNS, CORS or timeout. */
export class AgenticUnreachableError extends Error {
  constructor(message: string, options?: { cause?: unknown; }) {
    super(message, options);
    this.name = 'AgenticUnreachableError';
  }
}

/** The service answered, but with an error status or an unusable body. */
export class AgenticResponseError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'AgenticResponseError';
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

function getAgenticPyUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_AGENTIC_PY_URL;
  return `${trimTrailingSlash(baseUrl || DEFAULT_BASE_URL)}${path}`;
}

/** FastAPI sends `detail` as a string, or as a list of issues when validating. */
function extractDetail(body: unknown): string | null {
  if (!isRecord(body)) return null;

  const { detail } = body;
  if (typeof detail === 'string') return detail;

  if (Array.isArray(detail)) {
    const issues = detail
      .filter(isRecord)
      .map((issue) => {
        const location = Array.isArray(issue.loc) ? issue.loc.join('.') : null;
        const message = typeof issue.msg === 'string' ? issue.msg : null;
        if (!message) return null;
        return location ? `${location}: ${message}` : message;
      })
      .filter((issue): issue is string => issue !== null);

    if (issues.length > 0) return issues.join('; ');
  }

  return null;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

type RequestOptions = {
  method: 'GET' | 'POST';
  body?: unknown;
  timeoutMs?: number;
};

async function requestJson<TSchema extends z.ZodType>(
  path: string,
  schema: TSchema,
  { method, body, timeoutMs = DEFAULT_TIMEOUT_MS }: RequestOptions,
): Promise<z.infer<TSchema>> {
  const url = getAgenticPyUrl(path);
  let response: Response;

  try {
    response = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    throw new AgenticUnreachableError(`Cannot reach agentic service at ${url}`, {
      cause: error,
    });
  }

  const payload = await readJson(response);

  if (!response.ok) {
    throw new AgenticResponseError(
      extractDetail(payload) ?? `${response.status} ${response.statusText}`,
      response.status,
    );
  }

  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`)
      .join('; ');

    throw new AgenticResponseError(
      `Unexpected response from ${path} (${issues})`,
      response.status,
    );
  }

  return parsed.data;
}

const missingItemSchema = z.object({
  field: z.string(),
  severity: z.enum(['blocking', 'quality', 'optional']),
  reason: z.string(),
  searchedSources: z.array(z.string()).default([]),
  suggestedAction: z.string(),
  canInfer: z.boolean(),
  uiTarget: z.string().nullish(),
});

const widgetSchema = z.object({
  type: z.enum([
    'setup-overview',
    'social-connect',
    'brand-form',
    'drive-form',
    'setup-complete',
  ]),
});

// `intent` and `decision` stay loose: an unrecognised verb should cost us one
// dropped button, not the whole reply.
const nextActionSchema = z.object({
  id: z.string(),
  label: z.string(),
  kind: z.enum(['intent', 'href', 'decision']),
  intent: z.string().nullish(),
  href: z.string().nullish(),
  decision: z.string().nullish(),
  variant: z.enum(['primary', 'secondary']),
  payload: z.record(z.string(), z.unknown()).default({}),
});

const assetSchema = z.object({
  assetId: z.string(),
  workspaceId: z.string(),
  platform: z.string(),
  status: z.string(),
  draft: z.object({
    hook: z.string().nullish(),
    body: z.string().nullish(),
    cta: z.string().nullish(),
    firstComment: z.string().nullish(),
    replySuggestions: z.array(z.string()).default([]),
    hashtags: z.array(z.string()).default([]),
    deliveredFactIds: z.array(z.string()).default([]),
    missingFactIds: z.array(z.string()).default([]),
  }),
  validation: z.object({
    riskLevel: z.string(),
    finalDecision: z.string(),
    issues: z
      .array(
        z.object({
          code: z.string(),
          severity: z.string(),
          message: z.string(),
        }),
      )
      .default([]),
  }),
});

const planSchema = z.object({
  planId: z.string(),
  strategySummary: z.string().nullish(),
  days: z.number(),
  platforms: z.array(z.string()).default([]),
  nodes: z
    .array(
      z.object({
        nodeId: z.string(),
        dayIndex: z.number(),
        platform: z.string(),
        funnelStage: z.string().nullish(),
        goal: z.string().nullish(),
        angle: z.string().nullish(),
        rationale: z.string().nullish(),
        score: z.number().nullish(),
      }),
    )
    .default([]),
});

const citationSchema = z.object({
  sourceId: z.string(),
  sourceType: z.string(),
  confidence: z.number().nullish(),
  approved: z.boolean().nullish(),
});

const chatResponseSchema = z.object({
  runId: z.string(),
  threadId: z.string(),
  status: z.enum([
    'running',
    'completed',
    'partial',
    'needs_user_input',
    'needs_approval',
    'failed',
    'cancelled',
  ]),
  reply: z.string(),
  widget: widgetSchema.nullish(),
  nextActions: z.array(nextActionSchema).default([]),
  missingItems: z.array(missingItemSchema).default([]),
  asset: assetSchema.nullish(),
  plan: planSchema.nullish(),
  citations: z.array(citationSchema).default([]),
  // Diagnostics only, and the service serialises these two with keys that do not
  // match the published contract, so nothing here is pinned to a shape.
  progress: z.record(z.string(), z.unknown()).nullish(),
  agentRun: z.record(z.string(), z.unknown()).nullish(),
  warnings: z.array(z.string()).default([]),
  traceId: z.string().nullish(),
});

const setupResponseSchema = z.object({
  action: z.string(),
  assertionId: z.string(),
  readinessScore: z.number(),
  missingItems: z.array(missingItemSchema).default([]),
});

const learnedRuleSchema = z.object({
  rule: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]).transform(String),
  status: z.string().nullish(),
});

const decisionResponseSchema = z.object({
  assetId: z.string(),
  status: z.string(),
  feedbackId: z.string(),
  voiceProfileVersion: z.number(),
  learnedThisTurn: z.array(learnedRuleSchema).default([]),
  activeRules: z.array(z.unknown()).default([]),
});

const healthResponseSchema = z.object({
  status: z.string(),
  storeBackend: z.string(),
  llmProvider: z.string(),
  storeReachable: z.boolean(),
  skillsLoaded: z.number(),
  warnings: z.array(z.string()).default([]),
});

export type AgenticChatResponse = z.infer<typeof chatResponseSchema>;
export type AgenticNextAction = z.infer<typeof nextActionSchema>;
export type AgenticSetupResponse = z.infer<typeof setupResponseSchema>;
export type AgenticDecisionResponse = z.infer<typeof decisionResponseSchema>;
export type AgenticHealthResponse = z.infer<typeof healthResponseSchema>;

export type SendChatMessageInput = {
  workspaceId: string;
  userId: string;
  threadId: string;
  message: string;
  platform?: SocialPlatformId;
  platforms?: SocialPlatformId[];
  days?: number;
};

export function sendChatMessage(
  input: SendChatMessageInput,
): Promise<AgenticChatResponse> {
  return requestJson('/v1/chat/messages', chatResponseSchema, {
    method: 'POST',
    body: input,
    timeoutMs: CHAT_TIMEOUT_MS,
  });
}

export type SetupSocialInput = {
  workspaceId: string;
  userId: string;
  platforms: SocialPlatformId[];
};

export function setupSocial(
  input: SetupSocialInput,
): Promise<AgenticSetupResponse> {
  return requestJson('/v1/setup/social', setupResponseSchema, {
    method: 'POST',
    body: input,
  });
}

export type SetupBrandInput = {
  workspaceId: string;
  userId: string;
  name: string;
  tone: BrandToneId;
};

export function setupBrand(
  input: SetupBrandInput,
): Promise<AgenticSetupResponse> {
  return requestJson('/v1/setup/brand', setupResponseSchema, {
    method: 'POST',
    body: input,
  });
}

export type SetupDriveInput = {
  workspaceId: string;
  userId: string;
  url: string;
};

export function setupDrive(
  input: SetupDriveInput,
): Promise<AgenticSetupResponse> {
  return requestJson('/v1/setup/drive', setupResponseSchema, {
    method: 'POST',
    body: input,
  });
}

export type DecideOnAssetInput = {
  assetId: string;
  workspaceId: string;
  userId: string;
  decision: 'approve' | 'reject' | 'edit' | 'regenerate' | 'pin_as_good';
  editedText?: string;
  reason?: string;
};

export function decideOnAsset({
  assetId,
  ...input
}: DecideOnAssetInput): Promise<AgenticDecisionResponse> {
  return requestJson(
    `/v1/content-assets/${encodeURIComponent(assetId)}/decision`,
    decisionResponseSchema,
    { method: 'POST', body: input },
  );
}

export function getHealth(): Promise<AgenticHealthResponse> {
  return requestJson('/health', healthResponseSchema, {
    method: 'GET',
    timeoutMs: 5_000,
  });
}
