import 'server-only';

import { ACTIVE_CAMPAIGNS } from '@/data/mock-data';
import { getCampaignDetailById as getMockCampaignDetailById } from '@/features/campaign-detail/server/get-campaign-detail-by-id';
import type { CampaignDetail } from '@/features/campaign-detail/types';
import { backendRequest } from '@/server/backend/backend-client';
import type { BackendCampaign } from '@/server/backend/backend-types';

function mapBackendStatus(status?: string | null): CampaignDetail['status'] {
  const normalized = status?.toLowerCase() ?? '';
  if (normalized.includes('draft')) return 'draft';
  if (
    normalized.includes('closed')
    || normalized.includes('completed')
    || normalized.includes('cancel')
  ) {
    return 'closed';
  }
  return 'active';
}

function formatBudget(value?: number | null): string {
  if (!value || value <= 0) return 'Liên hệ';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function titleFromDescription(description?: string | null): string {
  const firstLine = description?.split(/\r?\n/).find((line) => line.trim());
  if (!firstLine) return 'Chiến dịch HiveK';
  return firstLine.trim().slice(0, 96);
}

function targetLabels(campaign: BackendCampaign): string[] {
  return (
    campaign.platformTarget
      ?.map((target) => target.note || target.platformId)
      .filter((value): value is string => Boolean(value?.trim()))
      .slice(0, 4) ?? []
  );
}

function mapBackendCampaignToDetail(campaign: BackendCampaign): CampaignDetail {
  const participants = campaign.participants ?? [];
  const scheduledPosts = campaign.schedule?.timeline?.reduce(
    (total, day) => total + (day.posts?.length ?? 0),
    0,
  ) ?? 0;
  const niches = targetLabels(campaign);

  return {
    id: campaign.id,
    title: titleFromDescription(campaign.description),
    status: mapBackendStatus(campaign.status),
    externalIdLabel: `Mã chiến dịch: #${campaign.id.slice(0, 10).toUpperCase()}`,
    createdByLabel: campaign.enterpriseId
      ? `Được tạo bởi enterprise ${campaign.enterpriseId}`
      : 'Được tạo trên HiveK',
    stats: [
      {
        id: 'budget',
        label: 'Tổng ngân sách',
        value: formatBudget(campaign.budget),
        metaLabel: 'Từ backend',
        metaVariant: 'success',
        icon: 'payments',
      },
      {
        id: 'posts',
        label: 'Bài đã lên lịch',
        value: String(scheduledPosts),
        metaLabel: 'Theo timeline',
        metaVariant: 'secondary',
        icon: 'calendar_month',
      },
      {
        id: 'creators',
        label: 'Creator tham gia',
        value: String(participants.length),
        metaLabel: 'Participants',
        metaVariant: 'secondary',
        icon: 'groups',
      },
      {
        id: 'outputs',
        label: 'Raw contents',
        value: String(campaign.rawContents?.length ?? 0),
        metaLabel: 'Từ campaign',
        metaVariant: 'success',
        icon: 'shopping_cart',
      },
    ],
    kpis: [
      {
        id: 'budget-readiness',
        label: 'Mức sẵn sàng ngân sách',
        valueLabel: campaign.budget && campaign.budget > 0 ? '80%' : '35%',
        percent: campaign.budget && campaign.budget > 0 ? 80 : 35,
        strokeClass: 'stroke-orange-500',
      },
      {
        id: 'participant-progress',
        label: 'Tiến độ creator',
        valueLabel: `${Math.min(100, participants.length * 20)}%`,
        percent: Math.min(100, participants.length * 20),
        strokeClass: 'stroke-sky-500',
      },
      {
        id: 'content-progress',
        label: 'Tiến độ nội dung',
        valueLabel: `${Math.min(100, scheduledPosts * 15)}%`,
        percent: Math.min(100, scheduledPosts * 15),
        strokeClass: 'stroke-violet-500',
      },
    ],
    creators: participants.slice(0, 6).map((participant, index) => ({
      id: participant.id,
      name: participant.kolProfileId
        ? `KOL ${participant.kolProfileId.slice(0, 6)}`
        : `Creator ${index + 1}`,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${
        encodeURIComponent(participant.id)
      }`,
      reachLabel: 'Đang cập nhật',
      engagementLabel: participant.status ?? 'pending',
      status: participant.status?.toLowerCase().includes('pending')
        ? 'pending_post'
        : 'live',
    })),
    brief: {
      niches: niches.length > 0 ? niches : ['Chiến dịch'],
      platforms: ['instagram', 'youtube', 'tiktok'],
      audience: campaign.description
        || 'Thông tin audience đang được đồng bộ từ backend.',
      pdfBriefLabel: 'Brief đang đồng bộ',
    },
    recentContent: campaign.rawContents?.slice(0, 3).map((content, index) => ({
      id: content.fileId ?? `content-${index}`,
      thumbnailUrl: ACTIVE_CAMPAIGNS[index % ACTIVE_CAMPAIGNS.length]?.image
        ?? ACTIVE_CAMPAIGNS[0].image,
      title: content.rawContent?.slice(0, 80) || `Nội dung ${index + 1}`,
      authorName: 'HiveK Backend',
      timeLabel: 'Đang cập nhật',
      state: 'pending_review',
    })) ?? [],
    totalContentCount: campaign.rawContents?.length ?? 0,
  };
}

export async function getCampaignDetailById(id: string): Promise<CampaignDetail | null> {
  try {
    const campaign = await backendRequest<BackendCampaign>(
      `/hivek/client/v1/campaigns/${encodeURIComponent(id)}`,
      {
        method: 'GET',
        includeAuth: true,
        cache: 'no-store',
      },
    );

    return mapBackendCampaignToDetail(campaign);
  } catch {
    return getMockCampaignDetailById(id);
  }
}
