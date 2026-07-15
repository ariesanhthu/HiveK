# Responsive, accessibility và tiêu chí nghiệm thu

## 1. Responsive behavior

### Desktop lớn

- Ba panel.
- Context panel có thể thu gọn.
- List item đủ metadata.
- Composer hỗ trợ shortcut.

### Desktop nhỏ hoặc tablet ngang

- Hai panel chính.
- Context panel là drawer.
- Filter nâng cao là popover/drawer.

### Tablet dọc

- Danh sách và conversation chuyển theo navigation.
- Header giữ action quan trọng.
- Không ép ba cột quá hẹp.

### Mobile

- Route hoặc view stack.
- Composer safe-area aware.
- Keyboard không che textarea và nút gửi.
- Attachment preview scroll ngang hoặc stack.
- Action phụ đưa vào menu.
- Nút `Tiếp quản` và `Gửi` vẫn dễ tiếp cận.

## 2. Keyboard

Tối thiểu:

- Tab order hợp lý.
- Enter gửi chỉ khi convention hiện có cho phép.
- Shift+Enter xuống dòng.
- Escape đóng popover/drawer.
- Arrow key cho list nếu component pattern hỗ trợ.
- Shortcut không xung đột trình duyệt.
- Có tooltip hoặc help cho shortcut.

Không ép Enter gửi trên mobile.

## 3. Screen reader

- Message timeline dùng semantics phù hợp với log cập nhật tuần tự.
- Tin mới có live region mức `polite`.
- Lỗi gửi hoặc lỗi form dùng alert phù hợp.
- Channel icon có accessible name.
- Badge unread có text thay thế.
- Button icon-only có label.
- Status không chỉ dựa vào màu.
- Internal note được đọc rõ là “Ghi chú nội bộ, không gửi khách”.

## 4. Focus management

- Mở conversation: focus không tự nhảy vào composer nếu người dùng chỉ muốn đọc.
- Mở drawer: focus vào heading, trap focus đúng.
- Đóng drawer: trả focus về nút mở.
- Sau khi gửi: giữ focus ở composer.
- Khi message lỗi: đưa thông báo đến assistive tech, không cưỡng ép scroll.
- Khi takeover thành công: thông báo mode đổi.

## 5. Motion

- Tôn trọng reduced motion.
- Không animate liên tục trạng thái AI.
- Typing indicator không gây nhấp nháy mạnh.
- Scroll animation ngắn và có thể bỏ qua.

## 6. Contrast và touch target

Dùng token/style hiện có nhưng phải kiểm tra:

- contrast text;
- focus indicator;
- trạng thái disabled vẫn đọc được;
- touch target đủ lớn;
- icon channel không phải tín hiệu duy nhất.

## 7. Tiêu chí nghiệm thu chức năng

### Điều hướng

- Có mục Hộp thư.
- Badge đúng theo view.
- Deep link mở đúng conversation.

### Danh sách

- Search và filter hoạt động.
- Unread, AI state, channel và assignee hiển thị rõ.
- Selection không mất khi realtime update.

### Hội thoại

- Phân biệt khách, AI, người dùng, thành viên và note.
- Load lịch sử cũ không làm nhảy scroll.
- Tin mới không kéo người dùng khỏi vị trí đọc.

### Composer

- Gửi text thành công.
- Draft không mất khi chuyển conversation.
- Gửi lỗi có retry.
- Internal note không thể gửi nhầm khách.
- Disabled đúng khi capability không cho phép.

### AI

- Xem được AI đã trả lời.
- Có thể tiếp quản.
- AI không tự bật lại.
- Có thể trả conversation lại cho AI.
- Handoff hiển thị lý do và action.
- Không hiển thị chain-of-thought.

### Team

- Gán người xử lý.
- Đổi trạng thái.
- Snooze.
- Resolve.
- Audit event cơ bản.

### Kênh

- Permission expired có banner.
- Read-only khóa composer.
- Reply window hiển thị.
- Unsupported capability không tạo nút giả.

### Responsive

- Không overflow ngang ngoài vùng message/attachment có chủ đích.
- Composer không che nội dung.
- Drawer hoạt động bằng keyboard.

## 8. Tiêu chí chất lượng

- Typecheck pass.
- Lint pass.
- Test pass.
- Build pass.
- Không có console error.
- Không có React key warning hoặc tương đương.
- Không hard-code secret.
- Không copy data mock vào component.
- Không thêm dependency không cần thiết.
