"use client";

import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  agenticQueryKeys,
  useAgenticCampaignPlanningSnapshot,
  useGenerateCampaignPlanMutation,
  useGenerateSinglePostMutation,
  useSaveFeedbackMutation,
  useValidateContentMutation,
} from "@/features/agentic-client";
import { useAgenticUiStore } from "@/features/agentic-client/store/use-agentic-ui-store";
import {
  type Campaign,
  type CampaignPost,
  type PlatformId,
} from "@/features/campaign-planning/types/campaign-planning";
import type { CampaignPlanningSnapshot } from "@/server/ai/types/agent.types";

function groupPostsByDay(posts: CampaignPost[]) {
  const days = new Map<number, CampaignPost[]>();

  for (const post of posts) {
    const currentPosts = days.get(post.day) ?? [];
    currentPosts.push(post);
    days.set(post.day, currentPosts);
  }

  return Array.from(days.entries())
    .sort(([dayA], [dayB]) => dayA - dayB)
    .map(([day, dayPosts]) => ({
      day,
      dateLabel: dayPosts[0]?.dateLabel ?? "",
      posts: dayPosts.toSorted((a, b) => a.time.localeCompare(b.time)),
    }));
}

function getFirstAccountForPlatform(
  accounts: CampaignPlanningSnapshot["accounts"],
  platform: PlatformId
) {
  return accounts.find((account) => account.platform === platform)?.id ?? "";
}

function updateSnapshotData(
  queryClient: ReturnType<typeof useQueryClient>,
  campaignId: string,
  updater: (snapshot: CampaignPlanningSnapshot) => CampaignPlanningSnapshot
) {
  queryClient.setQueryData<CampaignPlanningSnapshot>(
    agenticQueryKeys.campaignPlanning(campaignId),
    (snapshot) => (snapshot ? updater(snapshot) : snapshot)
  );
}

export function useCampaignPlanning() {
  const queryClient = useQueryClient();
  const {
    selectedCampaignId,
    selectedPostId,
    activeCampaignDetailTab,
    isTimelineCompact,
    visitedCampaignDetailTabs,
    setSelectedCampaignId,
    setSelectedPostId,
    setActiveCampaignDetailTab,
    setIsTimelineCompact,
  } = useAgenticUiStore();
  const planningQuery = useAgenticCampaignPlanningSnapshot(selectedCampaignId);
  const generatePlanMutation = useGenerateCampaignPlanMutation(selectedCampaignId);
  const generatePostMutation = useGenerateSinglePostMutation(selectedCampaignId);
  const validateContentMutation = useValidateContentMutation();
  const saveFeedbackMutation = useSaveFeedbackMutation();

  const data = planningQuery.data;
  const campaigns = data.campaigns;
  const posts = data.posts;

  const selectedCampaign = useMemo(
    () => campaigns.find((campaign) => campaign.id === selectedCampaignId) ?? campaigns[0],
    [campaigns, selectedCampaignId]
  );

  const selectedPost = useMemo(
    () => posts.find((post) => post.id === selectedPostId) ?? posts[0],
    [posts, selectedPostId]
  );

  const publishingDays = useMemo(() => groupPostsByDay(posts), [posts]);

  const summary = useMemo(() => {
    const approved = posts.filter((post) => post.status === "approved").length;
    const scheduled = posts.filter((post) => post.status === "scheduled").length;
    const needsReview = posts.filter((post) => post.status === "needs-review").length;

    return {
      total: posts.length,
      approved,
      scheduled,
      needsReview,
    };
  }, [posts]);

  const updateCurrentSnapshot = useCallback(
    (updater: (snapshot: CampaignPlanningSnapshot) => CampaignPlanningSnapshot) => {
      updateSnapshotData(queryClient, selectedCampaignId, updater);
    },
    [queryClient, selectedCampaignId]
  );

  const updateSelectedPost = useCallback(
    (patch: Partial<CampaignPost>) => {
      updateCurrentSnapshot((snapshot) => ({
        ...snapshot,
        posts: snapshot.posts.map((post) =>
          post.id === selectedPostId ? { ...post, ...patch } : post
        ),
      }));
    },
    [selectedPostId, updateCurrentSnapshot]
  );

  const updateCampaign = useCallback(
    (campaignId: string, patch: Partial<Campaign>) => {
      updateCurrentSnapshot((snapshot) => ({
        ...snapshot,
        campaigns: snapshot.campaigns.map((campaign) =>
          campaign.id === campaignId ? { ...campaign, ...patch } : campaign
        ),
        selectedCampaign:
          snapshot.selectedCampaign?.id === campaignId
            ? { ...snapshot.selectedCampaign, ...patch }
            : snapshot.selectedCampaign,
      }));
    },
    [updateCurrentSnapshot]
  );

  const addCampaign = useCallback(() => {
    const nextNumber = campaigns.length + 1;
    const newCampaign: Campaign = {
      id: `campaign-${Date.now()}`,
      name: `Chien dich moi ${nextNumber}`,
      status: "draft",
      description: "Mock draft campaign ready for agentic planning.",
    };
    const nextSnapshot: CampaignPlanningSnapshot = {
      ...data,
      campaigns: [newCampaign, ...data.campaigns],
      selectedCampaign: newCampaign,
    };

    queryClient.setQueryData(
      agenticQueryKeys.campaignPlanning(newCampaign.id),
      nextSnapshot
    );
    updateCurrentSnapshot((snapshot) => ({
      ...snapshot,
      campaigns: [newCampaign, ...snapshot.campaigns],
    }));
    setSelectedCampaignId(newCampaign.id);
  }, [campaigns.length, data, queryClient, setSelectedCampaignId, updateCurrentSnapshot]);

  const generatePlan = useCallback(async () => {
    if (!selectedCampaign) return;

    await generatePlanMutation.mutateAsync({
      days: 7,
      platforms: ["facebook", "threads", "tiktok"],
      mode: "human_review",
      forceRefresh: true,
    });

    updateCampaign(selectedCampaign.id, { status: "ready" });
    updateCurrentSnapshot((snapshot) => ({ ...snapshot, agentProgress: 100 }));
  }, [generatePlanMutation, selectedCampaign, updateCampaign, updateCurrentSnapshot]);

  const approveSelectedPost = useCallback(async () => {
    if (!selectedPost || !selectedCampaign) return;

    const validation = await validateContentMutation.mutateAsync({
      campaignId: selectedCampaign.id,
      platform: selectedPost.platform,
      content: selectedPost.content,
    });
    const approved = validation.finalDecision === "approve";

    updateSelectedPost({
      status: approved ? "approved" : "needs-review",
      reviewNote:
        validation.issues.length > 0
          ? validation.issues.join(" ")
          : "Content validated and approved.",
    });

    await saveFeedbackMutation.mutateAsync({
      campaignId: selectedCampaign.id,
      stepId: selectedPost.id,
      eventType: approved ? "approve" : "mark_too_ai",
      reason: validation.suggestedRevision,
      metadata: {
        riskLevel: validation.riskLevel,
        finalDecision: validation.finalDecision,
      },
    });
  }, [
    saveFeedbackMutation,
    selectedCampaign,
    selectedPost,
    updateSelectedPost,
    validateContentMutation,
  ]);

  const approveAllPosts = useCallback(() => {
    updateCurrentSnapshot((snapshot) => ({
      ...snapshot,
      posts: snapshot.posts.map((post) =>
        post.status === "scheduled" ? post : { ...post, status: "approved" }
      ),
    }));
  }, [updateCurrentSnapshot]);

  const scheduleCampaign = useCallback(async () => {
    if (!selectedCampaign) return;

    updateCurrentSnapshot((snapshot) => ({
      ...snapshot,
      campaigns: snapshot.campaigns.map((campaign) =>
        campaign.id === selectedCampaign.id
          ? { ...campaign, status: "scheduled" }
          : campaign
      ),
      selectedCampaign: { ...selectedCampaign, status: "scheduled" },
      posts: snapshot.posts.map((post) => ({ ...post, status: "scheduled" })),
    }));

    await saveFeedbackMutation.mutateAsync({
      campaignId: selectedCampaign.id,
      eventType: "publish",
      reason: "Campaign scheduled from planner.",
    });
  }, [saveFeedbackMutation, selectedCampaign, updateCurrentSnapshot]);

  const setPostPlatform = useCallback(
    (platform: PlatformId) => {
      updateSelectedPost({
        platform,
        accountId: getFirstAccountForPlatform(data.accounts, platform),
      });
    },
    [data.accounts, updateSelectedPost]
  );

  const optimizeSelectedContent = useCallback(async () => {
    if (!selectedPost || !selectedCampaign) return;

    const generatedPost = await generatePostMutation.mutateAsync({
      stepId: selectedPost.id,
      platform: selectedPost.platform,
      angle: selectedPost.title,
      userInstruction: "Make the copy more natural and less salesy.",
    });

    updateSelectedPost({
      content: generatedPost.content,
      firstComment: generatedPost.firstComment,
      suggestedReplies: generatedPost.replySuggestions,
      status: "needs-review",
      reviewNote: generatedPost.validation.suggestedRevision,
    });

    await saveFeedbackMutation.mutateAsync({
      campaignId: selectedCampaign.id,
      stepId: selectedPost.id,
      eventType: "regenerate",
      beforeText: selectedPost.content,
      afterText: generatedPost.content,
      reason: "AI optimization requested from content tab.",
    });
  }, [
    generatePostMutation,
    saveFeedbackMutation,
    selectedCampaign,
    selectedPost,
    updateSelectedPost,
  ]);

  const generateMediaForPost = useCallback(() => {
    if (!selectedPost) return;

    updateSelectedPost({
      mediaAsset: `AI visual: ${selectedPost.mediaPrompt}`,
      status: "needs-review",
    });
  }, [selectedPost, updateSelectedPost]);

  const addSuggestedReply = useCallback(
    (reply: string) => {
      if (!reply.trim()) return;

      updateCurrentSnapshot((snapshot) => ({
        ...snapshot,
        posts: snapshot.posts.map((post) =>
          post.id === selectedPostId
            ? { ...post, suggestedReplies: [...post.suggestedReplies, reply.trim()] }
            : post
        ),
      }));
    },
    [selectedPostId, updateCurrentSnapshot]
  );

  return {
    accounts: data.accounts,
    agentSteps: data.agentSteps,
    agentProgress: data.agentProgress,
    campaigns,
    selectedCampaign,
    selectedCampaignId,
    setSelectedCampaignId,
    addCampaign,
    generatePlan,
    publishingDays,
    selectedPost,
    selectedPostId,
    setSelectedPostId,
    activeTab: activeCampaignDetailTab,
    setActiveTab: setActiveCampaignDetailTab,
    visitedTabs: visitedCampaignDetailTabs,
    isTimelineCompact,
    setIsTimelineCompact,
    summary,
    updateSelectedPost,
    setPostPlatform,
    optimizeSelectedContent,
    generateMediaForPost,
    approveSelectedPost,
    approveAllPosts,
    scheduleCampaign,
    addSuggestedReply,
    isLoading:
      planningQuery.isFetching ||
      generatePlanMutation.isPending ||
      generatePostMutation.isPending ||
      validateContentMutation.isPending,
  };
}
