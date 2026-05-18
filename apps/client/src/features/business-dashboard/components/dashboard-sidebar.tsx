import Link from "next/link";
import { type DashboardNavItem } from "@/features/business-dashboard/types";

type DashboardSidebarProps = {
  items: DashboardNavItem[];
};

export function DashboardSidebar({ items }: DashboardSidebarProps) {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-primary-soft bg-card p-5 md:flex md:flex-col">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-background-dark">
          <span className="material-symbols-outlined text-sm">hub</span>
        </div>
        <p className="text-base font-bold text-foreground">Phân tích KOL</p>
      </div>

      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-foreground-muted">
        Menu chính
      </p>
      <nav className="space-y-1.5">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
              item.isActive
                ? "bg-primary text-background-dark"
                : "text-foreground-muted hover:bg-primary-soft hover:text-foreground"
            }`}
          >
            <span className="material-symbols-outlined text-base">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
