import Link from "next/link";
import { AgentAvatar } from "@/features/ai-chat/components/agent-avatar";
import { type DashboardNavItem } from "@/features/business-dashboard/types";

type DashboardSidebarProps = {
  items: DashboardNavItem[];
};

export function DashboardSidebar({ items }: DashboardSidebarProps) {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 overflow-hidden border-r border-primary-soft bg-card p-4 md:flex md:flex-col">
      <Link
        href="/dashboard"
        className="mb-5 flex shrink-0 items-center gap-3 rounded-2xl outline-none ring-offset-2 ring-offset-card transition-opacity hover:opacity-85 focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="HiveK Dashboard"
      >
        <AgentAvatar
          size="md"
          variant="friendly"
          showStatus={false}
        />
        <span className="min-w-0">
          <span className="block text-base font-extrabold leading-tight text-foreground">
            HiveK
          </span>
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">
            Business
          </span>
        </span>
      </Link>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">
          Menu chính
        </p>
        <nav className="space-y-1">
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              aria-current={item.isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                item.isActive
                  ? "bg-primary text-background-dark"
                  : "text-foreground-muted hover:bg-primary-soft hover:text-foreground"
              }`}
            >
              {item.id === "ai-chat" ? (
                <AgentAvatar
                  size="xs"
                  variant={item.isActive ? "action" : "friendly"}
                  showStatus={false}
                  className="border-0 bg-transparent shadow-none"
                />
              ) : (
                <span className="material-symbols-outlined text-base" aria-hidden>
                  {item.icon}
                </span>
              )}
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.badgeCount ? (
                <span
                  className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                    item.isActive
                      ? "bg-background-dark text-on-dark"
                      : "bg-amber-100 text-amber-800"
                  }`}
                  aria-label={item.badgeLabel}
                  title={item.badgeLabel}
                >
                  {item.badgeCount > 99 ? "99+" : item.badgeCount}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-3 shrink-0 border-t border-primary-soft pt-3">
        <div className="mb-2 flex items-center gap-3 rounded-xl bg-primary-soft/60 p-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-background-dark">
            B
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">
              Brand Workspace
            </p>
            <p className="truncate text-xs text-foreground-muted">
              Quản trị doanh nghiệp
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className="flex h-9 items-center justify-center rounded-xl border border-primary-soft bg-card text-foreground-muted transition-colors hover:bg-primary-soft hover:text-foreground"
            aria-label="Thông báo"
          >
            <span className="material-symbols-outlined text-[18px]">
              notifications
            </span>
          </button>
          <button
            type="button"
            className="flex h-9 items-center justify-center rounded-xl border border-primary-soft bg-card text-foreground-muted transition-colors hover:bg-primary-soft hover:text-foreground"
            aria-label="Cài đặt"
          >
            <span className="material-symbols-outlined text-[18px]">
              settings
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}
