'use client';

import type { CampaignDetailTab } from '@/features/campaign-planning/types/campaign-planning';
import { create } from 'zustand';

type AgenticUiState = {
  selectedCampaignId: string;
  selectedPostId: string;
  activeCampaignDetailTab: CampaignDetailTab;
  isTimelineCompact: boolean;
  visitedCampaignDetailTabs: CampaignDetailTab[];
  setSelectedCampaignId: (campaignId: string) => void;
  setSelectedPostId: (postId: string) => void;
  setActiveCampaignDetailTab: (tab: CampaignDetailTab) => void;
  setIsTimelineCompact: (isCompact: boolean) => void;
};

export const useAgenticUiStore = create<AgenticUiState>((set) => ({
  selectedCampaignId: 'tutorx-better-every-hour',
  selectedPostId: 'post-01',
  activeCampaignDetailTab: 'content',
  isTimelineCompact: false,
  visitedCampaignDetailTabs: ['content'],
  setSelectedCampaignId: (campaignId) =>
    set({
      selectedCampaignId: campaignId,
      selectedPostId: 'post-01',
      activeCampaignDetailTab: 'content',
      visitedCampaignDetailTabs: ['content'],
    }),
  setSelectedPostId: (postId) => set({ selectedPostId: postId }),
  setActiveCampaignDetailTab: (tab) =>
    set((state) => ({
      activeCampaignDetailTab: tab,
      visitedCampaignDetailTabs: state.visitedCampaignDetailTabs.includes(tab)
        ? state.visitedCampaignDetailTabs
        : [...state.visitedCampaignDetailTabs, tab],
    })),
  setIsTimelineCompact: (isCompact) => set({ isTimelineCompact: isCompact }),
}));
