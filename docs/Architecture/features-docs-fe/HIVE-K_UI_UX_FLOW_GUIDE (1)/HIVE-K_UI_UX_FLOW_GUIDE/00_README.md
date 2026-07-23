# HIVE-K — Guide thiết kế UI/UX Flow

## 1. Phạm vi

Bộ tài liệu này hướng dẫn thiết kế **kiến trúc thông tin, luồng trải nghiệm, trạng thái màn hình và hành vi tương tác** cho website HIVE-K.

Không định nghĩa lại:

- màu sắc;
- font;
- hệ lưới;
- bo góc;
- shadow;
- icon style;
- visual language;
- design token.

Các phần trên sử dụng style UI/UX chung đã có của sản phẩm.

## 2. Mục tiêu trải nghiệm

HIVE-K không được tạo cảm giác như một chatbot yêu cầu người dùng tự viết prompt dài. Trải nghiệm chính phải giúp người dùng:

1. Kết nối dữ liệu sẵn có.
2. Theo dõi HIVE-K tự xử lý dữ liệu.
3. Kiểm tra những gì hệ thống đã hiểu.
4. Chỉ bổ sung dữ liệu thực sự còn thiếu.
5. Tạo kế hoạch nội dung có cấu trúc.
6. Tạo, chỉnh sửa, kiểm tra và duyệt bài.
7. Lên lịch đăng trên đúng tài khoản.
8. Theo dõi hiệu quả và kiểm soát những gì hệ thống học được.

## 3. Nguyên tắc bắt buộc

- Không tạo wizard dài nếu dữ liệu có thể tự đọc từ nguồn kết nối.
- Mỗi lần chỉ yêu cầu người dùng xử lý tối đa 3–5 vấn đề quan trọng.
- Mọi dữ kiện quan trọng phải xem được nguồn.
- Không tự đăng hoặc gửi tin nếu chưa có bước duyệt phù hợp.
- Mọi tiến trình dài phải có trạng thái, tiến độ và khả năng tiếp tục sau lỗi.
- Người dùng phải hiểu rõ: hệ thống đang làm gì, đang chờ gì và cần họ làm gì.
- Không hiển thị thuật ngữ kỹ thuật như graph state, embedding, Temporal hoặc model routing trên giao diện người dùng thông thường.

## 4. Cấu trúc tài liệu

| File                                       | Nội dung                                               |
| ------------------------------------------ | ------------------------------------------------------ |
| `01_INFORMATION_ARCHITECTURE.md`           | Điều hướng, sitemap và phân nhóm chức năng             |
| `02_GLOBAL_UX_MODEL.md`                    | Mô hình trạng thái, nguyên tắc tương tác toàn hệ thống |
| `03_WORKSPACE_ONBOARDING.md`               | Tạo workspace và khởi động thiết lập                   |
| `04_CONNECT_SOURCES_AND_SETUP_PROGRESS.md` | Kết nối nguồn và theo dõi xử lý                        |
| `05_BRAND_SNAPSHOT_AND_READINESS.md`       | Duyệt bản chụp thương hiệu và mức sẵn sàng             |
| `06_KNOWLEDGE_CENTER.md`                   | Tri thức, nguồn, thiếu dữ liệu và mâu thuẫn            |
| `07_HOME_DASHBOARD_AND_AGENT_RUNS.md`      | Trang chủ và tiến trình AI                             |
| `08_CONTENT_PLAN_AND_CALENDAR.md`          | Lập kế hoạch nội dung và lịch                          |
| `09_CONTENT_GENERATION_EDITOR.md`          | Tạo bài, chỉnh sửa, kiểm tra                           |
| `10_REVIEW_APPROVAL_PUBLISH.md`            | Duyệt, lên lịch, đăng và xử lý lỗi                     |
| `11_ANALYTICS_TRENDS_LEARNING.md`          | Phân tích, xu hướng và học phong cách                  |
| `12_ACCOUNTS_TEAM_PERMISSIONS.md`          | Tài khoản, vai trò kênh, thành viên và quyền           |
| `13_SHARED_STATES_COMPONENTS.md`           | Trạng thái dùng chung và component hành vi             |
| `14_UX_COPY_AND_NOTIFICATIONS.md`          | Quy tắc nội dung giao diện và thông báo                |
| `15_ROUTE_SCREEN_EVENT_MAP.md`             | Route, object dữ liệu và sự kiện hệ thống              |
| `16_MVP_AND_ACCEPTANCE.md`                 | Phạm vi MVP và tiêu chí nghiệm thu                     |
| `17_DESIGN_HANDOFF_PROMPT.md`              | Brief giao cho UI/UX Designer hoặc design agent        |

## 5. Đối tượng người dùng chính

### Chủ workspace

- Thiết lập nguồn dữ liệu.
- Quản lý tài khoản mạng xã hội.
- Duyệt dữ kiện và nội dung.
- Quản lý thành viên, quyền và chi phí.

### Quản lý nội dung

- Tạo kế hoạch.
- Điều phối lịch.
- Duyệt nội dung.
- Theo dõi hiệu quả.

### Người viết nội dung

- Tạo và chỉnh sửa bài.
- Xử lý cảnh báo nội dung.
- Gửi bài sang bước duyệt.

### Người duyệt

- Xác nhận dữ kiện.
- Duyệt hoặc từ chối nội dung.
- Duyệt trước khi đăng.

## 6. Nguồn yêu cầu

Guide được tổng hợp từ các tài liệu kiến trúc HIVE-K:

- `00_README_MASTER_BLUEPRINT(1).md`
- `01_RUNTIME_ORCHESTRATION_GUIDE_PROMPT(1).md`
- `02_ONBOARDING_CONNECTORS_KNOWLEDGE_GRAPH_GUIDE_PROMPT(1).md`
- `03_CONTENT_TREND_LEARNING_GUIDE_PROMPT(1).md`
- `04_IMPLEMENTATION_EVAL_SECURITY_GUIDE_PROMPT(1).md`
