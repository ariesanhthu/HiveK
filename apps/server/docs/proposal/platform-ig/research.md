# **Engineering Integration Blueprint for the Instagram Graph API**

## **Architectural and Protocol Foundations**

The Instagram Graph API is built directly upon the Meta Graph API infrastructure1. Unlike standalone APIs, all Instagram Graph operations route through the standard Facebook Graph API endpoint host (graph.facebook.com)1.  
Because Instagram profiles are structurally connected to Facebook’s core social graph, programmatic publishing and metadata operations require a strict dependency chain1:

1. A physical Instagram account must be converted to a **Professional (Business or Creator) Account**2.  
2. This Instagram Professional Account must be linked to an active **Facebook Page** of which the API user has administrative control1.  
3. The API interactions target the unique **Instagram Business Account ID**, which is discovered by querying the linked Facebook Page node1.

### **Operational Validation Rules and Media Specifications**

The Instagram Graph API enforces media-centric validation rules. Notably, **text-only posts are completely unsupported**; every post must contain at least one image or video1.

| Architectural Attribute | Specification | Operational Limits & Validation Rules |
| :---- | :---- | :---- |
| **Maximum Caption Length** | 2,200 characters3 | Payloads over this limit are rejected3. |
| **First-Level Comments** | Max 2,196 characters4 | Can optionally be created alongside the post payload. |
| **Asset Formats (Images)** | JPEG, PNG4 | Maximum file size of 8 MB per item4. Minimum resolution of 200x200px4. |
| **Asset Formats (Videos/Reels)** | MP4, MOV4 | Maximum file size of 300 MB per item4. Duration spans 3 seconds to 60 minutes4. |
| **Carousel Slide Limits** | 2 to 10 items4 | Supports mixed images and videos4. Aspect ratio must be consistent across all slides (Instagram crops or letterboxes subsequent slides to match the first item)4. |
| **Link Rendering** | Unsupported in Feed/Reels | Captions do not support clickable hyperlinks. Link integration is reserved exclusively for the Stories "Link Sticker" mechanism. |

## **Authorization and Token Exchange Architecture**

The Instagram API leverages the Facebook OAuth 2.0 gateway to delegate privileges1. The system exchanges a temporary client authorization code for a long-lived user access token valid for 60 days1.

  \[ Client Browser \]          \[ Application Backend \]          \[ Facebook Identity Service \]  
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

### **OAuth Scope Configuration**

To authenticate a user and grant content creation privileges, redirect the browser to the Facebook Login dialog1:

https://www.facebook.com/v21.0/dialog/oauth?client\_id={app-id}\&redirect\_uri={callback-uri}\&scope=instagram\_basic,instagram\_content\_publish,pages\_show\_list,pages\_read\_engagement\&response\_type=code

The scopes required for a functional publishing and management MVP are1:

* instagram\_basic: Allows reading profile data and identifying linked Instagram accounts1.  
* instagram\_content\_publish: Grants the permission to upload media and publish posts, Reels, and Stories1.  
* pages\_show\_list: Allows your application to list the Facebook Pages managed by the authenticated user2.  
* pages\_read\_engagement: Allows reading Page metadata, which is required to bridge the authorization gap and locate the linked Instagram account2.

### **Short-Lived to Long-Lived Token Lifecycle**

1. **Exchange Auth Code**: Upon successful consent, Facebook redirects to your redirect\_uri with a code query parameter1. Your server must issue a POST request to exchange it for a short-lived user token (valid for \~1 hour)1:  
   POST https://graph.facebook.com/v21.0/oauth/access\_token  
   Payload: client\_id={app-id}\&client\_secret={app-secret}\&redirect\_uri={callback-uri}\&code={code}

2. **Upgrade to Long-Lived Token**: Exchange the short-lived token for a long-lived token (valid for 60 days) via a GET request1:  
   GET https://graph.facebook.com/v21.0/oauth/access\_token?grant\_type=fb\_exchange\_token\&client\_id={app-id}\&client\_secret={app-secret}\&fb\_exchange\_token={short-lived-token}

## **Instagram Business Account Discovery**

Because authorizations route through Facebook Page nodes, your system must locate which Instagram Business account is linked to the user's Facebook Pages1.  
Rather than executing separate HTTP requests for every page node (which can quickly trigger rate limits), you can run an **optimized single-endpoint batch discovery query** against the /me/accounts endpoint5. This fetches all Facebook Pages and automatically nests the linked instagram\_business\_account metadata5:

GET https://graph.facebook.com/v21.0/me/accounts?fields=id,name,instagram\_business\_account{id,name,username,profile\_picture\_url}\&access\_token={long-lived-token}

### **JSON Response Structure**

JSON  
{  
  "data": \[  
    {  
      "id": "104857600000000",  
      "name": "My Business Page",  
      "instagram\_business\_account": {  
        "id": "17841400000000000",  
        "name": "Jane Developer",  
        "username": "janedev",  
        "profile\_picture\_url": "https://scontent.xx.fbcdn.net/..."  
      }  
    }  
  \]  
}

Your application should parse this list, identify the active instagram\_business\_account.id5, and store it in your database alongside the corresponding access\_token for subsequent automated publishing1.

## **The 3-Step Publishing Pipeline**

Publishing to Instagram requires a strict multi-step workflow using **Media Containers**1. You cannot upload media directly; your server must host assets at publicly accessible HTTPS URLs, which Meta's ingestion servers will fetch during processing1.

  \[ App Server \]                  \[ Instagram Graph API \]                \[ Public CDN \]  
        │                                    │                                │  
        │  ── 1\. Create Media Container ────\>│                                │  
        │                                    │  ── 2\. Fetch Media File ──────\>│  
        │                                    │  \<─ 3\. Validate & Transcode ───│  
        │  ── 4\. Poll /status\_code ─────────\>│                                │  
        │  \<─ 5\. Returns 'FINISHED' ─────────│                                │  
        │                                    │                                │  
        │  ── 6\. Execute /media\_publish ────\>│                                │  
        │  \<─ 7\. Returns Public Media ID ────│                                │

### **Step 1: Initialize Media Container**

Send a POST request to create the draft container1.

* **For Images**:  
  POST https://graph.facebook.com/v21.0/{ig-user-id}/media  
  Params: image\_url={public-img-url}\&caption={caption}\&access\_token={token}

* **For Videos / Reels**:  
  POST https://graph.facebook.com/v21.0/{ig-user-id}/media  
  Params: media\_type=REELS\&video\_url={public-video-url}\&caption={caption}\&access\_token={token}

This call returns a draft **Container ID** (id)1.

### **Step 2: Poll Container Processing Status**

While images transcode almost instantly, video files require asynchronous rendering1. Your system must poll the container's status until it is marked as ready1.

GET https://graph.facebook.com/v21.0/{container-id}?fields=status\_code\&access\_token={token}

The status must resolve to FINISHED before you proceed1. If it returns IN\_PROGRESS or processing, wait and retry1. If it returns FAILED or ERROR, abort and inspect the error logs.

### **Step 3: Publish Container**

Commit the processed container to the live feed1:

POST https://graph.facebook.com/v21.0/{ig-user-id}/media\_publish  
Params: creation\_id={container-id}\&access\_token={token}

This returns the final public **Instagram Media ID**1.

## **Orchestrating Carousels and Stories**

### **Carousel Posts (Multi-Image/Video Slides)**

Creating a carousel requires building nested child containers first, and then linking them to a parent container1:

1. **Create Child Containers**: For each item in the carousel, create a media container with is\_carousel\_item=true1.  
   * *Note*: Do not include a caption in child containers1.

POST https://graph.facebook.com/v21.0/{ig-user-id}/media  
Params: image\_url={slide-url}\&is\_carousel\_item=true\&access\_token={token}

2. **Verify Children**: Poll each child container ID until all status codes return FINISHED4.  
3. **Create Parent Container**: Create a parent container with media\_type=CAROUSEL and pass the ordered child IDs as a comma-separated array inside the children parameter1. Include the post caption here1.  
   POST https://graph.facebook.com/v21.0/{ig-user-id}/media  
   Params: media\_type=CAROUSEL\&children={child\_id\_1},{child\_id\_2}\&caption={caption}\&access\_token={token}

4. **Publish Parent**: Execute the /media\_publish call using the parent container ID4.

### **Ephemeral Stories**

To publish a story, use the 2-step media container process, but explicitly set media\_type=STORIES1. Captions are ignored on Story containers since Stories do not support standard text captions1.

POST https://graph.facebook.com/v21.0/{ig-user-id}/media  
Params: media\_type=STORIES\&image\_url={public-image-url}\&access\_token={token}

## **TypeScript Schema Catalog**

This production-grade TypeScript schema catalog provides typing for all core Instagram MVP operations.

TypeScript  
export type InstagramMediaType \= 'IMAGE' | 'VIDEO' | 'REELS' | 'STORIES' | 'CAROUSEL';

// \==========================================  
// OAUTH INTERFACES  
// \==========================================

export interface ShortLivedTokenResponse {  
  access\_token: string;  
  token\_type: string;  
  expires\_in?: number; // Expiration time in seconds (typically \~3600)  
}

export interface LongLivedTokenResponse {  
  access\_token: string;  
  token\_type: string;  
  expires\_in: number; // Expiration lifetime in seconds (typically 5183944 for 60 days)  
}

// \==========================================  
// ACCOUNT DISCOVERY INTERFACES  
// \==========================================

export interface InstagramBusinessAccount {  
  id: string;  
  name?: string;  
  username?: string;  
  profile\_picture\_url?: string;  
}

export interface LinkedFacebookPage {  
  id: string;  
  name: string;  
  instagram\_business\_account?: InstagramBusinessAccount;  
}

export interface FacebookAccountsResponse {  
  data: LinkedFacebookPage\[\];  
}

// \==========================================  
// CONTAINER CREATION INTERFACES  
// \==========================================

export interface BaseContainerRequest {  
  caption?: string; // Max 2,200 characters  
  user\_tags?: string;  
  location\_id?: string;  
}

export interface ImageContainerRequest extends BaseContainerRequest {  
  image\_url: string; // Public HTTPS URL  
}

export interface VideoContainerRequest extends BaseContainerRequest {  
  media\_type: 'VIDEO' | 'REELS' | 'STORIES';  
  video\_url: string; // Public HTTPS URL  
}

export interface CarouselChildRequest {  
  is\_carousel\_item: true;  
  image\_url?: string; // Required if child is image  
  video\_url?: string; // Required if child is video  
}

export interface CarouselParentRequest extends BaseContainerRequest {  
  media\_type: 'CAROUSEL';  
  children: string\[\]; // Ordered array of verified child container IDs  
}

export interface ContainerCreationResponse {  
  id: string; // Staged container ID  
}

// \==========================================  
// STATUS POLLING INTERFACES  
// \==========================================

export interface ContainerStatusResponse {  
  id: string;  
  status\_code: 'EXPIRED' | 'FAILED' | 'FINISHED' | 'IN\_PROGRESS';  
  error\_message?: string;  
}

// \==========================================  
// PUBLISHING INTERFACES  
// \==========================================

export interface PublishRequest {  
  creation\_id: string;  
}

export interface PublishResponse {  
  id: string; // Final live Instagram Media ID  
}

## **Throttling and System Resilience**

The Instagram Graph API enforces a dynamic rate limit structure based on call execution times, payload weights, and user engagement metrics6.

### **Monitoring Live Quota Usage**

To protect your system from hitting limits, extract the X-Business-Use-Case-Usage header returned in every API response6:

JSON  
{  
  "X-Business-Use-Case-Usage": {  
    "17841400000000000": \[  
      {  
        "type": "content\_publishing",  
        "call\_count": 32,  
        "total\_cputime": 10,  
        "total\_time": 15,  
        "estimated\_time\_to\_regain\_limit": 0  
      }  
    \]  
  }  
}

### **Implementing Exponential Backoff**

When your application receives an HTTP 429 (Rate Limit Exceeded) error, you should immediately hold outgoing actions7. The system should pause execution and retry after a calculated delay7:  
![][image1]  
To avoid "thundering herd" issues (where multiple queued tasks retry at the exact same millisecond), append a random jitter factor to the wait time7:  
![][image2]

### **Error Mitigation Tactics**

* **Media Hosting Requirements**: Ensure your media hosting CDN can handle parallel, rapid GET requests from Meta's crawlers. If your CDN returns a slow response or a 403 error to Meta's crawler, the container status will quickly fail with an invalid media format error1.  
* **Token Refresh Scheduler**: Establish a cron job on your backend that scans for any long-lived user tokens set to expire in the next 15 days, and automatically runs the refresh flow1. This avoids hard disconnects1.  
* **Sandbox Validation**: While in development mode, only Facebook accounts registered as Administrators, Developers, or Testers inside your Meta App Dashboard can go through the login flow1. Production users cannot authorize until your app passes formal Meta App Review1.

#### **Works cited**

1. Instagram Graph API 2026: Dev Questions Meta's Docs Leave Open \- Zernio, [https://zernio.com/blog/instagram-graph-api](https://zernio.com/blog/instagram-graph-api)  
2. GitHub \- mikusnuz/meta-mcp: MCP server for Instagram Graph API, Threads API & Meta platform — 57 tools with Graph API v25.0, [https://github.com/mikusnuz/meta-mcp](https://github.com/mikusnuz/meta-mcp)  
3. How to Post to Threads via API (2026 Developer Guide) \- PostEverywhere's AI, [https://posteverywhere.ai/blog/post-to-threads-api](https://posteverywhere.ai/blog/post-to-threads-api)  
4. How to Publish an Instagram Carousel via API \- Postproxy, [https://postproxy.dev/how-to/publish-instagram-carousel-api/](https://postproxy.dev/how-to/publish-instagram-carousel-api/)  
5. \[source-instagram\] Optimize instagram\_business\_account info request · Issue \#60965 · airbytehq/airbyte \- GitHub, [https://github.com/airbytehq/airbyte/issues/60965](https://github.com/airbytehq/airbyte/issues/60965)  
6. Meta: 15 Tools | MCP Servers \- Claude Code Marketplaces, [https://claudemarketplaces.com/mcp/io.github.mikusnuz/meta](https://claudemarketplaces.com/mcp/io.github.mikusnuz/meta)  
7. Threads Posting API: OAuth Setup & Code Examples \[2026\] \- Zernio, [https://zernio.com/blog/threads-posting-api](https://zernio.com/blog/threads-posting-api)

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,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>