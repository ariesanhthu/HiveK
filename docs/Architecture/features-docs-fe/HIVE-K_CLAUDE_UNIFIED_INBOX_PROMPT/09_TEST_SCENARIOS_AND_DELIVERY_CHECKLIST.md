# Kịch bản kiểm thử và checklist bàn giao

## 1. Dữ liệu demo bắt buộc

Tạo ít nhất các account:

- `HIVE-K English Center` — Facebook Messenger.
- `HIVE-K English Center` — Instagram Direct.
- `Mây Homestay` — Facebook Messenger.
- Một account read-only.
- Một account permission expired.

Tạo ít nhất 12 conversation để thể hiện đầy đủ trạng thái.

## 2. Kịch bản 1 — AI trả lời thành công

Khách:

```text
Lớp IELTS Foundation khai giảng ngày nào và học phí bao nhiêu?
```

AI:

- tìm đúng FAQ;
- dùng lịch và học phí đã duyệt;
- gửi câu trả lời;
- bubble có label AI;
- phần cơ sở trả lời xem được;
- conversation chuyển sang `Đang chờ khách`.

## 3. Kịch bản 2 — Giá bị mâu thuẫn

Khách:

```text
Học phí hiện tại là 3,5 triệu hay 3,8 triệu vậy?
```

Hệ thống:

- phát hiện hai nguồn giá;
- AI không tự trả lời;
- tạo handoff;
- hiển thị hai nguồn;
- cho người dùng tiếp quản;
- người dùng trả lời thủ công;
- có suggestion bổ sung/cập nhật dữ kiện.

## 4. Kịch bản 3 — Người dùng tiếp quản

- AI đang active.
- Người dùng bấm `Tiếp quản`.
- AI stop auto-send.
- Timeline có system event.
- Người dùng gửi tin.
- Reload trang.
- Conversation vẫn ở mode Người trực tiếp.
- AI không tự bật lại.

## 5. Kịch bản 4 — Trả lại AI

- Conversation đang human mode.
- Người dùng bấm `Trả lại AI`.
- Chọn `AI đề xuất để duyệt`.
- Tin mới đến.
- AI tạo draft nhưng không gửi.
- Người dùng chỉnh và gửi.

## 6. Kịch bản 5 — Tin mới khi đang đọc lịch sử

- Người dùng cuộn lên.
- Tin mới đến.
- Timeline không tự nhảy.
- Hiển thị `1 tin nhắn mới`.
- Click chip xuống đúng vị trí.

## 7. Kịch bản 6 — Draft

- Soạn dở conversation A.
- Chuyển sang B.
- Quay lại A.
- Draft còn nguyên.
- List item A có badge Bản nháp.
- Gửi thành công thì badge biến mất.

## 8. Kịch bản 7 — Hết reply window

- Conversation có reply window expired.
- Composer disabled.
- Có giải thích.
- Không thể bypass bằng shortcut.
- Có `Mở trên nền tảng` nếu capability hỗ trợ.

## 9. Kịch bản 8 — Mất quyền connector

- Account chuyển permission expired.
- Banner xuất hiện.
- Composer disabled.
- Dữ liệu cache vẫn xem được nếu policy cho phép.
- Chỉ admin thấy CTA reconnect.

## 10. Kịch bản 9 — Gửi thất bại

- User gửi message.
- UI hiển thị sending.
- Adapter trả lỗi.
- Bubble chuyển failed.
- Nội dung không mất.
- Có retry.
- Retry không tạo duplicate khi thành công.

## 11. Kịch bản 10 — Hai người cùng xử lý

- Member A mở conversation.
- Member B nhận assignment hoặc typing state.
- UI cảnh báo ownership.
- Không để cả AI và B tự gửi đồng thời.
- Gửi có version conflict thì yêu cầu refresh/review.

## 12. Kịch bản 11 — Ghi chú nội bộ

- Chọn mode Ghi chú nội bộ.
- Composer label luôn hiện.
- Note hiển thị khác reply.
- Note không gửi qua connector.
- Có author và timestamp.

## 13. Kịch bản 12 — Mobile

- Mở list.
- Chọn conversation.
- Mở context bottom sheet.
- Soạn và gửi.
- Keyboard không che action.
- Back giữ filter và scroll.

## 14. Test đề xuất

### Unit

- mapper capability → disabled actions;
- state reducer realtime;
- unread count;
- draft persistence;
- permission check;
- reply window formatter;
- AI mode transition.

### Component

- ConversationListItem variants;
- MessageBubble variants;
- HandoffCard actions;
- Composer reply/note mode;
- error retry;
- empty states.

### Integration

- open conversation;
- send message;
- takeover;
- return to AI;
- assignment;
- realtime message receive;
- permission expiration.

### End-to-end

Tối thiểu:

```text
Mở inbox
→ chọn conversation cần người thật
→ tiếp quản
→ nhập câu trả lời
→ gửi
→ chuyển đang chờ khách
```

và:

```text
Mở conversation AI xử lý
→ xem AI reply
→ xem cơ sở trả lời
→ đánh dấu sai dữ kiện
→ tạo FAQ candidate hoặc mở kho tri thức
```

## 15. Checklist bàn giao

Claude phải trả:

- [ ] File đã tạo/sửa.
- [ ] Route.
- [ ] Component tree.
- [ ] Data adapter.
- [ ] Mock data tách riêng.
- [ ] Types.
- [ ] Realtime handling.
- [ ] Loading/empty/error.
- [ ] Responsive.
- [ ] Accessibility.
- [ ] Unit/component/integration test.
- [ ] Lint/typecheck/build.
- [ ] Backend TODO.
- [ ] Giới hạn connector.
- [ ] Không sửa style toàn cục ngoài phạm vi.
