# HIVE-K — Bản thiết kế tổng thể hệ thống Agentic bằng Python

## 1. Mục tiêu của bộ tài liệu

Bộ tài liệu này thay thế hướng triển khai cũ thiên về một lớp gọi mô hình ngôn ngữ trong backend bằng một **hệ thống agentic có trạng thái, có dữ liệu, có đồ thị tri thức, có vòng học và có khả năng vận hành lâu dài**.

HIVE-K không được xây như một chatbot hoặc một công cụ “nhập prompt → nhận caption”. Hệ thống phải:

- Tự thu thập và chuẩn hóa dữ liệu sau khi người dùng kết nối tài khoản, website, Drive hoặc tải tệp lên.
- Tự tạo hồ sơ thương hiệu, sản phẩm, khách hàng, câu hỏi thường gặp, giọng văn và quy tắc nội dung.
- Phát hiện dữ liệu thiếu hoặc mâu thuẫn rồi chỉ hỏi người dùng những câu cần thiết.
- Duy trì đồ thị tri thức có nguồn, phiên bản, độ tin cậy và lịch sử thay đổi.
- Tạo kế hoạch nội dung và bài đăng theo từng nền tảng, tài khoản, vai trò kênh và tầng phễu.
- Học từ bài được duyệt, phần người dùng sửa, bài bị từ chối và hiệu quả sau đăng.
- Dùng thuật toán, mô hình học máy và xử lý ngôn ngữ ở nơi phù hợp; không ép mọi việc qua mô hình ngôn ngữ.
- Giảm chi phí và số token bằng truy xuất có chọn lọc, tóm tắt phân tầng, bộ nhớ có cấu trúc, bộ nhớ đệm và định tuyến mô hình.
- Không tự đăng, gửi tin, thay đổi dữ liệu quan trọng hoặc liên hệ cộng tác viên khi chưa có quyền và bước duyệt phù hợp.

Đối tượng ưu tiên của HIVE-K là nhóm vận hành nhiều tài khoản mạng xã hội, thường có 5–10 tài khoản và nhu cầu tạo số lượng bài lớn hằng ngày; trước mắt tập trung vào trung tâm giảng dạy, người bán khóa học, homestay và bất động sản nhỏ.

---

## 2. Điểm phải sửa so với thiết kế cũ

Thiết kế cũ có các phần tốt cần giữ:

- Luồng từng bước thay vì bắt người dùng nhập một prompt dài.
- Bài viết riêng cho từng nền tảng.
- Có kiểm tra dữ kiện, duyệt trước khi đăng và ghi nhận phản hồi.
- Có tách tác vụ tiếp nhận dữ liệu, lập kế hoạch, viết nội dung và kiểm tra.

Tuy nhiên, thiết kế cũ chưa đáp ứng yêu cầu mới vì:

1. Quá tập trung vào form nhập thủ công; chưa có quá trình khám phá dữ liệu tự động sau khi kết nối.
2. Bộ nhớ chủ yếu là tìm kiếm vector; chưa có bản thể tri thức, quan hệ, nguồn gốc và cơ chế cập nhật liên tục.
3. Chưa tách rõ tác vụ xác định bằng thuật toán với tác vụ cần suy luận bằng mô hình ngôn ngữ.
4. Chưa có kiến trúc chạy bền vững cho tiến trình dài, lỗi mạng, giới hạn API, webhook, lịch đồng bộ và tiếp tục sau khi hệ thống khởi động lại.
5. Chưa có chiến lược học máy cho xếp hạng nội dung, phát hiện xu hướng, học phong cách và tối ưu thử nghiệm.
6. Chưa có “trình biên dịch ngữ cảnh” để chọn đúng dữ liệu và giới hạn token.
7. Chưa có tiêu chuẩn đánh giá hồi quy, tập kiểm thử, quan sát chi phí, độ trễ và chất lượng theo từng nút.
8. Dùng nhiều “agent” cho cả công việc có thể viết bằng hàm xác định, làm hệ thống khó kiểm soát và tốn chi phí.

---

## 3. Quyết định kiến trúc chính

### 3.1. Ngăn xếp đề xuất

| Lớp                 | Công nghệ đề xuất                                              | Vai trò                                                   |
| ------------------- | -------------------------------------------------------------- | --------------------------------------------------------- |
| API                 | FastAPI + Pydantic v2                                          | API typed, hợp đồng dữ liệu, streaming sự kiện            |
| Đồ thị suy luận     | LangGraph                                                      | Trạng thái, nhánh điều kiện, checkpoint, dừng để duyệt    |
| Tiến trình bền vững | Temporal Python SDK                                            | Đồng bộ dài, retry, lịch chạy, webhook, publish, vòng học |
| Dữ liệu nghiệp vụ   | PostgreSQL                                                     | Nguồn dữ liệu chuẩn, giao dịch, phiên bản, audit          |
| Tìm kiếm ngữ nghĩa  | pgvector + full-text search                                    | Truy xuất lai từ khóa + ngữ nghĩa                         |
| Đồ thị tri thức     | Neo4j                                                          | Thực thể, quan hệ, truy vấn theo ngữ cảnh và GraphRAG     |
| Bộ nhớ đệm          | Redis                                                          | Cache, rate limit, khóa phân tán, hàng đợi nhẹ            |
| Tệp                 | S3/MinIO                                                       | Tài liệu, ảnh, video, snapshot nguồn                      |
| Quan sát AI         | Langfuse + OpenTelemetry                                       | Trace, token, độ trễ, prompt version, đánh giá            |
| Kết nối công cụ     | Adapter nội bộ, tương thích MCP                                | Chuẩn hóa tài nguyên, công cụ và quyền                    |
| Học máy             | scikit-learn, sentence-transformers, LightGBM, BERTopic, River | Phân loại, clustering, xếp hạng, chủ đề, học trực tuyến   |

### 3.2. Vì sao không dùng một framework duy nhất

- **LangGraph** chịu trách nhiệm cho luồng suy luận có trạng thái và chờ người dùng duyệt.
- **Temporal** chịu trách nhiệm cho tiến trình có tác dụng phụ và kéo dài: OAuth, đồng bộ Drive, crawl, webhook, retry API, lên lịch đăng, thu KPI.
- **PostgreSQL** là nguồn dữ liệu chuẩn; không để Neo4j hoặc vector store trở thành nơi duy nhất giữ sự thật.
- **Neo4j** lưu quan hệ và hỗ trợ truy xuất theo đồ thị; không thay thế dữ liệu giao dịch.
- **Mô hình ngôn ngữ** chỉ xử lý phần cần hiểu ngôn ngữ, tổng hợp hoặc suy luận; các bước kiểm tra quyền, lọc ngày, tính điểm, deduplicate, rate limit và ghi dữ liệu phải là mã xác định.

---

## 4. Ba mặt phẳng của hệ thống

```text
┌──────────────────────────────────────────────────────────────────┐
│ MẶT PHẲNG ĐIỀU KHIỂN                                             │
│ Auth · quyền · quota · workflow · duyệt · audit · cấu hình model │
└──────────────────────────────────────────────────────────────────┘
                 │
┌──────────────────────────────────────────────────────────────────┐
│ MẶT PHẲNG DỮ LIỆU                                                │
│ Connector → snapshot → parse → chuẩn hóa → graph/vector/storage  │
└──────────────────────────────────────────────────────────────────┘
                 │
┌──────────────────────────────────────────────────────────────────┐
│ MẶT PHẲNG TRÍ TUỆ                                               │
│ Router → context compiler → planner → writer → validator → learn │
└──────────────────────────────────────────────────────────────────┘
```

Không để agent gọi trực tiếp mọi API. Agent chỉ gọi các công cụ đã được đăng ký, có quyền, schema, idempotency key và audit.

---

## 5. Luồng người dùng tối giản

```text
1. Tạo workspace
2. Kết nối tài khoản / website / Drive hoặc tải tệp
3. HIVE-K tự đọc và tạo “Bản chụp thương hiệu”
4. HIVE-K hiển thị:
   - thông tin đã hiểu
   - thông tin chưa chắc
   - thông tin còn thiếu
5. Người dùng xác nhận hoặc sửa
6. HIVE-K tạo 3 bài mẫu để hiệu chỉnh giọng văn
7. Người dùng chọn/sửa bài mẫu
8. Workspace chuyển sang trạng thái sẵn sàng
9. Người dùng chỉ cần yêu cầu:
   - tạo kế hoạch nội dung
   - tạo bài cho một kênh
   - cập nhật theo ưu đãi/lịch/phòng trống
10. Hệ thống theo dõi phản hồi và học dần
```

Nguyên tắc đặt câu hỏi:

- Không hỏi lại dữ liệu đã có nguồn đáng tin.
- Mỗi lượt chỉ hỏi tối đa 3–5 mục có tác động lớn.
- Trước khi hỏi, hệ thống phải nói đã tìm ở đâu và vì sao chưa đủ.
- Có thể hướng dẫn người dùng cập nhật đúng tệp Drive hoặc đúng trường dữ liệu.
- Dữ kiện về giá, lịch, cam kết, ưu đãi và chính sách phải được người dùng xác nhận hoặc đến từ nguồn đã được phê duyệt.

---

## 6. Các thành phần trong bộ tài liệu

### `01_RUNTIME_ORCHESTRATION_GUIDE_PROMPT.md`

Thiết kế agentic harness, trạng thái LangGraph, Temporal workflow, công cụ, quyền, checkpoint, duyệt và hợp đồng trả về cho frontend.

### `02_ONBOARDING_CONNECTORS_KNOWLEDGE_GRAPH_GUIDE_PROMPT.md`

Thiết kế quá trình kết nối nguồn, tự cấu trúc dữ liệu, phát hiện thiếu, hướng dẫn cập nhật Drive, ontology đồ thị tri thức, provenance và đồng bộ tăng dần.

### `03_CONTENT_TREND_LEARNING_GUIDE_PROMPT.md`

Thiết kế hệ thống đọc bài tương tự, phát hiện xu hướng, trích cấu trúc, tạo kế hoạch, học giọng văn từ chỉnh sửa, học máy xếp hạng và vòng phản hồi hiệu suất.

### `04_IMPLEMENTATION_EVAL_SECURITY_GUIDE_PROMPT.md`

Cấu trúc mã nguồn, schema, API, backlog triển khai, đánh giá, bảo mật, kiểm thử và các prompt giao việc có thể đưa thẳng cho coding agent.

---

## 7. Ranh giới MVP và hệ thống mở rộng

### MVP bắt buộc

- Workspace và kết nối Drive/website/tệp.
- Tạo bản chụp thương hiệu tự động.
- Đồ thị tri thức cốt lõi có nguồn và độ tin cậy.
- Tạo kế hoạch nội dung và bài theo nền tảng.
- Trình duyệt dữ kiện và quy tắc thương hiệu.
- Duyệt trước khi đăng.
- Lưu diff người dùng sửa.
- Theo dõi trace, token, độ trễ và lỗi.
- Tập đánh giá hồi quy tối thiểu.

### Giai đoạn tiếp theo

- Đồng bộ bình luận, tin nhắn và KPI bằng webhook/API.
- Mô hình xếp hạng bài/angle.
- Phát hiện xu hướng theo thời gian.
- Contextual bandit để cân bằng thử nghiệm và khai thác.
- Gợi ý cộng tác viên/người quảng cáo.
- Fine-tune mô hình nhỏ hoặc adapter khi dữ liệu đủ và có bằng chứng vượt baseline.

---

## 8. Nguyên tắc kỹ thuật không được vi phạm

1. Không có “siêu agent” nhận toàn bộ quyền.
2. Không dùng mô hình ngôn ngữ cho phép tính hoặc kiểm tra có thể viết bằng mã.
3. Không đưa toàn bộ tài liệu vào prompt.
4. Không ghi đè dữ liệu người dùng đã xác nhận.
5. Không biến nội dung thu thập từ mạng thành bản sao.
6. Không dùng crawler trái điều khoản nền tảng hoặc vượt quyền OAuth.
7. Không auto-publish nội dung rủi ro.
8. Không lưu token truy cập dưới dạng văn bản thuần.
9. Không học từ dữ liệu của workspace khác nếu chưa có cơ chế ẩn danh và đồng ý.
10. Không fine-tune chỉ vì “có dữ liệu”; phải chứng minh retrieval + prompt + ranker đã đạt trần trên tập đánh giá.

---

## 9. Lộ trình thực hiện đề xuất

| Giai đoạn            | Kết quả kiểm chứng được                                    |
| -------------------- | ---------------------------------------------------------- |
| 1. Nền tảng          | API, PostgreSQL, trace, LangGraph state, một connector tệp |
| 2. Thiết lập tự động | Bản chụp thương hiệu, gap detector, xác nhận dữ kiện       |
| 3. Tri thức          | Neo4j ontology, vector/full-text retrieval, provenance     |
| 4. Tạo nội dung      | Kế hoạch, bài theo kênh, validator, human review           |
| 5. Vòng học          | diff, style profile, feedback event, performance event     |
| 6. Tối ưu            | model routing, cache, ranker, trend detection, A/B test    |

---

## 10. Nguồn kỹ thuật tham khảo

- LangGraph: durable execution, persistence, checkpoint và human-in-the-loop.
- Temporal Python SDK: workflow bền vững, retry, signal, timer và task queue.
- Neo4j GraphRAG Python: graph retrieval, vector + Cypher traversal.
- PostgreSQL + pgvector: vector similarity và kết hợp full-text search.
- Pydantic/PydanticAI: structured output, validation, dependency injection.
- Model Context Protocol: resource, prompt, tool, authorization và security.
- Langfuse: trace, datasets, experiments, scores và đánh giá.
- BERTopic: clustering chủ đề và theo dõi chủ đề theo thời gian.
