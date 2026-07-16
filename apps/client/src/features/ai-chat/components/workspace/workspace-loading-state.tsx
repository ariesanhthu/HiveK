import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function WorkspaceLoadingState() {
  return (
    <div
      className="mx-auto w-full max-w-7xl space-y-5 px-4 py-5 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-label="Đang tải hồ sơ workspace"
    >
      <div className="animate-pulse space-y-3 motion-reduce:animate-none">
        <div className="h-4 w-36 rounded-full bg-slate-200" />
        <div className="h-9 w-full max-w-xl rounded-xl bg-slate-200" />
        <div className="h-4 w-full max-w-2xl rounded-full bg-slate-100" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-card p-4 motion-reduce:animate-none"
          >
            <div className="h-3 w-20 rounded-full bg-slate-100" />
            <div className="mt-4 h-7 w-24 rounded-lg bg-slate-200" />
            <div className="mt-3 h-3 w-32 rounded-full bg-slate-100" />
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-card p-4 sm:p-5">
          <div className="h-5 w-48 animate-pulse rounded-full bg-slate-200 motion-reduce:animate-none" />
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none"
            />
          ))}
        </div>
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-card p-4 sm:p-5">
          <div className="h-5 w-36 animate-pulse rounded-full bg-slate-200 motion-reduce:animate-none" />
          <div className="h-44 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none" />
          <div className="h-20 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none" />
        </div>
      </div>
      <span className="sr-only" role="status">
        Đang tải và chuẩn bị dữ liệu workspace. Bạn có thể tiếp tục khi nội dung xuất hiện.
      </span>
    </div>
  );
}

type WorkspaceErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function WorkspaceErrorState({
  message,
  onRetry,
}: WorkspaceErrorStateProps) {
  return (
    <section className="mx-auto flex min-h-[28rem] w-full max-w-2xl items-center px-4 py-10">
      <div className="w-full rounded-2xl border border-red-200 bg-card p-6 shadow-sm">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertTriangle className="size-5" aria-hidden />
        </span>
        <h2 className="mt-4 text-xl font-extrabold tracking-tight text-foreground">
          Chưa tải được hồ sơ workspace
        </h2>
        <p className="mt-2 text-sm leading-6 text-foreground-muted">
          Dữ liệu đã lưu trước đó không bị thay đổi. {message}
        </p>
        <Button className="mt-5" onClick={onRetry}>
          <RefreshCcw className="size-4" aria-hidden />
          Tải lại hồ sơ
        </Button>
      </div>
    </section>
  );
}
