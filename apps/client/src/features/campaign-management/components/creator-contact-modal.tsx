"use client";

import { Copy, Send, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CREATOR_TYPE_LABELS,
  PLATFORM_LABELS,
} from "@/features/campaign-management/data/campaign-management-options";
import type {
  CampaignBrief,
  CampaignCreatorSuggestion,
} from "@/features/campaign-management/types";

type CreatorContactModalProps = {
  campaign: CampaignBrief;
  creator: CampaignCreatorSuggestion;
  onClose: () => void;
  onCopyMessage: (message: string) => void;
  onMarkContacted: () => void;
};

function createMessage(campaign: CampaignBrief, creator: CampaignCreatorSuggestion) {
  return `Chào ${creator.name},

Bên mình đang triển khai chiến dịch ${campaign.name} và thấy nội dung của bạn khá phù hợp với nhóm khách hàng mà chiến dịch hướng tới.

Bên mình muốn mời bạn tham gia chiến dịch với vai trò ${CREATOR_TYPE_LABELS[creator.type]}. Bạn có thể xem thông tin chiến dịch tại link dưới đây:

${campaign.invite.inviteLink}

Nếu bạn quan tâm, mình rất mong được trao đổi thêm về format nội dung, thời gian đăng và chi phí hợp tác.

Cảm ơn bạn.`;
}

export function CreatorContactModal({
  campaign,
  creator,
  onClose,
  onCopyMessage,
  onMarkContacted,
}: CreatorContactModalProps) {
  const message = createMessage(campaign, creator);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-primary-soft bg-card shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-primary-soft p-4">
          <div>
            <h2 className="text-lg font-extrabold text-foreground">Liên hệ KOL/KOC</h2>
            <p className="mt-1 text-xs text-foreground-muted">
              Người nhận: {creator.name} · Chiến dịch: {campaign.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-foreground-muted hover:bg-muted hover:text-foreground"
            aria-label="Đóng"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="space-y-4 p-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="warning">{CREATOR_TYPE_LABELS[creator.type]}</Badge>
            {creator.platforms.map((platform) => (
              <Badge key={platform} variant="secondary">
                {PLATFORM_LABELS[platform]}
              </Badge>
            ))}
            <Badge variant="success">Match {creator.audienceMatchScore}%</Badge>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-primary-soft bg-background-light p-3">
              <p className="text-xs font-bold text-foreground">Mã cộng tác viên</p>
              <p className="mt-1 text-sm font-bold text-primary">
                {creator.name.replace(/\s/g, "").toUpperCase().slice(0, 8)}
              </p>
            </div>
            <div className="rounded-lg border border-primary-soft bg-background-light p-3">
              <p className="text-xs font-bold text-foreground">Link mời</p>
              <p className="mt-1 truncate text-xs text-foreground-muted">
                {campaign.invite.inviteLink}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-foreground">Mẫu tin nhắn</p>
            <textarea
              readOnly
              value={message}
              className="mt-2 min-h-64 w-full resize-none rounded-xl border border-primary-soft bg-background-light p-3 text-sm leading-6 text-foreground"
            />
          </div>
        </div>

        <footer className="flex flex-col gap-2 border-t border-primary-soft p-4 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onCopyMessage(message)}>
            <Copy className="size-4" aria-hidden />
            Copy nội dung
          </Button>
          <Button variant="outline" disabled>
            <Send className="size-4" aria-hidden />
            Gửi lời mời
          </Button>
          <Button
            onClick={() => {
              onMarkContacted();
              onClose();
            }}
          >
            Đánh dấu đã liên hệ
          </Button>
        </footer>
      </div>
    </div>
  );
}

