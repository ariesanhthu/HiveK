# Component cho Hộp thư hợp nhất

## 1. Component tree tham khảo

Tên phải điều chỉnh theo convention repository.

```text
UnifiedInboxPage
├── InboxHeader
├── InboxViewTabs
├── InboxFilterBar
├── InboxConnectionBanner
├── ConversationListPanel
│   ├── ConversationListToolbar
│   ├── BulkActionBar
│   ├── ConversationList
│   │   └── ConversationListItem
│   └── ConversationListPaginationOrLoader
├── ConversationPanel
│   ├── ConversationHeader
│   ├── ConversationStatusStrip
│   ├── MessageTimeline
│   │   ├── TimelineDateDivider
│   │   ├── MessageBubble
│   │   ├── AgentActionCard
│   │   ├── HumanHandoffCard
│   │   ├── InternalNote
│   │   ├── SystemEvent
│   │   └── NewMessageAnchor
│   └── ReplyComposer
│       ├── ReplyModeSelector
│       ├── SuggestedReplyPanel
│       ├── MessageInput
│       ├── AttachmentPreview
│       ├── SendCapabilityNotice
│       └── ComposerActions
└── ConversationContextPanel
    ├── CustomerSummary
    ├── LeadAndTags
    ├── ProductOrCampaignContext
    ├── AIContextSummary
    ├── AssignmentAndStatus
    ├── ConversationAutomationSettings
    └── ActivityHistory
```

## 2. Header

`InboxHeader` gồm:

- Tiêu đề `Hộp thư`.
- Tổng số cuộc hội thoại cần xử lý.
- Tìm kiếm.
- Nút bộ lọc nâng cao.
- Bộ chọn workspace nếu business site hiện có.
- Trạng thái realtime hoặc lần đồng bộ gần nhất.
- Nút `Kết nối kênh` chỉ hiển thị với người có quyền.
- Nút refresh không thay thế realtime, chỉ là thao tác phục hồi.

### Tìm kiếm

Tìm theo:

- tên khách;
- nội dung tin nhắn;
- số điện thoại hoặc email nếu có quyền hiển thị;
- tên page/account;
- sản phẩm hoặc chiến dịch;
- tag;
- mã conversation.

Kết quả phải nêu phần khớp và không phá vỡ filter hiện tại.

## 3. Bộ lọc

Filter chính:

- Trạng thái.
- Chưa đọc.
- Cần người thật.
- AI đã trả lời.
- AI bị chặn.
- Chưa phân công.
- Người phụ trách.
- Nền tảng.
- Tài khoản/page.
- Mức ưu tiên.
- Tag.
- Sản phẩm.
- Chiến dịch hoặc bài đăng nguồn.
- Thời gian chờ phản hồi.
- Khoảng ngày.

Có nút:

- `Xóa bộ lọc`.
- `Lưu chế độ xem` nếu sản phẩm đã có pattern saved view.
- Hiển thị số filter đang áp dụng.

## 4. ConversationListItem

Mỗi item cần hiển thị vừa đủ để triage:

- avatar khách hoặc fallback;
- tên khách;
- icon nền tảng;
- tên page/account nhận tin;
- đoạn tin gần nhất;
- thời gian;
- số tin chưa đọc;
- trạng thái AI;
- người phụ trách;
- mức ưu tiên;
- tag quan trọng;
- trạng thái chờ;
- dấu draft chưa gửi;
- dấu lỗi gửi hoặc mất kết nối nếu có.

### Thứ tự ưu tiên nội dung

1. Tên khách.
2. Tin gần nhất.
3. Kênh và account.
4. Trạng thái cần hành động.

Không nhồi toàn bộ metadata vào list item.

### Trạng thái nổi bật

- `Cần bạn xử lý`
- `AI đang trả lời`
- `AI đã trả lời`
- `Đang chờ khách`
- `Chưa phân công`
- `Gửi thất bại`
- `Ngoài thời gian gửi`
- `Đã hoàn tất`

Không chỉ dùng màu; phải có text hoặc icon có label.

## 5. ConversationHeader

Hiển thị:

- tên khách;
- channel và account;
- trạng thái online nếu nguồn cung cấp đáng tin;
- conversation status;
- assignee;
- AI mode;
- nút ưu tiên;
- nút thêm hành động;
- nút mở panel ngữ cảnh trên màn hình nhỏ.

Hành động nhanh:

- Tiếp quản.
- Tạm dừng AI.
- Trả lại AI.
- Gán người xử lý.
- Tạm hoãn.
- Hoàn tất.
- Mở trên nền tảng gốc nếu connector có deep link.
- Báo cáo spam hoặc chặn chỉ khi API và quyền hỗ trợ.

## 6. MessageBubble

Mỗi message cần có:

- tác giả;
- avatar hoặc loại tác giả;
- thời gian;
- nội dung;
- attachment;
- trạng thái gửi;
- channel message ID chỉ dùng nội bộ;
- label nguồn gửi.

### Loại message

```text
customer
ai_agent
current_user
workspace_member
internal_note
system_event
```

### AI message

Bắt buộc có label rõ:

```text
AI Agent đã trả lời tự động
```

hoặc:

```text
AI Agent đề xuất — chưa gửi
```

AI bubble có phần mở rộng `Cơ sở trả lời`, gồm:

- FAQ đã dùng;
- sản phẩm/dịch vụ liên quan;
- dữ kiện đã duyệt;
- mức tin cậy;
- cảnh báo nếu có.

Không hiển thị suy luận nội bộ hoặc chain-of-thought.

### Internal note

- Khác biệt rõ với tin gửi khách.
- Composer phải chuyển mode rõ ràng giữa `Trả lời khách` và `Ghi chú nội bộ`.
- Không dùng cùng nút gửi mà chỉ đổi màu mơ hồ.
- Trước khi gửi note, label phải luôn nhìn thấy.

## 7. AgentActionCard

Dùng cho sự kiện AI, ví dụ:

- AI phân loại ý định.
- AI tìm được FAQ.
- AI gửi câu trả lời.
- AI dừng vì thiếu thông tin.
- AI chuyển người.
- AI đề xuất bổ sung FAQ.

Card hiển thị ngắn, có thể expand.

Không biến timeline thành log kỹ thuật dài.

## 8. ConversationContextPanel

Các section:

### Khách hàng

- tên;
- avatar;
- username nền tảng;
- thông tin liên hệ đã được phép lưu;
- khu vực;
- lịch sử hội thoại;
- lần tương tác gần nhất.

### Phân loại

- lead stage;
- tags;
- ưu tiên;
- nhu cầu hoặc ý định;
- sentiment chỉ hiển thị như tín hiệu, không khẳng định tuyệt đối.

### Ngữ cảnh kinh doanh

- sản phẩm/khóa học/phòng liên quan;
- chiến dịch;
- bài đăng hoặc quảng cáo dẫn đến cuộc hội thoại;
- nguồn lead;
- lịch, giá hoặc offer hiện hành đã duyệt.

### AI

- AI mode;
- mức tin cậy;
- dữ kiện đang dùng;
- câu hỏi chưa có FAQ;
- lý do chuyển người;
- nút `Bổ sung vào kho tri thức`.

### Quản lý

- assignee;
- team;
- trạng thái;
- follow-up;
- lịch sử thay đổi;
- audit rút gọn.

Panel phải collapsible và không làm mất vị trí đọc tin nhắn.
