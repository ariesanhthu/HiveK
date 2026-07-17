# **Engineering Integration Blueprint for the Meta Threads API**

## **Architecture and Protocol Foundations for the Meta Threads API**

The Meta Threads API is a programmatic interface built directly upon the foundation of the Meta Graph API infrastructure1. Unlike legacy platforms, Threads utilizes a completely independent permission namespace, an isolated authorization flow, and its own base URL host, separate from both Facebook and Instagram3. While Facebook Graph API requests route to graph.facebook.com, the Threads engine addresses graph.threads.net directly3. This clear boundary prevents credentials, API rates, and app definitions from crossing over, meaning that even if an existing Instagram Business Profile is connected, developers must build a separate integration specifically for Threads3.  
Integrating natively with the Threads API requires an understanding of its strict payload limits and media validation rules2. The platform is designed around conversation-first structures, which introduces different validation rules compared to traditional media-centric platforms like Instagram4.

| Architectural Attribute | Specification | Operational Limits & Validation Rules |
| :---- | :---- | :---- |
| **Maximum Character Length** | 500 graphemes3 | Payloads over 500 characters are rejected3. Only 1 hashtag is hyperlinked2. |
| **Asset Formats (Images)** | JPEG, PNG, WEBP, GIF2 | Max file size 8 MB2. Dimensions: 320px to 1440px wide8. Aspect ratio: 1.91:1 to 4:52. |
| **Asset Formats (Videos)** | MP4, MOV2 | Max file size 1 GB7, duration 3s to 5m2. Aspect ratio: 0.01:1 to 10:14. |
| **Publishing Limit** | 250 posts per 24 hours2 | Tracked across a sliding 24-hour window per user profile2. |
| **Deletion Limit** | 100 deletions per 24 hours9 | Restricts rapid post-cleanup operations to prevent spam behaviors9. |
| **Link Previews** | Automated parsing2 | The first URL in a text-only post is parsed into a preview card2. |

## **Authorization and Token Exchange Architecture**

The Threads authorization system relies on a two-step OAuth 2.0 process that converts a temporary user authorization code into a long-lived access token valid for 60 days1. This process requires a secure server-side infrastructure to store and manage secrets11.

  \[ Client Browser \]          \[ Application Backend \]          \[ Meta Identity Service \]  
          │                              │                                 │  
          │  ── 1\. Redirect to Auth URL ─┼────────────────────────────────\>│  
          │  \<─ 2\. Returns Auth Code ────┼─────────────────────────────────│  
          │                              │                                 │  
          │  ── 3\. Post Code to Backend ─\>│                                 │  
          │                              │  ── 4\. Exchange Short Token ───\>│  
          │                              │  \<─ 5\. Returns Short Access ────│  
          │                              │                                 │  
          │                              │  ── 6\. Exchange Long Token ────\>│  
          │                              │  \<─ 7\. Returns Long-Lived Token │

### **Short-Lived Access Token Protocol**

The authorization sequence begins on the client side11. The user is redirected to the Threads interactive consent screen, which is hosted directly on the main Threads platform rather than the standard Facebook login page1:

https://threads.net/oauth/authorize?client\_id={app-id}\&redirect\_uri={callback-uri}\&scope=threads\_basic,threads\_content\_publish\&response\_type=code

This request requires specific access scopes1: threads\_basic provides access to core profile metadata and media history1, while threads\_content\_publish is required to programmatically create and share posts1. Once the user grants consent, Meta redirects the browser back to the registered callback URL, appending a temporary authorization code as a query parameter1.  
The application server must then exchange this authorization code for a short-lived access token3. This requires a server-side POST request to https://graph.threads.net/oauth/access\_token3, using the application/x-www-form-urlencoded format13:

* client\_id: The Meta App ID15  
* client\_secret: The Meta App Secret15  
* grant\_type: must be set to authorization\_code  
  \[cite: 15, 16, 17\]  
* redirect\_uri: The identical, registered callback URL15  
* code: The extracted authorization code15

This request returns a short-lived user access token that is valid for 1 hour4.

### **Long-Lived Token Exchange and Refresh Lifecycle**

Because short-lived tokens expire quickly, background automation systems require a long-lived token3. The application server exchanges the valid short-lived token for a long-lived access token using a GET request3:

GET https://graph.threads.net/access\_token?grant\_type=th\_exchange\_token\&client\_secret={app-secret}\&access\_token={short-lived-token}

A successful exchange returns a long-lived token valid for 60 days, along with its expiration timestamp3.

JSON  
{  
  "access\_token": "TH\_LONG\_LIVED\_TOKEN\_VALUE",  
  "token\_type": "bearer",  
  "expires\_in": 5183944  
}

To maintain access without requiring the user to log in again, the application backend must refresh the long-lived token before the 60-day window closes3. This is done via a GET request using the th\_refresh\_token grant type17:

GET https://graph.threads.net/refresh\_access\_token?grant\_type=th\_refresh\_token\&access\_token={current-long-lived-token}

A successful refresh yields a new long-lived token with a reset 60-day expiration window3. If a token is allowed to expire completely, it cannot be refreshed; the connection is lost, and the user must go through the interactive OAuth flow again3.

## **The Container-Based Content Publishing System**

The Threads API uses a two-step container model for publishing all post types8. This prevents the immediate creation of live posts and gives the platform time to parse text formatting, validate sizes, and transcode remote media files1.

  \[ App Server \]                   \[ Threads Core API \]                 \[ Media CDN \]  
        │                                    │                                │  
        │  ── 1\. Create Media Container ────\>│                                │  
        │                                    │  ── 2\. Request Asset Files ───\>│  
        │                                    │  \<─ 3\. Transcode and Parse ────│  
        │  ── 4\. Poll /status\_code ─────────\>│                                │  
        │  \<─ 5\. Returns 'FINISHED' ─────────│                                │  
        │                                    │                                │  
        │  ── 6\. Execute /threads\_publish ──\>│                                │  
        │  \<─ 7\. Returns Public Post ID ─────│                                │

### **Native Step-by-Step Media Pipeline**

To publish a text, image, or video post, the integration must execute two distinct steps8:  
**Step 1: Container Creation**  
The application server initiates a POST request to https://graph.threads.net/v1.0/{user-id}/threads to create a media container8. The payload contains the text, media type, and public asset URLs8. The endpoint immediately returns a temporary creation\_id representing the draft container, which remains valid for 24 hours6.  
**Step 2: Container Status Polling (Mandatory for Videos)**  
For text and standard image posts, transcoding is quick enough that the application can publish almost immediately2. However, videos require the system to poll the container's status until processing is complete5. This is done via a GET request to https://graph.threads.net/v1.0/{container-id}?fields=status\_code5. The publish step can only proceed when the status resolves to FINISHED5.  
**Step 3: Post Publication**  
Once the container is processed, the system commits the draft to the live feed by sending a POST request to https://graph.threads.net/v1.0/{user-id}/threads\_publish?creation\_id={container-id}8. This publishes the post and returns the final public Threads Media ID18.

## **Orchestrating Complex Features**

### **Multi-Image and Mixed-Media Carousel Composition**

Publishing a multi-image or mixed-media carousel is a more complex process2. It requires creating and verifying several independent child containers before linking them under a single parent container2.

1. **Create Child Containers**: The system generates an independent container for each slide by sending a POST request to /{user-id}/threads2. Crucially, the request must include the parameter is\_carousel\_item=true2. This flags the asset as a child element and prevents it from publishing as an individual standalone post2.  
2. **Poll Child Transcoding**: The system must poll each child container's status\_code until it resolves to FINISHED9.  
3. **Generate Parent Container**: Once all child containers are ready, the system creates the parent container5. This is done by sending a POST request to /{user-id}/threads with media\_type: "CAROUSEL" and a comma-separated list of the child container IDs passed in the children parameter2.  
4. **Publish Carousel**: Finally, the system publishes the parent container ID using the /threads\_publish endpoint, which pushes the entire carousel live to the user's feed5.

### **Conversation Trees and Response Sequences**

The Threads API allows developers to programmatically create threaded replies using a nesting model8. To post a reply to an existing thread, the system must set the reply\_to\_id parameter to the target post's parent ID when initializing the media container8:

POST https://graph.threads.net/v1.0/{user-id}/threads?media\_type=TEXT\&text=Continuous+Reply+Content\&reply\_to\_id={parent-post-id}

Once the container is created, publishing follows the standard /threads\_publish flow8. To construct longer reply chains (multi-post threads), the integration must publish each post sequentially, capture the resulting post ID, and pass it as the reply\_to\_id for the next post in the sequence8.

## **Technical Integration Design and Middleware Comparison**

When planning a Threads integration, developers must choose between building directly on Meta's native endpoints or routing requests through a unified middleware provider4. Writing a native implementation gives you direct control over the raw API features and avoids third-party subscription costs, but it requires you to manually handle authentication lifecycles, asset hosting, polling queues, and rate limits4.

| Integration Vector | Native Threads API Integration | Unified Social Middleware (e.g., Postproxy, Ayrshare, letmepost) |
| :---- | :---- | :---- |
| **Publishing Pipeline** | Manual two-step container creation and publishing sequence8. | Single POST request; the middleware handles container creation and publishing6. |
| **Token Maintenance** | Manual implementation of database storage, token expiration tracking, and silent refresh flows3. | The middleware manages tokens and handles silent refreshes automatically6. |
| **Asset Delivery Requirements** | Assets must be hosted on public HTTPS URLs for Meta to fetch2. | Supports direct file uploads or automated asset hosting2. |
| **Video Processing** | Manual status polling of video containers before publishing5. | The middleware polls processing states internally and notifies your system via webhooks6. |
| **Automated Scheduling** | No native scheduling support; posts publish immediately4. Requires an internal database and scheduling queue. | Built-in scheduling features allow you to target publication times in the future2. |
| **Compliance & App Review** | Requires formal Meta App Review approval for scopes like threads\_content\_publish in production3. | Uses pre-approved developer applications, allowing you to bypass the App Review process6. |

## **Technical Specification and TypeScript Schema Catalog**

Below is a complete, production-ready TypeScript schema definition that provides strong type safety for the requests and responses utilized across the Threads API21. This catalog covers the core authentication, container creation, video status polling, publishing, analytics, and deletion operations2.

TypeScript  
/\*\*  
 \* Global API Scope Definitions for the Threads Platform  
 \*/  
export type ThreadsPermissionScope \=  
  | 'threads\_basic'  
  | 'threads\_content\_publish'  
  | 'threads\_manage\_insights'  
  | 'threads\_manage\_replies'  
  | 'threads\_read\_replies';

/\*\*  
 \* Valid Media Format Identifiers  
 \*/  
export type ThreadsMediaType \= 'TEXT' | 'IMAGE' | 'VIDEO' | 'CAROUSEL';

/\*\*  
 \* Access Control for Replies  
 \*/  
export type ThreadsReplyControl \= 'everyone' | 'accounts\_you\_follow' | 'mentioned\_only';

/\*\*  
 \* Interactive Analytics Metric Identifiers  
 \*/  
export type ThreadsMetricType \= 'views' | 'likes' | 'replies' | 'reposts' | 'shares' | 'quotes';

// \==========================================  
// AUTHENTICATION INTERFACES  
// \==========================================

export interface ShortLivedTokenRequest {  
  client\_id: string;  
  client\_secret: string;  
  grant\_type: 'authorization\_code';  
  redirect\_uri: string;  
  code: string;  
}

export interface ShortLivedTokenResponse {  
  access\_token: string;  
  user\_id: string;  
}

export interface LongLivedTokenRequest {  
  grant\_type: 'th\_exchange\_token';  
  client\_secret: string;  
  access\_token: string;  
}

export interface LongLivedTokenResponse {  
  access\_token: string;  
  token\_type: 'bearer';  
  expires\_in: number; // Expiration lifetime in seconds  
}

export interface TokenRefreshRequest {  
  grant\_type: 'th\_refresh\_token';  
  access\_token: string;  
}

export interface TokenRefreshResponse {  
  access\_token: string;  
  token\_type: 'bearer';  
  expires\_in: number; // Reset expiration lifetime in seconds  
}

// \==========================================  
// USER PROFILE INTERFACES  
// \==========================================

export interface UserProfileResponse {  
  id: string;  
  username: string;  
  name?: string;  
  threads\_profile\_picture\_url?: string;  
  threads\_biography?: string;  
}

// \==========================================  
// PUBLISHING & CONTAINER INTERFACES  
// \==========================================

export interface BaseContainerRequest {  
  media\_type: ThreadsMediaType;  
  text?: string; // Max 500 characters  
  reply\_control?: ThreadsReplyControl;  
  reply\_to\_id?: string; // Identifies parent post for replies  
  location\_id?: string;  
  topic\_tag?: string; // Explicit category tagging  
}

export interface ImageContainerRequest extends BaseContainerRequest {  
  media\_type: 'IMAGE';  
  image\_url: string; // Public HTTPS URL  
  alt\_text?: string;  
}

export interface VideoContainerRequest extends BaseContainerRequest {  
  media\_type: 'VIDEO';  
  video\_url: string; // Public HTTPS URL  
  alt\_text?: string;  
}

export interface CarouselChildContainerRequest {  
  media\_type: 'IMAGE' | 'VIDEO';  
  image\_url?: string; // Required if media\_type is IMAGE  
  video\_url?: string; // Required if media\_type is VIDEO  
  is\_carousel\_item: true;  
  alt\_text?: string;  
}

export interface CarouselParentContainerRequest extends BaseContainerRequest {  
  media\_type: 'CAROUSEL';  
  children: string\[\]; // Ordered list of child container IDs  
}

export interface ContainerCreationResponse {  
  id: string; // Temporary container creation\_id  
}

export interface ContainerStatusResponse {  
  id: string;  
  status\_code: 'EXPIRED' | 'FAILED' | 'FINISHED' | 'IN\_PROGRESS';  
  error\_message?: string;  
}

export interface PublishRequest {  
  creation\_id: string;  
}

export interface PublishResponse {  
  id: string; // Final public Threads Media ID  
}

// \==========================================  
// POST DELETION INTERFACES  
// \==========================================

export interface PostDeletionResponse {  
  success: boolean;  
}

// \==========================================  
// METRICS & ANALYTICS INTERFACES  
// \==========================================

export interface MetricValue {  
  name: ThreadsMetricType;  
  period: 'day' | 'lifetime';  
  values: Array\<{ value: number }\>;  
  title: string;  
  description: string;  
}

export interface PostAnalyticsResponse {  
  data: MetricValue\[\];  
}

## **Rate Limits, Operational Thresholds, and Fault Recovery**

Operating a native integration requires structured strategies to handle API rate limits and token failures1.

                \[ Outgoing API Post Event \]  
                             │  
                             ▼  
               { Check Rate Limit Quota }  
               /                        \\  
      (Within Quota)               (Quota Exceeded)  
            │                              │  
            ▼                              ▼  
    \[ Execute Call \]             \[ Queue Task & Backoff \]  
            │                              │  
    { Handle Errors }                      │  
     /             \\                       │  
 (Success)     (Http 429 / 401\)            │  
    │                  │                   │  
    ▼                  ▼                   │  
 \[Done\]     \[ Trigger Refresh/Retry \] \<────┘

### **Quota Calculations and Adaptive Throttling**

To stay within the sliding 24-hour limit of 250 posts, the system should track the rate of outgoing requests2:  
![][image1]  
To enforce this, developers should use a token-bucket algorithm that limits outgoing requests to one every 5.76 minutes during peak usage. This protects the integration from hitting platform limits11.  
When making API calls, the system must parse the X-Business-Use-Case-Usage header returned in Meta's HTTP responses to monitor live usage1:

JSON  
{  
  "X-Business-Use-Case-Usage": {  
    "threads\_publishing\_rate": \[  
      {  
        "call\_count": 18,  
        "total\_cputime": 12,  
        "total\_time": 5,  
        "estimated\_time\_to\_regain\_access": 0  
      }  
    \]  
  }  
}

If an API call is rejected with an HTTP 429 (Too Many Requests) status code, the integration must capture the rejection, calculate an exponential backoff delay based on the retry attempt, and queue the task for retry11:  
![][image2]

### **Resolving Authentication Desynchronization (Code 100 / Subcode 10\)**

During deployment, teams often encounter a persistent error when attempting token exchanges for verified, reviewed apps15:

JSON  
{  
  "error": {  
    "message": "This action requires the threads\_basic permission. You must submit for app review, or your user must be in the list of Threads testers.",  
    "type": "THApiException",  
    "code": 100,  
    "error\_subcode": 10  
  }  
}

This error usually indicates a desynchronization issue between Meta's authorization servers and the active app configuration15. It occurs when permissions are approved but the production app manifest fails to refresh the changes15.  
**Resolution Workflow**:  
To fix this desynchronization, the developer should go to the Meta App Dashboard, toggle the app's status from "Live" back to "Development" mode, wait one minute, and then switch it back to "Live"15. Alternatively, unpublishing and republishing the integration forces Meta's identity network to hard-reload scope configurations across user profiles15.

### **Automating Token Failures**

The application database should store the expiration date of all long-lived tokens (expiresAt \= Date.now() \+ response.expires\_in \* 1000\)3. A daily background cron job should identify any tokens expiring within the next 7 days and automatically exchange them for fresh tokens using the th\_refresh\_token endpoint3.  
If a token refresh request returns an HTTP 401 (Unauthorized) error, the token is no longer valid11. The system must mark that account connection as "Disconnected" (setting needsReconnection: true), halt all pending queue jobs for that profile to prevent further failures, and alert the user to re-authenticate and re-link their account3.

#### **Works cited**

1. Threads API Documentation 2026: Complete Developer Guide \- Zernio, [https://zernio.com/blog/threads-api](https://zernio.com/blog/threads-api)  
2. Threads API Integration: Authorization, Posting, & Analytics with Ayrshare, [https://www.ayrshare.com/blog/threads-api-integration-authorization-posting-analytics-with-ayrshare/](https://www.ayrshare.com/blog/threads-api-integration-authorization-posting-analytics-with-ayrshare/)  
3. Threads integration \- Hayon Documentation, [https://devxtra-community-hayon-25.mintlify.app/integrations/threads](https://devxtra-community-hayon-25.mintlify.app/integrations/threads)  
4. How to Post to Threads via API (2026 Developer Guide) \- PostEverywhere's AI, [https://posteverywhere.ai/blog/post-to-threads-api](https://posteverywhere.ai/blog/post-to-threads-api)  
5. Instagram Graph API 2026: Dev Questions Meta's Docs Leave Open \- Zernio, [https://zernio.com/blog/instagram-graph-api](https://zernio.com/blog/instagram-graph-api)  
6. Threads API for developers · letmepost.dev, [https://letmepost.dev/platforms/threads](https://letmepost.dev/platforms/threads)  
7. How to Schedule & Auto-Post to Threads via API \- Postproxy, [https://postproxy.dev/how-to/post-to-threads-api/](https://postproxy.dev/how-to/post-to-threads-api/)  
8. Post to Threads via API: Developer Guide (2026) | Postproxy, [https://postproxy.dev/blog/how-to-post-to-threads-via-api/](https://postproxy.dev/blog/how-to-post-to-threads-via-api/)  
9. GitHub \- mikusnuz/meta-mcp: MCP server for Instagram Graph API, Threads API & Meta platform — 57 tools with Graph API v25.0, [https://github.com/mikusnuz/meta-mcp](https://github.com/mikusnuz/meta-mcp)  
10. Meta: 15 Tools | MCP Servers \- Claude Code Marketplaces, [https://claudemarketplaces.com/mcp/io.github.mikusnuz/meta](https://claudemarketplaces.com/mcp/io.github.mikusnuz/meta)  
11. Threads Posting API: OAuth Setup & Code Examples \[2026\] \- Zernio, [https://zernio.com/blog/threads-posting-api](https://zernio.com/blog/threads-posting-api)  
12. Threads API Developer Guide \[2025\] — Application Process, Integration Examples, Endpoint List, Real-World Use Cases, [https://lionfans.cc/en/blog/threads-api-guide](https://lionfans.cc/en/blog/threads-api-guide)  
13. threads-api | Skills Marketplace \- LobeHub, [https://lobehub.com/skills/rawveg-skillsforge-marketplace-threads-api](https://lobehub.com/skills/rawveg-skillsforge-marketplace-threads-api)  
14. Threads Api (Grade A) \- Claude Skill, [https://www.skillsdirectory.com/skills/rawveg-threads-api](https://www.skillsdirectory.com/skills/rawveg-threads-api)  
15. Meta Threads API exchange access tokens in error \- Stack Overflow, [https://stackoverflow.com/questions/79895230/meta-threads-api-exchange-access-tokens-in-error](https://stackoverflow.com/questions/79895230/meta-threads-api-exchange-access-tokens-in-error)  
16. Threads API | Documentation | Postman API Network, [https://www.postman.com/meta/threads/documentation/dht3nzz/threads-api](https://www.postman.com/meta/threads/documentation/dht3nzz/threads-api)  
17. Threads APIトークン取得・管理手順まとめ (Access Token取得・長期トークン延長について) \- Qiita, [https://qiita.com/kawamurashin/items/5f7aadde537919fea2cb](https://qiita.com/kawamurashin/items/5f7aadde537919fea2cb)  
18. Threads API is here \- Disane.dev \- Tech blog, [https://blog.disane.dev/en/threads-api-is-here/](https://blog.disane.dev/en/threads-api-is-here/)  
19. Threads API \- Post, Schedule & Analyze \- Outstand, [https://www.outstand.so/threads](https://www.outstand.so/threads)  
20. How to Publish an Instagram Carousel via API \- Postproxy, [https://postproxy.dev/how-to/publish-instagram-carousel-api/](https://postproxy.dev/how-to/publish-instagram-carousel-api/)  
21. Introducing the Typescript SDK \- Parallel Web Systems, [https://parallel.ai/blog/typescript-sdk](https://parallel.ai/blog/typescript-sdk)  
22. GitHub \- solojungle/threads-ts: Threads API & SDK in TypeScript: Post, Reply, Analyze API, [https://github.com/solojungle/threads-ts](https://github.com/solojungle/threads-ts)  
23. spoolappio/threads-graph-api: A Javascript library to interface with the official Instagram Threads API \- GitHub, [https://github.com/spoolappio/threads-graph-api](https://github.com/spoolappio/threads-graph-api)

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,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>