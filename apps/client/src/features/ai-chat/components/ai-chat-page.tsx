"use client";

import { DashboardSidebar } from "@/features/business-dashboard/components/dashboard-sidebar";
import { useBusinessNavItems } from "@/features/business-dashboard/hooks/use-business-nav-items";
import { ChatComposer } from "@/features/ai-chat/components/chat-composer";
import { ChatConversation } from "@/features/ai-chat/components/chat-conversation";
import { ChatHeader } from "@/features/ai-chat/components/chat-header";
import { ChatWelcome } from "@/features/ai-chat/components/chat-welcome";
import { useAiChat } from "@/features/ai-chat/hooks/use-ai-chat";

export function AiChatPage() {
  const navItems = useBusinessNavItems();
  const {
    messages,
    setup,
    setupProgress,
    starterPrompts,
    sendMessage,
    selectPrompt,
    runAction,
    completeSocial,
    completeBrand,
    completeDrive,
    resetChat,
  } = useAiChat();
  const hasConversation = messages.length > 0;
  const hasStartedSetup =
    setupProgress.completed > 0 || messages.some((message) => Boolean(message.widget));

  return (
    <main className="flex h-dvh min-h-0 w-full overflow-hidden bg-background-light">
      <a
        href="#ai-chat-content"
        className="sr-only z-50 rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        Chuyển đến hội thoại
      </a>
      <DashboardSidebar items={navItems} />

      <section
        id="ai-chat-content"
        tabIndex={-1}
        className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f9fafb_24%,#f9fafb_100%)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
      >
        <ChatHeader
          completedSetupSteps={setupProgress.completed}
          totalSetupSteps={setupProgress.total}
          showSetupProgress={hasStartedSetup}
          hasConversation={hasConversation}
          navItems={navItems}
          onReset={resetChat}
        />

        {hasConversation ? (
          <ChatConversation
            messages={messages}
            setup={setup}
            setupProgress={setupProgress}
            onAction={runAction}
            onCompleteSocial={(platforms) => completeSocial({ platforms })}
            onCompleteBrand={(name, tone) => completeBrand({ name, tone })}
            onCompleteDrive={(url) => completeDrive({ url })}
          />
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <ChatWelcome
              prompts={starterPrompts}
              onSelectPrompt={selectPrompt}
            />
          </div>
        )}

        <ChatComposer onSubmit={sendMessage} />
      </section>
    </main>
  );
}
