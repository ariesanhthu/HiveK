# 13 — Trạng thái và component hành vi dùng chung

## 1. Page state chuẩn

Mỗi trang dữ liệu phải có:

- loading;
- success;
- empty;
- partial;
- stale;
- permission denied;
- disconnected;
- error;
- offline/reconnecting nếu có realtime.

## 2. Loading

### Không dùng

- spinner toàn trang kéo dài;
- placeholder không có cấu trúc;
- phần trăm giả.

### Nên dùng

- skeleton giữ layout;
- tiến độ theo bước khi có run;
- dữ liệu cũ kèm nhãn đang cập nhật;
- kết quả một phần.

## 3. Empty state

Empty state phải trả lời:

- đây là nơi nào;
- vì sao chưa có dữ liệu;
- bước tiếp theo;
- ví dụ kết quả sau khi hoàn tất.

Ví dụ:

```text
Chưa có kế hoạch nội dung
Tạo kế hoạch đầu tiên từ dữ kiện thương hiệu và các kênh đã kết nối.
[Tạo kế hoạch]
```

## 4. Error state

Gồm:

- điều gì không hoàn tất;
- dữ liệu nào vẫn an toàn;
- người dùng có thể làm gì;
- mã hỗ trợ nếu cần;
- hành động thử lại đúng phạm vi.

## 5. Banner

Dùng cho vấn đề cấp trang hoặc toàn workspace:

- connector mất quyền;
- dữ kiện quan trọng hết hạn;
- publish bị tạm dừng;
- workspace chưa đủ readiness.

Không dùng nhiều banner cạnh nhau. Gộp vào một khu vực ưu tiên.

## 6. Toast

Chỉ dùng cho phản hồi ngắn:

- đã lưu;
- đã sao chép;
- đã gửi duyệt;
- đã lên lịch.

Không dùng toast cho lỗi cần hành động lâu dài.

## 7. Modal và drawer

### Modal

Dùng cho:

- xác nhận hành động nguy hiểm;
- chọn nhanh;
- quyết định ngắn.

### Drawer

Dùng cho:

- xem nguồn;
- xem dữ kiện;
- xem kiểm tra;
- chỉnh metadata mà không rời ngữ cảnh.

Không dùng modal cho form nhiều bước.

## 8. Table và card

### Dùng table khi

- cần so sánh nhiều object;
- cần filter, sort, bulk action;
- dữ liệu có cấu trúc ổn định.

### Dùng card khi

- object cần preview;
- cần nhấn mạnh trạng thái;
- có ít trường nhưng nhiều hành động ngữ cảnh.

## 9. Filter

- Filter được phản ánh trên URL.
- Có nút xóa tất cả.
- Hiển thị số filter đang áp dụng.
- Lưu filter gần nhất theo workspace và màn hình.
- Không giữ filter từ workspace khác.

## 10. Selection và bulk action

- Hiển thị số item chọn.
- Chỉ hiện action hợp lệ với toàn bộ selection.
- Nêu ảnh hưởng trước khi thực hiện.
- Bulk approve không áp dụng cho bài rủi ro hoặc thiếu dữ kiện.

## 11. Accessibility

- Không truyền trạng thái chỉ bằng màu.
- Keyboard navigation cho editor, table, modal.
- Focus rõ ràng.
- Label cho icon button.
- Error gắn với trường.
- Live region cho progress và notification quan trọng.
- Preview nội dung có chế độ đọc tuyến tính.

## 12. Responsive

Ưu tiên desktop cho workflow quản trị, nhưng:

- Dashboard và review queue dùng được trên tablet.
- Mobile hỗ trợ xem task, approve/reject nhanh và nhận thông báo.
- Không ép editor hoặc calendar đầy đủ vào mobile nếu trải nghiệm không đảm bảo.
