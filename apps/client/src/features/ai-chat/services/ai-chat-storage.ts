import type {
  AiChatIdentity,
  AiChatSetup,
  BrandToneId,
  SocialPlatformId,
} from '@/features/ai-chat/types';

const STORAGE_KEY = 'hivek.ai-chat.setup.v1';
const STORAGE_VERSION = 1;
const IDENTITY_STORAGE_KEY = 'hivek.ai-chat.identity.v1';
const IDENTITY_STORAGE_VERSION = 1;

const SOCIAL_PLATFORM_IDS = new Set<SocialPlatformId>([
  'facebook',
  'instagram',
  'tiktok',
  'youtube',
  'threads',
]);
const BRAND_TONE_IDS = new Set<BrandToneId>([
  'professional',
  'friendly',
  'inspiring',
  'playful',
]);

type StoredSetup = {
  version: typeof STORAGE_VERSION;
  setup: AiChatSetup;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseStoredSetup(value: unknown): AiChatSetup | null {
  if (!isRecord(value) || value.version !== STORAGE_VERSION) return null;

  const setup = value.setup;
  if (!isRecord(setup)) return null;

  const socialPlatforms = setup.socialPlatforms;
  const branding = setup.branding;
  const driveUrl = setup.driveUrl;

  if (
    !Array.isArray(socialPlatforms)
    || !socialPlatforms.every(
      (platform): platform is SocialPlatformId =>
        typeof platform === 'string'
        && SOCIAL_PLATFORM_IDS.has(platform as SocialPlatformId),
    )
    || !isRecord(branding)
    || typeof branding.name !== 'string'
    || (branding.tone !== null
      && (typeof branding.tone !== 'string'
        || !BRAND_TONE_IDS.has(branding.tone as BrandToneId)))
    || typeof driveUrl !== 'string'
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
  if (typeof window === 'undefined') return null;

  try {
    const storedValue = window.sessionStorage.getItem(STORAGE_KEY);
    if (!storedValue) return null;
    return parseStoredSetup(JSON.parse(storedValue));
  } catch {
    return null;
  }
}

export function writeAiChatSetup(setup: AiChatSetup): void {
  if (typeof window === 'undefined') return;

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

export function clearAiChatSetup(): void {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}

function createId(prefix: string): string {
  // randomUUID only exists in secure contexts, so a demo served over plain HTTP
  // on a LAN address would otherwise throw here.
  const unique = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  return `${prefix}-${unique}`;
}

function createIdentity(): AiChatIdentity {
  return {
    workspaceId: createId('ws'),
    userId: createId('user'),
    threadId: createId('th'),
  };
}

function parseStoredIdentity(value: unknown): AiChatIdentity | null {
  if (!isRecord(value) || value.version !== IDENTITY_STORAGE_VERSION) return null;

  const identity = value.identity;
  if (!isRecord(identity)) return null;

  const { workspaceId, userId, threadId } = identity;

  if (
    typeof workspaceId !== 'string'
    || typeof userId !== 'string'
    || typeof threadId !== 'string'
    || !workspaceId
    || !userId
    || !threadId
  ) {
    return null;
  }

  return { workspaceId, userId, threadId };
}

function writeIdentity(identity: AiChatIdentity): void {
  try {
    window.localStorage.setItem(
      IDENTITY_STORAGE_KEY,
      JSON.stringify({ version: IDENTITY_STORAGE_VERSION, identity }),
    );
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}

// Unlike the setup snapshot, the identity outlives a tab session so the agent
// keeps its learned voice profile between visits.
let cachedIdentity: AiChatIdentity | null = null;

export function getOrCreateChatIdentity(): AiChatIdentity {
  // Never cache on the server: module scope is shared across requests there.
  if (typeof window === 'undefined') return createIdentity();
  if (cachedIdentity) return cachedIdentity;

  let identity: AiChatIdentity | null = null;

  try {
    const storedValue = window.localStorage.getItem(IDENTITY_STORAGE_KEY);
    identity = storedValue ? parseStoredIdentity(JSON.parse(storedValue)) : null;
  } catch {
    identity = null;
  }

  if (!identity) {
    identity = createIdentity();
    writeIdentity(identity);
  }

  cachedIdentity = identity;
  return identity;
}

/** Starts a fresh agent thread while keeping the workspace and its facts. */
export function resetChatThreadId(): AiChatIdentity {
  const identity: AiChatIdentity = {
    ...getOrCreateChatIdentity(),
    threadId: createId('th'),
  };

  if (typeof window === 'undefined') return identity;

  writeIdentity(identity);
  cachedIdentity = identity;
  return identity;
}
