type DashboardTopbarProps = {
  periodLabel: string;
};

export function DashboardTopbar({ periodLabel }: DashboardTopbarProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-primary-soft bg-card px-4 py-3 md:px-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 rounded-xl border border-primary-soft bg-primary-soft px-3 py-2">
          <span className="material-symbols-outlined text-base text-foreground-muted">
            search
          </span>
          <input
            type="text"
            placeholder="Search creators or campaigns..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground-muted focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="rounded-full border border-primary-soft bg-muted px-3 py-1 text-xs font-medium text-foreground-muted">
          {periodLabel}
        </span>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-soft bg-card text-foreground-muted transition-colors hover:bg-primary-soft hover:text-foreground"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-[18px]">notifications</span>
        </button>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-primary-soft bg-card text-foreground-muted transition-colors hover:bg-primary-soft hover:text-foreground"
          aria-label="Settings"
        >
          <span className="material-symbols-outlined text-[18px]">settings</span>
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-background-dark">
          B
        </div>
      </div>
    </header>
  );
}
