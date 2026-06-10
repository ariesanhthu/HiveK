"use client";

import dynamic from "next/dynamic";
import { DashboardSidebar } from "@/features/business-dashboard/components/dashboard-sidebar";
import { useBusinessNavItems } from "@/features/business-dashboard/hooks/use-business-nav-items";
import { AgentProgressCard } from "@/features/campaign-planning/components/agent-progress-card";
import { CampaignPlanningHeader } from "@/features/campaign-planning/components/campaign-planning-header";
import { CampaignSummaryBar } from "@/features/campaign-planning/components/campaign-summary-bar";
import { PostDetailShell } from "@/features/campaign-planning/components/post-detail-shell";
import { PublishingTimeline } from "@/features/campaign-planning/components/publishing-timeline";
import { useCampaignPlanning } from "@/features/campaign-planning/hooks/use-campaign-planning";
import { cn } from "@/lib/utils";

const PostContentPanel = dynamic(
  () =>
    import("@/features/campaign-planning/components/PostDetailTabs/post-content-panel").then(
      (mod) => mod.PostContentPanel
    ),
  { loading: () => <TabLoading /> }
);

const PostReviewPanel = dynamic(
  () =>
    import("@/features/campaign-planning/components/PostDetailTabs/post-review-panel").then(
      (mod) => mod.PostReviewPanel
    ),
  { loading: () => <TabLoading /> }
);

const PostSchedulePanel = dynamic(
  () =>
    import("@/features/campaign-planning/components/PostDetailTabs/post-schedule-panel").then(
      (mod) => mod.PostSchedulePanel
    ),
  { loading: () => <TabLoading /> }
);

function TabLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-3">
      <div className="h-10 animate-pulse rounded-lg bg-muted" />
      <div className="h-32 animate-pulse rounded-lg bg-muted" />
      <div className="h-24 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}

export function CampaignPlanningClient() {
  const navItems = useBusinessNavItems();
  const {
    accounts,
    agentSteps,
    agentProgress,
    campaigns,
    selectedCampaignId,
    setSelectedCampaignId,
    addCampaign,
    generatePlan,
    publishingDays,
    selectedPost,
    selectedPostId,
    setSelectedPostId,
    activeTab,
    setActiveTab,
    visitedTabs,
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
    isLoading,
  } = useCampaignPlanning();

  return (
    <main className="flex min-h-screen w-full bg-background-light">
      <DashboardSidebar items={navItems} />

      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <CampaignPlanningHeader
          campaigns={campaigns}
          selectedCampaignId={selectedCampaignId}
          onCampaignChange={setSelectedCampaignId}
          onAddCampaign={addCampaign}
          onGeneratePlan={generatePlan}
        />

        <div className="grid min-h-0 flex-1 gap-4 overflow-hidden p-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col gap-4">
            <AgentProgressCard progress={agentProgress} steps={agentSteps} />
            <PublishingTimeline
              days={publishingDays}
              selectedPostId={selectedPostId}
              isCompact={isTimelineCompact}
              onCompactChange={setIsTimelineCompact}
              onPostSelect={setSelectedPostId}
            />
          </aside>

          <PostDetailShell activeTab={activeTab} onTabChange={setActiveTab}>
            {selectedPost ? (
              <>
                {visitedTabs.includes("content") ? (
                  <div className={cn(activeTab !== "content" ? "hidden" : null)}>
                    <PostContentPanel
                      post={selectedPost}
                      accounts={accounts}
                      onPostChange={updateSelectedPost}
                      onPlatformChange={setPostPlatform}
                      onOptimizeContent={optimizeSelectedContent}
                      onGenerateMedia={generateMediaForPost}
                      onAddSuggestedReply={addSuggestedReply}
                    />
                  </div>
                ) : null}

                {visitedTabs.includes("review") ? (
                  <div className={cn(activeTab !== "review" ? "hidden" : null)}>
                    <PostReviewPanel
                      post={selectedPost}
                      onPostChange={updateSelectedPost}
                      onApprovePost={approveSelectedPost}
                    />
                  </div>
                ) : null}

                {visitedTabs.includes("schedule") ? (
                  <div className={cn(activeTab !== "schedule" ? "hidden" : null)}>
                    <PostSchedulePanel
                      post={selectedPost}
                      onPostChange={updateSelectedPost}
                    />
                  </div>
                ) : null}
              </>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-primary-soft text-sm font-semibold text-foreground-muted">
                {isLoading
                  ? "Dang tai agentic planner..."
                  : "Chon mot bai viet trong lo trinh de xem chi tiet."}
              </div>
            )}
          </PostDetailShell>
        </div>

        <CampaignSummaryBar
          total={summary.total}
          approved={summary.approved}
          scheduled={summary.scheduled}
          needsReview={summary.needsReview}
          onApproveAll={approveAllPosts}
          onScheduleCampaign={scheduleCampaign}
        />
      </div>
    </main>
  );
}
