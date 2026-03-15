# HIVEK Docs Visual Workspace

Workspace này là một React Flow editor độc lập dưới `docs/visual/` dùng để:

- khám phá quan hệ **feature → workflow → file** của hệ thống
- chỉnh sửa graph bằng UI
- liên kết và chỉnh sửa nội dung markdown trong `docs/`

## Cách chạy

Từ thư mục gốc repo:

```bash
cd docs/visual
npm install
npm run dev
```

Vite sẽ chạy dev server (mặc định `http://localhost:5173`) từ thư mục `docs/visual/`.

## Cấu trúc thư mục

- `package.json`: cấu hình Vite + React + React Flow
- `index.html`: entry HTML, mount vào `#root`
- `graph.json`: dữ liệu graph (source-of-truth cho React Flow)
- `src/main.tsx`: entry React
- `src/App.tsx`: shell chính, layout 3 cột
- `src/components/GraphCanvas.tsx`: React Flow canvas (zoom, pan, minimap, controls)
- `src/components/Sidebar.tsx`: danh sách node theo filter
- `src/components/NodeInspector.tsx`: panel metadata node
- `src/components/MarkdownEditor.tsx`: panel xem/chỉnh markdown liên kết
- `src/components/Toolbar.tsx`: filter + export `graph.json`
- `src/lib/schema.ts`: schema chuẩn cho node/edge/graph
- `src/lib/graph.ts`: load `graph.json`, fallback starter graph, helper export
- `src/lib/markdown.ts`: load/copy/download file markdown
- `src/lib/sync.ts`: helper nhỏ cho sync timestamp
- `src/styles/app.css`: layout + style UI

## Cách dữ liệu graph hoạt động

- UI luôn cố gắng load `docs/visual/graph.json`.
- Nếu file trống hoặc thiếu, UI dùng **starter graph** nội bộ trong `src/lib/graph.ts` nhưng bạn vẫn có thể export lại `graph.json`.
- Schema:

```jsonc
{
  "version": 1,
  "lastUpdatedAt": "ISO_TIMESTAMP",
  "nodes": [
    {
      "id": "string",
      "type": "feature|workflow|file|folder|note",
      "label": "string",
      "path": "docs/Project-Description/...",
      "parentId": "id|null",
      "feature": "string",
      "workflow": "string",
      "description": "string",
      "tags": ["string"],
      "status": "draft|active|deprecated",
      "position": { "x": 0, "y": 0 },
      "lastSyncedAt": "ISO_TIMESTAMP"
    }
  ],
  "edges": [
    {
      "id": "string",
      "source": "node-id",
      "target": "node-id",
      "relation": "contains|uses|depends_on|documents|implements|references|flows_to",
      "label": "string"
    }
  ]
}
```

## Tương tác trong UI

- **Canvas**
  - tải nodes/edges từ `graph.json` (hoặc starter graph)
  - có zoom, pan, minimap, background grid, controls
  - drag node để cập nhật `position`
  - click node để chọn, hiển thị metadata + markdown
  - connect node để tạo edge mới
  - xoá node đang chọn bằng nút **“Xóa node đang chọn”** (sẽ xoá luôn edges liên quan)
- **Sidebar**
  - list nodes theo filter (type / feature / workflow) để chọn nhanh
- **NodeInspector**
  - chỉnh:
    - `label`
    - `type`
    - `path`
    - `feature`
    - `workflow`
    - `status`
    - `tags`
    - `description`
- **MarkdownEditor**
  - nếu `node.path` trỏ tới file `.md`:
    - UI cố load markdown đó (VD `docs/Architecture/frontend/pages.md`)
    - có textarea để chỉnh nội dung
    - có nút:
      - **“Tải xuống .md”** → download file đã chỉnh (bạn copy đè vào file thật trong `docs/`)
      - **“Copy vào clipboard”** → copy text để dán vào editor khác

> Giới hạn kỹ thuật: UI chạy thuần frontend nên **không thể ghi trực tiếp** lên file trong repo.  
> Thay vào đó, bạn export JSON/markdown rồi cập nhật file bằng tay (hoặc dùng script riêng).

## Hai chiều: docs ↔ graph

- **Docs → Graph**
  - Khi bạn chỉnh markdown trong `docs/` (hoặc thêm file mới), hãy:
    1. Mở workspace này.
    2. Thêm / cập nhật node type `feature|workflow|file` tương ứng.
    3. Cập nhật `path`, `label`, `description`, `feature`, `workflow`, `tags`, `status`.
    4. Kết nối edges `contains / documents / implements / uses / flows_to`.
    5. Export `graph.json` mới và commit cùng với docs.
- **Graph → Docs**
  - Khi bạn chỉnh graph (thêm/đổi tên node, đổi path):
    1. Export `graph.json`.
    2. Với node mới:
       - tạo file `.md` tương ứng trong `docs/` theo `path`
       - dùng structure được mô tả trong kỹ năng `react-flow` (Title/Purpose/Feature/Workflow/…).
    3. Với node rename / path change:
       - cập nhật title + link trong các markdown liên quan.
    4. Cập nhật `structure.md` của các folder bị ảnh hưởng.

## Source of truth

- **Markdown trong `docs/`** là source-of-truth.
- `graph.json` + React Flow UI là projection có thể chỉnh sửa, nhưng nếu conflict thì:
  - ưu tiên docs, trừ khi edit graph là intentional và đã sync docs lại theo flow 2 chiều ở trên.

## Hạn chế hiện tại

- Không có backend: export/save là tải file về, không ghi trực tiếp vào repo.
- Chưa có auto-rescan markdown để gen graph; bước này vẫn thủ công (theo rules trong `.cursor/skills/react-flow.md`).
- `structure.md` cần được chỉnh tay khi bạn thêm feature/workflow/file mới.

## Gợi ý workflow

1. Đọc `docs/Project-Description/structure.md` để hiểu cấu trúc docs.
2. Mở `docs/Architecture/frontend/pages.md` khi map frontend flows vào graph.
3. Dùng workspace này để:
   - vẽ hình feature → workflow → file
   - kiểm tra nhanh docs còn thiếu
   - thêm `note` nodes cho TODO / missing-doc.
4. Khi hoàn tất:
   - export `graph.json`
   - cập nhật markdown tương ứng
   - đảm bảo `structure.md` các folder liên quan đã update.

