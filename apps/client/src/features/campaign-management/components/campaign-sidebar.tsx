"use client";

import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InviteLinkBlock } from "@/features/campaign-management/components/invite-link-block";
import {
  OBJECTIVE_LABELS,
  PLATFORM_LABELS,
  TONE_LABELS,
} from "@/features/campaign-management/data/campaign-management-options";
import type { CampaignBrief } from "@/features/campaign-management/types";

type CampaignSidebarProps = {
  campaign?: CampaignBrief;
  validationMessages: string[];
  participantCount: number;
  onCopyInviteLink: () => void;
};

const AI_STEPS = [
  "Đọc dữ liệu đầu vào",
  "Hiểu mục tiêu và đối tượng mục tiêu",
  "Phân tích tone thương hiệu",
  "Gợi ý KOL/KOC phù hợp",
  "Tạo kế hoạch nội dung",
  "Tạo nội dung bài viết",
  "Kiểm tra giọng văn thương hiệu",
  "Chuẩn bị lịch trình đăng tự động",
];

export function CampaignSidebar({
  campaign,
  validationMessages,
  participantCount,
  onCopyInviteLink,
}: CampaignSidebarProps) {
  const progress = validationMessages.length === 0 ? 78 : 45;

  if (!campaign) {
    return (
      <Card className="p-4">
        <p className="text-sm font-bold text-foreground">Chưa có chiến dịch nào.</p>
        <p className="mt-1 text-xs text-foreground-muted">
          Hãy tạo chiến dịch đầu tiên để AI có thể lập kế hoạch nội dung.
        </p>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold text-foreground">{campaign.name}</p>
            <p className="mt-1 text-xs text-foreground-muted">
              Mục tiêu: {OBJECTIVE_LABELS[campaign.objective]}
            </p>
          </div>
          <Badge variant="warning">{campaign.status}</Badge>
        </div>
        <div className="mt-3 space-y-2 text-xs text-foreground-muted">
          <p>Nền tảng: {campaign.platforms.map((item) => PLATFORM_LABELS[item]).join(", ")}</p>
          <p>Tone: {TONE_LABELS[campaign.tone.preset]}</p>
          <p>Mã mời: <span className="font-bold text-primary">{campaign.invite.defaultCode}</span></p>
          <p>{participantCount} người tham gia</p>
        </div>
        <Button className="mt-4 w-full" size="sm" onClick={onCopyInviteLink}>
          Copy link mời
        </Button>
        <div className="mt-3">
          <InviteLinkBlock
            inviteLink={campaign.invite.inviteLink}
            onCopy={onCopyInviteLink}
          />
        </div>
      </Card>

      <section className="rounded-lg border border-amber-300 bg-amber-50 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-full bg-primary" />
            <p className="truncate text-xs font-bold text-foreground">
              Agent AI đang tối ưu hoá kế hoạch đăng bài...
            </p>
          </div>
          <span className="text-xs font-bold text-amber-700">{progress}%</span>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-amber-100">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {validationMessages.length > 0 ? (
          <div className="mt-3 rounded-lg border border-amber-300 bg-card p-3">
            <p className="text-xs font-bold text-amber-700">
              Cần bổ sung trước khi tạo kế hoạch:
            </p>
            <ul className="mt-2 space-y-1 text-xs text-foreground-muted">
              {validationMessages.map((message) => (
                <li key={message}>- {message}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-4 space-y-2.5">
          {AI_STEPS.map((step, index) => {
            const isDone = index < 3;
            const isActive = index === 3;
            const Icon = isDone ? CheckCircle2 : isActive ? Loader2 : Circle;

            return (
              <div
                key={step}
                className="flex items-center gap-2 text-xs text-foreground"
              >
                <Icon
                  className={
                    isDone
                      ? "size-3.5 text-emerald-600"
                      : isActive
                        ? "size-3.5 animate-spin text-primary"
                        : "size-3.5 text-muted"
                  }
                  aria-hidden
                />
                <span className={isActive ? "font-semibold" : undefined}>{step}</span>
              </div>
            );
          })}
        </div>
      </section>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-extrabold text-foreground">Lộ trình đăng bài</p>
          <Badge variant="secondary">{campaign.aiConfig.numberOfPosts} bài</Badge>
        </div>
        <div className="mt-3 space-y-2">
          {["Teaser", "UGC review", "Offer reminder"].map((item, index) => (
            <div
              key={item}
              className="rounded-lg border border-primary-soft bg-background-light p-3"
            >
              <p className="text-xs font-bold text-foreground">Ngày {index + 1}</p>
              <p className="mt-1 text-xs text-foreground-muted">{item}</p>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
