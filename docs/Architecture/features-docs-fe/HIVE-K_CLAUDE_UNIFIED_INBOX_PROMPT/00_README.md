# HIVE-K — Bộ prompt bổ sung giao diện Hộp thư hợp nhất

## Mục đích

Bộ tài liệu này dùng để giao cho Claude thực hiện một **section Hộp thư hợp nhất** trong business site HIVE-K.

Section mới phải giúp người dùng:

- Nhận tin nhắn từ Facebook Messenger, Instagram và các kênh đã kết nối có hỗ trợ hội thoại.
- Xem toàn bộ cuộc hội thoại trong một nơi.
- Biết rõ tin nhắn nào do khách gửi, AI Agent trả lời, người dùng trả lời hoặc thành viên khác xử lý.
- Có thể tạm dừng AI, tiếp quản cuộc hội thoại và trả lời trực tiếp ngay trong HIVE-K.
- Biết khi nào AI không đủ dữ liệu và cần chuyển cho người thật.
- Quản lý trạng thái, người phụ trách, mức ưu tiên và lịch sử xử lý.
- Không giả định mọi nền tảng đều hỗ trợ đọc và gửi tin nhắn qua API.

## Phạm vi thiết kế

Bộ prompt **không định nghĩa lại style UI/UX**.

Claude phải sử dụng file style, design token, component library, layout, typography, màu sắc, icon và quy ước responsive đang có trong repository.

Không được:

- Tạo một design system mới.
- Đổi style toàn website.
- Tự ý sửa các màn hình không liên quan.
- Dùng màu nền tảng làm màu chủ đạo mới nếu style hiện tại không có.
- Sao chép nguyên giao diện Messenger, Intercom, Zendesk hoặc HubSpot.

## Cách sử dụng

1. Đưa toàn bộ thư mục này vào context của Claude.
2. Yêu cầu Claude đọc theo thứ tự:
   - `01_MASTER_PROMPT_FOR_CLAUDE.md`
   - `02_INFORMATION_ARCHITECTURE_AND_ENTRY_FLOW.md`
   - `03_UNIFIED_INBOX_COMPONENTS.md`
   - `04_CONVERSATION_REPLY_AND_TEAM_WORKFLOW.md`
   - `05_AI_AGENT_AUTOMATION_AND_HUMAN_HANDOFF.md`
   - `06_CHANNEL_CAPABILITY_AND_POLICY_STATES.md`
   - `07_DATA_EVENTS_LOADING_AND_ERROR_STATES.md`
   - `08_RESPONSIVE_ACCESSIBILITY_AND_ACCEPTANCE.md`
   - `09_TEST_SCENARIOS_AND_DELIVERY_CHECKLIST.md`
   - `10_RESEARCH_NOTES.md`
3. Cho Claude truy cập repository hiện tại.
4. Claude phải kiểm tra file style/UI chung trước khi viết code.
5. Nếu backend chưa có API thật, Claude được phép dùng adapter hoặc dữ liệu giả có kiểu dữ liệu rõ ràng, nhưng không được trộn dữ liệu giả trực tiếp vào component.

## Kết quả mong đợi

- Một section `Hộp thư` hoàn chỉnh trong business site.
- Có luồng nhận tin, đọc hội thoại, xem AI trả lời, tiếp quản và gửi tin thủ công.
- Có trạng thái xử lý và khả năng chuyển lại cho AI.
- Có dữ liệu mẫu đủ để demo.
- Có tài liệu mô tả route, component, state và phần backend còn thiếu.
