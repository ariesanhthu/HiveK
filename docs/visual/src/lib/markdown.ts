export async function loadMarkdown(path: string): Promise<string> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(normalizedPath, { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(`Failed to load markdown at ${normalizedPath}`);
  }
  return response.text();
}

export function downloadMarkdown(path: string, content: string): void {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const fileName = path.split("/").pop() ?? "doc.md";

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  URL.revokeObjectURL(url);
}

export async function copyMarkdownToClipboard(content: string): Promise<void> {
  if (!navigator.clipboard) {
    return;
  }

  await navigator.clipboard.writeText(content);
}

