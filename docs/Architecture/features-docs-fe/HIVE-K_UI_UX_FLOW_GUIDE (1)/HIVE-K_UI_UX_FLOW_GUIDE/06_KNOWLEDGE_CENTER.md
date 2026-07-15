# 06 — Trung tâm tri thức

## 1. Mục tiêu

Tạo một nơi để tìm, kiểm tra và quản lý dữ liệu mà HIVE-K sử dụng khi tạo nội dung.

## 2. Cấu trúc trang

### Trang tổng quan tri thức

Các khu vực:

- Tìm kiếm
- Dữ kiện cần chú ý
- Mâu thuẫn
- Dữ kiện sắp hết hạn
- Nguồn mới đồng bộ
- Nhóm thực thể chính
- Lịch sử thay đổi gần đây

### Tab đề xuất

- Tất cả
- Thương hiệu
- Sản phẩm
- Ưu đãi và giá
- Khách hàng
- FAQ
- Dữ kiện và bằng chứng
- Nguồn

## 3. Tìm kiếm

Kết quả phải phân biệt:

- dữ kiện;
- thực thể;
- tài liệu nguồn;
- bài viết;
- FAQ.

Bộ lọc:

- loại;
- trạng thái xác nhận;
- nguồn;
- ngày cập nhật;
- độ mới;
- có mâu thuẫn;
- được phép dùng trong nội dung.

## 4. Trang chi tiết dữ kiện

Hiển thị:

- giá trị hiện tại;
- nguồn và trích đoạn liên quan;
- lịch sử phiên bản;
- phạm vi thời gian hiệu lực;
- nội dung nào đã sử dụng;
- mâu thuẫn liên quan;
- người xác nhận gần nhất.

Hành động theo quyền:

- xác nhận;
- sửa;
- chặn sử dụng;
- đặt thời gian hết hạn;
- thay nguồn ưu tiên.

## 5. Trang chi tiết nguồn

Hiển thị:

- loại nguồn;
- trạng thái kết nối;
- lần đồng bộ;
- phiên bản/snapshot;
- dữ kiện đã trích xuất;
- lỗi parse;
- phạm vi quyền;
- nút đồng bộ lại;
- nút thu hồi quyền.

Không cho phép sửa trực tiếp nội dung nguồn ngoài nếu connector không hỗ trợ quyền ghi.

## 6. Hàng chờ mâu thuẫn

Sắp xếp theo:

1. Đang chặn bài hoặc kế hoạch
2. Liên quan giá, lịch, ưu đãi, chính sách
3. Dữ kiện được dùng nhiều
4. Dữ kiện sắp đăng
5. Mức độ còn lại

Bulk action chỉ áp dụng cho mâu thuẫn cùng loại và có điều kiện rõ ràng.

## 7. Hàng chờ dữ liệu thiếu

Mỗi mục có một hành động cụ thể:

- Mở nguồn
- Tải tài liệu
- Nhập dữ kiện
- Chọn giá trị
- Mời người có quyền xử lý
- Đánh dấu không áp dụng

## 8. Hành vi khi dữ kiện thay đổi

Nếu dữ kiện ảnh hưởng đến bài nháp hoặc bài đã lên lịch:

- hiển thị số bài bị ảnh hưởng;
- cho phép xem danh sách;
- đề xuất cập nhật;
- không âm thầm sửa nội dung đã duyệt;
- bài đã lên lịch phải quay lại trạng thái cần kiểm tra nếu thay đổi nghiêm trọng.

## 9. Tiêu chí nghiệm thu

- Tìm được một dữ kiện theo từ khóa và theo thực thể liên quan.
- Mỗi dữ kiện có provenance rõ ràng.
- Có lịch sử và trạng thái hiệu lực.
- Dữ kiện thay đổi tạo cảnh báo đúng cho bài liên quan.
- Không rò dữ liệu giữa workspace.
