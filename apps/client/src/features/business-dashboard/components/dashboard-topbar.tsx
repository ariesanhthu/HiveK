export function DashboardTopbar() {
  return (
    <header className="border-b border-primary-soft bg-card px-4 py-3 md:px-6">
      <div className="w-full max-w-xl">
        <div className="flex items-center gap-2 rounded-xl border border-primary-soft bg-primary-soft px-3 py-2">
          <span className="material-symbols-outlined text-base text-foreground-muted">
            search
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm creator hoặc chiến dịch..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground-muted focus:outline-none"
          />
        </div>
      </div>
    </header>
  );
}
