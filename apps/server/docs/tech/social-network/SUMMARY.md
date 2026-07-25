# Social Network Platform Integration Guide

> **Full domain documentation**: [`docs/domain/social-page-domain.md`](../../domain/social-page-domain.md)
> **Infrastructure refactor**: [`docs/refactor/social-network.md`](../../refactor/social-network.md)
> **Last updated**: 2026-07-18

---

## Architecture in 30 Seconds

```
infrastructure/social-network/
├── <platform>/          ← your platform implementation
│   ├── <platform>.module.ts
│   ├── <platform>-social-page-connector.service.ts   ← ISocialPageConnector
│   ├── <platform>-publisher.service.ts               ← ISocialPublisher
│   ├── <platform>-graph-api.client.ts                ← HTTP client
│   └── <platform>-api.types.ts                       ← request/response types
├── common/
│   ├── factories/         ← SocialPageConnectorFactory, SocialPublisherDiscovery, CommentReplierDiscovery
│   ├── jobs/              ← post-publish.job.ts (cron every 1 min)
│   └── social-network.module.ts  ← wires all platforms + factories + handlers
└── instagram/             ← (future)
```

Each platform plugs into the factory pattern via **multi-provider DI maps** — no code outside `social-network/` needs to change.

---

## What You Need to Build

### 1. Core Interfaces (already exist — implement these)

| Interface | File | Methods |
|-----------|------|---------|
| `ISocialPageConnector` | `src/core/interfaces/services/social-page-connector.interface.ts` | `getPlatformCode()`, `exchangeCodeForToken()`, `exchangeForLongLivedToken()`, `getUserAccounts()`, `getPageDetails()` |
| `ISocialPublisher` | `src/core/interfaces/services/social-publisher.interface.ts` | `publishPost({ pageToken, pageId, content, mediaUrls })` |
| `ICommentReplier` | `src/core/interfaces/services/comment-replier.interface.ts` | `replyToComment({ pageToken, commentId, message })` — optional |

### 2. Platform Enum Entry

Add your platform to `src/core/enums/social-platform-code.enum.ts`:

```ts
export enum ESocialPlatformCode {
  FACEBOOK = 'facebook',
  THREADS = 'threads',
  TIKTOK = 'tiktok',
  INSTAGRAM = 'instagram',
  // add yours here
}
```

### 3. Implementation Files (create in `social-network/<platform>/`)

```
social-network/<platform>/
├── <platform>.module.ts
├── <platform>-social-page-connector.service.ts
├── <platform>-publisher.service.ts
├── <platform>-graph-api.client.ts
└── <platform>-api.types.ts
```

#### Module boilerplate

```ts
@Module({
  imports: [HttpModule],
  providers: [
    YourGraphApiClient,
    YourPublisherService,
    YourConnectorService,
  ],
  exports: [
    YourGraphApiClient,
    YourPublisherService,
    YourConnectorService,
  ],
})
export class YourPlatformModule {}
```

#### Connector boilerplate

```ts
@Injectable()
export class YourPlatformConnectorService implements ISocialPageConnector {
  constructor(private readonly apiClient: YourGraphApiClient) {}

  getPlatformCode(): ESocialPlatformCode {
    return ESocialPlatformCode.YOUR_PLATFORM;
  }

  async exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
    const res = await this.apiClient.exchangeCode(code, redirectUri);
    return res.access_token;
  }

  async exchangeForLongLivedToken(token: string): Promise<string> {
    const res = await this.apiClient.exchangeLongLived(token);
    return res.access_token;
  }

  async getUserAccounts(token: string): Promise<ISocialPageAccount[]> {
    // Pages-based (Facebook): return multiple pages
    // User-based (Threads): return single-entry array with user profile
    const accounts = await this.apiClient.getAccounts(token);
    return accounts.map(a => ({ id: a.id, name: a.name, accessToken: token }));
  }

  async getPageDetails(pageToken: string, pageId: string): Promise<ISocialPageDetails> {
    const details = await this.apiClient.getDetails(pageId, pageToken);
    return { id: details.id, name: details.name, accessToken: pageToken,
             pictureUrl: details.picture ?? null, followerCount: details.followers ?? null };
  }
}
```

#### Publisher boilerplate

```ts
@Injectable()
export class YourPlatformPublisherService implements ISocialPublisher {
  constructor(private readonly apiClient: YourGraphApiClient) {}

  async publishPost(params: {
    pageToken: string; pageId: string; content: string; mediaUrls: string[];
  }): Promise<{ platformPostId: string }> {
    // Follow the platform's publish contract:
    //   one-step: POST content directly → return post ID
    //   two-step (Threads/Instagram): create container → poll status → publish
    const result = await this.apiClient.publish(params.pageId, params.content, params.pageToken);
    return { platformPostId: result.id };
  }
}
```

---

## Wiring It Up

In `social-network/common/social-network.module.ts`, add your platform to the **3 multi-provider registries**:

### Step A: Import your module

```ts
imports: [CqrsModule, FacebookModule, ThreadsModule, YourPlatformModule],
```

### Step B: Register into the DI maps

```ts
// SOCIAL PAGE CONNECTORS
{
  provide: SOCIAL_PAGE_CONNECTORS,
  inject: [FacebookConnectorService, ThreadsConnectorService, YourConnectorService],
  useFactory: (fb, thr, yours) => ({ facebook: fb, threads: thr, yourPlatform: yours }),
},

// SOCIAL PUBLISHERS
{
  provide: SOCIAL_PUBLISHERS,
  inject: [FacebookPublisherService, ThreadsPublisherService, YourPublisherService],
  useFactory: (fb, thr, yours) => ({ facebook: fb, threads: thr, yourPlatform: yours }),
},

// COMMENT REPLIERS (optional — only if your platform supports comment auto-reply)
{
  provide: COMMENT_REPLIERS,
  inject: [FacebookCommentReplierService, YourCommentReplierService],
  useFactory: (fb, yours) => ({ facebook: fb, yourPlatform: yours }),
},
```

That's it. **No other file in the codebase needs to change.** The factories (`SocialPageConnectorFactoryService`, `SocialPublisherDiscoveryService`, `CommentReplierDiscoveryService`) resolve strategies dynamically by `platformCode`.

---

## What Stays Where

| Concern | Location | Reason |
|---------|----------|--------|
| Mongoose schemas | `infrastructure/mongo/schemas/` | Persistence — not platform-specific |
| Repositories | `infrastructure/mongo/repositories/` | Same |
| Read services | `infrastructure/mongo/read-services/` | Same |
| REST controllers | `presentation/controllers/` | Presentation layer |
| Application handlers | `application/commands/` / `queries/` | Application layer |
| Core interfaces | `core/interfaces/` | Domain definitions |
| OAuth strategies | `infrastructure/auth/strategies/` | KOL auth flow (different from Enterprise page OAuth) |

---

## Key Differences Between Platforms

| Aspect | Facebook | Threads | Notes for new platforms |
|--------|----------|---------|------------------------|
| **Account model** | Page-based (multiple per user) | User-based (single) | TikTok is user-based; Instagram is page-based |
| **Publish model** | One-step POST | Two-step container → poll → publish | Instagram uses the same two-step model as Threads |
| **Token lifetime** | 60 days (long-lived) | 60 days (long-lived) | Standard for most Meta APIs |
| **Content limits** | 63206 chars | 500 chars | Check platform docs |
| **Media** | Single/multiple photos, video | Single image, single video, carousel (future) | |
| **Comment replies** | ✅ Supported | ❌ Not yet available | Falls back gracefully via `CommentReplierDiscovery` |

---

## Checklists

### Before coding

- [ ] Platform supports OAuth 2.0 with code exchange?
- [ ] Platform has a content publishing API?
- [ ] Platform has a `ESocialPlatformCode` entry?
- [ ] Check rate limits (posts/24h, deletions/24h)
- [ ] Check media constraints (max size, format, aspect ratio)

### Files to create

- [ ] `social-network/<platform>/<platform>.module.ts`
- [ ] `social-network/<platform>/<platform>-graph-api.client.ts`
- [ ] `social-network/<platform>/<platform>-social-page-connector.service.ts`
- [ ] `social-network/<platform>/<platform>-publisher.service.ts`
- [ ] `social-network/<platform>/<platform>-api.types.ts`
- [ ] `social-network/<platform>/<platform>-comment-replier.service.ts` (if supported)

### Files to modify

- [ ] `src/core/enums/social-platform-code.enum.ts` — add platform code
- [ ] `src/infrastructure/social-network/common/social-network.module.ts` — register connectors + publishers

---

## References

- [`docs/domain/social-page-domain.md`](../../domain/social-page-domain.md) — full domain doc: all aggregates, events, handlers, endpoints, state machines, workflows
- [`docs/refactor/social-network.md`](../../refactor/social-network.md) — infrastructure refactor plan and history
- Existing implementations: `social-network/facebook/`, `social-network/threads/`
