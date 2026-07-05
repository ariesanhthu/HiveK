# 02 — Campaign Wizard UI Layout & Step-by-Step UX

## 0. Mục tiêu UX

UI mới cần biến flow “lên chiến dịch” thành một hành trình có hướng dẫn, thay vì bắt người dùng tự đi nhiều nơi: quản lý chiến dịch, cấu hình, ảnh, Q&A, KOL, lên bài, tracking.

Nguyên tắc:

- Campaign-first trước, post-first sau.
- Một wizard để nhập brief, một planner để review bài.
- Luôn có thanh tiến độ và checklist thiếu dữ liệu.
- Agent tự gợi ý trước, người dùng chỉ cần sửa/duyệt.
- Những tác vụ rủi ro như publish, gửi email, nhắn KOL/KOC luôn cần confirm.

---

## 1. Information architecture đề xuất

```text
/app/campaigns
  ├─ Campaign List
  ├─ Create Campaign Wizard
  ├─ Campaign Detail
  │   ├─ Overview
  │   ├─ Brief
  │   ├─ Media
  │   ├─ Q&A
  │   ├─ Creators / Participants
  │   ├─ Planner
  │   └─ Tracking
  └─ Agent Runs / Audit
```

Điều hướng chính:

- `Quản lý chiến dịch`: xem campaign card, status, KPI, nút “Lên bài tự động”.
- `Tạo chiến dịch`: wizard step-by-step.
- `Lên bài tự động`: timeline + post editor + review panel.
- `Tracking`: KPI dashboard sau khi chạy campaign.

---

## 2. Layout tổng thể: Campaign Wizard

### 2.1. Desktop layout

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Header: Tạo chiến dịch mới                         Save draft  Exit │
├───────────────┬────────────────────────────────────┬────────────────┤
│ Stepper       │ Main Step Form                      │ AI Brief Panel │
│               │                                    │                │
│ 1 Basics      │ [Form fields]                       │ Brief score    │
│ 2 Product     │ [AI suggestion cards]               │ Missing inputs │
│ 3 Audience    │ [Preview chips]                     │ Next actions   │
│ 4 Brand Voice │                                    │                │
│ 5 Platforms   │                                    │                │
│ 6 Trends      │                                    │                │
│ 7 Media/Q&A   │                                    │                │
│ 8 Creators    │                                    │                │
│ 9 Review      │                                    │                │
├───────────────┴────────────────────────────────────┴────────────────┤
│ Footer: Back                                      Next / Generate    │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2. Mobile layout

```text
┌──────────────────────────────┐
│ Header + progress bar         │
├──────────────────────────────┤
│ Current step form              │
├──────────────────────────────┤
│ Collapsible AI Brief Panel     │
├──────────────────────────────┤
│ Sticky bottom actions          │
└──────────────────────────────┘
```

---

## 3. Component inventory

### 3.1. `CampaignWizardShell`

Vai trò:

- Chứa stepper, form, footer action.
- Auto-save draft.
- Gọi `useCampaignWizardState()`.
- Gọi `useHarnessRunMutation()` khi cần AI.

Props:

```ts
type CampaignWizardShellProps = {
  campaignId?: string;
  initialStep?: CampaignWizardStepId;
  mode: "create" | "edit";
};
```

### 3.2. `WizardStepper`

Hiển thị:

- Step number.
- Step name.
- Status: `empty`, `in_progress`, `complete`, `warning`, `blocked`.
- Missing count.

```ts
type WizardStepStatus = "empty" | "in_progress" | "complete" | "warning" | "blocked";
```

### 3.3. `AIBriefPanel`

Panel bên phải, luôn thấy được campaign summary.

Nội dung:

- Brief completeness score.
- Những field đang thiếu.
- Những field AI có thể gợi ý.
- Warning về claim/risk.
- Nút quick action: “AI gợi ý”, “Sửa field này”, “Bỏ qua tạm”.

Layout:

```text
AI Brief Panel
  ├─ Campaign score: 72%
  ├─ Missing required: 2
  ├─ Quality warnings: 4
  ├─ Suggested next action
  └─ Agent notes
```

### 3.4. `AISuggestionCard`

Dùng khi agent gợi ý nội dung.

```text
┌─────────────────────────────┐
│ AI suggestion                │
│ “Đối tượng có thể là...”     │
│ Reason: dựa trên sản phẩm... │
│ [Apply] [Edit] [Dismiss]     │
└─────────────────────────────┘
```

Quy tắc:

- Không auto-apply claim quan trọng.
- Nếu user bấm Apply thì source chuyển thành `ai_suggestion_approved`.

### 3.5. `FieldConfidenceBadge`

Hiển thị nguồn và độ chắc chắn của field.

Ví dụ:

- `User confirmed`
- `AI suggested`
- `From brand memory`
- `Needs proof`

---

## 4. Step layout chi tiết

## Step 1 — Campaign Basics

Mục tiêu UI: người dùng hiểu ngay chiến dịch này để làm gì.

Layout:

```text
[Campaign name]
[Objective cards]
  Awareness | Engagement | Traffic | Leads | Sales | Creator Recruitment
[Date range]
[Budget range]
[Success metric]
```

AI support:

- Nếu user chọn objective, AI gợi ý KPI phù hợp.
- Nếu thiếu ngày, cho phép tạo plan theo `7 ngày mẫu`.
- Nếu budget thấp, AI cảnh báo không nên đề xuất KOL/KOC đắt.

Validation:

- Required: name, objective.
- Warning: thiếu metric, thiếu date.

---

## Step 2 — Product & Offer

Mục tiêu UI: gom tất cả thông tin sản phẩm vào một chỗ.

Layout:

```text
[Product name]
[Product description]
[Category]
[USP chips]
[Offer / Price]
[Mandatory facts]
[Forbidden claims]
[CTA]
[Landing URL]
```

UX detail:

- Có template theo ngành: thời trang, mỹ phẩm, F&B, khóa học, SaaS, dịch vụ.
- Có nút “AI tóm tắt sản phẩm” nếu user paste mô tả dài.
- Có warning riêng cho claim nhạy cảm.

Ví dụ microcopy:

```text
Những điều bắt buộc phải nói
Ví dụ: chất liệu cotton, freeship từ 299k, bảo hành 7 ngày.
```

```text
Những điều không được nói
Ví dụ: không nói “chống nước 100%” nếu sản phẩm chỉ chống thấm nhẹ.
```

---

## Step 3 — Audience & Insight

Mục tiêu UI: giúp người dùng không chỉ nhập “nữ 18–25” mà đi đến insight viết bài.

Layout:

```text
[Target audience description]
[Location]
[Age range]
[Pain point chips]
[Buying trigger chips]
[Objection chips]
[Customer language textarea]
```

AI support:

- Nút “Gợi ý pain point từ sản phẩm”.
- Nút “Chuyển audience thành insight”.
- AI tạo `Audience Insight Preview`.

Preview card:

```text
Người mua đang muốn: ...
Họ ngại: ...
Hook nên đánh vào: ...
CTA nên dùng: ...
```

---

## Step 4 — Brand Voice & Guardrails

Mục tiêu UI: tránh bài viết nghe chung chung hoặc quá AI.

Layout:

```text
[Tone multi-select]
[Communication style]
[Emoji level]
[Words to use]
[Words to avoid]
[Approved example posts]
[Rejected example posts]
```

UI pattern:

- Chọn tone bằng card có ví dụ.
- Bảng 2 cột: “Bài thích” / “Bài không thích”.
- Agent trích rule từ ví dụ.

Output preview:

```text
Brand voice rules
1. Viết như đang tư vấn thật, không quá quảng cáo.
2. Hook nên bắt đầu bằng tình huống cụ thể.
3. Không dùng các cụm: “giải pháp hoàn hảo”, “đừng bỏ lỡ”.
```

---

## Step 5 — Platform Strategy

Mục tiêu UI: cấu hình từng platform trong một màn hình, không viết lặp lại.

Layout:

```text
[Select platforms]
┌ Facebook card ┐
│ Format: caption / album / reel
│ Style: giải thích đầy đủ, có CTA rõ
│ Frequency: ...
└───────────────┘
┌ Instagram card ┐
│ Format: carousel / reels / story
│ Style: visual-first, caption ngắn
└───────────────┘
┌ Threads card ┐
│ Format: thread / short post
│ Style: hội thoại, câu hỏi, first comment
└───────────────┘
```

Platform defaults:

| Platform | Default strategy | Không nên |
|---|---|---|
| Facebook | Caption đầy đủ, album, social proof, CTA rõ | Quá ngắn, thiếu thông tin mua hàng |
| Instagram | Visual-first, carousel/reels, caption ngắn, hashtag tinh gọn | Caption dài như Facebook |
| Threads | Hook hội thoại, quan điểm, câu hỏi, first comment | Viết brochure, quá sales |

---

## Step 6 — Trend Learning

Mục tiêu UI: cho người dùng hướng dẫn agent học trend mà không cần tự phân tích.

Layout:

```text
[Trend mode]
  Safe | Balanced | Aggressive
[What kind of trend?]
  UGC | Review | Storytelling | Meme-lite | Educational | Hot take
[Paste trend examples]
  Link / text / screenshot note
[Competitor examples]
[Creator examples]
[Trends to avoid]
[Generate Trend Playbook]
```

Trend board sau khi agent học:

```text
Trend Playbook
  ├─ Hook patterns
  ├─ Content structures
  ├─ Visual directions
  ├─ CTA patterns
  ├─ Vocabulary to use
  ├─ Risk notes
  └─ Recommended platforms
```

UX rule:

- Agent không nói “copy trend này”.
- Agent phải nói “adapt pattern này cho brand”.
- Mỗi trend có score: `Freshness`, `Brand fit`, `Execution ease`, `Risk`.

---

## Step 7 — Media & Q&A

Mục tiêu UI: gom ảnh và câu trả lời mẫu trước khi viết/schedule.

Layout:

```text
Tabs: Media Library | Q&A Replies

Media Library
  ├─ Upload zone
  ├─ Asset cards
  ├─ Role tag: product/lifestyle/brand/reference
  └─ AI analysis status

Q&A Replies
  ├─ Question
  ├─ Answer
  ├─ Intent
  ├─ Keywords
  └─ Requires human review
```

Media card:

```text
[Image]
Name
Role: product
Aspect ratio: 4:5
Detected: áo, người mẫu, nền trắng
Best for: Instagram carousel, sales post
```

Q&A table:

| Question | Answer | Intent | Auto reply? |
|---|---|---|---|
| Có size M không? | Có, bạn inbox chiều cao/cân nặng để tư vấn size. | size | Draft only |

---

## Step 8 — Creator / KOL-KOC Setup

Mục tiêu UI: giúp user quyết định có cần creator không, nếu có thì match và liên hệ.

Layout:

```text
[Need KOL/KOC? toggle]
[Creator goal]
  Awareness | Review | Sales | Affiliate | Livestream
[Budget]
[Platform]
[Niche]
[Risk tolerance]
[Generate creator suggestions]
```

Creator suggestion card:

```text
Creator name
Match score: 86%
Audience fit: 82%
Style fit: 88%
Risk: Low
Reason: ...
Evidence: ...
[View profile] [Draft message] [Invite]
```

Không gửi thật mặc định:

- Chỉ tạo message draft.
- Có nút copy.
- Có nút mark contacted.
- Nếu có connector thì queue send sau approval.

---

## Step 9 — Final Review & Generate Plan

Mục tiêu UI: người dùng thấy toàn bộ brief trước khi AI generate.

Layout:

```text
Final Review
  ├─ Campaign summary
  ├─ Product facts
  ├─ Audience insight
  ├─ Brand voice rules
  ├─ Platform strategy
  ├─ Trend playbook
  ├─ Media readiness
  ├─ Creator readiness
  └─ Generate plan button
```

CTA chính:

```text
Generate campaign plan
Generate plan + first post drafts
Save brief only
```

---

## 5. Planner layout sau khi generate

### 5.1. Desktop layout

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Campaign Planner Header: Campaign name | Status | Generate more     │
├─────────────────┬──────────────────────────────────┬────────────────┤
│ Timeline         │ Post Editor                       │ Review Panel   │
│ Day 1            │ Hook                              │ Validation     │
│  - FB post       │ Caption                           │ Brand fit      │
│  - IG carousel   │ First comment                     │ Human score    │
│ Day 2            │ Media                             │ Risk notes     │
│  - Threads       │ Reply suggestions                 │ Trend used     │
│                  │                                  │ Actions        │
├─────────────────┴──────────────────────────────────┴────────────────┤
│ Batch actions: Approve selected | Regenerate | Schedule approved    │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2. Timeline panel

Hiển thị theo ngày:

```text
Day 1 — Awareness
  09:00 Facebook · Caption · needs-review
  19:30 Instagram · Carousel · draft
Day 2 — Consideration
  10:00 Threads · Thread · approved
```

Filter:

- Platform.
- Status.
- Funnel stage.
- Risk level.
- Needs media.

### 5.3. Post editor

Tabs:

1. Content
2. Media
3. Review
4. Schedule
5. Comments/Q&A
6. History

Content tab:

```text
[Hook]
[Main content]
[First comment]
[CTA]
[Reply suggestions]
[Regenerate options]
  - Shorter
  - Less salesy
  - More conversational
  - More trend-based
  - More brand-safe
```

Review tab:

```text
Validation
  Brand fit: 86
  Human-likeness: 82
  Factual consistency: 92
  Platform fit: 80
  Sales pressure: 30
  Risk: Green
Issues
  - ...
Suggested revision
  - ...
```

Schedule tab:

- Account selector.
- Date/time picker.
- Checklist: approved, media attached, no red risk, account connected.
- Schedule button disabled nếu thiếu điều kiện.

---

## 6. UI state machine

### Campaign status

```text
draft → briefing → ready_to_generate → generating → reviewing → scheduled → published → archived
```

### Post status

```text
draft → needs-review → approved → scheduled → published
        ↘ rejected
```

### Field status

```text
empty → ai_suggested → user_edited → user_confirmed
```

---

## 7. Error & empty states

### Thiếu input blocking

```text
Chưa thể tạo kế hoạch vì còn thiếu 2 thông tin bắt buộc:
1. Sản phẩm chính của chiến dịch
2. Nền tảng đăng bài
```

CTA:

- “Điền ngay”
- “Để AI gợi ý nháp”

### Thiếu ảnh

```text
Chiến dịch chưa có ảnh phù hợp cho Instagram carousel.
Bạn có thể upload ảnh hoặc để AI tạo prompt ảnh gợi ý.
```

CTA:

- Upload media
- Generate image prompt
- Continue without media

### Trend risk cao

```text
Trend này có thể không phù hợp với brand vì rủi ro tranh cãi cao.
Agent sẽ dùng pattern hook nhẹ hơn thay vì bắt trend trực tiếp.
```

---

## 8. Quick actions giúp user không phải thao tác nhiều

Ở mỗi step có quick action:

- `AI gợi ý từ sản phẩm`
- `AI tóm tắt brief`
- `AI tạo platform strategy`
- `AI học từ bài mẫu`
- `AI tạo Q&A mẫu`
- `AI match ảnh với bài`
- `AI đề xuất KOL/KOC`
- `Regenerate selected posts`
- `Approve all green posts`
- `Schedule approved posts`

Quy tắc batch action:

- Chỉ batch approve post risk `green`.
- Không batch schedule nếu thiếu media/account.
- Không batch send outreach nếu chưa có approval.

---

## 9. Acceptance checklist cho UI

- User tạo campaign mới không phải rời khỏi wizard.
- Mỗi step có input rõ ràng, validation rõ ràng.
- User luôn biết còn thiếu gì để generate.
- Agent có thể gợi ý field còn thiếu nhưng không tự xác nhận claim quan trọng.
- Trend learning có màn hình riêng, không lẫn với post editor.
- Planner có timeline, editor, validation panel trong cùng một layout.
- User có thể review từng bài, chỉnh, approve, schedule.
- KOL/KOC matching và outreach nằm trong campaign context, không phải màn rời.
- Tracking tách khỏi lộ trình đăng bài.
- Mọi publish/send đều có confirm và audit.
