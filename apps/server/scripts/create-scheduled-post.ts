/**
 * Script: create-scheduled-post.ts
 * Description: Signs in as an Enterprise user, then sends a POST request
 *              to create a scheduled post with scheduledAt = now + 2 minutes.
 *
 * Usage: npx ts-node scripts/create-scheduled-post.ts
 */

// ─── Configuration (edit these before running) ──────────────────────────────
const BASE_URL = 'https://webhook.gnourt.me/hivek';       // e.g. 'http://localhost:3000'
const API_KEY = 'HiveK_ApiKey';        // x-api-key header value
const EMAIL = 'txt812005@gmail.com';          // Enterprise user email
const PASSWORD = 'Hivek@123';       // Enterprise user password
const SOCIAL_PAGE_ID = '6a5a5711a0472b6d73a6e5e2'; // TODO: fill in with a valid socialPageId
// ─────────────────────────────────────────────────────────────────────────────

const AUTH_ENDPOINT = `${BASE_URL}/client/v1/auth/sign-in`;
const SCHEDULED_POST_ENDPOINT = `${BASE_URL}/client/v1/scheduled-posts/test`;

async function signIn(): Promise<string> {
  console.log(`➡️  POST ${AUTH_ENDPOINT} (sign-in)`);

  const response = await fetch(AUTH_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });

  const body = await response.json();

  if (!response.ok) {
    console.error(`❌ Sign-in failed (${response.status}):`, JSON.stringify(body, null, 2));
    process.exit(1);
  }

  const accessToken = body?.data?.accessToken;
  if (!accessToken) {
    console.error('❌ No accessToken in sign-in response:', JSON.stringify(body, null, 2));
    process.exit(1);
  }

  console.log('✅ Sign-in successful, got accessToken');
  return accessToken;
}

async function createScheduledPost(accessToken: string) {
  // Calculate scheduledAt = now + 2 minutes
  const scheduledAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();
  console.log(`📅 scheduledAt: ${scheduledAt}`);

  const payload = {
    socialPageId: SOCIAL_PAGE_ID,   // TODO: fill in
    content: `Test post from create-scheduled-post script ${new Date().toISOString()}`,
    mediaFileIds: [],
    scheduledAt,
  };

  console.log(`➡️  POST ${SCHEDULED_POST_ENDPOINT}`);
  console.log(`📦 Body: ${JSON.stringify(payload, null, 2)}`);

  const response = await fetch(SCHEDULED_POST_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'x-api-key': API_KEY,
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json();

  if (!response.ok) {
    console.error(`❌ Create scheduled post failed (${response.status}):`, JSON.stringify(body, null, 2));
    process.exit(1);
  }

  console.log(`✅ Success (${response.status}):`, JSON.stringify(body, null, 2));
}

async function main() {
  if (!BASE_URL || !API_KEY || !EMAIL || !PASSWORD) {
    console.error(
      '❌ Please set BASE_URL, API_KEY, EMAIL, and PASSWORD at the top of the script.',
    );
    process.exit(1);
  }

  const accessToken = await signIn();
  await createScheduledPost(accessToken);
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});