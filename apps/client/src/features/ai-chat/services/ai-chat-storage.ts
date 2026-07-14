import type {
  AiChatSetup,
  BrandToneId,
  SocialPlatformId,
} from "@/features/ai-chat/types";

const STORAGE_KEY = "hivek.ai-chat.setup.v1";
const STORAGE_VERSION = 1;

const SOCIAL_PLATFORM_IDS = new Set<SocialPlatformId>([
  "facebook",
  "instagram",
  "tiktok",
  "youtube",
  "threads",
]);
const BRAND_TONE_IDS = new Set<BrandToneId>([
  "professional",
  "friendly",
  "inspiring",
  "playful",
]);

type StoredSetup = {
  version: typeof STORAGE_VERSION;
  setup: AiChatSetup;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseStoredSetup(value: unknown): AiChatSetup | null {
  if (!isRecord(value) || value.version !== STORAGE_VERSION) return null;

  const setup = value.setup;
  if (!isRecord(setup)) return null;

  const socialPlatforms = setup.socialPlatforms;
  const branding = setup.branding;
  const driveUrl = setup.driveUrl;

  if (
    !Array.isArray(socialPlatforms) ||
    !socialPlatforms.every(
      (platform): platform is SocialPlatformId =>
        typeof platform === "string" &&
        SOCIAL_PLATFORM_IDS.has(platform as SocialPlatformId)
    ) ||
    !isRecord(branding) ||
    typeof branding.name !== "string" ||
    (branding.tone !== null &&
      (typeof branding.tone !== "string" ||
        !BRAND_TONE_IDS.has(branding.tone as BrandToneId))) ||
    typeof driveUrl !== "string"
  ) {
    return null;
  }

  return {
    socialPlatforms: [...socialPlatforms],
    branding: {
      name: branding.name,
      tone: branding.tone as BrandToneId | null,
    },
    driveUrl,
  };
}

export function readAiChatSetup(): AiChatSetup | null {
  if (typeof window === "undefined") return null;

  try {
    const storedValue = window.sessionStorage.getItem(STORAGE_KEY);
    if (!storedValue) return null;
    return parseStoredSetup(JSON.parse(storedValue));
  } catch {
    return null;
  }
}

export function writeAiChatSetup(setup: AiChatSetup): void {
  if (typeof window === "undefined") return;

  const storedSetup: StoredSetup = {
    version: STORAGE_VERSION,
    setup,
  };

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(storedSetup));
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}
