import "server-only";

import { ACTIVE_CAMPAIGNS } from "@/data/mock-data";
import type { CampaignListItem, CampaignStatus } from "@/features/campaigns/types";
import { backendRequestEnvelope } from "@/server/backend/backend-client";
import type {
  BackendCampaign,
  BackendPaginatedMeta,
} from "@/server/backend/backend-types";

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 10_000;
  }
  return hash;
}

function fallbackImage(id: string): string {
  return ACTIVE_CAMPAIGNS[hashString(id) % ACTIVE_CAMPAIGNS.length]?.image ?? ACTIVE_CAMPAIGNS[0].image;
}

function mapCampaignStatus(status?: string | null): CampaignStatus {
  const normalized = status?.toLowerCase() ?? "";
  if (normalized.includes("draft")) return "draft";
  if (
    normalized.includes("closed") ||
    normalized.includes("completed") ||
    normalized.includes("cancel")
  ) {
    return "closed";
  }
  return "active";
}

function formatBudget(value?: number | null): string {
  if (!value || value <= 0) return "Liên hệ";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function titleFromDescription(description?: string | null): string {
  const firstLine = description?.split(/\r?\n/).find((line) => line.trim());
  if (!firstLine) return "Chiến dịch HiveK";
  return firstLine.trim().slice(0, 96);
}

function categoryFromCampaign(campaign: BackendCampaign): string {
  const note = campaign.platformTarget?.find((item) => item.note?.trim())?.note;
  if (note) return note.trim().slice(0, 40);
  return "Chiến dịch";
}

function mapBackendCampaign(campaign: BackendCampaign): CampaignListItem {
  return {
    id: campaign.id,
    image: fallbackImage(campaign.id),
    category: categoryFromCampaign(campaign),
    title: titleFromDescription(campaign.description),
    priceRange: formatBudget(campaign.budget),
    status: mapCampaignStatus(campaign.status),
  };
}

export async function getCampaigns(): Promise<CampaignListItem[]> {
  try {
    const envelope = await backendRequestEnvelope<
      BackendCampaign[],
      BackendPaginatedMeta
    >("/hivek/client/v1/campaigns", {
      method: "GET",
      includeAuth: true,
      query: {
        limit: 50,
        sort: "desc",
      },
      cache: "no-store",
    });

    return envelope.data.map(mapBackendCampaign);
  } catch {
    return ACTIVE_CAMPAIGNS;
  }
}
