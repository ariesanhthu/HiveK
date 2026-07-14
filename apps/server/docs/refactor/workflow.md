# **WORKFLOW SPECIFICATION: HIVE-K PLATFORM**

## **1. Core Platform Entities & Core Concepts**

* **User:** Individual accounts authenticated via Local Credentials or Google OAuth. Must pass OTP validation to activate.  
* **Enterprise:** A bounded corporate workspace. Requires an active subscription tier to initialize. It encapsulates an **AI Knowledge Base** (vector embeddings of corporate assets used to feed prompt contexts).  
* **RBAC (Role-Based Access Control) Within Enterprise:**  
  * **Owner:** The user who initialized the enterprise. Holds absolute structural mutations, subscription controls, billing administration, and credit provisioning.  
  * **Sub-owner:** Invited operational users. Authorized to bind social media channels, configure schedules, trigger AI generation, and manage active posting queues.  
  * **User:** normal collaborators
* **Campaign:** A logical domain grouping used to bucket multiple posts belonging to a singular marketing drive. Enforces subscription boundary quotas (e.g., maximum posts per campaign).  
* **Post:** The core transactional engine representing multi-channel automated scheduling, media publishing, KPI tracking, and interactive comment loops.

## **2. Authentication Flow**

### **Step 1: Registration (Ingress)**

1. User registers via **Local Identity Providers** (Email/Password) or **Google OAuth2**.  
2. System initializes a temporary user record with isVerified: false.  
3. System triggers an asynchronous transaction to dispatch a 6-digit cryptographic **OTP** to the user's validated email address.

### **Step 2: Activation Gatekeeper**

1. Upon logging in, a global NestJS Guard intercepts the execution context.  
2. If isVerified === false, the router forces a strict redirect to the /verify-otp channel, locking access to internal system dashboard sub-modules.  
3. Successful OTP submission mutates the user profile state to isVerified: true, clearing the interceptor gate.

## **3. Subscription & Billing Lifecycle Engineering**

### **Flow A: Registration & Tier Selection**

1. **Selection:** Validated User selects a tier package mapping their operational requirements (e.g., Creator, Pro, Business). Custom enterprise limits map to specific pricing brackets.  
2. **Custom / Agency Bracket:** If selecting the "Agency" package, the UI bypasses automated checkouts, routing an aggregated payload form to corporate CRM handlers for manual invoicing.  
3. **Checkout Execution:** Standard subscriptions process payment via gateway webhooks. Upon success, the system creates a Subscription record mapping maxEnterprises, maxUsersPerEnterprise, and aiCredits quotas.

### **Flow B: Upgrade & Downgrade (Prorated Ledger Calculation)**

To ensure zero financial leaks when a user shifts tiers mid-cycle, the billing engine computes delta financial attributes using a time-weighted prorated model.  
Let:

* $P_{\text{old}}$ = Price of current tier  
* $P_{\text{new}}$ = Price of target tier  
* $D_{\text{total}}$ = Total days in current billing cycle (e.g., 30 days)  
* $D_{\text{used}}$ = Days elapsed from cycle start to mutation timestamp

The Remaining Credit ($C_{\text{remaining}}$) from the current package is defined as:

$$
C_{\text{remaining}} = P_{\text{old}} \times \left(1 - \frac{D_{\text{used}}}{D_{\text{total}}}\right)
$$

The Cost of the New Tier for the rest of the cycle ($Cost_{\text{new}}$) is:

$$
Cost_{\text{new}} = P_{\text{new}} \times \left(1 - \frac{D_{\text{used}}}{D_{\text{total}}}\right)
$$

The Final Financial Settlement Adjustments ($\Delta_{\text{Settlement}}$) is computed as:

$$
\Delta_{\text{Settlement}} = Cost_{\text{new}} - C_{\text{remaining}}
$$

* **If $\Delta_{\text{Settlement}} > 0$ (Upgrade):** The system charges the owner the exact delta amount immediately. Quotas adapt instantaneously.  
* **If $\Delta_{\text{Settlement}} < 0$ (Downgrade):** The system processes a partial refund credit back to the billing account ledger or offsets the subsequent billing invoice amount.

### **Flow C: Expiration & Data Retention Constraints (The Frozen Phase)**

1. **Auto-Renew Path:** If autoRenew: true, the system executes automated card processing exactly 24 hours prior to expiration date ($T_{\text{exp}}$).  
2. **Manual Renew Path Notification:** If autoRenew: false, a background Cron worker dispatches an email notification alert at exactly $T_{\text{exp}} - 7\text{ days}$.  
3. **Subscription Failure Loop (Frozen State):**  
   * If payment fails at $T_{\text{exp}}$, the Subscription status mutates to FROZEN.  
   * All corresponding Enterprise profiles connected to this subscription switch to a read-only state. Users can view analytical history dashboards but all AI generation, automated posting queues, and webhook listeners are paused.  
   * **Hard Eviction Timeout:** A delayed structural event is queued for $T_{\text{exp}} + 3\text{ days}$. If no renewal transaction occurs within this 72-hour grace window, a hard-delete database eviction pipeline completely purges all data rows associated with the frozen workspace.

### **Flow D: AI Credit Provisioning**

1. **Validation Gate:** Only the Workspace **Owner** is authorized to process transactions for extra AI resources. The parent subscription profile must possess an ACTIVE status state.  
2. **Isolation Guarantee:** Purchased credits are bound strictly to a target Enterprise database document instance.  
3. **No Transfer Rule:** Credits cannot be transferred across distinct Enterprise clusters, preventing multi-workspace resource draining bugs.

## **4. Enterprise & Social Data Operations**

### **Flow A: Workspace Provisioning**

1. **Quota Check:** The system verifies that the current workspace creation volume counter is less than the subscription tier allowance parameter.  
2. **Metadata Ingest:** The user inputs basic profile properties (Corporate Name, Industry Domain, Localization Configuration).  
3. **Initialization:** The database persists the new record and increments the active tracking counter.

### **Flow B: AI Knowledge Base Contextualization Pipeline**

To feed the AI Content Generator with brand-accurate contexts, the user constructs a local Knowledge Base:

```
User Input Assets (PDF, DOCX, Sites) ──► File Parser & Chunking Engine  
                                                     │  
                                                     ▼  
Vector Database ◄── Embedding Pipeline ◄── Text Splitting (Max Input Limit)
```

1. **Asset Ingress:** Sub-owners upload corporate document assets (PDF, DOCX, Cloud Storage Directories) or register targeted public root asset paths (Websites, Brand Pages).  
2. **Data Sanitization & Limits:** The NestJS upload service intercepts files and screens data payloads against configured size boundaries. Documents are parsed, split into text chunks, and processed through an vectorization engine to produce semantic array embeddings.  
3. **Synthesis Engine:** The processed data creates a centralized digital brand asset file containing explicit brand details, vocabulary instructions, and contextual guidelines. This context is automatically injected into the FastAPI AI worker during prompt generation loops.

### **Flow C: Social Media Node Architecture Linkage**

1. **OAuth Handshake Initiator:** A Sub-owner selects a target ecosystem channel to attach (e.g., Facebook, TikTok, YouTube).  
2. **Authorization Ingress:** The browser triggers a redirect to the platform login context, requesting operational permissions (e.g., publish_video, pages_manage_posts, read_insights).  
3. **Node Selection & Binding:** Upon successful token receipt, the callback routine queries the platform api to pull accessible sub-properties. The user checks which specific corporate entity assets (e.g., Facebook Pages, TikTok Brand Profiles) they wish to actively mount into the platform context workspace database collection.

## **5. Post Management & Automated Engagement Logic (The Pivot)**

This new workflow block expands on your latest MVP requirements (scheduling, content generation, and automated interactive comment loops).

### **Flow A: Post Scheduling & Delayed Ingestion Lifecycle**

1. **Content Draft Generation:** The user initiates post creation. They can invoke the **AI Generation Assistant**, which reads context fragments from the **AI Knowledge Base Module** to output platform-optimized text copy and image suggestions.  
2. **Scheduling Action:** The user binds the draft post asset metadata model, selects destination connected platform nodes, and assigns a specific scheduling timestamp ($T_{\text{post}}$).  
3. **Broker Persistence Engine:** \* NestJS creates a post document with state status: "scheduled".  
   * It computes the epoch delta delay: $\Delta_{\text{delay}} = T_{\text{post}} - \text{CurrentTime}$.  
   * It fires a transaction message task carrying the target Post ID into the RabbitMQ Delayed Exchange, tagged with x-delay: $\Delta_{\text{delay}}$.  
4. **Execution Delivery Handshake:** Exactly at $T_{\text{post}}$, RabbitMQ pushes the message down to the Publishing Worker. The worker pulls the asset payloads, interacts with destination Graph APIs, transforms state properties to status: "published", and logs structural API tracker tracking reference IDs.

### **Flow B: High-Throughput Automated Webhook Conversation Pipeline**

To process auto-comments and direct messaging replies without crashing during high-volume viral engagement spikes, the system employs an asynchronous queue routing pattern:
```
Platform Webhook Spike  ──► NestJS Ingress Receiver   
                              │ (Fast Ack - 200 OK)  
                              ▼  
                        RabbitMQ Buffer Queue  
                              │  
                              ▼ (Worker Consumer Loops)  
                       AI Evaluation Worker ──► Target Graph API Reply Action
```
1. **Ingress Webhook Handling:** When a consumer leaves a comment or sends a direct message to a linked brand page, the social media network emits a real-time event packet back to our NestJS endpoints.  
2. **Buffering & Fast Acknowledgement:** To avoid connection timeout penalties from platform webhooks, NestJS skips heavy synchronous database operations. It validates the basic request signature, wraps the raw webhook body into an internal queue payload format, pushes it instantly into the incoming_engagement_queue broker, and issues an immediate HTTP 200 OK handshake response back to the platform network.  
3. **Asynchronous Processing Loop:** An active worker consumes events from the queue one at a time:  
   * It checks if the target post or page configuration has automated engagement rules turned on.  
   * It runs keyword pattern matching or executes an AI-driven text evaluation pass to generate an appropriate response.  
4. **Action Dispatch:** The worker makes a direct outward API call back to the social media network to post the auto-comment reply or fire the private direct message payload. It then updates the local historical transaction logs inside the MongoDB collection.