"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  INITIAL_AI_CHAT_SETUP,
  STARTER_PROMPTS,
} from "@/features/ai-chat/data/ai-chat-data";
import {
  aiChatService,
  resolveIntent,
} from "@/features/ai-chat/services/ai-chat-service";
import {
  readAiChatSetup,
  writeAiChatSetup,
} from "@/features/ai-chat/services/ai-chat-storage";
import type {
  AiChatAction,
  AiChatIntent,
  AiChatMessage,
  AiChatMessageDraft,
  AiChatSetup,
  BrandSetupPayload,
  DriveSetupPayload,
  SocialSetupPayload,
} from "@/features/ai-chat/types";

type AiChatState = {
  messages: AiChatMessage[];
  setup: AiChatSetup;
  nextMessageNumber: number;
};

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
    aiChatService.createInitialAgentTurns()
  );
}

function getLatestActionById(
  messages: AiChatMessage[],
  actionId: string
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
    social: "social-connect",
    brand: "brand-form",
    drive: "drive-form",
  }[nextStep];

  return state.messages.some((message) => message.widget?.type === widgetType);
}

export function useAiChat() {
  const router = useRouter();
  const [state, setState] = useState<AiChatState>(createInitialState);
  const [hasLoadedStoredSetup, setHasLoadedStoredSetup] = useState(false);

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

  const setupProgress = useMemo(
    () => aiChatService.getSetupProgress(state.setup),
    [state.setup]
  );

  const sendMessage = useCallback((input: string): void => {
    const content = input.trim();
    if (!content) return;

    setState((previousState) => {
      if (resolveIntent(content) === "quick-start" && hasActiveSetupStep(previousState)) {
        return appendDrafts(previousState, [
          aiChatService.createUserTurn(content),
          {
            role: "assistant",
            content:
              "Luồng thiết lập đang mở. Hãy hoàn tất biểu mẫu hiện tại trước khi bắt đầu lại.",
          },
        ]);
      }

      return appendDrafts(previousState, [
        aiChatService.createUserTurn(content),
        ...aiChatService.createInputAgentTurns(content, previousState.setup),
      ]);
    });
  }, []);

  const selectPrompt = useCallback((intent: AiChatIntent): void => {
    setState((previousState) => {
      if (intent === "quick-start" && hasActiveSetupStep(previousState)) {
        return previousState;
      }

      const prompt = aiChatService.getPrompt(intent);

      return appendDrafts(previousState, [
        aiChatService.createUserTurn(prompt.label),
        ...aiChatService.createIntentAgentTurns(intent, previousState.setup),
      ]);
    });
  }, []);

  const runAction = useCallback(
    (actionOrId: AiChatAction | string): void => {
      const action =
        typeof actionOrId === "string"
          ? getLatestActionById(state.messages, actionOrId)
          : actionOrId;

      if (!action) return;

      if (action.kind === "intent") {
        selectPrompt(action.intent);
        return;
      }

      if (action.external) {
        window.open(action.href, "_blank", "noopener,noreferrer");
        return;
      }

      router.push(action.href);
    },
    [router, selectPrompt, state.messages]
  );

  const completeSocial = useCallback((payload: SocialSetupPayload): void => {
    const platforms = Array.from(new Set(payload.platforms));
    if (platforms.length === 0) return;

    setState((previousState) => {
      const setup: AiChatSetup = {
        ...previousState.setup,
        socialPlatforms: platforms,
      };

      return appendDrafts(
        { ...previousState, setup },
        [
          aiChatService.createUserTurn(
            `Đã chọn ${platforms.length} kênh mạng xã hội`
          ),
          ...aiChatService.createSetupCompletionTurns("social", setup),
        ]
      );
    });
  }, []);

  const completeBrand = useCallback((payload: BrandSetupPayload): void => {
    const name = payload.name.trim();
    if (!name) return;

    setState((previousState) => {
      const setup: AiChatSetup = {
        ...previousState.setup,
        branding: {
          name,
          tone: payload.tone,
        },
      };

      return appendDrafts(
        { ...previousState, setup },
        [
          aiChatService.createUserTurn(`Thương hiệu: ${name}`),
          ...aiChatService.createSetupCompletionTurns("brand", setup),
        ]
      );
    });
  }, []);

  const completeDrive = useCallback((payload: DriveSetupPayload): void => {
    const url = payload.url.trim();
    if (!url) return;

    setState((previousState) => {
      const setup: AiChatSetup = {
        ...previousState.setup,
        driveUrl: url,
      };

      return appendDrafts(
        { ...previousState, setup },
        [
          aiChatService.createUserTurn("Đã thêm thư mục tài nguyên"),
          ...aiChatService.createSetupCompletionTurns("drive", setup),
        ]
      );
    });
  }, []);

  const resetChat = useCallback((): void => {
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
  };
}
