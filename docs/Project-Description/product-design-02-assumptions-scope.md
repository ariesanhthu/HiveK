## Giả định và phạm vi

Các giả định tối thiểu để developer có thể triển khai (đều có thể thay đổi sau khi có quyết định sản phẩm; nếu không thay đổi, coi như tiêu chuẩn dự án):
- **Hình thức định danh**: ID dạng UUID cho các entity chính (User, Campaign, Participant…). (Nếu muốn ULID để sort theo thời gian: *không xác định*).  
- **Chuẩn thời gian**: Tất cả trường datetime dùng RFC 3339 (ISO8601 profile) để tránh nhập nhằng múi giờ.  
- **Vai trò hệ thống**: Admin/Business/KOL đúng như tài liệu sản phẩm; cơ chế phân quyền áp dụng trên từng endpoint theo role.  
- **MVP không bao gồm**: thanh toán, ký hợp đồng, escrow, in-app chat (đều *không xác định* trong tài liệu đầu vào).  
- **Tích hợp mạng xã hội**: MVP chỉ **manual submission + verify** và **tracking link (UTM/short link)**; tích hợp social API thuộc Phase 2 (đúng định hướng trong tài liệu).  
- **Ngôn ngữ**: mặc định `vi-VN`; i18n “sẵn sàng mở rộng” (không bắt buộc bật đa ngôn ngữ ngay). Next.js có guide i18n cho App Router.  

Phạm vi deliverable kỹ thuật trong báo cáo:
- Danh sách chức năng + luồng người dùng + trạng thái + ràng buộc + ưu tiên.
- Thiết kế Next.js (cấu trúc thư mục, routing, SSR/SSG/ISR theo trang, component tree, state, styling, a11y, i18n, performance, SEO).
- Thiết kế API REST + bản phác GraphQL (operation, schema mẫu, lỗi, auth, rate limit, pagination, versioning, webhook).
- Database schema + ERD bằng mermaid.
- Mẫu JSON, ví dụ request/response và code Next.js cho data fetching + form.
- Checklist setup/testing/CI/CD/security/logging/monitoring/migration.
- Kế hoạch triển khai và timeline ước tính, kèm trade-offs.

