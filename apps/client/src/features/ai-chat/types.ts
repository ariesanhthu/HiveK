export type AiChatIntent =
  | "quick-start"
  | "plan-posts"
  | "campaign-ideas"
  | "find-creators"
  | "analyze-content";

export type AiChatMessageRole = "user" | "assistant";

export type SetupStepId = "social" | "brand" | "drive";

export type SocialPlatformId =
  | "facebook"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "threads";

export type BrandToneId =
  | "professional"
  | "friendly"
  | "inspiring"
  | "playful";

export type AiChatActionVariant = "primary" | "secondary";

type AiChatActionBase = {
  id: string;
  label: string;
  variant?: AiChatActionVariant;
};

export type AiChatIntentAction = AiChatActionBase & {
  kind: "intent";
  intent: AiChatIntent;
};

export type AiChatHrefAction = AiChatActionBase & {
  kind: "href";
  href: string;
  external?: boolean;
};

export type AiChatAction = AiChatIntentAction | AiChatHrefAction;

export type AiChatWidget =
  | { type: "setup-overview" }
  | { type: "social-connect" }
  | { type: "brand-form" }
  | { type: "drive-form" }
  | { type: "setup-complete" };

export type AiChatMessage = {
  id: string;
  role: AiChatMessageRole;
  content: string;
  actions?: AiChatAction[];
  widget?: AiChatWidget;
};

/** A service response before the client assigns a stable local id. */
export type AiChatMessageDraft = Omit<AiChatMessage, "id">;

export type StarterPromptIcon =
  | "rocket"
  | "calendar"
  | "megaphone"
  | "users"
  | "chart";

export type StarterPrompt = {
  id: AiChatIntent;
  label: string;
  description: string;
  icon: StarterPromptIcon;
};

export type SocialPlatformOption = {
  id: SocialPlatformId;
  label: string;
};

export type BrandToneOption = {
  id: BrandToneId;
  label: string;
  description: string;
};

export type AiChatSetup = {
  socialPlatforms: SocialPlatformId[];
  branding: {
    name: string;
    tone: BrandToneId | null;
  };
  driveUrl: string;
};

export type AiChatSetupProgress = {
  completed: number;
  total: number;
  percent: number;
  completedSteps: SetupStepId[];
  nextStep: SetupStepId | null;
  isComplete: boolean;
};

export type SocialSetupPayload = {
  platforms: SocialPlatformId[];
};

export type BrandSetupPayload = {
  name: string;
  tone: BrandToneId;
};

export type DriveSetupPayload = {
  url: string;
};
