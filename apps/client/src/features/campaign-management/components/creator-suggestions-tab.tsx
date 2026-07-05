"use client";

import { RefreshCcw } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CONTACT_STATUS_LABELS,
  CREATOR_TYPE_LABELS,
  PLATFORM_LABELS,
} from "@/features/campaign-management/data/campaign-management-options";
import { CreatorContactModal } from "@/features/campaign-management/components/creator-contact-modal";
import type {
  CampaignBrief,
  CampaignCreatorSuggestion,
} from "@/features/campaign-management/types";

type CreatorSuggestionsTabProps = {
  campaign: CampaignBrief;
  suggestions: CampaignCreatorSuggestion[];
  onGenerateSuggestions: () => void;
  onCopyMessage: (message: string) => void;
  onMarkContacted: (creator: CampaignCreatorSuggestion) => void;
};

export function CreatorSuggestionsTab({
  campaign,
  suggestions,
  onGenerateSuggestions,
  onCopyMessage,
  onMarkContacted,
}: CreatorSuggestionsTabProps) {
  const [contactCreator, setContactCreator] =
    useState<CampaignCreatorSuggestion | null>(null);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-primary-soft bg-background-light p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-extrabold text-foreground">
            KOL/KOC phù hợp với chiến dịch
          </p>
          <p className="mt-1 text-xs text-foreground-muted">
            Filter: Nền tảng · Niche · Sort: Match cao nhất
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={onGenerateSuggestions}>
          <RefreshCcw className="size-3.5" aria-hidden />
          Gợi ý lại bằng AI
        </Button>
      </div>

      {suggestions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-primary-soft p-8 text-center">
          <p className="text-sm font-bold text-foreground">
            Chưa có gợi ý KOL/KOC.
          </p>
          <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-foreground-muted">
            Hoàn thiện brief để AI tìm người phù hợp với chiến dịch.
          </p>
          <Button className="mt-4" size="sm" onClick={onGenerateSuggestions}>
            Gợi ý bằng AI
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((creator) => (
            <div
              key={creator.id}
              className="rounded-lg border border-primary-soft bg-card p-4 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-extrabold text-primary">
                    {creator.name.slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-extrabold text-foreground">
                        {creator.name}
                      </h3>
                      <Badge variant="warning">{CREATOR_TYPE_LABELS[creator.type]}</Badge>
                      <Badge variant="success">Match {creator.audienceMatchScore}%</Badge>
                      <Badge variant="secondary">
                        {CONTACT_STATUS_LABELS[creator.contactStatus]}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-foreground-muted">
                      {creator.niche.join(" · ")}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {creator.platforms.map((platform) => (
                        <Badge key={platform} variant="outline">
                          {PLATFORM_LABELS[platform]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid shrink-0 grid-cols-2 gap-2 text-xs text-foreground-muted lg:w-64">
                  <p>Follower: <span className="font-bold text-foreground">{creator.followerRange}</span></p>
                  <p>Engagement: <span className="font-bold text-foreground">{creator.engagementRate}%</span></p>
                  <p className="col-span-2">
                    Cost: <span className="font-bold text-foreground">{creator.estimatedCost}</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-background-light p-3">
                <p className="text-xs font-bold text-foreground">Vì sao phù hợp:</p>
                <ul className="mt-2 space-y-1 text-xs leading-5 text-foreground-muted">
                  {creator.reason.map((reason) => (
                    <li key={reason}>- {reason}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button size="sm" variant="outline">Xem chi tiết</Button>
                <Button size="sm" onClick={() => setContactCreator(creator)}>
                  Contact
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {contactCreator ? (
        <CreatorContactModal
          campaign={campaign}
          creator={contactCreator}
          onClose={() => setContactCreator(null)}
          onCopyMessage={onCopyMessage}
          onMarkContacted={() => onMarkContacted(contactCreator)}
        />
      ) : null}
    </div>
  );
}

