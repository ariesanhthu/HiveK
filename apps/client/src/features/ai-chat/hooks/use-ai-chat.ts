'use client';

import {
  BRAND_TONE_OPTIONS,
  INITIAL_AI_CHAT_SETUP,
  SOCIAL_PLATFORM_OPTIONS,
  STARTER_PROMPTS,
} from '@/features/ai-chat/data/ai-chat-data';
import {
  type AgenticDecisionResponse,
  AgenticResponseError,
  AgenticUnreachableError,
  decideOnAsset,
  getHealth,
  getOrCreateChatIdentity,
  resetChatThreadId,
  sendChatMessage,
  setupBrand,
  setupDrive,
  setupSocial,
} from '@/features/ai-chat/services/agentic-chat-client';
import { mapChatTurn } from '@/features/ai-chat/services/agentic-chat-mapper';
import { aiChatService, resolveIntent } from '@/features/ai-chat/services/ai-chat-service';
import { readAiChatSetup, writeAiChatSetup } from '@/features/ai-chat/services/ai-chat-storage';
import type {
  AiChatAction,
  AiChatDecision,
  AiChatDecisionAction,
  AiChatIdentity,
  AiChatIntent,
  AiChatMessage,
  AiChatMessageDraft,
  AiChatSetup,
  BrandSetupPayload,
  DriveSetupPayload,
  SetupStepId,
  SocialSetupPayload,
} from '@/features/ai-chat/types';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type AiChatState = {
  messages: AiChatMessage[];
  setup: AiChatSetup;
  nextMessageNumber: number;
};

type BackendStatus = 'probing' | 'online' | 'offline';

type RemoteOutcome<T> =
  | { type: 'ok'; value: T; }
  | { type: 'unreachable'; }
  | { type: 'failed'; message: string; };

const REQUEST_ERROR_MESSAGE = 'Mình chưa xử lý được yêu cầu này. Bạn thử lại sau giúp mình nhé.';

const OFFLINE_DECISION_MESSAGE =
  'Mình chưa gửi được phản hồi này về dịch vụ AI. Bạn thử lại khi có kết nối nhé.';

const DECISION_ACKNOWLEDGEMENT: Record<AiChatDecision, string> = {
  approve: 'Đã duyệt bài. Mình sẽ giữ văn phong này cho các bài sau.',
  reject: 'Đã bỏ bản nháp này. Mình sẽ tránh hướng tiếp cận vừa rồi.',
  edit: 'Đã lưu bản chỉnh sửa của bạn làm chuẩn mới.',
  regenerate: 'Đã ghi nhận. Bạn nhắn thêm định hướng để mình viết lại nhé.',
  pin_as_good: 'Đã ghim bài này làm mẫu chuẩn cho thương hiệu.',
};

const VOICE_RULE_LABELS: Record<string, string> = {
  length: 'Độ dài',
  banned_phrase: 'Cụm từ cần tránh',
  tone: 'Giọng điệu',
};

/**
 * Only a service we cannot reach falls back to the local mock. One that answers
 * badly is reported instead, and anything unexpected still throws.
 */
async function callRemote<T>(run: () => Promise<T>): Promise<RemoteOutcome<T>> {
  try {
    return { type: 'ok', value: await run() };
  } catch (error) {
    if (error instanceof AgenticUnreachableError) return { type: 'unreachable' };
    if (error instanceof AgenticResponseError) {
      return { type: 'failed', message: error.message };
    }

    throw error;
  }
}

function cloneInitialSetup(): AiChatSetup {
  return {
    socialPlatforms: [...INITIAL_AI_CHAT_SETUP.socialPlatforms],
    branding: { ...INITIAL_AI_CHAT_SETUP.branding },
    driveUrl: INITIAL_AI_CHAT_SETUP.driveUrl,
  };
}

function appendDrafts(state: AiChatState, drafts: AiChatMessageDraft[]): AiChatState {
  if (drafts.length === 0) return state;

  const messages = drafts.map((draft, index): AiChatMessage => ({
    ...draft,
    id: `ai-chat-message-${state.nextMessageNumber + index}`,
  }));

  return {
    ...state,
    messages: [...state.messages, ...messages],
    nextMessageNumber: state.nextMessageNumber + messages.length,
  };
}

function createInitialState(): AiChatState {
  return appendDrafts(
    {
      messages: [],
      setup: cloneInitialSetup(),
      nextMessageNumber: 1,
    },
    aiChatService.createInitialAgentTurns(),
  );
}

function getLatestActionById(
  messages: AiChatMessage[],
  actionId: string,
): AiChatAction | undefined {
  for (let messageIndex = messages.length - 1; messageIndex >= 0; messageIndex -= 1) {
    const action = messages[messageIndex]?.actions?.find((item) => item.id === actionId);
    if (action) return action;
  }

  return undefined;
}

function hasActiveSetupStep(state: AiChatState): boolean {
  const nextStep = aiChatService.getSetupProgress(state.setup).nextStep;
  if (!nextStep) return false;

  const widgetType = {
    social: 'social-connect',
    brand: 'brand-form',
    drive: 'drive-form',
  }[nextStep];

  return state.messages.some((message) => message.widget?.type === widgetType);
}

function createDecisionTurn(
  decision: AiChatDecision,
  result: AgenticDecisionResponse,
): AiChatMessageDraft {
  const lines = [DECISION_ACKNOWLEDGEMENT[decision]];

  if (result.learnedThisTurn.length > 0) {
    lines.push('', 'Mình vừa học thêm từ phản hồi này:');

    for (const rule of result.learnedThisTurn) {
      lines.push(`• ${VOICE_RULE_LABELS[rule.rule] ?? rule.rule}: ${rule.value}`);
    }
  }

  return { role: 'assistant', content: lines.join('\n') };
}

export function useAiChat() {
  const router = useRouter();
  const [state, setState] = useState<AiChatState>(createInitialState);
  const [hasLoadedStoredSetup, setHasLoadedStoredSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('probing');
  const stateRef = useRef(state);
  const isLoadingRef = useRef(false);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const storedSetup = readAiChatSetup();

    if (storedSetup) {
      setState((previousState) => ({ ...previousState, setup: storedSetup }));
    }

    setHasLoadedStoredSetup(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedStoredSetup) return;
    writeAiChatSetup(state.setup);
  }, [hasLoadedStoredSetup, state.setup]);

  useEffect(() => {
    let isActive = true;

    void (async () => {
      const outcome = await callRemote(getHealth);
      if (!isActive) return;
      setBackendStatus(outcome.type === 'ok' ? 'online' : 'offline');
    })();

    return () => {
      isActive = false;
    };
  }, []);

  const setupProgress = useMemo(
    () => aiChatService.getSetupProgress(state.setup),
    [state.setup],
  );

  const appendTurns = useCallback((drafts: AiChatMessageDraft[]): void => {
    setState((previousState) => appendDrafts(previousState, drafts));
  }, []);

  const withLoading = useCallback(
    async (run: () => Promise<void>): Promise<void> => {
      isLoadingRef.current = true;
      setIsLoading(true);
      setError(null);

      try {
        await run();
      } finally {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    },
    [],
  );

  const runChat = useCallback(
    async (
      message: string,
      createFallbackTurns: (setup: AiChatSetup) => AiChatMessageDraft[],
    ): Promise<void> => {
      const identity = getOrCreateChatIdentity();
      const outcome = await callRemote(() =>
        sendChatMessage({
          workspaceId: identity.workspaceId,
          userId: identity.userId,
          threadId: identity.threadId,
          message,
        })
      );

      if (outcome.type === 'failed') setError(outcome.message);
      setBackendStatus(outcome.type === 'unreachable' ? 'offline' : 'online');

      setState((previousState) => {
        if (outcome.type === 'ok') {
          return appendDrafts(previousState, [
            mapChatTurn(outcome.value, previousState.setup),
          ]);
        }

        if (outcome.type === 'unreachable') {
          return appendDrafts(previousState, createFallbackTurns(previousState.setup));
        }

        return appendDrafts(previousState, [
          { role: 'assistant', content: REQUEST_ERROR_MESSAGE },
        ]);
      });
    },
    [],
  );

  const sendMessage = useCallback(
    (input: string): void => {
      const content = input.trim();
      if (!content || isLoadingRef.current) return;

      if (
        resolveIntent(content) === 'quick-start'
        && hasActiveSetupStep(stateRef.current)
      ) {
        appendTurns([
          aiChatService.createUserTurn(content),
          {
            role: 'assistant',
            content:
              'Luồng thiết lập đang mở. Hãy hoàn tất biểu mẫu hiện tại trước khi bắt đầu lại.',
          },
        ]);
        return;
      }

      appendTurns([aiChatService.createUserTurn(content)]);
      void withLoading(() =>
        runChat(content, (setup) => aiChatService.createInputAgentTurns(content, setup))
      );
    },
    [appendTurns, runChat, withLoading],
  );

  const selectPrompt = useCallback(
    (intent: AiChatIntent): void => {
      if (isLoadingRef.current) return;
      if (intent === 'quick-start' && hasActiveSetupStep(stateRef.current)) return;

      const prompt = aiChatService.getPrompt(intent);

      appendTurns([aiChatService.createUserTurn(prompt.label)]);
      void withLoading(() =>
        runChat(prompt.label, (setup) => aiChatService.createIntentAgentTurns(intent, setup))
      );
    },
    [appendTurns, runChat, withLoading],
  );

  const runDecision = useCallback(
    (action: AiChatDecisionAction): void => {
      if (isLoadingRef.current) return;

      void withLoading(async () => {
        const identity = getOrCreateChatIdentity();
        const outcome = await callRemote(() =>
          decideOnAsset({
            assetId: action.assetId,
            workspaceId: identity.workspaceId,
            userId: identity.userId,
            decision: action.decision,
          })
        );

        if (outcome.type === 'failed') setError(outcome.message);
        setBackendStatus(outcome.type === 'unreachable' ? 'offline' : 'online');

        appendTurns([
          aiChatService.createUserTurn(action.label),
          outcome.type === 'ok'
            ? createDecisionTurn(action.decision, outcome.value)
            : {
              role: 'assistant',
              content: outcome.type === 'unreachable'
                ? OFFLINE_DECISION_MESSAGE
                : REQUEST_ERROR_MESSAGE,
            },
        ]);
      });
    },
    [appendTurns, withLoading],
  );

  const runAction = useCallback(
    (actionOrId: AiChatAction | string): void => {
      const action = typeof actionOrId === 'string'
        ? getLatestActionById(stateRef.current.messages, actionOrId)
        : actionOrId;

      if (!action) return;

      if (action.kind === 'intent') {
        selectPrompt(action.intent);
        return;
      }

      if (action.kind === 'decision') {
        runDecision(action);
        return;
      }

      if (action.external) {
        window.open(action.href, '_blank', 'noopener,noreferrer');
        return;
      }

      router.push(action.href);
    },
    [router, runDecision, selectPrompt],
  );

  const completeSetupStep = useCallback(
    (
      step: SetupStepId,
      setup: AiChatSetup,
      userTurn: string,
      submit: (identity: AiChatIdentity) => Promise<unknown>,
      followUpMessage: string,
    ): void => {
      if (isLoadingRef.current) return;

      setState((previousState) =>
        appendDrafts({ ...previousState, setup }, [
          aiChatService.createUserTurn(userTurn),
        ])
      );

      void withLoading(async () => {
        const identity = getOrCreateChatIdentity();
        const outcome = await callRemote(() => submit(identity));

        if (outcome.type === 'ok') {
          setBackendStatus('online');
          await runChat(
            followUpMessage,
            (currentSetup) => aiChatService.createSetupCompletionTurns(step, currentSetup),
          );
          return;
        }

        // The fact never landed, so let the local flow move the conversation on
        // rather than ask an agent that knows nothing about this step.
        if (outcome.type === 'failed') setError(outcome.message);
        setBackendStatus(outcome.type === 'unreachable' ? 'offline' : 'online');
        setState((previousState) =>
          appendDrafts(
            previousState,
            aiChatService.createSetupCompletionTurns(step, previousState.setup),
          )
        );
      });
    },
    [runChat, withLoading],
  );

  const completeSocial = useCallback(
    (payload: SocialSetupPayload): void => {
      const platforms = Array.from(new Set(payload.platforms));
      if (platforms.length === 0) return;

      const labels = platforms.map(
        (platform) =>
          SOCIAL_PLATFORM_OPTIONS.find((option) => option.id === platform)?.label
            ?? platform,
      );

      completeSetupStep(
        'social',
        { ...stateRef.current.setup, socialPlatforms: platforms },
        `Đã chọn ${platforms.length} kênh mạng xã hội`,
        (identity) =>
          setupSocial({
            workspaceId: identity.workspaceId,
            userId: identity.userId,
            platforms,
          }),
        `Mình đang dùng các kênh: ${labels.join(', ')}.`,
      );
    },
    [completeSetupStep],
  );

  const completeBrand = useCallback(
    (payload: BrandSetupPayload): void => {
      const name = payload.name.trim();
      if (!name) return;

      const toneLabel = BRAND_TONE_OPTIONS.find((option) => option.id === payload.tone)?.label
        ?? payload.tone;

      completeSetupStep(
        'brand',
        { ...stateRef.current.setup, branding: { name, tone: payload.tone } },
        `Thương hiệu: ${name}`,
        (identity) =>
          setupBrand({
            workspaceId: identity.workspaceId,
            userId: identity.userId,
            name,
            tone: payload.tone,
          }),
        `Thương hiệu của mình tên là ${name}, giọng điệu ${toneLabel.toLowerCase()}.`,
      );
    },
    [completeSetupStep],
  );

  const completeDrive = useCallback(
    (payload: DriveSetupPayload): void => {
      const url = payload.url.trim();
      if (!url) return;

      completeSetupStep(
        'drive',
        { ...stateRef.current.setup, driveUrl: url },
        'Đã thêm thư mục tài nguyên',
        (identity) =>
          setupDrive({
            workspaceId: identity.workspaceId,
            userId: identity.userId,
            url,
          }),
        'Mình đã thêm thư mục tài nguyên thương hiệu.',
      );
    },
    [completeSetupStep],
  );

  const resetChat = useCallback((): void => {
    resetChatThreadId();
    setError(null);
    setState((previousState) => ({
      messages: [],
      setup: previousState.setup,
      nextMessageNumber: 1,
    }));
  }, []);

  return {
    messages: state.messages,
    setup: state.setup,
    setupProgress,
    starterPrompts: STARTER_PROMPTS,
    sendMessage,
    selectPrompt,
    runAction,
    completeSocial,
    completeBrand,
    completeDrive,
    resetChat,
    isLoading,
    error,
    isBackendAvailable: backendStatus !== 'offline',
  };
}
