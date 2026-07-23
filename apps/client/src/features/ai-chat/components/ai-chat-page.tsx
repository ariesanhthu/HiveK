'use client';

import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import type { AgentContextAction } from '@/features/ai-chat/components/workspace/agent-sidecar';
import { WorkspaceHeader } from '@/features/ai-chat/components/workspace/workspace-header';
import {
  WorkspaceErrorState,
  WorkspaceLoadingState,
} from '@/features/ai-chat/components/workspace/workspace-loading-state';
import { WorkspaceOverviewView } from '@/features/ai-chat/components/workspace/workspace-overview-view';
import { useAgentWorkspace } from '@/features/ai-chat/hooks/use-agent-workspace';
import type { WorkspaceViewId } from '@/features/ai-chat/types/workspace-types';
import { DashboardSidebar } from '@/features/business-dashboard/components/dashboard-sidebar';
import { useBusinessNavItems } from '@/features/business-dashboard/hooks/use-business-nav-items';

const WorkspaceStudioView = dynamic(
  () =>
    import('@/features/ai-chat/components/workspace/workspace-studio-view').then(
      (module) => module.WorkspaceStudioView,
    ),
  { loading: () => <WorkspaceLoadingState /> },
);

const WorkspaceBrandView = dynamic(() =>
  import('@/features/ai-chat/components/workspace/workspace-brand-view').then(
    (module) => module.WorkspaceBrandView,
  )
);

const WorkspaceChannelsView = dynamic(() =>
  import('@/features/ai-chat/components/workspace/workspace-channels-view').then(
    (module) => module.WorkspaceChannelsView,
  )
);

const WorkspaceStrategyView = dynamic(() =>
  import('@/features/ai-chat/components/workspace/workspace-strategy-view').then(
    (module) => module.WorkspaceStrategyView,
  )
);

const WorkspaceAnalyticsView = dynamic(() =>
  import('@/features/ai-chat/components/workspace/workspace-analytics-view').then(
    (module) => module.WorkspaceAnalyticsView,
  )
);

const AgentSidecarContainer = dynamic(
  () =>
    import(
      '@/features/ai-chat/components/workspace/agent-sidecar-container'
    ).then((module) => module.AgentSidecarContainer),
  {
    loading: () => (
      <aside
        className='h-full w-full animate-pulse border-l border-slate-200 bg-card'
        aria-label='Đang nạp HiveK Agent'
      />
    ),
  },
);

const FactEditorDrawer = dynamic(() =>
  import('@/features/ai-chat/components/workspace/fact-editor-drawer').then(
    (module) => module.FactEditorDrawer,
  )
);

const ChannelProfileDrawer = dynamic(() =>
  import('@/features/ai-chat/components/workspace/channel-profile-drawers').then(
    (module) => module.ChannelProfileDrawer,
  )
);

const SatelliteProfileDrawer = dynamic(() =>
  import('@/features/ai-chat/components/workspace/channel-profile-drawers').then(
    (module) => module.SatelliteProfileDrawer,
  )
);

const WORKSPACE_VIEWS = new Set<WorkspaceViewId>([
  'overview',
  'brand',
  'channels',
  'satellites',
  'strategy',
  'analytics',
  'studio',
]);

type WorkspaceSelection = Partial<
  Record<'fact' | 'channel' | 'satellite', string>
>;

function isWorkspaceView(value: string | null): value is WorkspaceViewId {
  return Boolean(value && WORKSPACE_VIEWS.has(value as WorkspaceViewId));
}

function logWorkspaceNavigation(
  view: WorkspaceViewId,
  selection?: WorkspaceSelection,
): void {
  console.group('[HIVE-K demo] Điều hướng Agent workspace');
  console.info('Trang đích:', view);
  if (selection && Object.keys(selection).length > 0) {
    console.info('Đối tượng được mở:', selection);
  }
  console.groupEnd();
}

type AgentWorkspacePageProps = {
  onRestart: () => void;
};

export function AgentWorkspacePage({ onRestart }: AgentWorkspacePageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const navItems = useBusinessNavItems();
  const [agentOpen, setAgentOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [studioDirty, setStudioDirty] = useState(false);
  const agentPanelRef = useRef<HTMLDivElement>(null);
  const agentReturnFocusRef = useRef<HTMLElement | null>(null);

  const {
    data,
    status,
    error: workspaceError,
    reload,
    updateFact,
    confirmFact,
    updateChannel,
    confirmChannel,
    updateSatellite,
    confirmSatellite,
    updateStrategy,
    confirmStrategy,
    updateStudioConfig,
  } = useAgentWorkspace();

  const requestedView = searchParams.get('view');
  const activeView: WorkspaceViewId = isWorkspaceView(requestedView)
    ? requestedView
    : 'overview';

  useLayoutEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 1280px)');
    const syncViewport = () => {
      setIsDesktop(desktopQuery.matches);
      setAgentOpen(desktopQuery.matches);
    };

    syncViewport();
    desktopQuery.addEventListener('change', syncViewport);
    return () => desktopQuery.removeEventListener('change', syncViewport);
  }, []);

  const closeAgent = useCallback(() => {
    setAgentOpen(false);
    window.requestAnimationFrame(() => agentReturnFocusRef.current?.focus());
  }, []);

  const toggleAgent = useCallback(() => {
    if (agentOpen) {
      closeAgent();
      return;
    }

    agentReturnFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    setAgentOpen(true);
  }, [agentOpen, closeAgent]);

  useEffect(() => {
    if (!agentOpen) return;

    if (!isDesktop) {
      window.requestAnimationFrame(() => agentPanelRef.current?.focus());
    }

    const handleAgentKeyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAgent();
        return;
      }
      if (event.key !== 'Tab' || isDesktop || !agentPanelRef.current) return;

      const focusable = Array.from(
        agentPanelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.getClientRects().length > 0);

      if (focusable.length === 0) {
        event.preventDefault();
        agentPanelRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (document.activeElement === agentPanelRef.current) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleAgentKeyboard);
    return () => window.removeEventListener('keydown', handleAgentKeyboard);
  }, [agentOpen, closeAgent, isDesktop]);

  const replaceLocation = useCallback(
    (view: WorkspaceViewId, selection?: WorkspaceSelection) => {
      if (
        activeView === 'studio'
        && view !== 'studio'
        && studioDirty
        && !window.confirm(
          'Bạn có thay đổi Studio chưa xác nhận. Rời Studio bây giờ? Bản nháp chỉ được giữ nếu Tự động lưu đang bật.',
        )
      ) {
        return;
      }

      const next = new URLSearchParams(searchParamsKey);
      next.set('view', view);
      next.delete('fact');
      next.delete('channel');
      next.delete('satellite');

      Object.entries(selection ?? {}).forEach(([key, value]) => {
        if (value) next.set(key, value);
      });

      if (view !== 'studio') setStudioDirty(false);
      router.push(`/ai-chat?${next.toString()}`, { scroll: false });
      logWorkspaceNavigation(view, selection);
    },
    [activeView, router, searchParamsKey, studioDirty],
  );

  const openFromAgent = useCallback(
    (view: WorkspaceViewId, selection?: WorkspaceSelection) => {
      replaceLocation(view, selection);
      if (!isDesktop) closeAgent();
    },
    [closeAgent, isDesktop, replaceLocation],
  );

  const navigateFromAgent = useCallback(
    (view: WorkspaceViewId) => openFromAgent(view),
    [openFromAgent],
  );

  const closeSelection = useCallback(
    (key: keyof WorkspaceSelection) => {
      const next = new URLSearchParams(searchParamsKey);
      next.delete(key);
      router.replace(`/ai-chat?${next.toString()}`, { scroll: false });
    },
    [router, searchParamsKey],
  );

  const selectedFact = useMemo(
    () =>
      activeView === 'brand'
        ? data?.brand.facts.find(
          (fact) => fact.id === searchParams.get('fact'),
        ) ?? null
        : null,
    [activeView, data, searchParams],
  );
  const selectedChannel = useMemo(
    () =>
      activeView === 'channels'
        ? data?.channels.find(
          (channel) => channel.id === searchParams.get('channel'),
        ) ?? null
        : null,
    [activeView, data, searchParams],
  );
  const selectedSatellite = useMemo(
    () =>
      activeView === 'satellites'
        ? data?.satellites.find(
          (satellite) => satellite.id === searchParams.get('satellite'),
        ) ?? null
        : null,
    [activeView, data, searchParams],
  );

  const agentContextActions = useMemo<AgentContextAction[]>(() => {
    if (!data) return [];

    if (activeView === 'overview' || activeView === 'brand') {
      const pendingFact = data.brand.facts.find(
        (fact) => fact.status === 'needs_review',
      );
      return pendingFact
        ? [
          {
            id: `review-${pendingFact.id}`,
            label: `Kiểm tra ${pendingFact.label}`,
            description: 'Agent mở đúng dữ kiện cùng nguồn để bạn chỉnh và xác nhận.',
            onSelect: () => openFromAgent('brand', { fact: pendingFact.id }),
          },
        ]
        : [];
    }

    if (activeView === 'channels') {
      const pendingChannel = data.channels.find(
        (channel) => channel.status === 'needs_review',
      );
      return pendingChannel
        ? [
          {
            id: `review-${pendingChannel.id}`,
            label: `Duyệt hồ sơ ${pendingChannel.displayName}`,
            description: 'Mở vai trò, audience, cadence và quyền kênh đã điền.',
            onSelect: () => openFromAgent('channels', { channel: pendingChannel.id }),
          },
        ]
        : [];
    }

    if (activeView === 'satellites') {
      const suggestion = data.satellites.find(
        (satellite) => satellite.status === 'suggested',
      );
      return suggestion
        ? [
          {
            id: `review-${suggestion.id}`,
            label: `Duyệt ${suggestion.profile.displayName}`,
            description: 'Mở hồ sơ vệ tinh để chỉnh bio, handle, CTA và guardrail.',
            onSelect: () => openFromAgent('satellites', { satellite: suggestion.id }),
          },
        ]
        : [];
    }

    if (activeView === 'strategy' && data.strategy.status === 'needs_review') {
      return [
        {
          id: 'confirm-strategy',
          label: 'Xác nhận kế hoạch 90 ngày',
          description: 'Xác nhận rõ ràng phiên bản đang hiển thị; không xuất bản nội dung.',
          onSelect: () => {
            confirmStrategy();
            if (!isDesktop) closeAgent();
          },
        },
      ];
    }

    const priority = data.analytics.priorities[0];
    return activeView === 'analytics' && priority
      ? [
        {
          id: `open-${priority.id}`,
          label: priority.recommendedAction,
          description: 'Đi tới màn hình liên quan để kiểm tra phạm vi trước khi áp dụng.',
          onSelect: () => openFromAgent(priority.relatedView),
        },
      ]
      : [];
  }, [
    activeView,
    closeAgent,
    confirmStrategy,
    data,
    isDesktop,
    openFromAgent,
  ]);

  let workspaceContent;

  if (status === 'error') {
    workspaceContent = (
      <WorkspaceErrorState
        message={workspaceError ?? 'Không thể nạp dữ liệu workspace.'}
        onRetry={() => void reload()}
      />
    );
  } else if (!data || status === 'idle' || status === 'loading') {
    workspaceContent = <WorkspaceLoadingState />;
  } else {
    switch (activeView) {
      case 'brand':
        workspaceContent = (
          <WorkspaceBrandView
            workspaceName={data.workspace.name}
            brand={data.brand}
            onEditFact={(factId) => replaceLocation('brand', { fact: factId })}
            onConfirmFact={confirmFact}
          />
        );
        break;
      case 'channels':
      case 'satellites':
        workspaceContent = (
          <WorkspaceChannelsView
            workspaceName={data.workspace.name}
            mode={activeView}
            channels={data.channels}
            satellites={data.satellites}
            onNavigate={replaceLocation}
            onOpenChannel={(channelId) => replaceLocation('channels', { channel: channelId })}
            onOpenSatellite={(satelliteId) =>
              replaceLocation('satellites', { satellite: satelliteId })}
            onConfirmChannel={confirmChannel}
            onConfirmSatellite={confirmSatellite}
          />
        );
        break;
      case 'strategy':
        workspaceContent = (
          <WorkspaceStrategyView
            strategy={data.strategy}
            onUpdateStrategy={updateStrategy}
            onConfirmStrategy={confirmStrategy}
          />
        );
        break;
      case 'analytics':
        workspaceContent = (
          <WorkspaceAnalyticsView
            analytics={data.analytics}
            onNavigate={replaceLocation}
          />
        );
        break;
      case 'studio':
        workspaceContent = (
          <WorkspaceStudioView
            config={data.studio}
            sources={data.sources}
            onSave={updateStudioConfig}
            onDirtyChange={setStudioDirty}
          />
        );
        break;
      case 'overview':
      default:
        workspaceContent = (
          <WorkspaceOverviewView
            data={data}
            onNavigate={replaceLocation}
            onOpenFact={(factId) => replaceLocation('brand', { fact: factId })}
          />
        );
    }
  }

  return (
    <main className='flex h-dvh min-h-0 w-full overflow-hidden bg-background-light'>
      <a
        href='#agent-workspace-content'
        className='sr-only z-[70] rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:outline-none focus:ring-2 focus:ring-primary'
      >
        Chuyển đến nội dung workspace
      </a>

      <DashboardSidebar items={navItems} />

      <section className='relative flex min-w-0 flex-1 flex-col overflow-hidden'>
        {data
          ? (
            <WorkspaceHeader
              workspaceName={data.workspace.name}
              websiteUrl={data.workspace.websiteUrl}
              readinessScore={data.brand.readiness.score}
              currentView={activeView}
              businessNavItems={navItems}
              agentOpen={agentOpen}
              onNavigate={replaceLocation}
              onToggleAgent={toggleAgent}
              onRestart={onRestart}
            />
          )
          : (
            <div
              className='h-[7.25rem] shrink-0 animate-pulse border-b border-slate-200 bg-card'
              aria-hidden
            />
          )}

        <div className='relative flex min-h-0 flex-1 overflow-hidden'>
          <div
            id='agent-workspace-content'
            tabIndex={-1}
            className='min-w-0 flex-1 overflow-y-auto overscroll-contain bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_22%,#f8fafc_100%)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary'
          >
            {workspaceContent}
          </div>

          {agentOpen
            ? (
              <>
                <button
                  type='button'
                  aria-label='Đóng HiveK Agent'
                  className='fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[1px] xl:hidden'
                  onClick={closeAgent}
                />
                <div
                  id='hivek-agent-sidecar'
                  ref={agentPanelRef}
                  tabIndex={-1}
                  role={isDesktop ? undefined : 'dialog'}
                  aria-modal={isDesktop ? undefined : true}
                  aria-label={isDesktop ? undefined : 'HiveK Agent'}
                  className='fixed inset-y-0 right-0 z-50 w-[min(94vw,25rem)] shadow-2xl xl:static xl:z-auto xl:w-[25rem] xl:shrink-0 xl:shadow-none'
                >
                  <AgentSidecarContainer
                    currentView={activeView}
                    workspaceName={data?.workspace.name ?? 'workspace'}
                    contextActions={agentContextActions}
                    onNavigate={navigateFromAgent}
                    onClose={closeAgent}
                  />
                </div>
              </>
            )
            : null}
        </div>
      </section>

      {selectedFact
        ? (
          <FactEditorDrawer
            fact={selectedFact}
            onClose={() => closeSelection('fact')}
            onUpdate={updateFact}
            onConfirm={confirmFact}
          />
        )
        : null}
      {selectedChannel
        ? (
          <ChannelProfileDrawer
            channel={selectedChannel}
            onClose={() => closeSelection('channel')}
            onUpdate={updateChannel}
            onConfirm={confirmChannel}
          />
        )
        : null}
      {selectedSatellite
        ? (
          <SatelliteProfileDrawer
            satellite={selectedSatellite}
            onClose={() => closeSelection('satellite')}
            onUpdate={updateSatellite}
            onConfirm={confirmSatellite}
          />
        )
        : null}
    </main>
  );
}
