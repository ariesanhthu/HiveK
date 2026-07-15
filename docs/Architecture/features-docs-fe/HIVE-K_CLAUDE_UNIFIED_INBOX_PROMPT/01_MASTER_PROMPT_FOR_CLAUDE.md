# Prompt tổng cho Claude

Bạn là Senior Product Designer kiêm Senior Frontend Engineer đang làm việc trực tiếp trên repository HIVE-K.

## Bối cảnh sản phẩm

HIVE-K là nền tảng SaaS dùng AI Agent để giúp trung tâm giáo dục, người bán khóa học, đội gia sư, homestay và nhóm kinh doanh nhỏ vận hành nhiều kênh truyền thông trong một workspace.

Hệ thống hiện có các luồng chính:

- Kết nối tài khoản và nguồn dữ liệu.
- Tạo hồ sơ thương hiệu và kho tri thức.
- Lập kế hoạch nội dung.
- Tạo, duyệt, lên lịch và đăng bài.
- Theo dõi chỉ số.
- AI Agent dùng dữ liệu đã được duyệt để gợi ý hoặc trả lời câu hỏi lặp lại.
- Khi thiếu dữ liệu, có xung đột hoặc rủi ro cao, hệ thống phải chuyển cho người thật.

## Nhiệm vụ

Bổ sung một section mới cho business site tên **Hộp thư**.

Section này là hộp thư hợp nhất cho các tài khoản đã kết nối có khả năng nhận và gửi tin nhắn, trước mắt ưu tiên:

- Facebook Messenger của Facebook Page.
- Instagram Direct của tài khoản Instagram Professional.
- Các kênh khác chỉ xuất hiện khi connector khai báo có capability hội thoại phù hợp.

Không giả định TikTok, Threads, Facebook Group hoặc tài khoản cá nhân đều có API nhắn tin. Giao diện phải dựa vào capability thực tế của từng connector.

## Điều bắt buộc phải làm trước khi code

1. Đọc cấu trúc repository.
2. Tìm và đọc file định nghĩa style UI/UX, design token, theme, component library và layout hiện tại.
3. Xác định:
   - framework;
   - router;
   - state management;
   - data fetching;
   - component primitives;
   - icon set;
   - form library;
   - notification/toast;
   - permission model;
   - pattern responsive;
   - convention đặt tên file.
4. Tái sử dụng component hiện có trước khi tạo component mới.
5. Không sửa style toàn cục nếu không thực sự cần.
6. Liệt kê ngắn các file dự kiến tạo hoặc sửa trước khi bắt đầu triển khai.

## Mục tiêu UX

Người dùng mở Hộp thư phải trả lời được ngay các câu hỏi:

- Có bao nhiêu cuộc hội thoại mới?
- Tin nào cần người thật xử lý?
- AI đang tự trả lời cuộc hội thoại nào?
- AI đã trả lời nội dung gì?
- Cuộc hội thoại thuộc page hoặc tài khoản nào?
- Khách đang quan tâm sản phẩm, khóa học, phòng hoặc chiến dịch nào?
- Tôi có thể trả lời ngay ở đâu?
- Tôi có đang nằm trong thời gian được phép gửi tin không?
- Ai đang phụ trách?
- Cuộc hội thoại đang chờ khách, cần theo dõi hay đã hoàn tất?

## Phạm vi triển khai

### Bắt buộc

- Thêm mục `Hộp thư` vào điều hướng business site.
- Hiển thị badge số cuộc hội thoại chưa đọc hoặc cần xử lý.
- Trang hộp thư desktop dạng ba vùng:
  1. danh sách và bộ lọc;
  2. nội dung hội thoại;
  3. thông tin khách hàng và ngữ cảnh.
- Cho phép thu gọn panel ngữ cảnh.
- Có giao diện responsive cho tablet và mobile.
- Nhận cập nhật hội thoại theo event/webhook adapter hoặc mock realtime service.
- Hiển thị rõ nguồn gửi:
  - Khách hàng;
  - AI Agent;
  - người dùng hiện tại;
  - thành viên khác;
  - ghi chú nội bộ.
- Có vùng nhập và gửi tin nhắn.
- Có thao tác:
  - AI gợi ý câu trả lời;
  - dùng câu trả lời mẫu;
  - tạm dừng AI;
  - tiếp quản cuộc hội thoại;
  - trả cuộc hội thoại lại cho AI;
  - gán người xử lý;
  - đổi trạng thái;
  - thêm nhãn;
  - ghi chú nội bộ;
  - đánh dấu ưu tiên;
  - tạm hoãn;
  - hoàn tất.
- Có trạng thái khi hết thời gian gửi tin tự do hoặc connector không cho phép gửi.
- Có hiển thị khi AI bị chặn do thiếu dữ liệu, dữ liệu mâu thuẫn hoặc mức tin cậy thấp.
- Có dữ liệu mẫu đủ cho demo các ngành:
  - trung tâm tiếng Anh;
  - người bán khóa học;
  - homestay.

### Không bắt buộc trong sprint này

- Xây toàn bộ backend connector thật.
- Tự động hóa trái chính sách nền tảng.
- CRM hoàn chỉnh.
- Voice call hoặc video call.
- Thanh toán trong chat.
- Chatbot builder phức tạp.
- Báo cáo nâng cao toàn bộ hệ thống.

## Nguyên tắc AI

Không hiển thị chain-of-thought hoặc suy luận nội bộ của mô hình.

Chỉ được hiển thị các thông tin an toàn và hữu ích:

- nguồn dữ kiện đã dùng;
- FAQ hoặc sản phẩm liên quan;
- mức tin cậy;
- lý do chuyển người ở mức nghiệp vụ;
- cảnh báo dữ liệu thiếu hoặc xung đột;
- hành động đề xuất.

AI không được tự gửi khi:

- người dùng đã tiếp quản;
- cuộc hội thoại đang bị khóa bởi thành viên khác;
- ngoài phạm vi gửi hợp lệ;
- connector chỉ đọc;
- dữ liệu cần dùng chưa được duyệt;
- có xung đột về giá, lịch, ưu đãi, chính sách hoặc cam kết;
- nội dung rủi ro cao;
- khách yêu cầu người thật;
- khách khiếu nại, đòi hoàn tiền hoặc có dấu hiệu khẩn cấp.

## Nguyên tắc kỹ thuật

- Tách UI khỏi data adapter.
- Không hard-code logic nền tảng trong component trình bày.
- Dùng capability object để quyết định nút nào được bật.
- Có typed model cho conversation, participant, message, assignment, agent state và channel capability.
- Bảo toàn draft riêng cho từng cuộc hội thoại.
- Có optimistic state hợp lý nhưng phải rollback khi gửi lỗi.
- Ngăn gửi trùng bằng request key hoặc message client ID.
- Không để AI và người thật gửi đồng thời.
- Không tự cuộn xuống cuối nếu người dùng đang đọc lịch sử cũ.
- Không làm mất vị trí cuộn khi có tin nhắn mới.
- Không đưa secret, access token hoặc raw payload nhạy cảm lên UI.

## Quy trình thực hiện

1. Khảo sát repository và style hiện có.
2. Đề xuất route, component tree và data contract.
3. Triển khai navigation và route.
4. Triển khai dữ liệu mẫu hoặc adapter.
5. Triển khai danh sách hội thoại.
6. Triển khai timeline và composer.
7. Triển khai AI state, handoff và assignment.
8. Triển khai panel ngữ cảnh.
9. Triển khai loading, empty, error và connection states.
10. Triển khai responsive và accessibility.
11. Viết test.
12. Chạy lint, typecheck, test và build.
13. Tóm tắt file đã sửa, giới hạn còn lại và cách kết nối backend thật.

## Không được làm

- Không chỉ tạo một mockup tĩnh.
- Không chỉ dựng một trang giống Messenger.
- Không dùng một textarea đơn giản rồi kết thúc.
- Không ẩn việc AI đã gửi gì.
- Không tự động tiếp tục AI sau khi người dùng tiếp quản.
- Không hiển thị nút gửi khi platform không cho phép.
- Không gắn mọi tin nhắn vào một customer giả duy nhất.
- Không xóa lịch sử hội thoại khi đổi trạng thái.
- Không dùng màu làm tín hiệu trạng thái duy nhất.
- Không tạo dữ liệu giả trực tiếp trong JSX hoặc template.
- Không thêm dependency lớn khi repository đã có giải pháp tương đương.

## Đầu ra cuối cùng Claude phải cung cấp

- Danh sách file tạo mới và file chỉnh sửa.
- Route mới.
- Component tree.
- Data types hoặc interface.
- Mô tả luồng AI–người thật.
- Mô tả connector capability.
- Test đã chạy và kết quả.
- TODO tích hợp backend thật.
- Ảnh chụp hoặc mô tả các trạng thái chính nếu môi trường hỗ trợ.
