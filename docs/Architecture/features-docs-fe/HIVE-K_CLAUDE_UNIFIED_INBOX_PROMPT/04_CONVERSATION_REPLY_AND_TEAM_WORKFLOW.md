# Luồng hội thoại, trả lời và cộng tác nhóm

## 1. Ba chế độ xử lý hội thoại

Mỗi conversation có một `handling mode` rõ ràng:

### Tự động có giới hạn

- AI được phép trả lời nhóm câu hỏi rủi ro thấp.
- Chỉ dùng dữ liệu đã duyệt.
- Gặp ngoại lệ thì tự chuyển người.
- UI luôn hiển thị AI đang hoạt động.

### AI đề xuất để duyệt

- AI tạo draft.
- Người dùng xem, chỉnh và gửi.
- Phù hợp khi workspace mới hoặc dữ liệu chưa ổn định.

### Người trực tiếp

- AI không tự gửi.
- AI vẫn có thể gợi ý nếu người dùng yêu cầu.
- Người dùng hoặc thành viên xử lý trực tiếp.

Tên hiển thị cần dùng ngôn ngữ dễ hiểu, tránh thuật ngữ như autonomous agent.

## 2. ReplyComposer

### Thành phần bắt buộc

- Textarea tự tăng chiều cao.
- Placeholder theo trạng thái.
- Nút gửi.
- Nút AI gợi ý.
- Câu trả lời mẫu hoặc FAQ.
- Attachment nếu channel hỗ trợ.
- Emoji chỉ khi component hiện có.
- Chuyển giữa `Trả lời khách` và `Ghi chú nội bộ`.
- Hiển thị channel/account đang gửi.
- Hiển thị người đang sở hữu conversation.
- Hiển thị hạn hoặc khả năng gửi.
- Autosave draft theo conversation.

### Trước khi gửi

Hiển thị cảnh báo khi:

- ngoài thời gian gửi tự do;
- connector mất quyền;
- một người khác đang xử lý;
- AI đang chuẩn bị gửi;
- dữ liệu giá/lịch có xung đột;
- message vượt giới hạn;
- attachment không được hỗ trợ;
- khách đã bị chặn;
- conversation đang closed nhưng cần reopen.

### Sau khi gửi

Trạng thái:

```text
Đang gửi
Đã gửi
Đã chuyển đến nền tảng
Đã nhận nếu nền tảng hỗ trợ
Gửi thất bại
Không rõ trạng thái
```

Khi trạng thái không rõ, không retry mù quáng. Hiển thị action kiểm tra hoặc gửi lại có xác nhận.

## 3. Tiếp quản từ AI

### Luồng

```text
Người dùng bấm “Tiếp quản”
→ hệ thống kiểm tra AI có outgoing action đang chạy không
→ dừng hoặc chờ action hiện tại kết thúc an toàn
→ khóa AI auto-send cho conversation
→ gán conversation cho người dùng hoặc giữ assignee hiện tại
→ composer chuyển sang chế độ Người trực tiếp
→ tạo system event trong timeline
```

System event:

```text
Anh Thư đã tiếp quản cuộc hội thoại. AI sẽ không tự gửi cho đến khi được bật lại.
```

Không tự bật lại AI khi người dùng gửi xong một tin.

## 4. Trả lại cho AI

### Luồng

```text
Người dùng bấm “Trả lại AI”
→ chọn chế độ:
   - Tự động có giới hạn
   - AI đề xuất để duyệt
→ xem tóm tắt rule đang áp dụng
→ xác nhận
→ AI tiếp tục từ tin nhắn tiếp theo
```

Nếu conversation có cảnh báo chưa giải quyết, không cho bật tự động. Chỉ cho bật chế độ đề xuất hoặc yêu cầu xử lý cảnh báo.

## 5. AI gợi ý câu trả lời

Nút `Gợi ý trả lời`:

- không tự gửi;
- tạo tối đa số phương án hợp lý, mặc định 1–3;
- mỗi phương án nêu tone hoặc mục tiêu khác nhau nếu cần;
- cho phép chèn vào composer;
- không ghi đè draft hiện tại mà không xác nhận;
- có thể regenerate nhưng giữ phương án cũ cho đến khi người dùng chọn;
- hiển thị nguồn dữ kiện và cảnh báo.

Các action:

- `Chèn vào câu trả lời`
- `Sửa trước khi gửi`
- `Tạo phương án khác`
- `Đánh dấu không phù hợp`
- `Mở dữ kiện liên quan`

## 6. Tránh trả lời trùng

Phải có cơ chế UI và data state:

- conversation ownership;
- AI send lock;
- teammate typing presence nếu backend hỗ trợ;
- pending outgoing message;
- client-generated message ID;
- disable gửi trong lúc cùng message đang pending;
- cảnh báo khi có tin mới đến trong lúc người dùng soạn;
- kiểm tra version trước khi gửi nếu conversation thay đổi.

Ví dụ cảnh báo:

```text
AI vừa gửi một câu trả lời mới. Kiểm tra hội thoại trước khi gửi nội dung đang soạn.
```

Người dùng được chọn:

- Xem tin mới.
- Giữ draft.
- Vẫn gửi sau khi xác nhận.

## 7. Assignment

Cho phép gán:

- Chưa phân công.
- AI Agent.
- Một team.
- Một thành viên.
- Tôi.

Khi gán cho người thật:

- AI auto-send phải tuân theo handling mode, không mặc định tiếp tục.
- Người nhận được notification nếu hệ thống hiện có notification.
- Ghi lịch sử gán.

Bulk action hợp lý:

- gán;
- đánh dấu đã đọc;
- thêm tag;
- đổi ưu tiên;
- tạm hoãn;
- hoàn tất.

Không cho bulk send tin nhắn khách trong MVP.

## 8. Trạng thái conversation

Đề xuất domain state:

```text
new
open
waiting_for_customer
needs_human
snoozed
resolved
closed
spam
```

UI copy:

- Mới
- Đang xử lý
- Đang chờ khách
- Cần người thật
- Tạm hoãn
- Đã giải quyết
- Đã đóng
- Spam

Phân biệt `resolved` và `closed` nếu backend hỗ trợ:

- Đã giải quyết: có thể mở lại khi khách nhắn.
- Đã đóng: kết thúc thủ công hoặc theo policy.

## 9. Snooze và follow-up

Preset:

- 1 giờ.
- Chiều nay.
- Ngày mai.
- Tuần sau.
- Chọn thời gian.

Conversation tự mở lại khi:

- hết thời gian snooze;
- khách gửi tin mới;
- rule đặc biệt kích hoạt.

## 10. Draft

- Lưu draft riêng theo conversation và user.
- Hiển thị badge `Bản nháp` ở list item.
- Khi chuyển conversation, draft không mất.
- Khi gửi thành công, xóa draft.
- Khi đổi sang internal note, không trộn draft reply và draft note.
- Có timestamp autosave.
