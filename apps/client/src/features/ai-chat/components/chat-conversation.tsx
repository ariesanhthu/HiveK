"use client";

import { useEffect, useRef } from "react";
import { AgentAvatar } from "@/features/ai-chat/components/agent-avatar";
import { ChatMessage } from "@/features/ai-chat/components/chat-message";
import type {
  AiChatAction,
  AiChatMessage as AiChatMessageType,
  AiChatSetup,
  AiChatSetupProgress,
  BrandToneId,
  SocialPlatformId,
} from "@/features/ai-chat/types";

type ChatConversationProps = {
  messages: AiChatMessageType[];
  setup: AiChatSetup;
  setupProgress: AiChatSetupProgress;
  isLoading?: boolean;
  onAction: (action: AiChatAction) => void;
  onCompleteSocial: (platforms: SocialPlatformId[]) => void;
  onCompleteBrand: (name: string, tone: BrandToneId) => void;
  onCompleteDrive: (url: string) => void;
};

function TypingIndicator() {
  return (
    <article className="flex items-start gap-3 py-3 sm:gap-3.5">
      <AgentAvatar size="sm" className="mt-0.5" />
      <span className="flex items-center gap-1.5 pt-3.5">
        <span className="sr-only">HiveK AI đang soạn câu trả lời</span>
        <span
          aria-hidden
          className="size-1.5 animate-bounce rounded-full bg-amber-400 [animation-delay:-0.3s] motion-reduce:animate-none"
        />
        <span
          aria-hidden
          className="size-1.5 animate-bounce rounded-full bg-amber-400 [animation-delay:-0.15s] motion-reduce:animate-none"
        />
        <span
          aria-hidden
          className="size-1.5 animate-bounce rounded-full bg-amber-400 motion-reduce:animate-none"
        />
      </span>
    </article>
  );
}

export function ChatConversation({
  messages,
  setup,
  setupProgress,
  isLoading = false,
  onAction,
  onCompleteSocial,
  onCompleteBrand,
  onCompleteDrive,
}: ChatConversationProps) {
  const endOfConversationRef = useRef<HTMLDivElement>(null);
  const hideQuickSetupAction =
    setupProgress.isComplete || messages.some((message) => Boolean(message.widget));

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    endOfConversationRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "end",
    });
  }, [messages.length, isLoading]);

  return (
    <div
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 sm:px-5"
      role="log"
      aria-live="polite"
      aria-label="Cuộc trò chuyện với HiveK AI"
    >
      <div className="mx-auto w-full max-w-3xl py-6 sm:py-8">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            setup={setup}
            setupProgress={setupProgress}
            hideQuickSetupAction={hideQuickSetupAction}
            onAction={onAction}
            onCompleteSocial={onCompleteSocial}
            onCompleteBrand={onCompleteBrand}
            onCompleteDrive={onCompleteDrive}
          />
        ))}
        {isLoading ? <TypingIndicator /> : null}
        <div ref={endOfConversationRef} className="h-2" aria-hidden />
      </div>
    </div>
  );
}
