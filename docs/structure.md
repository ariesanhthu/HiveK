# Cấu trúc thư mục `docs/`

- **Mục đích**: Chứa toàn bộ tài liệu kiến trúc, product, và visualize cho HIVEK.

## Thư mục con chính

- `Project-Description/`
  - Mô tả sản phẩm, vision, product-design và các phần breakdown (xem `Project-Description/structure.md`).
- `Architecture/`
  - Tài liệu kiến trúc chi tiết (frontend, backend, workflow, v.v.).
- `visual/`
  - React Flow workspace (`docs/visual/`) để visualize quan hệ feature → workflow → file dựa trên docs.

## Liên kết với graph

- Graph chính nằm ở: `docs/visual/graph.json`.
- React Flow UI: `docs/visual/` (chạy bằng Vite).
- Khi cập nhật docs (đặc biệt trong `Project-Description` và `Architecture`), cần cập nhật:
  - các node/edge tương ứng trong `graph.json`
  - các `structure.md` liên quan.

## Ghi chú cho agent

- Mọi folder con của `docs/` phải có `structure.md` riêng mô tả purpose, file quan trọng và liên kết với graph nếu có.
- Khi thêm/bớt/đổi tên file hoặc folder trong `docs/`, luôn cập nhật:
  - `structure.md` tương ứng
  - `docs/visual/graph.json` nếu thay đổi ảnh hưởng tới feature/workflow/file trong graph.

