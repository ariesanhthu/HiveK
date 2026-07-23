'use client';

import { LoaderCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { AiChatOnboarding } from '@/features/ai-chat/components/onboarding/ai-chat-onboarding';
import { useAgentOnboarding } from '@/features/ai-chat/hooks/use-agent-onboarding';

const AgentWorkspacePage = dynamic(
  () =>
    import('@/features/ai-chat/components/ai-chat-page').then(
      (module) => module.AgentWorkspacePage,
    ),
  {
    loading: () => (
      <main
        className='flex h-dvh w-full items-center justify-center bg-background-light'
        role='status'
      >
        <div className='text-center'>
          <span className='mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-amber-700'>
            <LoaderCircle
              className='size-5 animate-spin motion-reduce:animate-none'
              aria-hidden
            />
          </span>
          <p className='mt-3 text-sm font-bold text-foreground'>
            Đang mở Agent workspace…
          </p>
        </div>
      </main>
    ),
  },
);

export function AiChatPage() {
  const router = useRouter();
  const onboarding = useAgentOnboarding();
  const stage = onboarding.state.stage;
  const reset = onboarding.reset;

  const resetOnboarding = useCallback(async () => {
    if (
      stage !== 'welcome'
      && !window.confirm(
        'Bắt đầu lại từ đầu? Tiến trình thiết lập và các chỉnh sửa workspace trên trình duyệt này sẽ được xóa.',
      )
    ) {
      return;
    }

    const [{ clearAgentWorkspaceDemoEdits }, { clearAiChatSetup }] = await Promise.all([
      import('@/features/ai-chat/services/workspace-demo-service'),
      import('@/features/ai-chat/services/ai-chat-storage'),
    ]);
    clearAgentWorkspaceDemoEdits();
    clearAiChatSetup();
    reset();
    router.replace('/ai-chat', { scroll: false });
  }, [reset, router, stage]);

  if (!onboarding.isHydrated || stage !== 'ready') {
    return <AiChatOnboarding flow={onboarding} onReset={resetOnboarding} />;
  }

  return <AgentWorkspacePage onRestart={resetOnboarding} />;
}
