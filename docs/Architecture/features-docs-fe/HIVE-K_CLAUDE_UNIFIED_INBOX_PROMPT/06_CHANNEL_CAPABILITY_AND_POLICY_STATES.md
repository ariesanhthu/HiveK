# Capability theo kênh và trạng thái chính sách

## 1. Nguyên tắc

Giao diện không được suy luận khả năng từ tên nền tảng.

Mỗi connected account phải trả về capability object.

Ví dụ:

```ts
type ChannelCapabilities = {
  canReadConversations: boolean;
  canReadMessageHistory: boolean;
  canReceiveRealtimeEvents: boolean;
  canSendText: boolean;
  canSendAttachments: boolean;
  canSendOutsideStandardWindow: boolean;
  canMarkRead: boolean;
  canAssign: boolean;
  canBlockUser: boolean;
  canOpenNativeConversation: boolean;
  canUseAutomation: boolean;
  allowedMessageTypes: string[];
  replyWindowExpiresAt?: string;
  policyNotice?: string;
  permissionStatus:
    | 'active'
    | 'limited'
    | 'expired'
    | 'revoked'
    | 'pending_review'
    | 'read_only'
    | 'unsupported';
};
```

Claude được điều chỉnh type theo codebase nhưng phải giữ tư tưởng capability-driven.

## 2. Kênh ưu tiên MVP

### Facebook Messenger

Chỉ dùng cho Facebook Page đã kết nối, có quyền phù hợp và connector hoạt động.

Giao diện cần hỗ trợ:

- đọc conversation;
- nhận message event;
- gửi text trong phạm vi cho phép;
- hiển thị page nhận tin;
- hiển thị reply window;
- mở hội thoại gốc nếu có deep link.

### Instagram Direct

Chỉ dùng cho tài khoản Instagram Professional và connector có quyền messaging phù hợp.

Giao diện tương tự Messenger nhưng không giả định mọi message type giống nhau.

### Kênh khác

Chỉ hiển thị trong Hộp thư nếu:

```text
canReadConversations = true
```

Chỉ bật composer nếu:

```text
canSendText = true
```

Nếu chỉ đọc:

- hiển thị lịch sử;
- composer disabled;
- giải thích rõ;
- cung cấp `Mở trên nền tảng` nếu có.

## 3. Standard messaging window

Meta hiện có giới hạn thời gian phản hồi tiêu chuẩn đối với Messenger và Instagram Messaging.

Không hard-code toàn bộ policy trong UI.

Backend/adapter phải cung cấp:

```text
replyWindowExpiresAt
canSendText
allowedMessageTypes
policyNotice
```

UI hiển thị:

- còn bao lâu để gửi;
- đã hết thời gian;
- loại tin được phép;
- lý do nút gửi bị khóa.

Ví dụ:

```text
Bạn có thể gửi tin nhắn tự do trong 2 giờ 14 phút nữa.
```

hoặc:

```text
Đã hết thời gian phản hồi tiêu chuẩn. HIVE-K không thể gửi tin nhắn tự do trong cuộc hội thoại này.
```

Không tạo workaround trái chính sách.

## 4. Connection states

### active

- nhận realtime;
- đọc/gửi theo capability;
- không cần banner.

### limited

- một số quyền thiếu;
- hiển thị banner nhẹ;
- nút bị giới hạn có tooltip.

### expired

- dừng gửi;
- có thể vẫn hiển thị cache lịch sử;
- CTA `Kết nối lại`.

### revoked

- không tiếp tục đồng bộ;
- hiển thị thời điểm mất quyền;
- CTA chỉ cho người có quyền admin.

### pending_review

- account đã cấu hình nhưng app chưa được duyệt hoặc capability chưa hoạt động;
- UI demo hoặc read-only theo backend.

### read_only

- đọc được nhưng không gửi;
- composer disabled.

### unsupported

- không đưa conversation vào inbox chính;
- ở trang connector hiển thị khả năng thực tế.

## 5. Realtime states

Header hoặc account status:

- Đang cập nhật trực tiếp.
- Đang kết nối lại.
- Mất kết nối.
- Dữ liệu có thể chậm.
- Lần đồng bộ cuối.

Không hiển thị trạng thái kỹ thuật thô như socket closed code 1006.

## 6. Conversation control và tránh xung đột hệ thống

Nếu connector báo một ứng dụng/hệ thống khác đang giữ quyền xử lý conversation:

- hiển thị `Đang được xử lý bởi hệ thống khác`.
- chuyển composer sang read-only hoặc yêu cầu takeover hợp lệ.
- không gửi song song gây reply trùng.
- có action `Kiểm tra quyền xử lý` nếu backend hỗ trợ.

## 7. Platform-specific limits

Attachment picker phải lọc theo:

- loại file;
- dung lượng;
- số lượng;
- media type;
- policy account.

Không cho người dùng chọn rồi mới báo lỗi nếu capability đã biết trước.

## 8. Mở trên nền tảng gốc

Hiển thị action này khi:

```text
canOpenNativeConversation = true
```

Dùng cho:

- kiểm tra lịch sử không đồng bộ;
- thao tác chưa hỗ trợ;
- voice/video call;
- xử lý policy đặc biệt.

Không dùng action này để thay thế composer khi HIVE-K đã có capability gửi hợp lệ.
