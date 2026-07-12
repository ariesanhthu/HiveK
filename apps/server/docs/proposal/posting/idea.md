Here is a concise, production-ready **System Architecture Specification** for your Facebook automation feature.

---

# System Specification: Facebook Automation Module

## 1. Overview

This module handles **Automated Post Scheduling** and **Instant Auto-Reply for Comments/Inbox** using an Event-Driven Architecture (EDA). It is designed to be multi-tenant (scalable for many businesses) and highly resilient against traffic spikes.

---

## 2. System Architecture & Data Flow

```
[Facebook Platform]
     │ (1) Webhook Event (New Comment/Inbox)
     ▼
[Webhook Receiver Service] ──(2) Fast 200 OK ──► [Facebook Platform]
     │
     │ (3) Push Event Message
     ▼
[Message Queue (RabbitMQ)]
     │
     │ (4) Consume Message
     ▼
[Worker Service] ──(5) Check Cache ──► [Redis (Idempotency / Rate Limit)]
     │
     │ (6) Fetch Context & Scripts
     ▼
[Database (PostgreSQL/MongoDB)] 
     │
     │ (7) Call Graph API (Send Reply)
     ▼
[Facebook Platform]

```

### High-Level Flow Breakdown:

1. **Asynchronous Processing:** No heavy logic is processed inside the HTTP request. Every event is instantly queued.
2. **Decoupled Roles:** The `Receiver Service` only accepts data; the `Worker Service` executes the business logic.

---

## 3. Core Component Specifications

### A. Token Lifecycle Management

* **Objective:** Securely store and use Facebook Page Access Tokens.
* **Flow:** 1. User logs in via Facebook OAuth $\rightarrow$ System gets *Short-Lived User Token*.
2. Exchange for *Long-Lived User Token* (valid for 60 days).
3. Exchange for **Permanent Page Access Token** (never expires unless password changes).
* **Security:** All tokens must be encrypted in the Database using **AES-256** before saving.

### B. Feature 1: Post Scheduler (Lên lịch đăng bài)

* **Storage-First Approach:** Do not push far-future posts directly into the Queue (prevents RAM bloat).
* **Workflow:**
1. **Database:** Save the post content, media, and target `scheduled_time`.
2. **Cron Job / Poller:** Runs every 1 minute. It queries the DB for posts where `scheduled_time <= NOW()` and `status == PENDING`.
3. **Queue:** The Poller pushes these ready-to-publish post IDs into the `post-publishing-queue`.
4. **Worker:** Consumes the message, pulls the decrypted token, and calls the Meta Graph API to publish.



### C. Feature 2: Auto-Reply Comment & Inbox (Webhook)

To prevent crashes and Meta API bans, the Webhook processing pipeline implements three specific guardrails:

#### 1. Infinite Loop Prevention (Lọc ID)

* **Rule:** Before trigger execution, check the `from.id` (sender ID) in the webhook JSON payload.
* **Action:** If `from.id == YOUR_FACEBOOK_PAGE_ID`, instantly **drop the event**. Do not queue it.

#### 2. Idempotency Guardrail (Chống trùng lặp tin nhắn)

* **Problem:** Meta retries webhooks if your server responds slightly late, causing duplicate replies to the same comment.
* **Solution:** * Use **Redis** as a deduplication cache.
* Key: `fb_event:{comment_id}` (Expires in 5 minutes).
* **Flow:** When a Worker picks up a message, it performs an atomic `SETNX` operation in Redis. If the key already exists, the event is skipped.



#### 3. Outbound Rate Limiting (Chống Spam API)

* **Problem:** Spamming Meta API calls triggers temporary application bans.
* **Solution:** Use a **Token Bucket / Leaky Bucket** pattern managed via Redis. Track request rates per `Page_ID`. If a page approaches its limit, the worker delays execution (re-queues the message with a minor lag) instead of throwing an error.

---

## 4. Message Queue (RabbitMQ) Design

| Queue Name | Source | Purpose | Priority / Settings |
| --- | --- | --- | --- |
| `post-publishing-queue` | Cron Poller | Holds posts ready to be published | Low-to-Medium |
| `comment-webhook-queue` | Webhook Receiver | Holds raw comment events for text/AI processing | High |
| `inbox-webhook-queue` | Webhook Receiver | Holds raw Messenger inbox events | Critical |
| `dlx-failed-queue` | Dead Letter Exchange | Holds failed tasks (e.g., Expired tokens, Meta API downtime) | For Debugging/Alerts |

---

## 5. Technology Stack Recommendation

* **Webhook Receiver:** Fast HTTP Framework (Node.js/FastAPI/Go).
* **Queue:** RabbitMQ (standard AMQP) or BullMQ (Redis-based, excellent for simple Node.js setups).
* **Cache/Rate Limiting:** Redis.
* **Workers:** Node.js (NestJS) / Python / Go.

i have draft an idea in proposal/posting/idea.md. The new feature is scheduling posting and open webhook for new comment and auto reply. Currently we will
  digest all in one server. the makedown is just a high level idea (not specific to this server convention). help me read and ask me questions until everything
  clear. until there are no question, create a proposal/posting/plan.md