# 17 — Brief giao cho UI/UX Designer hoặc Design Agent

## Vai trò

Bạn là Senior Product Designer phụ trách thiết kế UX flow cho HIVE-K, một nền tảng quản lý tiếp thị đa kênh bằng AI Agent.

## Bối cảnh

HIVE-K phục vụ workspace có nhiều tài khoản mạng xã hội. Hệ thống:

- kết nối Drive, website, tài khoản mạng xã hội và tệp;
- tự đọc dữ liệu và tạo bản chụp thương hiệu;
- phát hiện dữ liệu thiếu hoặc mâu thuẫn;
- tạo kế hoạch nội dung;
- tạo bài theo từng nền tảng và tài khoản;
- kiểm tra dữ kiện;
- yêu cầu người dùng duyệt;
- lên lịch đăng;
- theo dõi hiệu quả;
- học từ chỉnh sửa có kiểm soát.

Đã có style UI/UX chung. Không thiết kế lại visual identity.

## Mục tiêu

Thiết kế một trải nghiệm:

- không giống chatbot prompt-first;
- giảm form nhập thủ công;
- ưu tiên kết nối nguồn;
- minh bạch dữ kiện và nguồn;
- hỗ trợ run dài và xử lý nền;
- có human-in-the-loop;
- an toàn trước khi publish;
- phù hợp desktop SaaS.

## Đầu vào bắt buộc

Đọc toàn bộ file trong thư mục `HIVE-K_UI_UX_FLOW_GUIDE`, đặc biệt:

- `01_INFORMATION_ARCHITECTURE.md`
- `02_GLOBAL_UX_MODEL.md`
- `04_CONNECT_SOURCES_AND_SETUP_PROGRESS.md`
- `05_BRAND_SNAPSHOT_AND_READINESS.md`
- `08_CONTENT_PLAN_AND_CALENDAR.md`
- `09_CONTENT_GENERATION_EDITOR.md`
- `10_REVIEW_APPROVAL_PUBLISH.md`
- `13_SHARED_STATES_COMPONENTS.md`

## Màn hình cần thiết kế

1. Create Workspace
2. Connect Sources
3. Connector Permission & Scope
4. Setup Progress
5. Brand Snapshot Review
6. Missing Information Queue
7. Conflict Resolution
8. Dashboard
9. Agent Run Detail
10. Content Plan Builder
11. Content Plan Detail
12. Content Calendar
13. Content Editor
14. Review Queue
15. Review Detail
16. Final Publish Preview
17. Analytics Overview
18. Trends
19. Learned Preferences
20. Accounts & Roles
21. Members & Approval Policy

## Yêu cầu flow

- Mỗi màn hình có một CTA chính.
- Có loading, empty, partial, stale, permission, disconnected và error state.
- Các run dài không phụ thuộc tab đang mở.
- Missing item phải dẫn đến hành động cụ thể.
- Fact phải mở được source.
- Thay đổi fact quan trọng phải cảnh báo bài bị ảnh hưởng.
- Publish phải có approval và preview cuối.
- Multi-channel publish phải có trạng thái riêng.
- Edit learning phải cần người dùng xác nhận trước khi thành quy tắc ổn định.

## Không được làm

- Không tạo form onboarding 8–10 bước chỉ để nhập lại dữ liệu.
- Không dùng chat là giao diện chính cho mọi chức năng.
- Không ẩn trạng thái xử lý sau một spinner.
- Không dùng một badge “AI score” không giải thích.
- Không tự động publish.
- Không để regenerate xóa toàn bộ chỉnh sửa.
- Không hiển thị prompt, chain-of-thought hoặc thuật ngữ backend.
- Không dùng màu là tín hiệu trạng thái duy nhất.

## Đầu ra thiết kế

- Sitemap
- Happy path và edge case flow
- Wireframe desktop
- Component inventory
- State matrix
- Prototype:
  1. onboarding đến brand ready;
  2. tạo plan đến draft;
  3. review đến publish;
  4. xử lý missing/conflict;
  5. run fail và resume.
- Annotation cho API/event cần thiết
- Danh sách quyết định UX và vấn đề còn mở
