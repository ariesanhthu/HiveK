# Cấu trúc thư mục `docs/visual`

- **Mục đích**: workspace web độc lập để visualize quan hệ feature → workflow → file dựa trên docs.
- **Thành phần chính**:
  - `package.json`, `vite.config.ts`, `tsconfig.json`: cấu hình Vite + React + React Flow.
  - `index.html`: entry HTML.
  - `graph.json`: dữ liệu graph chuẩn cho React Flow.
  - `src/`: mã nguồn React (canvas, sidebar, inspector, markdown editor, lib).
  - `styles/app.css`: style UI.
  - `README.md`: giải thích mục đích, cách chạy, cách sync docs ↔ graph.
- **Liên kết**:
  - Gắn với docs dưới `docs/` (đặc biệt `Project-Description` và `Architecture`).
  - Đồ thị tập trung quanh feature → workflow → file, có thể thêm `folder` và `note`.
- **Ghi chú cho agent**:
  - Mọi thay đổi feature/workflow/file quan trọng phải được phản ánh cả trong docs và `graph.json`.
  - Nếu tạo thư mục mới dưới `docs/visual/`, hãy thêm/ cập nhật `structure.md` tương ứng.

