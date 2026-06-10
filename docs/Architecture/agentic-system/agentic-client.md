# HIVE-K AI Agent Technical Architecture

## 1. Goal

Build an AI Agent module for HIVE-K that can run inside the existing Next.js backend.

The AI Agent is responsible for:

1. Campaign brief analysis.
2. Campaign strategy generation.
3. Content timeline generation.
4. Single post generation.
5. Content validation.
6. KOL/KOC matching using RAG.
7. Campaign insight generation.
8. Feedback collection and learning loop.

The AI module should be implemented as a clean backend layer, not inside frontend components.

---

## 2. Core Technical Decisions

### 2.1. Main stack

```text
Framework: Next.js
Language: TypeScript
Agent orchestration: ADK TypeScript
LLM provider: Gemini API
Database: MongoDB
Vector search: MongoDB Atlas Vector Search
Validation: Zod
Background jobs: Next.js cron / queue worker
```

### 2.2. Do not use

```text
Python
FastAPI
Pydantic
ChromaDB
Direct Gemini calls from frontend
Hardcoded backend/frontend URLs
Prompt text written directly inside route.ts
```

### 2.3. Why this stack

The current MVP does not require heavy ML infrastructure. Most AI tasks are:

```text
- calling Gemini API
- retrieving brand/campaign context
- running multi-agent workflow
- validating generated content
- saving feedback
- improving future generations using memory
```

Therefore, Next.js + ADK + MongoDB is enough for MVP.

Python should only be added later if the product needs:

```text
- custom ML model training
- PhoBERT / Vietnamese classifier inference
- OCR / document forgery pipeline
- large-scale crawling
- GPU inference
- offline ranking model training
```

---

## 3. High-Level Architecture

```text
Frontend
   ↓
Next.js Backend API
   ↓
AI Workflow Service
   ↓
ADK Agents
   ↓
Gemini API + MongoDB
```

The frontend must not call Gemini directly.

The correct flow is:

```text
1. User creates or selects a campaign.
2. Frontend calls Next.js API.
3. Next.js API loads campaign context from MongoDB.
4. AI workflow runs ADK agents.
5. Agents use Gemini and MongoDB tools.
6. Result is saved to MongoDB.
7. Frontend reads structured campaign steps from backend.
```

---

## 4. Folder Structure

```text
src/
│
├── app/
│   └── api/
│       └── ai/
│           ├── campaigns/
│           │   └── [campaignId]/
│           │       ├── generate-plan/
│           │       │   └── route.ts
│           │       ├── generate-post/
│           │       │   └── route.ts
│           │       └── insights/
│           │           └── route.ts
│           │
│           ├── matching/
│           │   └── kol-koc/
│           │       └── route.ts
│           │
│           ├── validation/
│           │   └── content/
│           │       └── route.ts
│           │
│           └── feedback/
│               └── route.ts
│
├── server/
│   ├── ai/
│   │   ├── agents/
│   │   │   ├── root.agent.ts
│   │   │   ├── intake.agent.ts
│   │   │   ├── strategy.agent.ts
│   │   │   ├── content.agent.ts
│   │   │   ├── validator.agent.ts
│   │   │   ├── matching.agent.ts
│   │   │   ├── insight.agent.ts
│   │   │   └── learning.agent.ts
│   │   │
│   │   ├── workflows/
│   │   │   ├── generate-campaign-plan.workflow.ts
│   │   │   ├── generate-single-post.workflow.ts
│   │   │   ├── validate-content.workflow.ts
│   │   │   ├── match-kol-koc.workflow.ts
│   │   │   └── generate-insight.workflow.ts
│   │   │
│   │   ├── tools/
│   │   │   ├── get-campaign-context.tool.ts
│   │   │   ├── search-brand-memory.tool.ts
│   │   │   ├── search-kol-profile.tool.ts
│   │   │   ├── get-campaign-metrics.tool.ts
│   │   │   ├── save-agent-run.tool.ts
│   │   │   ├── save-generated-asset.tool.ts
│   │   │   └── save-feedback.tool.ts
│   │   │
│   │   ├── prompts/
│   │   │   ├── base-system.prompt.ts
│   │   │   ├── intake.prompt.ts
│   │   │   ├── strategy.prompt.ts
│   │   │   ├── content.prompt.ts
│   │   │   ├── validator.prompt.ts
│   │   │   ├── matching.prompt.ts
│   │   │   └── insight.prompt.ts
│   │   │
│   │   ├── schemas/
│   │   │   ├── campaign.schema.ts
│   │   │   ├── campaign-step.schema.ts
│   │   │   ├── generated-asset.schema.ts
│   │   │   ├── matching.schema.ts
│   │   │   ├── feedback.schema.ts
│   │   │   └── agent-run.schema.ts
│   │   │
│   │   ├── services/
│   │   │   ├── gemini.service.ts
│   │   │   ├── agent-runner.service.ts
│   │   │   ├── rag.service.ts
│   │   │   ├── scoring.service.ts
│   │   │   ├── feedback.service.ts
│   │   │   └── learning.service.ts
│   │   │
│   │   └── types/
│   │       ├── agent.types.ts
│   │       ├── campaign.types.ts
│   │       └── common.types.ts
│   │
│   ├── db/
│   │   ├── mongo.client.ts
│   │   ├── collections.ts
│   │   └── indexes.ts
│   │
│   ├── jobs/
│   │   ├── embedding-sync.job.ts
│   │   ├── feedback-aggregation.job.ts
│   │   └── performance-learning.job.ts
│   │
│   └── config/
│       ├── env.ts
│       ├── model-routing.ts
│       └── constants.ts
```

---

## 5. Environment Variables

Create `.env.example`.

```env
APP_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=hivek

GEMINI_API_KEYS=key_1,key_2,key_3
GEMINI_MODEL_FAST=gemini-2.5-flash
GEMINI_MODEL_STRATEGY=gemini-2.5-pro
GEMINI_MODEL_VALIDATOR=gemini-2.5-flash
GEMINI_MAX_RETRIES=3
GEMINI_TIMEOUT_SECONDS=60

AI_AGENT_PROVIDER=gemini
AI_LOG_AGENT_TRACE=true

VECTOR_SEARCH_PROVIDER=mongodb
BRAND_MEMORY_VECTOR_INDEX=brand_memory_vector_index
KOL_PROFILE_VECTOR_INDEX=kol_profile_vector_index

CRON_SECRET=change_me
SERVICE_SECRET=change_me
```

Rules:

```text
- GEMINI_API_KEYS supports multiple keys separated by commas.
- Never expose Gemini keys to frontend.
- Never log raw API keys.
- Rotate to the next API key if quota or rate-limit error occurs.
- All model names must come from ENV or model-routing config.
```

---

## 6. MongoDB Collections

## 6.1. campaigns

Purpose: Store main campaign data.

```ts
{
  _id: ObjectId,
  brandId: ObjectId,
  name: string,
  objective: "awareness" | "consideration" | "conversion" | "retention",
  productInfo: {
    name: string,
    description: string,
    price?: string,
    offer?: string,
    mandatoryFacts: string[],
    forbiddenClaims: string[]
  },
  targetAudience: {
    description: string,
    location?: string,
    ageRange?: string,
    painPoints?: string[]
  },
  platforms: string[],
  status: "draft" | "generating" | "ready" | "published" | "archived",
  startDate?: Date,
  endDate?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 6.2. campaign_steps

Purpose: Store generated campaign timeline.

```ts
{
  _id: ObjectId,
  campaignId: ObjectId,
  brandId: ObjectId,

  dayIndex: number,
  scheduledDate?: Date,
  platform: "threads" | "facebook" | "tiktok" | "instagram" | "x",

  funnelStage: "awareness" | "consideration" | "conversion" | "retention",
  goal: string,
  angle: string,

  hook: string,
  content: string,
  firstComment?: string,
  replySuggestions?: string[],
  cta?: string,

  validation: {
    riskLevel: "green" | "amber" | "red",
    brandFitScore: number,
    humanLikenessScore: number,
    factualConsistencyScore: number,
    platformFitScore: number,
    issues: string[]
  },

  status: "draft" | "approved" | "scheduled" | "published" | "rejected",
  createdAt: Date,
  updatedAt: Date
}
```

---

## 6.3. brand_memories

Purpose: Store reusable brand knowledge and writing examples.

```ts
{
  _id: ObjectId,
  brandId: ObjectId,

  type:
    | "approved_post"
    | "rejected_post"
    | "brand_rule"
    | "tone_example"
    | "mandatory_fact"
    | "forbidden_claim"
    | "writing_preference",

  text: string,
  tags: string[],
  platform?: string,
  funnelStage?: string,

  embedding?: number[],
  source: "user_input" | "approved_content" | "feedback" | "system_summary",

  createdAt: Date,
  updatedAt: Date
}
```

---

## 6.4. kol_profiles

Purpose: Store KOL/KOC profiles for matching.

```ts
{
  _id: ObjectId,

  name: string,
  platforms: {
    platform: string,
    handle: string,
    followers?: number,
    avgEngagement?: number
  }[],

  categories: string[],
  audienceSummary?: string,
  contentStyle?: string,

  performanceMetrics?: {
    avgViews?: number,
    avgLikes?: number,
    avgComments?: number,
    estimatedCpa?: number,
    pastConversionRate?: number
  },

  trustScore?: number,
  riskScore?: number,

  profileText: string,
  embedding?: number[],

  createdAt: Date,
  updatedAt: Date
}
```

---

## 6.5. generated_assets

Purpose: Store all generated AI outputs.

```ts
{
  _id: ObjectId,
  campaignId: ObjectId,
  stepId?: ObjectId,
  brandId: ObjectId,

  assetType: "hook" | "post" | "comment" | "reply" | "strategy" | "insight",
  platform?: string,
  content: string,

  model: string,
  promptVersion: string,
  inputContextHash: string,

  validationScore?: number,
  riskLevel?: "green" | "amber" | "red",

  status: "generated" | "approved" | "edited" | "rejected" | "published",

  createdAt: Date,
  updatedAt: Date
}
```

---

## 6.6. agent_runs

Purpose: Store trace logs for each agent run.

```ts
{
  _id: ObjectId,
  runId: string,

  campaignId?: ObjectId,
  brandId?: ObjectId,

  workflowName: string,
  agentName: string,

  inputSummary: string,
  outputSummary: string,

  model: string,
  promptVersion: string,

  latencyMs: number,
  tokenUsage?: {
    inputTokens?: number,
    outputTokens?: number,
    totalTokens?: number
  },

  status: "success" | "failed",
  error?: string,

  createdAt: Date
}
```

---

## 6.7. feedback_events

Purpose: Store explicit and implicit user feedback.

```ts
{
  _id: ObjectId,

  campaignId: ObjectId,
  stepId?: ObjectId,
  assetId?: ObjectId,
  brandId: ObjectId,
  userId: ObjectId,

  eventType:
    | "approve"
    | "reject"
    | "edit"
    | "regenerate"
    | "publish"
    | "pin_as_good"
    | "mark_too_ai"
    | "mark_wrong_fact",

  beforeText?: string,
  afterText?: string,
  editDiff?: string,
  reason?: string,

  metadata?: Record<string, unknown>,

  createdAt: Date
}
```

---

## 6.8. performance_events

Purpose: Store real campaign performance.

```ts
{
  _id: ObjectId,

  campaignId: ObjectId,
  stepId?: ObjectId,
  assetId?: ObjectId,
  brandId: ObjectId,

  platform: string,

  impressions?: number,
  likes?: number,
  comments?: number,
  shares?: number,
  saves?: number,
  clicks?: number,
  leads?: number,
  conversions?: number,
  revenue?: number,
  cost?: number,

  collectedAt: Date
}
```

---

## 7. API Routes

## 7.1. Generate campaign plan

```http
POST /api/ai/campaigns/:campaignId/generate-plan
```

Purpose:

```text
Generate full campaign timeline.
```

Request body:

```json
{
  "days": 7,
  "platforms": ["threads", "facebook"],
  "mode": "human_review",
  "forceRefresh": false
}
```

Response:

```json
{
  "campaignId": "string",
  "strategySummary": "string",
  "steps": [
    {
      "stepId": "string",
      "dayIndex": 1,
      "platform": "threads",
      "funnelStage": "awareness",
      "goal": "Build initial attention",
      "angle": "practical observation",
      "hook": "string",
      "contentPreview": "string",
      "fullContent": "string",
      "firstComment": "string",
      "replySuggestions": ["string"],
      "cta": "string",
      "riskLevel": "green",
      "status": "draft"
    }
  ]
}
```

Implementation flow:

```text
route.ts
  → validate request
  → generateCampaignPlanWorkflow()
  → save campaign_steps
  → return structured response
```

---

## 7.2. Generate single post

```http
POST /api/ai/campaigns/:campaignId/generate-post
```

Purpose:

```text
Regenerate or create content for one specific campaign step.
```

Request body:

```json
{
  "stepId": "string",
  "platform": "threads",
  "angle": "practical observation",
  "userInstruction": "Make it more natural and less salesy"
}
```

Response:

```json
{
  "stepId": "string",
  "hook": "string",
  "content": "string",
  "firstComment": "string",
  "replySuggestions": ["string"],
  "validation": {
    "riskLevel": "green",
    "brandFitScore": 0.86,
    "humanLikenessScore": 0.82,
    "factualConsistencyScore": 0.92,
    "issues": []
  }
}
```

---

## 7.3. Validate content

```http
POST /api/ai/validation/content
```

Purpose:

```text
Validate generated or user-edited content before approval/publishing.
```

Request body:

```json
{
  "campaignId": "string",
  "platform": "threads",
  "content": "string"
}
```

Response:

```json
{
  "riskLevel": "green",
  "brandFitScore": 0.86,
  "humanLikenessScore": 0.82,
  "factualConsistencyScore": 0.92,
  "platformFitScore": 0.8,
  "issues": [],
  "suggestedRevision": "string",
  "finalDecision": "approve"
}
```

---

## 7.4. Match KOL/KOC

```http
POST /api/ai/matching/kol-koc
```

Purpose:

```text
Find and rank suitable KOL/KOC profiles for a campaign.
```

Request body:

```json
{
  "campaignId": "string",
  "limit": 10,
  "filters": {
    "platforms": ["tiktok", "facebook"],
    "minFollowers": 5000,
    "maxEstimatedCost": 3000000
  }
}
```

Response:

```json
{
  "recommendations": [
    {
      "kolId": "string",
      "name": "string",
      "overallMatchScore": 0.87,
      "audienceFit": 0.84,
      "brandFit": 0.88,
      "styleFit": 0.82,
      "trustScore": 0.9,
      "riskScore": 0.18,
      "reason": "string",
      "evidence": ["string"],
      "concerns": ["string"],
      "suggestedCampaignRole": "awareness"
    }
  ]
}
```

---

## 7.5. Save feedback

```http
POST /api/ai/feedback
```

Purpose:

```text
Save user feedback for learning loop.
```

Request body:

```json
{
  "campaignId": "string",
  "stepId": "string",
  "assetId": "string",
  "eventType": "edit",
  "beforeText": "old content",
  "afterText": "new content",
  "reason": "too AI"
}
```

Response:

```json
{
  "success": true
}
```

---

## 7.6. Generate campaign insight

```http
POST /api/ai/campaigns/:campaignId/insights
```

Purpose:

```text
Analyze campaign performance after publishing.
```

Response:

```json
{
  "summary": "string",
  "whatWorked": ["string"],
  "whatDidNotWork": ["string"],
  "bestAngle": "string",
  "weakestAngle": "string",
  "kolPerformanceNotes": ["string"],
  "nextCampaignRecommendations": ["string"],
  "dataLimitations": ["string"]
}
```

---

## 8. Agent Workflow

## 8.1. Generate campaign plan workflow

```text
Input: campaignId, days, platforms, mode

1. Load campaign context from MongoDB.
2. Search brand memories using RAG.
3. Run Intake Agent.
4. Run Strategy Agent.
5. For each campaign step:
   - Run Content Agent.
   - Run Validator Agent.
   - Score generated content.
6. Save generated steps to campaign_steps.
7. Save generated assets to generated_assets.
8. Save agent trace to agent_runs.
9. Return structured timeline.
```

---

## 8.2. Generate single post workflow

```text
Input: campaignId, stepId, userInstruction

1. Load campaign and step context.
2. Retrieve brand memories.
3. Retrieve previous feedback.
4. Run Content Agent.
5. Run Validator Agent.
6. Save generated asset.
7. Return new content.
```

---

## 8.3. Match KOL/KOC workflow

```text
Input: campaignId, filters, limit

1. Load campaign context.
2. Convert campaign description into search query.
3. Search KOL profiles using MongoDB Vector Search.
4. Filter by platform, follower range, category, risk score.
5. Run Matching Agent to explain and rerank.
6. Save agent run.
7. Return ranked recommendations.
```

---

## 8.4. Learning workflow

```text
Input: feedback event

1. Save raw feedback event.
2. If user approved content:
   - save content as positive brand memory.
3. If user rejected content:
   - save rejected pattern as negative brand memory.
4. If user edited content:
   - compare beforeText and afterText.
   - summarize writing preference.
   - save preference to brand_memories.
5. Update prompt/version metrics.
```

---

## 9. Agent Responsibilities

## 9.1. Root Agent

Responsible for orchestration.

```text
- Decide which agent to call.
- Pass context between agents.
- Ensure output follows schema.
- Trigger validation before saving.
```

---

## 9.2. Intake Agent

Purpose:

```text
Clean and normalize campaign brief.
```

Input:

```text
campaign objective
product information
target audience
platforms
brand voice
mandatory facts
forbidden claims
CTA
```

Output:

```json
{
  "campaignGoal": "string",
  "funnelStage": "awareness",
  "targetAudienceSummary": "string",
  "coreMessage": "string",
  "mainCustomerBlockers": ["string"],
  "brandVoiceDirection": "string",
  "missingFields": ["string"],
  "riskNotes": ["string"]
}
```

---

## 9.3. Strategy Agent

Purpose:

```text
Create campaign strategy and timeline.
```

Output:

```json
{
  "strategySummary": "string",
  "contentPillars": ["string"],
  "campaignSteps": [
    {
      "dayIndex": 1,
      "platform": "threads",
      "funnelStage": "awareness",
      "goal": "string",
      "angle": "string",
      "mainMessage": "string",
      "ctaType": "soft_comment"
    }
  ],
  "whatNotToDo": ["string"],
  "riskNotes": ["string"]
}
```

---

## 9.4. Content Agent

Purpose:

```text
Generate platform-native social content.
```

Rules:

```text
- Write natural Vietnamese.
- Avoid generic AI wording.
- Avoid brochure tone.
- Do not invent facts.
- Include mandatory facts naturally.
- Keep CTA soft.
- For Threads, support main post + first comment.
- For TikTok, support hook + scene idea if needed.
```

Output:

```json
{
  "platform": "threads",
  "hook": "string",
  "post": "string",
  "firstComment": "string",
  "replySuggestions": ["string"],
  "cta": "string",
  "deliveredFacts": ["string"],
  "missingFacts": ["string"],
  "notes": ["string"]
}
```

---

## 9.5. Validator Agent

Purpose:

```text
Check quality, risk, and factual consistency.
```

Validation criteria:

```text
brandFitScore
humanLikenessScore
factualConsistencyScore
platformFitScore
salesPressureScore
riskLevel
```

Output:

```json
{
  "brandFitScore": 0.86,
  "humanLikenessScore": 0.82,
  "factualConsistencyScore": 0.92,
  "platformFitScore": 0.8,
  "salesPressureScore": 0.3,
  "riskLevel": "green",
  "issues": [],
  "suggestedRevision": "string",
  "finalDecision": "approve"
}
```

Rules:

```text
- If content includes unsupported claims, reduce factualConsistencyScore.
- If content sounds too generic or polished, reduce humanLikenessScore.
- If content includes price, guarantee, medical/legal/financial claims, mark at least amber.
- If content can harm brand reputation, finalDecision must be human_review.
```

---

## 9.6. Matching Agent

Purpose:

```text
Find suitable KOL/KOC for a campaign.
```

Scoring criteria:

```text
audienceFit
brandFit
styleFit
trustScore
riskScore
expectedCampaignValue
```

Rules:

```text
- Do not rank only by follower count.
- Must explain recommendation with evidence.
- Penalize high-risk profiles.
- Prefer profiles that match audience and campaign goal.
```

---

## 9.7. Insight Agent

Purpose:

```text
Analyze campaign performance.
```

Rules:

```text
- Do not only evaluate likes and shares.
- Prioritize qualified comments, clicks, leads, conversions, revenue, cost and ROI.
- If data is incomplete, mention data limitations.
```

---

## 9.8. Learning Agent

Purpose:

```text
Convert feedback into reusable memory.
```

Responsibilities:

```text
- Store approved content as positive memory.
- Store rejected content as negative memory.
- Summarize edit patterns.
- Update brand writing preferences.
- Update prompt performance metrics.
- Prepare future data for ranking model.
```

---

## 10. RAG Design with MongoDB

## 10.1. Retrieval sources

```text
brand_memories
kol_profiles
generated_assets
feedback_events
performance_events
```

## 10.2. Brand memory retrieval

Used when generating campaign content.

Search query should include:

```text
campaign objective
platform
target audience
product description
brand voice
funnel stage
```

Filter by:

```text
brandId
platform
funnelStage
memory type
```

Return:

```json
{
  "text": "string",
  "type": "approved_post",
  "platform": "threads",
  "score": 0.87,
  "reason": "Relevant to campaign tone"
}
```

## 10.3. KOL/KOC retrieval

Used when matching representatives.

Search query should include:

```text
product category
target audience
campaign goal
brand positioning
preferred platform
```

Filter by:

```text
platform
category
followers
riskScore
trustScore
```

Return top candidates to Matching Agent for reranking.

---

## 11. Scoring Logic

## 11.1. Content score

```text
contentScore =
brandFitScore * 0.25
+ humanLikenessScore * 0.25
+ factualConsistencyScore * 0.25
+ platformFitScore * 0.15
- riskPenalty * 0.10
```

Risk penalty:

```text
green = 0
amber = 0.2
red = 0.5
```

## 11.2. KOL/KOC match score

```text
matchScore =
audienceFit * 0.25
+ brandFit * 0.20
+ styleFit * 0.15
+ trustScore * 0.20
+ expectedCampaignValue * 0.15
- riskScore * 0.20
```

---

## 12. Feedback Loop

The system should not fine-tune models in MVP.

Learning in MVP means:

```text
- better brand memory
- better rejected-pattern memory
- better prompt version tracking
- better retrieval
- better ranking
```

## 12.1. Feedback events to collect

```text
approve
reject
edit
regenerate
publish
pin_as_good
mark_too_ai
mark_wrong_fact
```

## 12.2. What the system learns

From approved content:

```text
- preferred hook style
- preferred tone
- preferred CTA style
- platform-specific writing pattern
```

From rejected content:

```text
- phrases to avoid
- tone that feels too AI
- risky claims
- weak angles
```

From edited content:

```text
- before/after writing preference
- words removed by user
- details added by user
- structure changed by user
```

From performance:

```text
- angle that generated qualified comments
- post type that generated clicks
- KOL/KOC that generated leads
- CTA that converted better
```

---

## 13. Growth Roadmap

## Stage 1: MVP

```text
- ADK agent workflow
- Gemini generation
- MongoDB storage
- Basic RAG
- Validator Agent
- Feedback logging
```

## Stage 2: Better memory

```text
- Approved/rejected memory
- Edit-diff summary
- Brand writing preference
- Prompt version metrics
```

## Stage 3: Better ranking

```text
- Heuristic content scoring
- Heuristic KOL/KOC scoring
- Compare approval rate by prompt version
- Compare performance by angle/hook type
```

## Stage 4: Lightweight ML

Only after enough data.

```text
- Train content approval predictor
- Train KOL/KOC match reranker
- Train Vietnamese style classifier
- Train risk classifier
```

## Stage 5: Separate ML service

Only if required.

```text
Next.js Backend
   ↓
Python ML Service
   ↓
Custom model inference / training
```

---

## 14. Code Rules

## 14.1. Route rules

Route files must only handle:

```text
- authentication
- request validation
- calling workflow
- returning response
```

Route files must not contain:

```text
- raw prompt text
- direct Gemini call
- long business logic
- database query mixed with agent logic
```

Correct pattern:

```text
route.ts
  → workflow
  → service
  → agent
  → tool
  → database / Gemini
```

---

## 14.2. Prompt rules

Prompts must be stored in:

```text
src/server/ai/prompts/
```

Each prompt should have:

```text
name
version
purpose
input contract
output contract
rules
```

Do not write large prompts directly in service files.

---

## 14.3. Agent run logging

Every agent run must save:

```text
workflowName
agentName
campaignId
model
promptVersion
latencyMs
status
error if failed
```

Do not log:

```text
Gemini API key
private user data unless necessary
sensitive raw payloads
```

---

## 14.4. Output rules

All AI outputs must be structured JSON.

Do not return unstructured text from workflows.

Every generated content must pass Validator Agent before being saved as campaign step.

---

## 15. Prompt Guide

## 15.1. Base system prompt

```text
You are the AI Agent of HIVE-K, a Marketplace & SaaS platform for transparent KOL/KOC campaign management.

Rules:
1. Do not invent facts.
2. Do not create unsupported claims.
3. Do not copy a specific creator's style.
4. Use only the provided campaign and brand context.
5. Always return valid JSON based on the required schema.
6. If information is missing, list it in missingFields.
7. If the content has risk, assign the correct riskLevel.
8. Optimize for campaign objective, not empty virality.
9. Vietnamese content must sound natural, specific and human.
10. Avoid generic AI phrases and brochure-like writing.
```

---

## 15.2. Content Agent prompt

```text
Task:
Generate social media content for one campaign step.

Input:
- campaign context
- platform
- funnel stage
- angle
- brand voice
- mandatory facts
- forbidden claims
- CTA
- retrieved brand memories

Writing rules:
1. Write in natural Vietnamese.
2. Avoid brochure tone.
3. Do not start with generic phrases like "Bạn đang tìm kiếm..."
4. Do not overuse emojis.
5. Do not sound too polished or templated.
6. The first 1-2 lines must create attention.
7. Include mandatory facts naturally.
8. Use a soft CTA.
9. For Threads, include main post and first comment.
10. Do not invent missing facts.

Output JSON:
{
  "platform": "...",
  "hook": "...",
  "post": "...",
  "firstComment": "...",
  "replySuggestions": [],
  "cta": "...",
  "deliveredFacts": [],
  "missingFacts": [],
  "notes": []
}
```

---

## 15.3. Validator Agent prompt

```text
Task:
Evaluate generated content before saving or publishing.

Criteria:
1. Brand fit.
2. Human-likeness.
3. Factual consistency.
4. Platform fit.
5. Sales pressure.
6. Risk level.
7. Hallucination risk.

Output JSON:
{
  "brandFitScore": 0.0,
  "humanLikenessScore": 0.0,
  "factualConsistencyScore": 0.0,
  "platformFitScore": 0.0,
  "salesPressureScore": 0.0,
  "riskLevel": "green | amber | red",
  "issues": [],
  "suggestedRevision": "...",
  "finalDecision": "approve | revise | human_review"
}

Rules:
- If there is any unsupported claim, reduce factualConsistencyScore.
- If the content sounds generic or too AI-like, reduce humanLikenessScore.
- If price, guarantee or sensitive claim appears, riskLevel must be at least amber.
- If there is brand reputation risk, finalDecision must be human_review.
```

---

## 15.4. Matching Agent prompt

```text
Task:
Rank KOL/KOC candidates for the campaign.

Input:
- campaign context
- brand positioning
- target audience
- product information
- candidate profiles
- trust score
- risk score
- performance metrics

Scoring:
1. audienceFit
2. brandFit
3. styleFit
4. trustScore
5. riskScore
6. expectedCampaignValue

Output JSON:
{
  "recommendations": [
    {
      "kolId": "...",
      "overallMatchScore": 0.0,
      "audienceFit": 0.0,
      "brandFit": 0.0,
      "styleFit": 0.0,
      "trustScore": 0.0,
      "riskScore": 0.0,
      "reason": "...",
      "evidence": [],
      "concerns": [],
      "suggestedCampaignRole": "awareness | conversion | review | livestream | affiliate"
    }
  ]
}

Rules:
- Do not recommend based only on follower count.
- Use evidence from candidate profile and campaign context.
- Penalize high risk.
- If data is missing, mention it clearly.
```

---

## 16. Final Implementation Order

## Phase 1: Foundation

```text
1. Setup env config.
2. Setup MongoDB client.
3. Setup Gemini service with multiple API keys.
4. Setup AI folder structure.
5. Setup base schemas with Zod.
```

## Phase 2: Campaign generation

```text
1. Build getCampaignContext tool.
2. Build Intake Agent.
3. Build Strategy Agent.
4. Build Content Agent.
5. Build Validator Agent.
6. Build generateCampaignPlan workflow.
7. Save campaign_steps.
```

## Phase 3: Feedback loop

```text
1. Build feedback API.
2. Save feedback_events.
3. Convert approved content to brand memory.
4. Convert rejected content to negative memory.
5. Summarize edit patterns.
```

## Phase 4: Matching

```text
1. Create kol_profiles collection.
2. Add profile embeddings.
3. Build MongoDB Vector Search.
4. Build Matching Agent.
5. Build matchKolKoc workflow.
```

## Phase 5: Insight

```text
1. Save performance_events.
2. Build getCampaignMetrics tool.
3. Build Insight Agent.
4. Generate campaign learning summary.
```

---

## 17. Final Architecture Summary

The MVP architecture should be:

```text
Next.js Backend
+ ADK TypeScript
+ Gemini API
+ MongoDB
+ MongoDB Atlas Vector Search
+ Zod validation
+ Feedback loop
```

The AI Agent should be implemented as a clean internal backend module.

Do not over-engineer with Python, FastAPI or separate ML services until the product actually needs custom ML training, local model inference or heavy data pipelines.
