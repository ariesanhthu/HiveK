## Tóm tắt điều hành

Phạm vi và các module cốt lõi bám sát mô tả trong `product-vision.md`

Khuyến nghị kiến trúc triển khai:
- **Frontend**: Next.js App Router (Server Components mặc định), tận dụng **SSR/ISR** cho SEO và khả năng cập nhật bảng xếp hạng; dùng **dynamic rendering** cho dashboard cá nhân hoá. Next.js cung cấp cơ chế **fetch caching + revalidation** (ví dụ `next.revalidate`) để cân bằng “tươi dữ liệu” và hiệu năng. 
- **API**: Ưu tiên **REST v1** cho MVP (dễ triển khai/kiểm thử, phù hợp BFF). Chuẩn hoá lỗi theo **RFC 9457 Problem Details** để thống nhất error format. 
- **Auth**: Bearer token theo chuẩn OAuth bearer usage (RFC 6750) và định dạng token theo JWT (RFC 7519).  
- **Security baseline**: Bám theo OWASP API Security Top 10 (2023) cho kiểm soát BOLA/IDOR, inventory/versioning, anti-abuse; và OWASP cheat sheets cho password storage/logging.  
- **Database**: Ưu tiên **SQL (PostgreSQL)** vì quan hệ chặt (campaign–participant–metrics–review) và nhu cầu tính toán/đối soát. PostgreSQL có cơ chế kiểm soát đồng thời để đảm bảo toàn vẹn dữ liệu khi nhiều phiên truy cập.  

Các điểm “không xác định” (theo yêu cầu của bạn) được ghi rõ trong phần “Giả định và phạm vi” và từng mục liên quan: thanh toán/escrow, hợp đồng pháp lý, chat nội bộ, cơ chế dispute, tích hợp mạng xã hội cụ thể (TikTok/Meta/YouTube), chuẩn dữ liệu KPI theo từng nền tảng.

