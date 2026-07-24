# 12 — Tài khoản, vai trò kênh, thành viên và quyền

## 1. Tài khoản mạng xã hội

Mỗi account card hiển thị:

- tên tài khoản;
- nền tảng;
- vai trò kênh;
- trạng thái kết nối;
- quyền đọc;
- quyền đăng;
- lần đồng bộ;
- bài đã lên lịch;
- cảnh báo.

Hành động:

- đồng bộ;
- kết nối lại;
- đổi vai trò;
- quản lý quyền;
- ngắt kết nối.

## 2. Vai trò kênh

Vai trò kênh khác quyền thành viên.

Ví dụ:

- Kênh thương hiệu chính
- Kênh khu vực
- Kênh tư vấn
- Kênh cộng đồng
- Kênh tuyển sinh
- Kênh chăm sóc khách hàng

Mỗi vai trò có:

- mục tiêu;
- đối tượng;
- tone override;
- loại nội dung;
- giới hạn bán hàng;
- quy tắc CTA.

## 3. Thành viên workspace

Vai trò hệ thống đề xuất:

| Vai trò         | Quyền chính                              |
| --------------- | ---------------------------------------- |
| Owner           | Toàn bộ workspace, billing, quyền        |
| Admin           | Kết nối, thành viên, cấu hình            |
| Content Manager | Kế hoạch, duyệt, lịch                    |
| Creator         | Tạo và chỉnh bài                         |
| Reviewer        | Duyệt nội dung và dữ kiện được phân công |
| Analyst         | Xem phân tích                            |
| Viewer          | Chỉ xem                                  |

## 4. Quy trình duyệt

Cho phép cấu hình:

- loại nội dung nào cần duyệt;
- tài khoản nào cần duyệt hai bước;
- ai duyệt dữ kiện;
- ai duyệt publish;
- SLA duyệt;
- người thay thế.

Không nên cho người dùng tạo workflow tùy biến quá phức tạp trong MVP.

## 5. Mời thành viên

Flow:

1. Nhập email
2. Chọn vai trò
3. Chọn phạm vi account nếu cần
4. Gửi lời mời
5. Theo dõi trạng thái
6. Thu hồi hoặc gửi lại

## 6. Chống thao tác sai quyền

Khi không có quyền:

- giải thích quyền nào còn thiếu;
- cho phép gửi yêu cầu đến admin;
- không hiển thị action có vẻ khả dụng rồi mới báo lỗi cuối flow;
- không lộ dữ liệu mà người dùng không được xem.

## 7. Nhật ký hoạt động

Ghi nhận:

- ai thay đổi dữ kiện;
- ai duyệt bài;
- ai thay lịch;
- ai publish;
- connector nào được cấp hoặc thu hồi;
- quyền nào thay đổi.

Cho phép filter theo người, loại hành động, object và thời gian.

## 8. Tiêu chí nghiệm thu

- Phân biệt rõ vai trò thành viên và vai trò kênh.
- Quyền được kiểm tra trước khi vào flow quan trọng.
- Có audit cho mọi hành động publish và thay đổi tri thức.
- Thành viên chỉ thấy account được phép.
