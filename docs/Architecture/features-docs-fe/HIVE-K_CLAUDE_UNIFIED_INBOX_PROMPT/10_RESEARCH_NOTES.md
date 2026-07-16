# Ghi chú nghiên cứu

## 1. Định hướng từ HIVE-K

HIVE-K không chỉ là công cụ tạo nội dung. Hệ thống cần nối:

```text
thương hiệu
→ sản phẩm
→ chiến dịch/bài đăng
→ hội thoại
→ khách hỏi
→ kết quả
→ dữ liệu học cho chu kỳ tiếp theo
```

Hộp thư vì vậy không được tách rời khỏi:

- kho tri thức;
- FAQ;
- sản phẩm;
- chiến dịch;
- bài đăng;
- trạng thái AI;
- phân quyền workspace;
- chỉ số kinh doanh.

## 2. Mẫu UX từ các hộp thư hợp nhất

Các sản phẩm quản trị hội thoại phổ biến thường có:

- list conversation;
- assignment;
- priority;
- snooze;
- close/resolve;
- internal note;
- saved reply/macro;
- bulk action;
- customer context;
- routing;
- AI–human handoff.

HIVE-K chỉ dùng các pattern phù hợp, không sao chép giao diện nguyên bản.

## 3. Meta Messaging

Các điểm cần phản ánh vào thiết kế:

- Messenger và Instagram Messaging dùng API và webhook để đọc/nhận conversation trong phạm vi quyền.
- Facebook Page cần quyền liên quan đến messaging.
- Instagram messaging áp dụng cho tài khoản chuyên nghiệp và quyền phù hợp.
- Tin nhắn tự do chịu giới hạn thời gian phản hồi tiêu chuẩn.
- Connector phải báo capability, permission và thời hạn gửi cho frontend.
- Có trường hợp conversation được một hệ thống khác kiểm soát; cần tránh gửi trùng.
- Không hard-code policy vào component trình bày.

## 4. Accessibility cho chat

Chat timeline là vùng cập nhật tuần tự.

Cần:

- semantics log/live region phù hợp;
- thông báo tin mới không cưỡng ép focus;
- lỗi được screen reader nhận biết;
- internal note có nhãn rõ;
- keyboard navigation;
- focus management cho drawer/dialog;
- trạng thái không chỉ dùng màu.

## 5. Nguồn tham khảo chính

### Meta for Developers

- Messenger Platform — Send Messages  
  https://developers.facebook.com/documentation/business-messaging/messenger-platform/send-messages

- Messenger and Instagram Messaging policy  
  https://developers.facebook.com/documentation/business-messaging/messenger-platform/policy

- Messenger Platform — Conversations API  
  https://developers.facebook.com/documentation/business-messaging/messenger-platform/conversations

- Messenger Platform — Webhooks  
  https://developers.facebook.com/documentation/business-messaging/messenger-platform/webhooks

- Messenger Platform — Overview and permissions  
  https://developers.facebook.com/documentation/business-messaging/messenger-platform/overview

- Instagram Messaging  
  https://developers.facebook.com/documentation/business-messaging/instagram-messaging

- Instagram Conversations API  
  https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/conversations-api/

- Conversation Routing  
  https://developers.facebook.com/documentation/business-messaging/messenger-platform/conversation-routing

### UX vận hành inbox

- Intercom — Get started with Inbox  
  https://www.intercom.com/help/en/articles/6274899-get-started-with-intercom-inbox

- Intercom — Assign conversations  
  https://www.intercom.com/help/en/articles/6561699-assign-conversations-to-teammates-and-teams

- Intercom — Work as a team and respond at scale  
  https://www.intercom.com/help/en/articles/6988841-work-as-a-team-and-respond-to-conversations-at-scale

- HubSpot — Conversations Inbox overview  
  https://knowledge.hubspot.com/inbox/overview-of-the-conversations-inbox

- HubSpot — Connect channels to Inbox  
  https://knowledge.hubspot.com/inbox/connect-channels-to-the-conversations-inbox

- Zendesk — Agent Workspace for messaging  
  https://support.zendesk.com/hc/en-us/articles/4408821905434-Agent-Workspace-for-messaging

### Accessibility

- WAI-ARIA  
  https://www.w3.org/TR/wai-aria-1.2/

- WAI technique: role log  
  https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA23

- ARIA Authoring Practices Guide  
  https://www.w3.org/WAI/ARIA/apg/

## 6. Kết luận thiết kế

Section Hộp thư của HIVE-K nên được xây như một **bàn điều phối hội thoại có AI**, không phải một chatbot độc lập.

Giá trị khác biệt cần thể hiện ngay trong UX:

- hội thoại gắn với dữ liệu thương hiệu đã duyệt;
- AI trả lời minh bạch;
- người dùng tiếp quản dễ dàng;
- ngoại lệ được chuyển người;
- câu hỏi mới quay lại kho tri thức;
- kết quả hội thoại quay lại phân tích chiến dịch và nội dung.
