"use client";

import Link from "next/link";
import {
  CalendarRange,
  ChevronRight,
  PanelRightClose,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentAvatar } from "@/features/ai-chat/components/agent-avatar";
import { ChatComposer } from "@/features/ai-chat/components/chat-composer";
import { ChatConversation } from "@/features/ai-chat/components/chat-conversation";
import type {
  AiChatAction,
  AiChatMessage,
  AiChatSetup,
  AiChatSetupProgress,
  BrandToneId,
  SocialPlatformId,
} from "@/features/ai-chat/types";
import { cn } from "@/lib/utils";

export type AgentWorkspaceView =
  | "overview"
  | "brand"
  | "channels"
  | "satellites"
  | "strategy"
  | "analytics"
  | "studio";

type AgentShortcut = {
  label: string;
  description: string;
  view: AgentWorkspaceView;
};

export type AgentContextAction = {
  id: string;
  label: string;
  description: string;
  onSelect: () => void;
};

const VIEW_LABELS: Record<AgentWorkspaceView, string> = {
  overview: "Tổng quan",
  brand: "Hồ sơ thương hiệu",
  channels: "Kênh & vệ tinh",
  satellites: "Hồ sơ vệ tinh",
  strategy: "Chiến lược",
  analytics: "Phân tích",
  studio: "Studio",
};

const SHORTCUTS_BY_VIEW: Record<AgentWorkspaceView, readonly AgentShortcut[]> = {
  overview: [
    {
      label: "Duyệt hồ sơ đã điền",
      description: "Kiểm tra các dữ kiện và nguồn quan trọng.",
      view: "brand",
    },
    {
      label: "Xem đề xuất kênh vệ tinh",
      description: "Mở hồ sơ kênh đã được chuẩn bị sẵn.",
      view: "satellites",
    },
    {
      label: "Hoàn thiện cấu hình Studio",
      description: "Kiểm tra quyền, duyệt, xuất bản và quy tắc Agent.",
      view: "studio",
    },
  ],
  brand: [
    {
      label: "Mở kênh áp dụng hồ sơ",
      description: "Xem vai trò, đối tượng và giọng điệu từng kênh.",
      view: "channels",
    },
    {
      label: "Đối chiếu chiến lược",
      description: "Kiểm tra hồ sơ đang được dùng trong kế hoạch nào.",
      view: "strategy",
    },
  ],
  channels: [
    {
      label: "Xem lộ trình xây kênh",
      description: "Mở chiến lược 90 ngày theo từng vai trò kênh.",
      view: "strategy",
    },
    {
      label: "So sánh hiệu quả kênh",
      description: "Xem độ phủ, chất lượng dữ liệu và tín hiệu tăng trưởng.",
      view: "analytics",
    },
  ],
  satellites: [
    {
      label: "Xem kênh đang vận hành",
      description: "Đối chiếu khoảng trống với hệ thống kênh hiện tại.",
      view: "channels",
    },
    {
      label: "Xem lộ trình ra mắt",
      description: "Đưa hồ sơ vệ tinh đã duyệt vào chiến lược 90 ngày.",
      view: "strategy",
    },
  ],
  strategy: [
    {
      label: "Kiểm tra tín hiệu hiệu quả",
      description: "Đối chiếu đề xuất với dữ liệu và mức tin cậy.",
      view: "analytics",
    },
    {
      label: "Chỉnh quy tắc xuất bản",
      description: "Cấu hình duyệt và giới hạn theo kênh.",
      view: "studio",
    },
  ],
  analytics: [
    {
      label: "Áp dụng vào chiến lược",
      description: "Mở kế hoạch kênh để xem phạm vi thay đổi.",
      view: "strategy",
    },
    {
      label: "Chỉnh hồ sơ kênh",
      description: "Cập nhật vai trò hoặc nhịp nội dung theo insight.",
      view: "channels",
    },
  ],
  studio: [
    {
      label: "Quay lại việc cần xử lý",
      description: "Xem readiness và các mục đang chờ xác nhận.",
      view: "overview",
    },
    {
      label: "Kiểm tra hồ sơ thương hiệu",
      description: "Đối chiếu dữ kiện sau khi đổi cấu hình.",
      view: "brand",
    },
  ],
};

type AgentSidecarProps = {
  className?: string;
  currentView: AgentWorkspaceView;
  workspaceName: string;
  messages: AiChatMessage[];
  setup: AiChatSetup;
  setupProgress: AiChatSetupProgress;
  isLoading: boolean;
  error: string | null;
  isBackendAvailable: boolean;
  contextActions?: AgentContextAction[];
  onNavigate: (view: AgentWorkspaceView) => void;
  onClose: () => void;
  onReset: () => void;
  onSubmit: (message: string) => void;
  onAction: (action: AiChatAction) => void;
  onCompleteSocial: (platforms: SocialPlatformId[]) => void;
  onCompleteBrand: (name: string, tone: BrandToneId) => void;
  onCompleteDrive: (url: string) => void;
};

export function AgentSidecar({
  className,
  currentView,
  workspaceName,
  messages,
  setup,
  setupProgress,
  isLoading,
  error,
  isBackendAvailable,
  contextActions = [],
  onNavigate,
  onClose,
  onReset,
  onSubmit,
  onAction,
  onCompleteSocial,
  onCompleteBrand,
  onCompleteDrive,
}: AgentSidecarProps) {
  const hasConversation = messages.length > 0;
  const shortcuts = SHORTCUTS_BY_VIEW[currentView];

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 w-full flex-col overflow-hidden border-l border-slate-200 bg-card",
        className
      )}
      aria-label="HiveK Agent"
    >
      <header className="flex h-[4.5rem] shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <AgentAvatar size="sm" variant={isLoading ? "action" : "friendly"} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="truncate text-sm font-extrabold text-foreground">
                HiveK Agent
              </h2>
              <Sparkles className="size-3.5 text-amber-600" aria-hidden />
            </div>
            <p className="truncate text-[11px] text-foreground-muted">
              Đang hỗ trợ tại {VIEW_LABELS[currentView]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {hasConversation ? (
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              onClick={onReset}
              disabled={isLoading}
              aria-label="Bắt đầu hội thoại mới"
            >
              <RotateCcw className="size-4" aria-hidden />
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            onClick={onClose}
            aria-label="Đóng HiveK Agent"
          >
            <PanelRightClose className="size-4" aria-hidden />
          </Button>
        </div>
      </header>

      {!isBackendAvailable || error ? (
        <div className="shrink-0 border-b border-amber-100 bg-amber-50 px-4 py-2.5">
          <p className="text-xs leading-5 text-amber-800" role="status">
            {error
              ? `Tác vụ tạo nội dung chưa hoàn tất: ${error}`
              : "Kết nối tạo nội dung đang gián đoạn. Dữ liệu workspace vẫn có thể xem và chỉnh sửa."}
          </p>
        </div>
      ) : null}

      {contextActions.length > 0 ? (
        <section
          className="shrink-0 border-b border-slate-200 bg-amber-50/55 px-3 py-3"
          aria-labelledby="agent-context-actions"
        >
          <h3
            id="agent-context-actions"
            className="px-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-amber-800"
          >
            Agent có thể xử lý tiếp
          </h3>
          <div className="mt-2 space-y-1.5">
            {contextActions.slice(0, 2).map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={action.onSelect}
                className="block w-full rounded-xl border border-amber-200 bg-card px-3 py-2 text-left transition-colors hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <span className="block text-xs font-bold text-foreground">
                  {action.label}
                </span>
                <span className="mt-0.5 block text-[10px] leading-4 text-foreground-muted">
                  {action.description}
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {hasConversation ? (
        <details className="group shrink-0 border-b border-slate-200 bg-slate-50/80">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 text-xs font-bold text-foreground-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40 [&::-webkit-details-marker]:hidden">
            Đi tới tác vụ trên trang
            <ChevronRight
              className="size-4 transition-transform group-open:rotate-90 motion-reduce:transition-none"
              aria-hidden
            />
          </summary>
          <div className="grid gap-2 px-3 pb-3 sm:grid-cols-2 xl:grid-cols-1">
            {shortcuts.slice(0, 2).map((shortcut) => (
              <button
                key={`${currentView}-conversation-${shortcut.view}`}
                type="button"
                onClick={() => onNavigate(shortcut.view)}
                className="rounded-xl border border-slate-200 bg-card px-3 py-2 text-left text-[11px] font-bold leading-4 text-foreground transition-colors hover:border-amber-200 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {shortcut.label}
              </button>
            ))}
          </div>
        </details>
      ) : null}

      {hasConversation ? (
        <ChatConversation
          messages={messages}
          setup={setup}
          setupProgress={setupProgress}
          isLoading={isLoading}
          onAction={onAction}
          onCompleteSocial={onCompleteSocial}
          onCompleteBrand={onCompleteBrand}
          onCompleteDrive={onCompleteDrive}
        />
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5">
          <div className="rounded-2xl border border-amber-200 bg-[linear-gradient(135deg,#fffaf0,#ffffff)] p-4">
            <AgentAvatar size="lg" variant="action" showStatus={false} />
            <h3 className="mt-4 text-base font-extrabold text-foreground">
              Mình đã chuẩn bị hồ sơ {workspaceName}
            </h3>
            <p className="mt-2 text-xs leading-5 text-foreground-muted">
              Chọn một hành động để mình đưa bạn đến đúng màn hình. Dữ liệu đã được điền sẵn, bạn chỉ cần kiểm tra, chỉnh sửa và xác nhận.
            </p>
            <Link
              href="/campaign-planning"
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-extrabold text-slate-950 shadow-[0_8px_20px_rgba(245,158,11,0.2)] transition-colors hover:bg-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <CalendarRange className="size-4" aria-hidden />
              Bắt đầu lên kế hoạch đăng bài
            </Link>
          </div>

          <section className="mt-5" aria-labelledby="agent-next-actions">
            <h3
              id="agent-next-actions"
              className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-400"
            >
              Việc nên làm tiếp theo
            </h3>
            <div className="mt-2 space-y-2">
              {shortcuts.map((shortcut) => (
                <button
                  key={`${currentView}-${shortcut.view}`}
                  type="button"
                  onClick={() => onNavigate(shortcut.view)}
                  className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-card p-3 text-left transition-colors hover:border-amber-200 hover:bg-amber-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-foreground">
                      {shortcut.label}
                    </span>
                    <span className="mt-1 block text-[11px] leading-4 text-foreground-muted">
                      {shortcut.description}
                    </span>
                  </span>
                  <ChevronRight
                    className="size-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                    aria-hidden
                  />
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      <ChatComposer onSubmit={onSubmit} isPending={isLoading} />
    </aside>
  );
}
