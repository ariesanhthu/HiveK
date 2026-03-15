import React from "react";
import { GraphNode } from "../lib/schema";
import { copyMarkdownToClipboard, downloadMarkdown } from "../lib/markdown";

type Props = {
  node: GraphNode | null;
  markdownPath: string | null;
  markdownContent: string;
  onMarkdownChange: (content: string) => void;
};

export const MarkdownEditor: React.FC<Props> = ({
  node,
  markdownPath,
  markdownContent,
  onMarkdownChange
}) => {
  if (!node || !markdownPath) {
    return (
      <section className="panel">
        <h2 className="panel-title">Markdown</h2>
        <p className="panel-empty">Chọn node có `path` trỏ tới file `.md` để xem và chỉnh sửa.</p>
      </section>
    );
  }

  const handleDownload = () => {
    downloadMarkdown(markdownPath, markdownContent);
  };

  const handleCopy = async () => {
    await copyMarkdownToClipboard(markdownContent);
  };

  return (
    <section className="panel">
      <h2 className="panel-title">Markdown: {markdownPath}</h2>
      <div className="panel-toolbar">
        <button className="primary-button" onClick={handleDownload}>
          Tải xuống .md
        </button>
        <button className="ghost-button" onClick={handleCopy}>
          Copy vào clipboard
        </button>
      </div>
      <textarea
        className="panel-markdown-editor"
        value={markdownContent}
        onChange={(event) => onMarkdownChange(event.target.value)}
      />
      <p className="panel-hint">
        Lưu ý: Workspace này không ghi trực tiếp vào file trên disk. Hãy tải file `.md` về hoặc copy
        nội dung rồi cập nhật lại file tương ứng trong `docs/`.
      </p>
    </section>
  );
};

