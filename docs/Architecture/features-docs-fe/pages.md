1️⃣ Public pages (không cần login)
2️⃣ Auth & account
3️⃣ Business dashboard
4️⃣ KOL dashboard
5️⃣ Admin
6️⃣ Component / UI system cần xây
7️⃣ Task list cho frontend

---

# 1. PUBLIC WEBSITE (KHÔNG CẦN LOGIN)

## 1.1 Homepage

### Mục tiêu

Trang giới thiệu platform.

### Nội dung

* Hero section
* Giải thích platform
* Call to action
* Top KOL ranking preview
* Featured campaigns

### Task Frontend

**Page**

```
/app/page.tsx
```

**Components**

```
HeroSection
PlatformBenefits
TopKOLPreview
FeaturedCampaigns
CTASection
Footer
```

**API**

GET

```
/api/public/top-kols
/api/public/campaigns
```

---

## 1.2 KOL Ranking Page

### Mục tiêu

Cho người dùng xem bảng xếp hạng KOL.

### URL

```
/ranking/kols
```

### UI

Table

| Rank | Avatar | Name | Niche | Followers | Rating | Badge |

Filter

* Niche
* Platform
* Follower range

### Task

Component

```
KOLRankingTable
RankingFilter
Pagination
```

API

```
GET /api/ranking/kols
```

Query

```
?niche=
&platform=
&page=
```

---

## 1.3 KOL Public Profile

### URL

```
/kol/[id]
```

### Nội dung

Header

```
Avatar
Name
Badge
Rating
Followers
Niche
Platforms
```

Tabs

```
Campaign History
Reviews
Performance Metrics
```

### Components

```
KOLHeader
KOLStats
CampaignHistoryList
ReviewList
PerformanceChart
```

API

```
GET /api/kols/:id
GET /api/kols/:id/campaigns
GET /api/kols/:id/reviews
```

---

# 2. AUTHENTICATION

## 2.1 Register

### URL

```
/auth/register
```

### Role selection

User chọn:

```
Business
KOL
```

### Form

```
email
password
confirm password
role
```

### API

```
POST /api/auth/register
```

---

## 2.2 Login

### URL

```
/auth/login
```

### Form

```
email
password
```

### API

```
POST /api/auth/login
```

Return

```
token
user
role
```

Redirect

```
Business -> /dashboard/business
KOL -> /dashboard/kol
```

---

# 3. BUSINESS DASHBOARD

## 3.1 Business Dashboard Overview

### URL

```
/dashboard/business
```

### UI

Cards

```
Active Campaigns
Total Spend
Average ROI
Total KOL
```

Charts

```
Campaign performance
Conversion trend
```

### Components

```
StatsCards
CampaignPerformanceChart
RecentCampaignList
```

API

```
GET /api/business/dashboard
```

---

# 3.2 Campaign List

### URL

```
/dashboard/business/campaigns
```

### UI

Table

| Campaign | Budget | Status | KOL | Start | End |

### Status

```
Pending
Active
Completed
Failed
```

### Components

```
CampaignTable
CampaignStatusBadge
CampaignFilter
```

API

```
GET /api/business/campaigns
```

---

# 3.3 Create Campaign

### URL

```
/dashboard/business/campaigns/create
```

### Form Fields

```
Campaign name
Product
Budget
Start date
End date

KPI targets:
- Reach
- CTR
- Conversion

KOL requirements:
- Niche
- Platform
- Follower range
```

### Components

```
CampaignForm
KPITargetInput
KOLRequirementSelector
DateRangePicker
```

### API

```
POST /api/campaigns
```

---

# 3.4 Campaign Detail

### URL

```
/dashboard/business/campaigns/[id]
```

### Tabs

```
Overview
Participants
KPI
Reviews
```

### Components

```
CampaignHeader
ParticipantTable
KPIMetrics
ReviewSection
```

API

```
GET /api/campaigns/:id
GET /api/campaigns/:id/participants
GET /api/campaigns/:id/kpi
```

---

# 3.5 Invite KOL

### UI

Button

```
Invite KOL
```

Modal

```
Search KOL
Select
Send invite
```

API

```
POST /api/campaigns/:id/invite
```

---

# 4. KOL DASHBOARD

## 4.1 KOL Dashboard

### URL

```
/dashboard/kol
```

### UI

Cards

```
Active Campaigns
Total Earnings
Rating
Completion Rate
```

Components

```
KOLStats
ActiveCampaignList
```

API

```
GET /api/kol/dashboard
```

---

## 4.2 Browse Campaigns

### URL

```
/dashboard/kol/campaigns
```

### UI

Card list

Campaign card

```
Brand
Budget
Requirements
Apply button
```

Components

```
CampaignCard
CampaignFilter
```

API

```
GET /api/campaigns/open
```

---

## 4.3 Apply Campaign

Button

```
Apply
```

Modal

```
Message
Confirm
```

API

```
POST /api/campaigns/:id/apply
```

---

## 4.4 My Campaigns

### URL

```
/dashboard/kol/my-campaigns
```

Table

| Campaign | Status | KPI | Deadline |

Status

```
Invited
Applied
Accepted
Posting
Completed
```

API

```
GET /api/kol/campaigns
```

---

## 4.5 Submit KPI

### UI

Form

```
Post URL
Views
Clicks
Conversions
Screenshot upload
```

API

```
POST /api/campaigns/:id/submit-metrics
```

---

# 5. REVIEW SYSTEM

## 5.1 Review Business → KOL

Form

```
rating
comment
```

API

```
POST /api/reviews
```

---

## 5.2 Display Reviews

Component

```
ReviewCard
ReviewList
```

API

```
GET /api/reviews?kolId=
```

---

# 6. RANKING SYSTEM

### Ranking Page

```
/ranking/kols
```

UI

```
Top performer
Badge
Score
```

Components

```
RankingTable
Badge
ScoreIndicator
```

API

```
GET /api/ranking
```

---

# 7. GLOBAL UI COMPONENTS

Frontend phải tạo reusable components

```
Button
Input
Modal
Card
Table
Badge
Tabs
Dropdown
Pagination
Chart
Avatar
RatingStars
```

---

# 8. NEXTJS STRUCTURE (RECOMMENDED)

```
app/

(auth)
login
register

(public)
ranking
kol/[id]

(dashboard)

business/
campaigns
create
[id]

kol/
campaigns
my-campaigns

components/

ui/
charts/
campaign/
kol/

lib/

api.ts
auth.ts
```

---

# 9. FRONTEND TECH STACK

Next.js

```
NextJS 14
App Router
TypeScript
```

UI

```
Tailwind
Shadcn UI
```

State

```
React Query / Tanstack Query
```

Charts

```
Recharts
```

Auth

```
JWT / NextAuth
```

---

# 10. TASK BREAKDOWN CHO FRONTEND TEAM

### Phase 1 (MVP)

Task

```
Auth pages
Business create campaign
KOL apply campaign
Campaign list
Manual KPI submission
Basic ranking
```

---

### Phase 2

```
Matching system UI
Auto KPI tracking UI
Advanced ranking
Analytics dashboard
```

---

### Phase 3

```
AI recommendation UI
Fraud detection alerts
Advanced ROI analytics
```
