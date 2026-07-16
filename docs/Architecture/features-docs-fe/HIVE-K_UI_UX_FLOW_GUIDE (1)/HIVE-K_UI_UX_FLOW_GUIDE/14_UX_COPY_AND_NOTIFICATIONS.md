# 14 — UX Copy và thông báo

## 1. Nguyên tắc câu chữ

- Nói theo hành động người dùng.
- Không dùng thuật ngữ backend.
- Không nhân cách hóa AI quá mức.
- Không khẳng định chắc chắn nếu dữ liệu chưa đủ.
- Không viết “Có lỗi xảy ra” mà không nêu phạm vi.
- Không dùng câu dài để giải thích một hành động đơn giản.

## 2. Mẫu trạng thái

### Đang xử lý

Tốt:

> Đang kiểm tra dữ kiện và nguồn cho 12 bài.

Không tốt:

> Agent đang chạy graph validation.

### Cần input

Tốt:

> HIVE-K tìm thấy ba lịch khai giảng khác nhau. Chọn lịch đang còn hiệu lực để tiếp tục.

### Kết quả một phần

Tốt:

> Đã tạo 8/10 bài. Hai bài còn thiếu thông tin ưu đãi.

### Lỗi connector

Tốt:

> Google Drive đã mất quyền truy cập. Dữ liệu đã lưu vẫn còn, nhưng HIVE-K không thể đồng bộ thay đổi mới.

## 3. Nhãn hành động

Ưu tiên động từ cụ thể:

- Xác nhận dữ kiện
- Mở nguồn
- Chọn lịch đúng
- Gửi duyệt
- Yêu cầu chỉnh sửa
- Lên lịch đăng
- Kết nối lại
- Thử lại 2 mục lỗi

Tránh:

- OK
- Tiếp tục
- Xử lý
- Đồng ý

khi không rõ hành động thực tế.

## 4. Câu hỏi từ HIVE-K

Cấu trúc:

1. Phát hiện
2. Vì sao cần xác nhận
3. Nguồn đã kiểm tra
4. Hành động cụ thể

Ví dụ:

> Website và tệp “Bảng giá 2026” đang hiển thị hai mức giá khác nhau. Giá được dùng trong bài quảng bá cần được xác nhận. Bạn muốn dùng mức nào?

## 5. Thông báo

### Thông báo ngay

- bài sắp đăng nhưng chưa duyệt;
- publish thất bại;
- connector mất quyền;
- dữ kiện chặn một batch;
- có yêu cầu duyệt được giao.

### Thông báo tổng hợp

- đồng bộ hoàn tất;
- insight mới;
- trend mới;
- thay đổi rule giọng văn;
- báo cáo tuần.

## 6. Kênh thông báo

Cho phép chọn:

- trong ứng dụng;
- email;
- push nếu có;
- không gửi.

Cấu hình theo loại sự kiện và mức nghiêm trọng.

## 7. Chống spam

- Gộp nhiều lỗi cùng connector.
- Không gửi lại thông báo chưa có thay đổi.
- Sau khi task được xử lý, đánh dấu notification resolved.
- Một run dài chỉ gửi khi bắt đầu, cần hành động, hoàn tất hoặc thất bại.
