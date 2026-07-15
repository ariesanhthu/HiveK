"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Wifi, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DashboardSidebar } from "@/features/business-dashboard/components/dashboard-sidebar";
import { useBusinessNavItems } from "@/features/business-dashboard/hooks/use-business-nav-items";
import { ConversationContextPanel } from "@/features/inbox/components/conversation-context-panel";
import { ConversationListPanel } from "@/features/inbox/components/conversation-list-panel";
import { ConversationPanel } from "@/features/inbox/components/conversation-panel";
import { useInbox } from "@/features/inbox/hooks/use-inbox";

export function InboxPage({ initialConversationId }: { initialConversationId?: string }) {
  const router = useRouter();
  const navItems = useBusinessNavItems();
  const inbox = useInbox(initialConversationId);
  const [isConversationOpen, setIsConversationOpen] = useState(Boolean(initialConversationId));
  const [isContextOpen, setIsContextOpen] = useState(false);

  useEffect(() => {
    if (!isContextOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsContextOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isContextOpen]);

  useEffect(() => {
    setIsConversationOpen(Boolean(initialConversationId));
  }, [initialConversationId]);

  const openConversation = (conversationId: string) => {
    inbox.selectConversation(conversationId);
    setIsConversationOpen(true);
    router.push(`/inbox/${conversationId}`, { scroll: false });
  };

  const closeConversation = () => {
    setIsConversationOpen(false);
    router.push("/inbox", { scroll: false });
  };

  return (
    <main className="flex h-screen w-full overflow-hidden bg-background-light">
      <DashboardSidebar items={navItems} />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0 border-b border-primary-soft bg-card px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">Hộp thư</h1>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">
                  {inbox.counts.needsHuman} cần xử lý
                </span>
              </div>
              <p className="mt-0.5 hidden text-xs text-foreground-muted sm:block">
                Hội thoại từ các kênh đã kết nối, được điều phối cùng AI Agent.
              </p>
            </div>
            <span className="hidden items-center gap-1.5 text-[11px] font-semibold text-emerald-700 sm:flex" role="status">
              <Wifi className="size-3.5" aria-hidden />
              Đang cập nhật trực tiếp
            </span>
            <Button size="icon" variant="outline" className="size-9" onClick={() => void inbox.retry()} aria-label="Làm mới hộp thư">
              <RefreshCw className="size-4" aria-hidden />
            </Button>
          </div>
        </header>

        {inbox.error ? (
          <div className="mx-4 mt-3 flex shrink-0 items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-800" role="alert">
            <span>{inbox.error}</span>
            <button type="button" onClick={() => void inbox.retry()} className="font-extrabold hover:underline">Thử lại</button>
          </div>
        ) : null}

        {inbox.selectedConversation?.capabilities.permissionStatus === "expired" ? (
          <div className="mx-4 mt-3 flex shrink-0 items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900 md:mx-5" role="status">
            <span><strong>Quyền nhắn tin đã hết hạn.</strong> Bạn vẫn có thể xem lịch sử đã đồng bộ.</span>
            <Button size="sm" variant="outline" className="shrink-0 bg-card">Kết nối lại</Button>
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-hidden md:p-4">
          <div className="grid h-full min-h-0 overflow-hidden bg-card md:grid-cols-[20rem_minmax(0,1fr)] md:rounded-xl md:border md:border-primary-soft md:shadow-sm 2xl:grid-cols-[20rem_minmax(0,1fr)_18rem]">
            <div className={`${isConversationOpen ? "hidden" : "block"} min-h-0 border-r border-primary-soft md:block`}>
              <ConversationListPanel
                conversations={inbox.filteredConversations}
                selectedId={inbox.selectedId}
                view={inbox.view}
                search={inbox.search}
                isLoading={inbox.isLoading}
                onViewChange={inbox.setView}
                onSearchChange={inbox.setSearch}
                onSelect={openConversation}
              />
            </div>

            <div className={`${isConversationOpen ? "flex" : "hidden"} min-h-0 min-w-0 flex-col md:flex`}>
              {inbox.selectedConversation ? (
                <ConversationPanel
                  conversation={inbox.selectedConversation}
                  mode={inbox.composerMode}
                  draft={inbox.draft}
                  suggestion={inbox.suggestion}
                  isSending={inbox.isSending}
                  onBack={closeConversation}
                  onOpenContext={() => setIsContextOpen(true)}
                  onTakeOver={inbox.takeOver}
                  onReturnToAi={inbox.returnToAi}
                  onToggleResolved={inbox.toggleResolved}
                  onTogglePriority={inbox.togglePriority}
                  onModeChange={inbox.setComposerMode}
                  onDraftChange={inbox.setDraft}
                  onSuggestionChange={inbox.setSuggestion}
                  onSuggest={inbox.suggestReply}
                  onSend={() => void inbox.sendMessage()}
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-background-light p-8 text-center">
                  <div>
                    <p className="text-sm font-extrabold text-foreground">Chọn một cuộc hội thoại</p>
                    <p className="mt-1 text-xs text-foreground-muted">Nội dung và ngữ cảnh khách hàng sẽ xuất hiện tại đây.</p>
                  </div>
                </div>
              )}
            </div>

            <aside className="hidden min-h-0 border-l border-primary-soft 2xl:block" aria-label="Thông tin khách hàng và AI">
              {inbox.selectedConversation ? (
                <ConversationContextPanel
                  conversation={inbox.selectedConversation}
                  onAssigneeChange={inbox.setAssignee}
                  onStatusChange={inbox.setStatus}
                />
              ) : null}
            </aside>
          </div>
        </div>
      </div>

      {isContextOpen && inbox.selectedConversation ? (
        <div className="fixed inset-0 z-50 bg-black/30" role="presentation" onMouseDown={() => setIsContextOpen(false)}>
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="inbox-context-title"
            className="ml-auto h-full w-full max-w-sm bg-card shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex h-14 items-center justify-between border-b border-primary-soft px-4">
              <h2 id="inbox-context-title" className="text-sm font-extrabold text-foreground">Thông tin hội thoại</h2>
              <Button autoFocus size="icon" variant="ghost" className="size-9" onClick={() => setIsContextOpen(false)} aria-label="Đóng thông tin hội thoại">
                <X className="size-4" aria-hidden />
              </Button>
            </div>
            <div className="h-[calc(100%-3.5rem)]">
              <ConversationContextPanel
                conversation={inbox.selectedConversation}
                onAssigneeChange={inbox.setAssignee}
                onStatusChange={inbox.setStatus}
              />
            </div>
          </aside>
        </div>
      ) : null}
    </main>
  );
}
