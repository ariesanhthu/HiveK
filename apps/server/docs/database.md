## 1. Nhóm Quản trị hệ thống (System & RBAC)

### Collection: `roles`

Quản lý quyền hạn và các gói dịch vụ (Subscription).

```json
{
  "_id": "ObjectId",
  "name": "string", // Ví dụ: "KOL_Free", "Business_Premium"
  "permissions": ["string"], // Danh sách mã quyền: ["view_kpi", "use_ai_matching"]
  "description": "string",
  "created_at": "ISODate"
}

```

### Collection: `platforms`

Danh mục các mạng xã hội hỗ trợ, tránh hard-code trong code.

```json
{
  "_id": "ObjectId",
  "name": "string", // Ví dụ: "TikTok", "Facebook", "Instagram"
  "base_url": "string",
  "api_status": "string", // "stable", "maintenance"
  "icon_url": "string"
}

```

---

## 2. Nhóm Người dùng (Accounts)

### Collection: `users`

Tài khoản đăng nhập của hệ thống.

```json
{
  "_id": "ObjectId",
  "email": "string",
  "password_hash": "string",
  "role_id": "ObjectId", // Tham chiếu tới Collection Roles
  "profile_id": "ObjectId", // Link tới Brand_Profiles hoặc Influencers tùy theo Role
  "created_at": "ISODate",
  "updated_at": "ISODate"
}

```

### Collection: `notifications`

```json
{
  "_id": "ObjectId",
  "recipient_id": "ObjectId", // Ref Users
  "sender_id": "ObjectId", // Ref Users hoặc SystemID
  "type": "string", // "CAMPAIGN_INVITE", "KPI_ALERT"
  "title": "string",
  "content": "string",
  "is_read": "boolean",
  "link_action": "string", // URL điều hướng khi click
  "created_at": "ISODate"
}

```

---

## 3. Nhóm Influencer & AI (Influencer Data)

### Collection: `influencers`

Chứa dữ liệu định danh hệ thống và kết quả từ AI Node/Gathering Node.

```json
{
  "_id": "ObjectId",
  "name": "string",
  "location": "string",
  "gender": "string",
  "bio": "string",
  "contact": { "email": "string", "phone": "string" },
  "platforms": [
    {
      "platform_id": "ObjectId", // Ref Platforms
      "handle": "string", // Ví dụ: @nguyenvana
      "external_id": "string", // ID của nền tảng (TikTok ID, FB ID)
      "follower_count": "number",
      "avg_engagement": "number",
      "top_tags": ["string"],
      "categories": ["string"],
    }
  ],
  "ai_metadata": {
    "embedding_vector": ["number"], // Vector phục vụ AI Matching
    "public_score": "number", // Thang điểm 0-100
    "sentiment_rank": "number", // Chỉ số tích cực 0-1
    "last_calculation": "ISODate"
  },
  "is_verified": "boolean"
}

```

---

## 4. Nhóm Doanh nghiệp & Chiến dịch (Business & Execution)

### Collection: `products`

```json
{
  "_id": "ObjectId",
  "owner_id": "ObjectId", // Ref Users (Business)
  "name": "string",
  "categories": ["string"],
  "features": {
    "description": "string",
    "target_audience": ["string"],
    "price_range": "string"
  },
  "media": ["string"], // Danh sách URL ảnh sản phẩm
  "is_deleted": "boolean"
}

```

### Collection: `campaigns`

```json
{
  "_id": "ObjectId",
  "business_id": "ObjectId", // Ref Users (Business)
  "product_id": "ObjectId", // Ref Products
  "title": "string",
  "description": "string",
  "status": "string", // "planning", "active", "completed"
  "start_date": "ISODate",
  "end_date": "ISODate",
  "created_at": "ISODate"
}

```

### Collection: `campaign_participants`

Quản lý thực thi và mục tiêu riêng biệt cho từng KOL.

```json
{
  "_id": "ObjectId",
  "campaign_id": "ObjectId", // Ref Campaigns
  "kol_id": "ObjectId", // Ref Influencers
  "platform_id": "ObjectId", // Ref Platforms
  "post_url": "string", // Link bài đăng cụ thể để track
  "status": "string", // "invited", "joined", "completed"
  "targets": {
    "views": "number",
    "engagement_rate": "number",
    "deadline": "ISODate"
  },
  "added_at": "ISODate"
}

```

---

## 5. Nhóm Dữ liệu Hiệu suất (Analytics)

### Collection: `kpi_logs`

*Lưu ý: Nên cấu hình là Time-series Collection để tối ưu dung lượng.*

```json
{
  "timestamp": "ISODate",
  "participant_id": "ObjectId", // Ref Campaign_Participants
  "metrics": {
    "views": "number",
    "likes": "number",
    "comments": "number",
    "shares": "number"
  }
}

```