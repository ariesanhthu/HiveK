# Kiến trúc thông tin và luồng vào Hộp thư

## 1. Vị trí trong business site

Thêm một mục điều hướng cấp cao:

```text
Hộp thư
```

Mục này phải nằm ở nhóm chức năng vận hành hằng ngày, gần các section như Nội dung, Lịch đăng, Phân tích hoặc Khách hàng.

Không đặt Hộp thư sâu trong phần Cài đặt.

### Badge điều hướng

Hiển thị badge theo ưu tiên:

1. Số cuộc hội thoại cần người thật xử lý.
2. Nếu không có, hiển thị số cuộc hội thoại chưa đọc.
3. Không hiển thị số tổng tin nhắn.

Badge cần có accessible label, ví dụ:

```text
Hộp thư, 7 cuộc hội thoại cần xử lý
```

## 2. Route đề xuất

Claude phải điều chỉnh theo router hiện có, nhưng nên giữ cấu trúc tương đương:

```text
/workspaces/:workspaceId/inbox
/workspaces/:workspaceId/inbox/:conversationId
```

Query state dùng cho bộ lọc có thể gồm:

```text
?view=needs-human
&channel=messenger
&account=page_123
&assignee=me
&status=open
&priority=high
&q=tuition
```

Không bắt buộc tất cả filter phải xuất hiện trong URL, nhưng các filter chính cần có khả năng chia sẻ hoặc khôi phục sau reload.

## 3. Cấu trúc trang

### Desktop

```text
┌────────────────────────────────────────────────────────────────────┐
│ Header: Hộp thư | tìm kiếm | bộ lọc | trạng thái đồng bộ | actions │
├───────────────────┬──────────────────────────┬─────────────────────┤
│ Danh sách         │ Nội dung hội thoại       │ Ngữ cảnh khách hàng │
│ hội thoại         │ + composer               │ và AI               │
└───────────────────┴──────────────────────────┴─────────────────────┘
```

Tỷ lệ panel phải dựa trên layout hiện tại, không hard-code theo pixel nếu design system đã có grid.

### Tablet

- Danh sách và hội thoại là hai vùng chính.
- Panel ngữ cảnh mở bằng drawer hoặc sheet.
- Bộ lọc mở bằng popover hoặc drawer.

### Mobile

- Màn hình 1: danh sách hội thoại.
- Màn hình 2: hội thoại.
- Panel ngữ cảnh mở bằng bottom sheet.
- Composer luôn nằm ở cuối viewport nhưng không che tin nhắn.
- Nút quay lại giữ nguyên filter và vị trí cuộn danh sách.

## 4. Views mặc định

Dùng tab hoặc filter preset, không tạo quá nhiều mục sidebar:

- `Cần xử lý`
- `Của tôi`
- `Chưa phân công`
- `AI đang xử lý`
- `Đang chờ khách`
- `Tất cả`
- `Đã hoàn tất`

### Quy tắc mặc định

- Chủ workspace hoặc quản lý mở vào `Cần xử lý`.
- Nhân viên trực tin nhắn mở vào `Của tôi`.
- Nếu workspace chưa có kênh hỗ trợ tin nhắn, hiển thị empty state kết nối kênh.
- Nếu có kênh nhưng quyền hết hạn, hiển thị reconnect state.

## 5. Luồng vào từ nơi khác

Các điểm vào Hộp thư:

- Badge trên navigation.
- Notification “AI cần bạn xử lý”.
- Dashboard card “Tin nhắn cần phản hồi”.
- Trang phân tích bài đăng: mở các hội thoại phát sinh từ bài.
- Trang chiến dịch: mở các hội thoại liên quan chiến dịch.
- Trang tài khoản kết nối: mở inbox của account.
- Link trực tiếp đến conversation.

Mỗi deep link phải mở đúng conversation và giữ context nguồn nếu có.

Ví dụ:

```text
Từ bài đăng “Tuyển sinh lớp hè”
→ mở Hộp thư
→ filter campaign/post
→ chọn conversation liên quan
```

## 6. Luồng sử dụng chính

```text
Mở Hộp thư
→ xem nhóm cần xử lý
→ chọn hội thoại
→ đọc tin gần nhất và trạng thái AI
→ kiểm tra thông tin khách/ngữ cảnh
→ chọn một trong ba:
   1. để AI tiếp tục;
   2. duyệt/chỉnh câu AI đề xuất;
   3. tiếp quản và tự trả lời
→ cập nhật trạng thái
→ chờ khách hoặc hoàn tất
```

## 7. Giữ ngữ cảnh giữa các lần sử dụng

Hệ thống cần lưu:

- view gần nhất;
- filter gần nhất;
- conversation đang mở;
- vị trí cuộn danh sách;
- draft chưa gửi theo từng conversation;
- trạng thái panel ngữ cảnh mở hoặc đóng trên desktop;
- kích thước panel nếu layout hiện có hỗ trợ resize.

Không lưu các filter tạm thời nhạy cảm trên thiết bị dùng chung nếu repository có quy tắc bảo mật riêng.
