import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Lightbulb,
  Megaphone,
  Rocket,
  Sparkles,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { AgentAvatar } from "@/features/ai-chat/components/agent-avatar";
import type { AiChatIntent } from "@/features/ai-chat/types";

export type ChatWelcomePrompt = {
  id: AiChatIntent;
  label: string;
  description: string;
  icon: string;
};

type ChatWelcomeProps = {
  prompts: readonly ChatWelcomePrompt[];
  onSelectPrompt: (promptId: AiChatIntent) => void;
};

const PROMPT_ICONS: Record<string, LucideIcon> = {
  rocket: Rocket,
  calendar: CalendarDays,
  megaphone: Megaphone,
  users: UsersRound,
  chart: BarChart3,
  idea: Lightbulb,
};

const DEFAULT_ICON = Sparkles;

export function ChatWelcome({ prompts, onSelectPrompt }: ChatWelcomeProps) {
  const [quickStart, ...suggestions] = prompts;

  return (
    <section className="relative flex min-h-full items-center justify-center overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.10),transparent_68%)]"
        aria-hidden
      />

      <div className="relative w-full max-w-3xl">
        <div className="mb-7 text-center sm:mb-9">
          <AgentAvatar size="lg" className="mx-auto" />
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
            Trợ lý tăng trưởng của bạn
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl text-balance text-3xl font-extrabold tracking-[-0.035em] text-foreground sm:text-4xl">
            Hôm nay bạn muốn HiveK hỗ trợ điều gì?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-sm leading-6 text-foreground-muted sm:text-[15px]">
            Thiết lập workspace, lên kế hoạch nội dung và vận hành chiến dịch qua
            một cuộc trò chuyện đơn giản.
          </p>
        </div>

        {quickStart ? (
          <button
            type="button"
            onClick={() => onSelectPrompt(quickStart.id)}
            className="group flex w-full touch-manipulation items-center gap-4 overflow-hidden rounded-2xl border border-amber-200 bg-[linear-gradient(110deg,#fffaf0_0%,#ffffff_68%)] p-4 text-left shadow-[0_12px_35px_rgba(245,158,11,0.08)] transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-[0_16px_40px_rgba(245,158,11,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 motion-reduce:transform-none motion-reduce:transition-none sm:p-5"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-background-dark shadow-[0_8px_20px_rgba(245,158,11,0.22)] sm:size-12">
              <Rocket className="size-5" strokeWidth={2.2} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-extrabold text-foreground sm:text-base">
                {quickStart.label}
              </span>
              <span className="mt-1 block text-xs leading-5 text-foreground-muted sm:text-sm">
                {quickStart.description}
              </span>
            </span>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-white text-amber-700 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none">
              <ArrowRight className="size-4" aria-hidden />
            </span>
          </button>
        ) : null}

        {suggestions.length > 0 ? (
          <div className="mt-5">
            <p className="mb-2.5 px-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Hoặc bắt đầu với một yêu cầu
            </p>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {suggestions.map((prompt) => {
                const Icon = PROMPT_ICONS[prompt.icon] ?? DEFAULT_ICON;

                return (
                  <button
                    key={prompt.id}
                    type="button"
                    onClick={() => onSelectPrompt(prompt.id)}
                    className="group flex min-h-24 touch-manipulation items-start gap-3 rounded-2xl border border-slate-200 bg-card p-4 text-left transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-[0_10px_28px_rgba(15,23,42,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 motion-reduce:transform-none motion-reduce:transition-none"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors group-hover:bg-primary-soft group-hover:text-amber-700">
                      <Icon className="size-[1.1rem]" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-foreground">
                        {prompt.label}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-foreground-muted">
                        {prompt.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
