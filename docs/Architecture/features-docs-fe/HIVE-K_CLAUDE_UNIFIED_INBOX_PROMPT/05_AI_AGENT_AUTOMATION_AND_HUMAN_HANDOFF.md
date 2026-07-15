# AI Agent, tự động hóa và chuyển người thật

## 1. Mục tiêu

AI hỗ trợ giảm câu hỏi lặp lại nhưng không che giấu trạng thái hoặc vượt quyền.

Người dùng luôn phải biết:

- AI có đang bật không;
- AI đã trả lời tin nào;
- AI dùng dữ liệu nào;
- vì sao AI không trả lời;
- ai đang chịu trách nhiệm;
- cách tiếp quản;
- cách bật lại AI.

## 2. Trạng thái AI cấp conversation

```text
inactive
suggestion_only
active
preparing_reply
waiting_for_approval
paused_by_user
paused_by_policy
blocked_missing_data
blocked_conflict
blocked_low_confidence
handoff_requested
failed
```

UI copy tương ứng:

- Không hoạt động
- Chỉ gợi ý
- Đang tự động xử lý
- Đang chuẩn bị câu trả lời
- Chờ duyệt
- Người dùng đã tạm dừng
- Tạm dừng theo chính sách
- Thiếu dữ liệu
- Dữ liệu mâu thuẫn
- Chưa đủ chắc chắn
- Đã chuyển người
- Xử lý lỗi

## 3. Điều kiện AI được tự trả lời

Tối thiểu phải thỏa:

- channel có quyền gửi;
- conversation đang trong thời gian hợp lệ;
- handling mode cho phép;
- không có human lock;
- intent thuộc nhóm được phép;
- dữ kiện cần dùng đã được duyệt và còn hiệu lực;
- không có xung đột blocking;
- confidence đạt ngưỡng;
- nội dung không thuộc nhóm rủi ro;
- khách không yêu cầu người thật;
- không có pending outgoing message khác.

## 4. Nhóm câu hỏi phù hợp tự động có giới hạn

Ví dụ:

- địa chỉ;
- giờ hoạt động;
- lịch học đã duyệt;
- học phí đã duyệt;
- tiện ích homestay;
- chính sách cơ bản;
- cách đăng ký;
- link form;
- nội dung FAQ lặp lại.

Không hard-code theo ngành; dùng policy/rule từ backend.

## 5. Nhóm bắt buộc chuyển người

Ví dụ:

- giá hoặc lịch có nhiều phiên bản mâu thuẫn;
- yêu cầu giảm giá riêng;
- khiếu nại;
- hoàn tiền;
- tranh chấp;
- cam kết kết quả;
- yêu cầu pháp lý;
- khách bức xúc mạnh;
- yêu cầu nói chuyện với người thật;
- thông tin cá nhân nhạy cảm;
- yêu cầu ngoài phạm vi dữ liệu;
- connector báo không thể gửi;
- nhiều lần AI không giải quyết được.

## 6. HumanHandoffCard

Card xuất hiện trong timeline và/hoặc đầu conversation.

Nội dung:

- `Cần người thật xử lý`.
- Lý do ngắn.
- Tin nhắn khách gần nhất.
- Ý định được nhận diện.
- Dữ liệu đã tìm.
- Phần còn thiếu hoặc mâu thuẫn.
- Câu trả lời nháp nếu vẫn có thể hỗ trợ.
- Người/team đề xuất.
- Thời gian đã chờ.

Actions:

- `Tiếp quản`
- `Gán người xử lý`
- `Dùng câu trả lời nháp`
- `Bổ sung dữ liệu`
- `Mở nguồn mâu thuẫn`
- `Đánh dấu không cần chuyển`

## 7. Cơ sở trả lời

Không hiển thị reasoning.

Chỉ hiển thị:

```text
Cơ sở trả lời
- FAQ: Học phí khóa IELTS Foundation
- Dữ kiện: Lịch khai giảng 05/08/2026
- Nguồn: Hồ sơ khóa học đã duyệt
- Độ tin cậy: Cao
```

Mức tin cậy:

- Cao
- Trung bình
- Thấp

Phải có tooltip giải thích đây là độ tin cậy hệ thống, không phải bảo đảm đúng tuyệt đối.

## 8. Feedback cho AI

Trên AI message hoặc suggested reply:

- Phù hợp.
- Chưa phù hợp.
- Sai dữ kiện.
- Không đúng giọng văn.
- Không nên tự trả lời.
- Thiếu thông tin.

Nếu người dùng sửa câu AI:

- lưu diff như tín hiệu học;
- không tự biến một lần sửa thành rule vĩnh viễn;
- thay đổi giá/lịch/chính sách phải dẫn đến bước xác nhận dữ kiện, không chỉ học style.

## 9. Tạo FAQ candidate từ hội thoại

Khi câu hỏi lặp lại hoặc người dùng trả lời thủ công nhiều lần:

- hiển thị suggestion `Tạo FAQ từ câu trả lời này`.
- mở form review:
  - câu hỏi chuẩn hóa;
  - câu trả lời;
  - sản phẩm liên quan;
  - ngày hiệu lực;
  - nguồn;
  - người duyệt.
- không thêm thẳng vào kho tri thức nếu chưa duyệt.

## 10. Tóm tắt hội thoại

Cho phép AI tạo tóm tắt an toàn:

- nhu cầu khách;
- sản phẩm quan tâm;
- câu hỏi đã giải quyết;
- việc còn lại;
- follow-up;
- trạng thái lead.

Không tóm tắt suy đoán nhạy cảm thành sự thật.

## 11. Chế độ tự động cấp workspace và conversation

Workspace có policy mặc định.

Conversation có override.

Thứ tự ưu tiên:

```text
policy bắt buộc của hệ thống
> giới hạn nền tảng
> quyền workspace
> override conversation
> mặc định workspace
```

UI phải cho biết khi conversation không thể thay đổi mode do policy cao hơn.
