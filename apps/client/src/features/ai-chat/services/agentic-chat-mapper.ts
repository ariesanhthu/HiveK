import type {
  AgenticChatResponse,
  AgenticNextAction,
} from "@/features/ai-chat/services/agentic-chat-client";
import {
  getNextIncompleteSetupStep,
  getSetupProgress,
} from "@/features/ai-chat/services/ai-chat-service";
import type {
  AiChatAction,
  AiChatDecision,
  AiChatIntent,
  AiChatMessageDraft,
  AiChatSetup,
  AiChatWidget,
  SetupStepId,
} from "@/features/ai-chat/types";

const FALLBACK_REPLY =
  "Mình đã nhận yêu cầu nhưng chưa có nội dung trả lời. Bạn thử diễn đạt lại giúp mình nhé.";

const AI_CHAT_INTENTS: readonly AiChatIntent[] = [
  "quick-start",
  "plan-posts",
  "campaign-ideas",
  "find-creators",
  "analyze-content",
];

const AI_CHAT_DECISIONS: readonly AiChatDecision[] = [
  "approve",
  "reject",
  "edit",
  "regenerate",
  "pin_as_good",
];

const STEP_WIDGET_TYPE: Record<SetupStepId, AiChatWidget["type"]> = {
  social: "social-connect",
  brand: "brand-form",
  drive: "drive-form",
};

const WIDGET_TYPE_STEP: Partial<Record<AiChatWidget["type"], SetupStepId>> = {
  "social-connect": "social",
  "brand-form": "brand",
  "drive-form": "drive",
};

/**
 * The agent's intents name graph branches; the chat UI's name starter prompts. They are
 * different vocabularies, so hyphenating `create_post` yields `create-post`, which is not
 * an `AiChatIntent` and would silently drop the action's button.
 */
const AGENT_INTENT_ALIASES: Record<string, AiChatIntent> = {
  setup: "quick-start",
  update_knowledge: "quick-start",
  create_content_plan: "plan-posts",
  create_post: "campaign-ideas",
  analyze_performance: "analyze-content",
};

function mapIntent(intent: string | null | undefined): AiChatIntent | null {
  if (!intent) return null;

  const raw = intent.trim().toLowerCase();
  const aliased = AGENT_INTENT_ALIASES[raw];
  if (aliased) return aliased;

  const normalized = raw.replace(/_/g, "-");
  return AI_CHAT_INTENTS.find((known) => known === normalized) ?? null;
}

function mapDecision(decision: string | null | undefined): AiChatDecision | null {
  if (!decision) return null;

  const normalized = decision.trim().toLowerCase();
  return AI_CHAT_DECISIONS.find((known) => known === normalized) ?? null;
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

/** Action payloads keep snake_case keys even though the reply is camelCase. */
function readAssetId(payload: Record<string, unknown>): string | null {
  const assetId = payload.asset_id ?? payload.assetId;
  return typeof assetId === "string" && assetId.length > 0 ? assetId : null;
}

function mapAction(
  action: AgenticNextAction,
  replyAssetId: string | null
): AiChatAction | null {
  const base = { id: action.id, label: action.label, variant: action.variant };

  if (action.kind === "href") {
    if (!action.href) return null;

    return {
      ...base,
      kind: "href",
      href: action.href,
      external: isExternalHref(action.href),
    };
  }

  if (action.kind === "intent") {
    const intent = mapIntent(action.intent);
    return intent ? { ...base, kind: "intent", intent } : null;
  }

  const decision = mapDecision(action.decision);
  const assetId = readAssetId(action.payload) ?? replyAssetId;

  if (!decision || !assetId) return null;

  return { ...base, kind: "decision", decision, assetId };
}

export function mapChatActions(
  actions: AgenticNextAction[],
  replyAssetId: string | null
): AiChatAction[] {
  return actions
    .map((action) => mapAction(action, replyAssetId))
    .filter((action): action is AiChatAction => action !== null);
}

export function resolveWidget(
  widgetType: AiChatWidget["type"] | undefined,
  setup: AiChatSetup
): AiChatWidget | undefined {
  if (!widgetType) return undefined;

  const step = WIDGET_TYPE_STEP[widgetType];
  if (!step) return { type: widgetType };
  if (!getSetupProgress(setup).completedSteps.includes(step)) {
    return { type: widgetType };
  }

  // The service picks this widget from the brand facts it is still missing, and
  // two of them (audience, product) have no field in this UI — so it would ask
  // for a step already done and stall the flow. Advance to the next open step.
  const nextStep = getNextIncompleteSetupStep(setup);
  return nextStep ? { type: STEP_WIDGET_TYPE[nextStep] } : { type: "setup-complete" };
}

export function mapChatTurn(
  response: AgenticChatResponse,
  setup: AiChatSetup
): AiChatMessageDraft {
  const widget = resolveWidget(response.widget?.type, setup);
  const actions = mapChatActions(response.nextActions, response.asset?.assetId ?? null);

  return {
    role: "assistant",
    content: response.reply.trim() || FALLBACK_REPLY,
    ...(widget ? { widget } : {}),
    ...(actions.length > 0 ? { actions } : {}),
  };
}
