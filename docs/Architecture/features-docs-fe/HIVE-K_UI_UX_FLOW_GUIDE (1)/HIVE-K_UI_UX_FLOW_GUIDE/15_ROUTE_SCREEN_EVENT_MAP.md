# 15 — Bản đồ Route, màn hình, object và sự kiện

## 1. Bảng màn hình chính

| Route | Màn hình | Object chính | Hành động chính |
|---|---|---|---|
| `/w/:id/overview` | Dashboard | SetupProgress, ApprovalRequest, InsightSummary | Xử lý việc ưu tiên |
| `/w/:id/connections` | Kết nối | ConnectorAccount | Kết nối nguồn |
| `/w/:id/setup/progress` | Tiến trình thiết lập | AgentRunEvent, SetupProgress | Theo dõi / xử lý lỗi |
| `/w/:id/knowledge/brand-profile` | Bản chụp thương hiệu | BrandSnapshot | Xác nhận dữ kiện |
| `/w/:id/knowledge/missing` | Dữ liệu thiếu | MissingItem | Bổ sung dữ liệu |
| `/w/:id/knowledge/conflicts` | Mâu thuẫn | ConflictItem | Giải quyết |
| `/w/:id/knowledge/sources/:sourceId` | Chi tiết nguồn | SourceObject, SourceSnapshot | Đồng bộ / xem dữ kiện |
| `/w/:id/content/plans` | Danh sách kế hoạch | ContentPlan | Tạo kế hoạch |
| `/w/:id/content/plans/:planId` | Chi tiết kế hoạch | ContentPlan, ContentNode | Duyệt cấu trúc |
| `/w/:id/content/calendar` | Lịch nội dung | ContentNode, PostDraft | Điều phối lịch |
| `/w/:id/content/posts/:postId` | Editor | PostDraft, ValidationResult | Chỉnh và gửi duyệt |
| `/w/:id/content/review` | Hàng chờ duyệt | ApprovalRequest | Duyệt |
| `/w/:id/analytics` | Tổng quan phân tích | InsightSummary | Áp dụng insight |
| `/w/:id/analytics/trends` | Xu hướng | TrendPattern | Thử trong kế hoạch |
| `/w/:id/analytics/learning` | Học phong cách | VoiceRule, EditLearningEvent | Xác nhận rule |
| `/runs/:runId` | Chi tiết tiến trình | AgentRunEvent | Resume / cancel |

## 2. Sự kiện SSE và phản hồi UI

| Event | Phản hồi UI |
|---|---|
| `run.started` | Tạo run card và mở progress |
| `step.started` | Đánh dấu bước hiện tại |
| `step.progress` | Cập nhật số lượng thực tế |
| `source.discovered` | Tăng số nguồn tìm thấy |
| `fact.extracted` | Cập nhật kết quả tạm thời |
| `conflict.detected` | Tạo task mâu thuẫn |
| `input.required` | Hiển thị CTA bổ sung |
| `approval.required` | Đưa vào hàng chờ duyệt |
| `draft.created` | Mở hoặc thông báo bản nháp |
| `validation.completed` | Cập nhật badge kiểm tra |
| `run.completed` | Chuyển sang kết quả |
| `run.failed` | Hiển thị lỗi đúng phạm vi |

## 3. Mapping UI Action

| `UIAction.type` | Component |
|---|---|
| `show_summary` | Summary card / result panel |
| `request_confirmation` | Confirmation panel |
| `request_upload` | Upload drawer/page |
| `open_drive_file` | Source drawer hoặc deep link |
| `review_draft` | Editor/review page |
| `approve_action` | Approval panel |
| `show_progress` | Run progress |
| `show_error` | Error state có retry |

## 4. Quy tắc route guard

Trước khi render:

1. Xác thực người dùng.
2. Kiểm tra workspace membership.
3. Kiểm tra quyền object.
4. Kiểm tra object thuộc workspace hiện tại.
5. Nếu thiếu quyền, hiển thị trạng thái yêu cầu quyền; không redirect vòng lặp.
6. Nếu object đã bị xóa hoặc superseded, chuyển đến phiên bản hợp lệ kèm thông báo.

## 5. URL state

Đưa vào query string:

- tab;
- filter;
- sort;
- date range;
- selected account;
- view mode calendar/list.

Không đưa vào URL:

- token;
- dữ liệu nhạy cảm;
- nội dung draft chưa lưu;
- raw prompt.
