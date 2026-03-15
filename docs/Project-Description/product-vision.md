# **Mục tiêu sản phẩm**

Xây dựng một nền tảng trung gian kết nối:

* Doanh nghiệp / Agency (Business) \-\> quản lý  
* Người đại diện tiếp thị (KOL/KOC) \-\> tìm kiếm cơ hội nghề nghiệp  
* Người dùng phổ thông \-\> minh bạch sản phẩm, xác minh độ tin cậy của người đại diện

**Lợi ích:**

* Tự động tìm kiếm KOL/KOC phù hợp  
* Quản lý và đo lường hiệu suất chiến dịch  
* Xây dựng hệ thống xếp hạng minh bạch  
* Tăng cơ hội cho KOL/KOC nhỏ (micro-influencer)

# **Điểm khác biệt so với marketplace truyền thống**

* Không chỉ listing KOL  
* Có hệ thống scoring và KPI tracking  
* Có bảng xếp hạng minh bạch  
* Tập trung hỗ trợ micro-influencer

—  
**MÔ TẢ CHI TIẾT:**

|  Business / Agency | KOL / KOC  |  Người dùng phổ thông (KHÔNG CẦN TÀI KHOẢN) |
| :---- | :---- | :---- |
| Vai trò: Tạo chiến dịch quảng bá sản phẩm. Mục tiêu: Tìm KOL/KOC phù hợp Theo dõi hiệu suất Tối ưu chi phí marketing | **Vai trò: Người đại diện sản phẩm.** Mục tiêu: Tìm thương hiệu hợp tác Xây dựng uy tín Tăng thu nhập | Theo dõi bảng xếp hạng Đánh giá KOL/KOC Xác minh tính minh bạch quảng cáo |

## 

# **Functional Components**

## **4.1 Campaign Management Module**

| Business | System |
| :---- | :---- |
| Tạo chiến dịch: Tên chiến dịch Sản phẩm Ngân sách Thời gian KPI mục tiêu (reach, conversion, CTR,...) Yêu cầu KOL (niche, follower range, platform,...) | Lưu campaign Cho phép attach nhiều KOL vào 1 campaign Tracking status: Pending Accepted Posting Completed Failed |

## **4.2 Matching Engine**

Mục tiêu: Tự động tìm KOL phù hợp.

Matching dựa trên:

* Niche  
* Follower range  
* Engagement rate  
* Conversion rate lịch sử  
* Rating  
* Ngân sách

**Có thể chia thành 2 phase:**

**Phase 1: Rule-based filtering**  
**Phase 2: Scoring algorithm**

Output: Danh sách KOL được xếp hạng theo độ phù hợp

---

## **4.3 KPI Tracking System**

Theo dõi:

* Ngày đăng bài  
* Lượt xem  
* Lượt tương tác  
* Click  
* Conversion  
* Chi phí / hiệu quả

Nguồn dữ liệu:

* API mạng xã hội (nếu có)  
* Manual submission \+ verify  
* Tracking link (UTM, short link)

---

## **4.4 Reputation & Rating System**

Xếp hạng KOL dựa trên:

1. Tỷ lệ hoàn thành campaign  
2. Đạt KPI hay không  
3. Đánh giá từ doanh nghiệp  
4. Phản hồi từ người dùng  
5. Tính minh bạch nội dung quảng cáo

Tạo:

* Score tổng  
* Badge (Verified, Top Performer, Micro Rising,...)  
* Ranking bảng xếp hạng

---

## **4.5 KOL Application System**

KOL có thể:

* Tạo hồ sơ:  
  * CV  
  * Portfolio  
  * Nền tảng đang hoạt động  
  * Số follower  
  * Niche  
* Chủ động apply campaign

---

## **4.6 Public Transparency Dashboard**

Dành cho người dùng phổ thông:

* Xem bảng xếp hạng KOL  
* Xem bảng xếp hạng doanh nghiệp  
* Xem chứng chỉ xác minh minh bạch  
* Đánh giá KOL

# 

# **Luồng nghiệp vụ chính**

## **Flow 1: Business tạo chiến dịch**

1. Business tạo campaign  
2. Hệ thống suggest KOL  
3. Business gửi lời mời  
4. KOL accept  
5. KOL đăng bài  
6. Hệ thống theo dõi KPI  
7. Campaign hoàn thành  
8. Đánh giá hai chiều

---

## **Flow 2: KOL chủ động tìm campaign**

1. KOL đăng nhập  
2. Xem danh sách campaign mở  
3. Apply  
4. Business xét duyệt  
5. Thực hiện chiến dịch

---

## **Flow 3: Người dùng xác minh**

1. Truy cập trang KOL  
2. Xem lịch sử campaign  
3. Xem rating  
4. Xem chứng nhận minh bạch

# 

# **Thành phần hệ thống (Technical Modules)**

## **1\. Authentication & Authorization**

**Role-based:** 

- Admin  
- Business  
- KOL/KOC

## **2\. Core Entities (Domain Model)**

| Model | Field |
| :---- | :---- |
| User | id role profile |
| Campaign | id businessId budget startDate endDate kpiTargets status |
| CampaignParticipant  | campaignId kolId status metrics |
| KOLProfile | userId niche followerCount engagementRate ratingScore  |
| Review | fromUserId toUserId rating comment |

# 

# **Giai đoạn phát triển (MVP → Full System)**

| MVP | Đăng ký role Tạo campaign Apply campaign Manual KPI update Basic rating |
| :---- | :---- |
| **Phase 2** | Matching engine tự động KPI tracking tự động Ranking algorithm |
| **Phase 3** | AI recommendation Fraud detection Phân tích ROI nâng cao |

