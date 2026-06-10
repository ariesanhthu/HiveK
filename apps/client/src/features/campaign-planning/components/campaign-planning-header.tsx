import { ChevronDown, Sparkles } from "lucide-react";
import { type Campaign } from "@/features/campaign-planning/types/campaign-planning";
import { cn } from "@/lib/utils";

type CampaignPlanningHeaderProps = {
  campaigns: Campaign[];
  selectedCampaignId: string;
  onCampaignChange: (campaignId: string) => void;
  onAddCampaign: () => void;
  onGeneratePlan: () => void;
};

const STATUS_LABELS: Record<Campaign["status"], string> = {
  draft: "Bản nháp",
  ready: "Sẵn sàng duyệt",
  scheduled: "Đã lên lịch",
};

export function CampaignPlanningHeader({
  campaigns,
  selectedCampaignId,
  onCampaignChange,
  onAddCampaign,
  onGeneratePlan,
}: CampaignPlanningHeaderProps) {
  const selectedCampaign =
    campaigns.find((campaign) => campaign.id === selectedCampaignId) ?? campaigns[0];

  return (
    <header className="shrink-0 border-b border-primary-soft bg-card px-4 py-4 md:px-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              Tạo Chiến Dịch
            </h1>
            {selectedCampaign ? (
              <span
                className={cn(
                  "rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  selectedCampaign.status === "scheduled"
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
                    : "border-primary-soft bg-muted text-foreground-muted"
                )}
              >
                {STATUS_LABELS[selectedCampaign.status]}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs leading-5 text-foreground-muted">
            Tạo, xem xét và lên lịch chiến dịch đăng bài tự động từ đầu vào có sẵn.
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 sm:w-80">
            <select
              value={selectedCampaignId}
              onChange={(event) => onCampaignChange(event.target.value)}
              className="h-10 w-full appearance-none rounded-lg border border-primary-soft bg-background-light px-3 pr-9 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-foreground-muted"
              aria-hidden
            />
          </div>

          <button
            type="button"
            onClick={onAddCampaign}
            className="h-10 rounded-lg border border-primary-soft px-3 text-sm font-semibold text-foreground transition-colors hover:bg-primary-soft"
          >
            + Thêm chiến dịch mới
          </button>

          <button
            type="button"
            onClick={onGeneratePlan}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-background-dark shadow-primary transition-colors hover:bg-amber-500"
          >
            <Sparkles className="size-4" aria-hidden />
            Tạo Kế Hoạch
          </button>
        </div>
      </div>
    </header>
  );
}
