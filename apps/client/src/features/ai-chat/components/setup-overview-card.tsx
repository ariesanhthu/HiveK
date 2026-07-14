import { Check, FolderOpen, Link2, Palette, ShieldCheck } from "lucide-react";
import type { AiChatSetupProgress, SetupStepId } from "@/features/ai-chat/types";
import { cn } from "@/lib/utils";

type SetupOverviewCardProps = {
  progress: AiChatSetupProgress;
};

const SETUP_STEPS: ReadonlyArray<{
  id: SetupStepId;
  label: string;
  description: string;
  icon: typeof Link2;
}> = [
  {
    id: "social",
    label: "Kênh mạng xã hội",
    description: "Chọn các nền tảng thương hiệu đang sử dụng",
    icon: Link2,
  },
  {
    id: "brand",
    label: "Nhận diện thương hiệu",
    description: "Tên thương hiệu và giọng điệu nội dung",
    icon: Palette,
  },
  {
    id: "drive",
    label: "Kho tài nguyên",
    description: "Đường dẫn Drive chứa logo, ảnh và guideline",
    icon: FolderOpen,
  },
];

export function SetupOverviewCard({ progress }: SetupOverviewCardProps) {
  return (
    <section className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-[0_8px_26px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-amber-700">
            <ShieldCheck className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-foreground">
              Thiết lập workspace
            </h3>
            <p className="mt-0.5 text-[11px] text-foreground-muted">
              Hoàn thành lần lượt trong cuộc trò chuyện
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
          {progress.completed}/{progress.total}
        </span>
      </div>

      <div className="px-4 pt-4 sm:px-5">
        <div
          className="h-1.5 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-label="Tiến độ thiết lập workspace"
          aria-valuemin={0}
          aria-valuemax={progress.total}
          aria-valuenow={progress.completed}
        >
          <div
            className="h-full w-full origin-left rounded-full bg-[linear-gradient(90deg,#f59e0b,#fb923c)] transition-transform duration-300 motion-reduce:transition-none"
            style={{ transform: `scaleX(${progress.percent / 100})` }}
          />
        </div>
      </div>

      <ol className="space-y-1 p-2.5 sm:p-3">
        {SETUP_STEPS.map((step, index) => {
          const isCompleted = progress.completedSteps.includes(step.id);
          const isNext = progress.nextStep === step.id;
          const Icon = step.icon;

          return (
            <li
              key={step.id}
              className={cn(
                "flex items-center gap-3 rounded-xl px-2.5 py-2.5",
                isNext ? "bg-amber-50/80" : undefined
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-xl border text-xs font-bold",
                  isCompleted
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                    : isNext
                      ? "border-amber-200 bg-white text-amber-700"
                      : "border-slate-200 bg-slate-50 text-slate-400"
                )}
              >
                {isCompleted ? (
                  <Check className="size-4" aria-hidden />
                ) : (
                  <Icon className="size-4" aria-hidden />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-foreground sm:text-sm">
                  {step.label}
                </span>
                <span className="mt-0.5 block text-[11px] leading-4 text-foreground-muted sm:text-xs">
                  {step.description}
                </span>
              </span>
              <span
                className={cn(
                  "shrink-0 text-[10px] font-bold uppercase tracking-wide",
                  isCompleted
                    ? "text-emerald-600"
                    : isNext
                      ? "text-amber-700"
                      : "text-slate-400"
                )}
              >
                {isCompleted ? "Đã xong" : isNext ? "Tiếp theo" : `0${index + 1}`}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
