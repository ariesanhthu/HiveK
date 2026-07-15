# 16 — Phạm vi MVP và tiêu chí nghiệm thu UX

## 1. MVP bắt buộc

### Thiết lập

- Tạo workspace
- Upload file
- Google Drive read-only
- Website
- Theo dõi tiến trình
- Bản chụp thương hiệu
- Dữ liệu thiếu
- Mâu thuẫn
- Hiệu chỉnh giọng văn

### Tri thức

- Xem dữ kiện
- Xem nguồn
- Xác nhận và sửa
- Tìm kiếm
- Lịch sử phiên bản cơ bản

### Nội dung

- Tạo kế hoạch
- Xem theo danh sách và lịch
- Tạo bài theo platform/account
- Editor
- Validation
- Review
- Approve/reject
- Lên lịch

### Vận hành

- Run progress
- Resume
- Partial failure
- Notification
- Audit cơ bản

### Phân tích

- Hiệu quả nội dung cơ bản
- Hiệu quả kênh
- Lưu feedback và diff
- Voice rule candidate

## 2. Giai đoạn sau

- Bình luận và tin nhắn
- Gợi ý cộng tác viên
- Trend detection nâng cao
- Ranker học máy
- Contextual bandit
- Tự động hóa quy trình duyệt phức tạp
- Fine-tune model
- Mobile editor đầy đủ

## 3. Checklist nghiệm thu theo flow

### Onboarding

- Hoàn thành mà không nhập form dài.
- Có thể rời và quay lại.
- Quyền connector rõ ràng.
- Lỗi một nguồn không chặn toàn bộ.

### Brand snapshot

- Mỗi fact có nguồn.
- Có confirm/correct.
- Có missing và conflict.
- Readiness giải thích được.

### Content planning

- Chọn account và role.
- Có ràng buộc.
- Cảnh báo trùng và fact hết hạn.
- Có calendar.

### Content editor

- Autosave.
- Version history.
- Validation trỏ đúng vấn đề.
- Regenerate theo phạm vi.
- Xem facts và nguồn.

### Approval & publish

- Không publish thiếu approval.
- Preview cuối.
- Timezone rõ.
- Multi-channel status độc lập.
- Retry không trùng.

### Analytics & learning

- Insight có số mẫu.
- Có confidence.
- Người dùng kiểm soát rule học.
- Không kết luận khi dữ liệu quá ít.

## 4. Tiêu chí chất lượng xuyên suốt

- Không có dead end.
- Mỗi màn hình có next action.
- Không mất dữ liệu khi reload.
- Không hiển thị trạng thái kỹ thuật khó hiểu.
- Không truyền trạng thái chỉ bằng màu.
- Tất cả hành động quan trọng có audit.
- Cross-workspace isolation được kiểm tra.
- Tải trang và realtime có fallback.
- Empty/error/permission state được thiết kế đầy đủ.

## 5. Deliverable thiết kế đề xuất

UI/UX Designer cần bàn giao:

1. Sitemap
2. User flow tổng thể
3. Flow onboarding
4. Flow content plan
5. Flow create/edit/review/publish
6. Flow missing/conflict
7. Flow run progress/resume
8. Wireframe desktop
9. Responsive behavior
10. Component state matrix
11. Prototype các flow quan trọng
12. Annotation API/event ở các màn hình realtime
