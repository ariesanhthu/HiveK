/**
 * Script: create-campaign-and-schedule-post.ts
 * Description: Signs in as an Enterprise user, creates a campaign,
 *              then creates a scheduled post linked to that campaign.
 *
 * Usage: npx ts-node scripts/create-campaign-and-schedule-post.ts
 *
 * Configuration (edit before running):
 *   - BASE_URL    : API base URL
 *   - API_KEY     : x-api-key header value
 *   - EMAIL       : Enterprise user email
 *   - PASSWORD    : Enterprise user password
 *   - ENTERPRISE_ID: The enterprise ID to own the campaign
 *   - SOCIAL_PAGE_ID: The social page ID for the scheduled post
 */

// ─── Configuration (edit these before running) ──────────────────────────────
const BASE_URL = 'https://webhook.gnourt.me/hivek';        // e.g. 'http://localhost:3000'
const API_KEY = 'HiveK_ApiKey';                             // x-api-key header value
const EMAIL = 'txt812005@gmail.com';                        // Enterprise user email
const PASSWORD = 'Hivek@123';                               // Enterprise user password
const ENTERPRISE_ID = '';                                   // TODO: fill in with a valid enterpriseId
const SOCIAL_PAGE_ID = '6a59105589cd6af5e9c52970';          // TODO: fill in with a valid socialPageId
// ─────────────────────────────────────────────────────────────────────────────

const AUTH_ENDPOINT = `${BASE_URL}/client/v1/auth/sign-in`;
const CAMPAIGN_ENDPOINT = `${BASE_URL}/client/v1/campaigns`;
const SCHEDULED_POST_ENDPOINT = `${BASE_URL}/client/v1/scheduled-posts`;

// ---------------------------------------------------------------------------
// Helper: typed fetch wrapper
// ---------------------------------------------------------------------------
async function apiFetch<T>(
  url: string,
  options: {
    method: string;
    body?: unknown;
    accessToken?: string;
  },
): Promise<{ ok: boolean; status: number; data: T }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
  };
  if (options.accessToken) {
    headers['Authorization'] = `Bearer ${options.accessToken}`;
  }

  console.log(`➡️  ${options.method} ${url}`);
  if (options.body) {
    console.log(`📦 Body: ${JSON.stringify(options.body, null, 2)}`);
  }

  const response = await fetch(url, {
    method: options.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let body: T;
  try {
    body = JSON.parse(text);
  } catch {
    body = text as unknown as T;
  }

  if (!response.ok) {
    console.error(`❌ Request failed (${response.status}):`, JSON.stringify(body, null, 2));
    process.exit(1);
  }

  console.log(`✅ Success (${response.status})`);
  return { ok: true, status: response.status, data: body };
}

// ---------------------------------------------------------------------------
// Step 1: Sign in
// ---------------------------------------------------------------------------
interface SignInResponse {
  accessToken: string;
  refreshToken?: string;
}

async function signIn(): Promise<string> {
  console.log(`\n═══ Step 1: Sign In ═══`);
  const result = await apiFetch<SignInResponse>(AUTH_ENDPOINT, {
    method: 'POST',
    body: { email: EMAIL, password: PASSWORD },
  });

  const body = result.data as any;
  // Handle both wrapped { data: { accessToken } } and unwrapped { accessToken } responses
  const accessToken = body?.data?.accessToken ?? body?.accessToken;
  if (!accessToken) {
    console.error('❌ No accessToken in sign-in response:', JSON.stringify(body, null, 2));
    process.exit(1);
  }

  console.log(`🔑 Got accessToken`);
  return accessToken;
}

// ---------------------------------------------------------------------------
// Step 2: Create a campaign
// ---------------------------------------------------------------------------
interface CampaignResponse {
  id: string;
  ownerId: string;
  enterpriseId: string;
  description: string;
  budget: number;
  status: string;
  [key: string]: unknown;
}

async function createCampaign(
  accessToken: string,
): Promise<string> {
  console.log(`\n═══ Step 2: Create Campaign ═══`);

  const payload = {
    enterpriseId: ENTERPRISE_ID,
    budget: 1000000,
    description: `Test campaign created by script at ${new Date().toISOString()}`,
    financialTarget: { conversions: 100 },
    platformTarget: [],
    extras: { source: 'script' },
  };

  const result = await apiFetch<CampaignResponse>(CAMPAIGN_ENDPOINT, {
    method: 'POST',
    body: payload,
    accessToken,
  });

  const campaignId = result.data?.id;
  if (!campaignId) {
    console.error('❌ No campaign ID in response:', JSON.stringify(result.data, null, 2));
    process.exit(1);
  }

  console.log(`📋 Campaign ID: ${campaignId}`);
  console.log(`📋 Campaign status: ${result.data.status}`);

  return campaignId;
}

// ---------------------------------------------------------------------------
// Step 3: Create a scheduled post (linked to the campaign)
// ---------------------------------------------------------------------------
interface ScheduledPostResponse {
  id: string;
  [key: string]: unknown;
}

async function createScheduledPost(
  accessToken: string,
  campaignId: string,
): Promise<void> {
  console.log(`\n═══ Step 3: Create Scheduled Post (campaign: ${campaignId}) ═══`);

  // scheduledAt = now + 2 minutes
  const scheduledAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();
  console.log(`📅 scheduledAt: ${scheduledAt}`);

  const payload = {
    socialPageId: SOCIAL_PAGE_ID,
    content: `Test scheduled post for campaign ${campaignId} created at ${new Date().toISOString()}`,
    mediaFileIds: [],
    scheduledAt,
    campaignId,
  };

  const result = await apiFetch<ScheduledPostResponse>(SCHEDULED_POST_ENDPOINT, {
    method: 'POST',
    body: payload,
    accessToken,
  });

  console.log(`✅ Scheduled post ID: ${result.data?.id ?? '(see above)'}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  if (!BASE_URL || !API_KEY || !EMAIL || !PASSWORD) {
    console.error('❌ Please set BASE_URL, API_KEY, EMAIL, and PASSWORD at the top of the script.');
    process.exit(1);
  }
  if (!ENTERPRISE_ID) {
    console.error('❌ Please set ENTERPRISE_ID at the top of the script.');
    process.exit(1);
  }
  if (!SOCIAL_PAGE_ID) {
    console.error('❌ Please set SOCIAL_PAGE_ID at the top of the script.');
    process.exit(1);
  }

  const accessToken = await signIn();
  const campaignId = await createCampaign(accessToken);
  await createScheduledPost(accessToken, campaignId);

  console.log(`\n🎉 Done! Campaign: ${campaignId}`);
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
