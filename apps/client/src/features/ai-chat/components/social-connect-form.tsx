"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SOCIAL_PLATFORM_OPTIONS } from "@/features/ai-chat/data/ai-chat-data";
import type { SocialPlatformId } from "@/features/ai-chat/types";
import { cn } from "@/lib/utils";

type SocialConnectFormProps = {
  initialPlatforms: SocialPlatformId[];
  onComplete: (platforms: SocialPlatformId[]) => void;
};

const PLATFORM_STYLE: Record<SocialPlatformId, string> = {
  facebook: "bg-[#1877f2] text-white",
  instagram:
    "bg-[linear-gradient(135deg,#f9ce34,#ee2a7b_52%,#6228d7)] text-white",
  tiktok: "bg-slate-950 text-white",
  youtube: "bg-[#ff0033] text-white",
  threads: "bg-slate-800 text-white",
};

const PLATFORM_MARK: Record<SocialPlatformId, string> = {
  facebook: "f",
  instagram: "◎",
  tiktok: "♪",
  youtube: "▶",
  threads: "@",
};

export function SocialConnectForm({
  initialPlatforms,
  onComplete,
}: SocialConnectFormProps) {
  const [selectedPlatforms, setSelectedPlatforms] =
    useState<SocialPlatformId[]>(initialPlatforms);
  const [isSubmitted, setIsSubmitted] = useState(false);

  function togglePlatform(platform: SocialPlatformId): void {
    setSelectedPlatforms((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform]
    );
  }

  return (
    <section className="mt-3 rounded-2xl border border-slate-200 bg-card p-4 shadow-[0_8px_26px_rgba(15,23,42,0.05)] sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Link2 className="size-[1.1rem]" aria-hidden />
        </span>
        <div>
          <h3 className="text-sm font-extrabold text-foreground">
            Chọn kênh đang hoạt động
          </h3>
          <p className="mt-1 text-xs leading-5 text-foreground-muted">
            Có thể chọn nhiều kênh. Bước này chỉ ghi nhận thủ công, chưa mở kết
            nối OAuth.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {SOCIAL_PLATFORM_OPTIONS.map((platform) => {
          const isSelected = selectedPlatforms.includes(platform.id);

          return (
            <button
              key={platform.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => togglePlatform(platform.id)}
              className={cn(
                "relative flex min-h-14 items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-xs font-bold transition-[border-color,background-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                isSelected
                  ? "border-amber-300 bg-amber-50 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.12)]"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-black",
                  PLATFORM_STYLE[platform.id]
                )}
              >
                {PLATFORM_MARK[platform.id]}
              </span>
              <span className="truncate text-foreground">{platform.label}</span>
              {isSelected ? (
                <span className="absolute right-2 top-2 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Check className="size-2.5" strokeWidth={3} aria-hidden />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          size="sm"
          className="h-11 touch-manipulation sm:h-9"
          disabled={selectedPlatforms.length === 0 || isSubmitted}
          onClick={() => {
            setIsSubmitted(true);
            onComplete(selectedPlatforms);
          }}
        >
          <Check className="size-3.5" aria-hidden />
          Xác nhận {selectedPlatforms.length > 0 ? `${selectedPlatforms.length} kênh` : "lựa chọn"}
        </Button>
      </div>
    </section>
  );
}
