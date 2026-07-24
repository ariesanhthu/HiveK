'use client';

import {
  type AgentContextAction,
  AgentSidecar,
  type AgentWorkspaceView,
} from '@/features/ai-chat/components/workspace/agent-sidecar';
import { useAiChat } from '@/features/ai-chat/hooks/use-ai-chat';

type AgentSidecarContainerProps = {
  currentView: AgentWorkspaceView;
  workspaceName: string;
  onNavigate: (view: AgentWorkspaceView) => void;
  onClose: () => void;
  contextActions?: AgentContextAction[];
};

export function AgentSidecarContainer({
  currentView,
  workspaceName,
  onNavigate,
  onClose,
  contextActions,
}: AgentSidecarContainerProps) {
  const {
    messages,
    setup,
    setupProgress,
    sendMessage,
    runAction,
    completeSocial,
    completeBrand,
    completeDrive,
    resetChat,
    isLoading,
    error,
    isBackendAvailable,
  } = useAiChat();

  return (
    <AgentSidecar
      currentView={currentView}
      workspaceName={workspaceName}
      messages={messages}
      setup={setup}
      setupProgress={setupProgress}
      isLoading={isLoading}
      error={error}
      isBackendAvailable={isBackendAvailable}
      contextActions={contextActions}
      onNavigate={onNavigate}
      onClose={onClose}
      onReset={resetChat}
      onSubmit={sendMessage}
      onAction={runAction}
      onCompleteSocial={(platforms) => completeSocial({ platforms })}
      onCompleteBrand={(name, tone) => completeBrand({ name, tone })}
      onCompleteDrive={(url) => completeDrive({ url })}
    />
  );
}
