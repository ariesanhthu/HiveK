# HIVE-K Unified Inbox — implementation handoff

## Route

- `/inbox`
- `/inbox/:conversationId`

Route dùng optional catch-all của Next.js App Router để cùng một page xử lý danh sách và deep link hội thoại.

## Component tree

```text
InboxPage
├── DashboardSidebar
├── ConversationListPanel
├── ConversationPanel
│   ├── MessageTimeline
│   └── ReplyComposer
└── ConversationContextPanel
```

## State và data boundary

- `features/inbox/types.ts`: domain types cho conversation, message, capability, AI/handling state.
- `features/inbox/services/mock-inbox-adapter.ts`: adapter cùng contract với backend tương lai.
- `features/inbox/data/mock-inbox.ts`: 12 conversation demo, không trộn dữ liệu giả vào JSX.
- `features/inbox/hooks/use-inbox.ts`: filter, selection, draft theo conversation/mode, optimistic send, handoff và assignment.
- Draft được lưu local theo schema key `hivek.inbox-drafts.v1`.
- UI chỉ bật composer dựa trên capability và handling mode, không dựa trên tên nền tảng.

## Luồng AI–người thật

`Tiếp quản` chuyển conversation sang `human`, khóa AI auto-send và ghi system event. `Trả lại AI` chuyển về `suggestion_only`; AI không được tự bật lại sau khi người dùng gửi. Khi thiếu hoặc mâu thuẫn dữ liệu, handoff card nêu lý do nghiệp vụ nhưng không hiển thị chain-of-thought.

## TODO backend

- Thay mock adapter bằng API cursor pagination cho conversation/message.
- Kết nối webhook/WebSocket và deduplicate theo event ID + conversation version.
- Persist draft theo workspace/user nếu cần đồng bộ đa thiết bị.
- Bổ sung idempotency key, retry/unknown-delivery reconciliation và version conflict.
- Trả capability, reply window, native deep link và permission state từ connector thật.
- Kết nối assignment, snooze, tag, knowledge candidate và notification endpoint.
