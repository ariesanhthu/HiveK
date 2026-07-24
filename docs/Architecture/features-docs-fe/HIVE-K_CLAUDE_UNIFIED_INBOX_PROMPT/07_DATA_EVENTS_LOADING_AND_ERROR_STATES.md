# Dữ liệu, sự kiện, loading và lỗi

## 1. Domain model tối thiểu

Claude phải ánh xạ vào model hiện có hoặc tạo type tương đương.

```ts
type Conversation = {
  id: string;
  workspaceId: string;
  channel: string;
  accountId: string;
  participantIds: string[];
  status: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  unreadCount: number;
  lastMessageAt: string;
  assignee?: Assignment;
  handlingMode: string;
  aiState: string;
  tags: string[];
  draftState?: 'none' | 'reply' | 'note';
  replyCapability: ReplyCapability;
  sourceContext?: SourceContext;
  version: number;
};

type Message = {
  id: string;
  conversationId: string;
  clientMessageId?: string;
  authorType:
    | 'customer'
    | 'ai_agent'
    | 'current_user'
    | 'workspace_member'
    | 'internal_note'
    | 'system';
  authorId?: string;
  content: string;
  attachments: Attachment[];
  createdAt: string;
  deliveryStatus:
    | 'draft'
    | 'queued'
    | 'sending'
    | 'sent'
    | 'delivered'
    | 'failed'
    | 'unknown';
  isAutomated?: boolean;
  evidenceRefs?: EvidenceRef[];
  confidence?: 'high' | 'medium' | 'low';
};

type Assignment = {
  type: 'unassigned' | 'ai' | 'team' | 'member';
  id?: string;
  displayName?: string;
};

type ReplyCapability = {
  canSend: boolean;
  reason?: string;
  expiresAt?: string;
  allowedMessageTypes: string[];
};
```

## 2. API hoặc service boundary tham khảo

Không bắt buộc URL giống hệt, nhưng frontend cần boundary tương đương:

```text
GET    /workspaces/:id/conversations
GET    /workspaces/:id/conversations/:conversationId
GET    /workspaces/:id/conversations/:conversationId/messages
POST   /workspaces/:id/conversations/:conversationId/messages
POST   /workspaces/:id/conversations/:conversationId/notes
PATCH  /workspaces/:id/conversations/:conversationId
POST   /workspaces/:id/conversations/:conversationId/takeover
POST   /workspaces/:id/conversations/:conversationId/return-to-ai
POST   /workspaces/:id/conversations/:conversationId/suggest-reply
POST   /workspaces/:id/conversations/:conversationId/snooze
POST   /workspaces/:id/conversations/:conversationId/resolve
GET    /workspaces/:id/inbox/views
GET    /workspaces/:id/channel-capabilities
```

## 3. Realtime events

```text
conversation.created
conversation.updated
conversation.assigned
conversation.status_changed
conversation.ai_state_changed
message.received
message.queued
message.sent
message.delivered
message.failed
message.unknown
handoff.created
handoff.resolved
channel.permission_changed
channel.connection_changed
typing.started
typing.stopped
```

Frontend phải:

- deduplicate event;
- đối chiếu version;
- không append message trùng;
- cập nhật unread đúng;
- giữ selected conversation;
- không làm list nhảy vị trí vô lý khi người dùng đang thao tác.

## 4. Loading states

### Trang đầu

- Skeleton danh sách.
- Skeleton hội thoại.
- Skeleton panel ngữ cảnh.
- Không dùng spinner toàn màn hình lâu nếu từng panel có thể tải độc lập.

### Load lịch sử cũ

- tải khi cuộn lên;
- giữ scroll anchor;
- không nhảy về đầu hoặc cuối.

### Load conversation mới

- giữ list visible;
- hiển thị skeleton trong panel giữa;
- draft của conversation cũ phải được lưu trước khi chuyển.

## 5. Empty states

### Chưa kết nối kênh

Tiêu đề:

```text
Kết nối kênh để nhận tin nhắn tại một nơi
```

Nội dung:

- nêu các kênh đang hỗ trợ;
- giải thích quyền cần cấp;
- CTA `Kết nối tài khoản`.

### Không có conversation

```text
Chưa có cuộc hội thoại nào trong chế độ xem này
```

Có action xóa filter.

### Không có kết quả tìm kiếm

- hiển thị query;
- đề xuất bỏ bớt filter;
- không hiển thị CTA kết nối kênh.

### Conversation chưa chọn

- hướng dẫn chọn một conversation;
- có thể hiển thị shortcut.

## 6. Error states

### Lỗi tải danh sách

- retry panel;
- không xóa dữ liệu cache đang có;
- hiển thị timestamp dữ liệu gần nhất.

### Lỗi tải conversation

- giữ list;
- retry riêng panel giữa;
- có nút mở trên nền tảng nếu có.

### Gửi thất bại

Message bubble giữ nguyên nội dung và draft.

Actions:

- Gửi lại.
- Chỉnh sửa.
- Sao chép.
- Mở nền tảng.
- Xem lý do.

### Permission expired

- banner cố định trong page;
- composer disabled;
- CTA reconnect theo quyền.

### Rate limited

- nêu thời điểm có thể thử lại nếu backend cung cấp;
- không cho spam retry.

### Unknown delivery

- không khẳng định chưa gửi;
- action `Kiểm tra trạng thái`;
- tránh gửi lại tự động.

## 7. New message behavior

Nếu người dùng đang ở cuối timeline:

- append và scroll nhẹ theo pattern hiện có.

Nếu người dùng đã cuộn lên:

- không auto-scroll;
- hiển thị chip `1 tin nhắn mới`;
- click để xuống tin mới.

Nếu người dùng đang soạn:

- giữ draft;
- hiển thị cảnh báo nếu tin mới thay đổi bối cảnh.

## 8. Pagination và hiệu năng

- Virtualize list nếu số conversation lớn.
- Không tải toàn bộ message history.
- Dùng cursor pagination.
- Prefetch conversation gần selection nếu framework hỗ trợ.
- Cache theo workspace và conversation.
- Hủy request cũ khi đổi selection nhanh.
- Không render lại toàn bộ list khi một message status thay đổi.
