import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { AgentAvatar } from "@/features/ai-chat/components/agent-avatar";
import { BrandSetupForm } from "@/features/ai-chat/components/brand-setup-form";
import { DriveSetupForm } from "@/features/ai-chat/components/drive-setup-form";
import { SetupCompleteCard } from "@/features/ai-chat/components/setup-complete-card";
import { SetupOverviewCard } from "@/features/ai-chat/components/setup-overview-card";
import { SetupStepReceipt } from "@/features/ai-chat/components/setup-step-receipt";
import { SocialConnectForm } from "@/features/ai-chat/components/social-connect-form";
import {
  BRAND_TONE_OPTIONS,
  SOCIAL_PLATFORM_OPTIONS,
} from "@/features/ai-chat/data/ai-chat-data";
import type {
  AiChatAction,
  AiChatMessage as AiChatMessageType,
  AiChatSetup,
  AiChatSetupProgress,
  BrandToneId,
  SocialPlatformId,
} from "@/features/ai-chat/types";
import { cn } from "@/lib/utils";

type ChatMessageProps = {
  message: AiChatMessageType;
  setup: AiChatSetup;
  setupProgress: AiChatSetupProgress;
  hideQuickSetupAction: boolean;
  onAction: (action: AiChatAction) => void;
  onCompleteSocial: (platforms: SocialPlatformId[]) => void;
  onCompleteBrand: (name: string, tone: BrandToneId) => void;
  onCompleteDrive: (url: string) => void;
};

function MessageActions({
  actions,
  onAction,
  hideQuickSetupAction,
}: {
  actions: AiChatAction[];
  onAction: (action: AiChatAction) => void;
  hideQuickSetupAction: boolean;
}) {
  const visibleActions = actions.filter(
    (action) =>
      !(
        hideQuickSetupAction &&
        action.kind === "intent" &&
        action.intent === "quick-start"
      )
  );

  if (visibleActions.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {visibleActions.map((action) => {
        const variant = action.variant === "primary" ? "default" : "outline";
        const icon =
          action.kind === "href" ? (
            <ArrowUpRight className="size-3.5" aria-hidden />
          ) : (
            <ChevronRight className="size-3.5" aria-hidden />
          );

        if (action.kind === "href") {
          if (action.external) {
            return (
              <a
                key={action.id}
                href={action.href}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ variant, size: "sm" }),
                  "h-11 touch-manipulation sm:h-9"
                )}
              >
                {action.label}
                {icon}
              </a>
            );
          }

          return (
            <Link
              key={action.id}
              href={action.href}
              className={cn(
                buttonVariants({ variant, size: "sm" }),
                "h-11 touch-manipulation sm:h-9"
              )}
            >
              {action.label}
              {icon}
            </Link>
          );
        }

        return (
          <Button
            key={action.id}
            variant={variant}
            size="sm"
            className="h-11 touch-manipulation sm:h-9"
            onClick={() => onAction(action)}
          >
            {action.label}
            {icon}
          </Button>
        );
      })}
    </div>
  );
}

export function ChatMessage({
  message,
  setup,
  setupProgress,
  hideQuickSetupAction,
  onAction,
  onCompleteSocial,
  onCompleteBrand,
  onCompleteDrive,
}: ChatMessageProps) {
  if (message.role === "user") {
    return (
      <article className="flex justify-end py-2.5">
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-slate-900 px-4 py-3 text-sm leading-6 text-white shadow-[0_7px_20px_rgba(15,23,42,0.12)] sm:max-w-[72%]">
          {message.content}
        </div>
      </article>
    );
  }

  const isSocialComplete = setupProgress.completedSteps.includes("social");
  const isBrandComplete = setupProgress.completedSteps.includes("brand");
  const isDriveComplete = setupProgress.completedSteps.includes("drive");
  const connectedPlatformLabels = setup.socialPlatforms.map(
    (platformId) =>
      SOCIAL_PLATFORM_OPTIONS.find((option) => option.id === platformId)?.label ??
      platformId
  );
  const brandToneLabel = BRAND_TONE_OPTIONS.find(
    (option) => option.id === setup.branding.tone
  )?.label;

  return (
    <article className="flex items-start gap-3 py-3 sm:gap-3.5">
      <AgentAvatar size="sm" className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="mb-1.5 text-[11px] font-extrabold tracking-wide text-amber-700">
          HIVEK AI
        </p>
        <p className="max-w-2xl whitespace-pre-wrap break-words text-sm leading-6 text-foreground">
          {message.content}
        </p>

        {message.widget?.type === "setup-overview" ? (
          <SetupOverviewCard progress={setupProgress} />
        ) : null}
        {message.widget?.type === "social-connect" && !isSocialComplete ? (
          <SocialConnectForm
            initialPlatforms={setup.socialPlatforms}
            onComplete={onCompleteSocial}
          />
        ) : null}
        {message.widget?.type === "social-connect" && isSocialComplete ? (
          <SetupStepReceipt
            step="social"
            title="Đã ghi nhận kênh xã hội"
            detail={connectedPlatformLabels.join(", ")}
          />
        ) : null}
        {message.widget?.type === "brand-form" && !isBrandComplete ? (
          <BrandSetupForm
            initialName={setup.branding.name}
            initialTone={setup.branding.tone}
            onComplete={onCompleteBrand}
          />
        ) : null}
        {message.widget?.type === "brand-form" && isBrandComplete ? (
          <SetupStepReceipt
            step="brand"
            title="Đã lưu nhận diện thương hiệu"
            detail={`${setup.branding.name} · ${brandToneLabel ?? "Đã chọn giọng điệu"}`}
          />
        ) : null}
        {message.widget?.type === "drive-form" && !isDriveComplete ? (
          <DriveSetupForm
            initialUrl={setup.driveUrl}
            onComplete={onCompleteDrive}
          />
        ) : null}
        {message.widget?.type === "drive-form" && isDriveComplete ? (
          <SetupStepReceipt
            step="drive"
            title="Đã thêm kho tài nguyên"
            detail="Đường dẫn Drive đã được ghi nhận"
          />
        ) : null}
        {message.widget?.type === "setup-complete" ? (
          <SetupCompleteCard />
        ) : null}

        {message.actions && message.actions.length > 0 ? (
          <MessageActions
            actions={message.actions}
            onAction={onAction}
            hideQuickSetupAction={hideQuickSetupAction}
          />
        ) : null}
      </div>
    </article>
  );
}
