"use client";

import { useEffect, useRef } from "react";
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
  onAction: (action: AiChatAction) => void;
  onCompleteSocial: (platforms: SocialPlatformId[]) => void;
  onCompleteBrand: (name: string, tone: BrandToneId) => void;
  onCompleteDrive: (url: string) => void;
};

export function ChatConversation({
  messages,
  setup,
  setupProgress,
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
  }, [messages.length]);

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
        <div ref={endOfConversationRef} className="h-2" aria-hidden />
      </div>
    </div>
  );
}
