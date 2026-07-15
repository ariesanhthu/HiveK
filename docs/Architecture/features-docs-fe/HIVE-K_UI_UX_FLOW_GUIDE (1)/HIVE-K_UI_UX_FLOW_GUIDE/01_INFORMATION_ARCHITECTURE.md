# 01 — Kiến trúc thông tin và điều hướng

## 1. Mục tiêu

Tổ chức hệ thống theo công việc người dùng cần hoàn thành, không tổ chức theo kiến trúc backend.

## 2. Điều hướng chính

```text
Tổng quan
Nội dung
  ├─ Kế hoạch
  ├─ Lịch nội dung
  ├─ Bài viết
  └─ Hàng chờ duyệt
Tri thức
  ├─ Bản chụp thương hiệu
  ├─ Sản phẩm & dịch vụ
  ├─ Khách hàng
  ├─ Dữ kiện & tuyên bố
  ├─ Câu hỏi thường gặp
  └─ Nguồn dữ liệu
Phân tích
  ├─ Hiệu quả nội dung
  ├─ Hiệu quả kênh
  ├─ Xu hướng
  └─ Những điều HIVE-K đã học
Kết nối
  ├─ Tài khoản mạng xã hội
  ├─ Google Drive
  ├─ Website
  └─ Tệp tải lên
Workspace
  ├─ Thành viên & quyền
  ├─ Vai trò kênh
  ├─ Quy trình duyệt
  ├─ Thông báo
  └─ Nhật ký hoạt động
```

## 3. Điều hướng cấp cao

### Thanh bên

Hiển thị tối đa 6 nhóm chính:

1. Tổng quan
2. Nội dung
3. Tri thức
4. Phân tích
5. Kết nối
6. Workspace

Không đưa từng loại dữ kiện hoặc từng connector thành menu cấp một.

### Thanh trên

Bao gồm:

- bộ chọn workspace;
- tìm kiếm toàn hệ thống;
- tiến trình đang chạy;
- thông báo;
- tài khoản cá nhân.

### Nút hành động chính

Nút tạo mới toàn cục mở menu:

- Tạo kế hoạch nội dung
- Tạo bài viết
- Tải nguồn dữ liệu
- Kết nối tài khoản
- Mời thành viên

## 4. Điều hướng theo ngữ cảnh

Một object phải liên kết được đến object liên quan:

- Bài viết → kế hoạch → dữ kiện đã dùng → nguồn.
- Cảnh báo dữ kiện → trang nguồn hoặc trường cần sửa.
- Tài khoản mạng xã hội → vai trò kênh → bài đã lên lịch.
- Insight → danh sách bài tạo ra insight.
- Quy tắc giọng văn → các lần chỉnh sửa làm bằng chứng.

## 5. Sitemap đề xuất

```text
/workspaces
/workspaces/new

/w/:workspaceId/overview

/w/:workspaceId/content/plans
/w/:workspaceId/content/plans/new
/w/:workspaceId/content/plans/:planId
/w/:workspaceId/content/calendar
/w/:workspaceId/content/posts
/w/:workspaceId/content/posts/:postId
/w/:workspaceId/content/review

/w/:workspaceId/knowledge
/w/:workspaceId/knowledge/brand-profile
/w/:workspaceId/knowledge/entities/:entityId
/w/:workspaceId/knowledge/facts/:factId
/w/:workspaceId/knowledge/conflicts
/w/:workspaceId/knowledge/missing
/w/:workspaceId/knowledge/sources
/w/:workspaceId/knowledge/sources/:sourceId

/w/:workspaceId/analytics
/w/:workspaceId/analytics/content
/w/:workspaceId/analytics/channels
/w/:workspaceId/analytics/trends
/w/:workspaceId/analytics/learning

/w/:workspaceId/connections
/w/:workspaceId/connections/new
/w/:workspaceId/connections/:connectorId

/w/:workspaceId/settings/members
/w/:workspaceId/settings/roles
/w/:workspaceId/settings/approval
/w/:workspaceId/settings/notifications
/w/:workspaceId/settings/audit

/runs/:runId
```

## 6. Quy tắc giữ ngữ cảnh

- Chuyển giữa bài viết và nguồn không làm mất bản nháp.
- Quay lại từ màn hình chi tiết phải giữ filter, tab và vị trí cuộn.
- Deep link phải mở đúng workspace và kiểm tra quyền trước khi hiển thị dữ liệu.
- Khi người dùng đổi workspace, không giữ filter hoặc dữ liệu của workspace cũ.
- Mọi URL chi tiết phải hỗ trợ tải lại trang mà không mất trạng thái quan trọng.
