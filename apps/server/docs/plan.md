
# HIVEKOC SYSTEM ARCHITECTURE

## 1. TÍNH NĂNG CHÍNH (KEY FEATURES)

Hệ thống được thiết kế để giải quyết bài toán kết nối và quản lý chiến dịch Marketing giữa Doanh nghiệp và KOL/KOC.

### A. Nhóm tính năng cho Doanh nghiệp (Enterprise)

* **AI Smart Matching:** Tìm kiếm và gợi ý KOL/KOC phù hợp nhất với sản phẩm dựa trên Feature Matching (Vector Search).
* **Quản lý Chiến dịch (Campaign Management):** Tạo chiến dịch, quản lý danh sách sản phẩm và theo dõi tiến độ thực hiện của từng KOL tham gia.
* **KPI Tracking:** Tự động hóa việc theo dõi các chỉ số tương tác (Views, Likes, Comments, Shares) từ các đường link bài đăng cụ thể.
* **Hệ thống Điểm Tín nhiệm (Public Scoring):** Đánh giá KOL dựa trên biến động drama, tin tức mạng xã hội và lịch sử hoàn thành công việc.

### B. Nhóm tính năng cho KOL/KOC

* **Quản lý Profile:** Liên kết các tài khoản mạng xã hội (TikTok, FB, Instagram) để hiển thị dữ liệu năng lực.
* **Theo dõi Hiệu suất:** Tự theo dõi tăng trưởng các chỉ số cá nhân và tiến độ hoàn thành các KPI đã cam kết với nhãn hàng.
* **Cơ hội kết nối:** Tiếp cận các chiến dịch từ doanh nghiệp và quản lý lời mời tham gia.

### C. Nhóm tính năng hệ thống (System & Guest)

* **Data Pipeline:** Tự động cào và cập nhật dữ liệu từ các nền tảng mạng xã hội lớn.
* **Hệ thống Phân quyền (RBAC):** Quản lý quyền hạn theo gói đăng ký (Subscription Models).
* **Bảng xếp hạng (Leaderboard):** Công khai thứ hạng KOL theo mức độ uy tín và tương tác (Dành cho khách quan sát).

---

## 2. THIẾT KẾ DATABASE (MONGODB SCHEMA)

Hệ thống sử dụng MongoDB để tận dụng tính linh hoạt của Schema và hỗ trợ Vector Search cho AI.

### A. Quản trị & Nền tảng

* **Roles:** Lưu trữ danh sách quyền (`permissions`) theo từng gói người dùng.
* **Platforms:** Định nghĩa các nền tảng mạng xã hội hỗ trợ (TikTok, Facebook, Instagram...).
* **Notifications:** Lưu trữ thông báo đẩy cho người dùng.

### B. Thực thể Chính (Core Entities)

* **Users:** Tài khoản đăng nhập, tham chiếu đến `Roles` và `Profiles`.
* **Products:** Kho sản phẩm của doanh nghiệp, lưu trữ đặc điểm (features) để AI matching.
* **Influencers:** "Trái tim" của dữ liệu. Lưu thông tin cá nhân, chỉ số các nền tảng (`platforms[]`) và dữ liệu AI (`embedding_vector`, `public_score`).

### C. Quản lý Chiến dịch & KPI

* **Campaigns:** Thông tin chung về chiến dịch và chủ sở hữu.
* **Campaign_Participants:** Bảng trung gian quan trọng nhất. Lưu link bài đăng cần track (`post_url`), KPI mục tiêu riêng cho từng KOL và trạng thái thực hiện.
* **KPI_Logs:** (Time-series) Lưu trữ lịch sử biến động chỉ số tương tác theo thời gian của từng bài đăng.

---

## 3. CÁC THÀNH PHẦN NODE

| Node | Trách nhiệm chính |
| --- | --- |
| **Main Node** (Node.js) | Xử lý API cho Client, Quản lý User/Role, CRUD Chiến dịch & Sản phẩm. |
| **Data Gathering** (Python) | Chạy Worker cào dữ liệu KOL định kỳ và Tracking KPI từ `Campaign_Participants`. |
| **AI Node** (Python) | Xử lý Matching (Vector Search), tính toán điểm `Public Score` dựa trên Sentiment Analysis. |

