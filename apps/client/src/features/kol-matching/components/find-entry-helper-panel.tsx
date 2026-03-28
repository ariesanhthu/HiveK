import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PROMPT_TEMPLATES = [
  {
    label: "D2C Lifestyle",
    content:
      "Finding eco-conscious nano-influencers in the EU for sustainable fashion...",
  },
  {
    label: "Mobile Gaming",
    content: "Streamers with high retention rates for RPG launch targeting Gen-Z...",
  },
];

const RECENT_SEARCHES = [
  { id: "search-1", title: "Lifestyle Tech (Global)", meta: "2 days ago • 45 matches" },
  { id: "search-2", title: "Skincare Routine KOLs", meta: "5 days ago • 120 matches" },
];

export function FindEntryHelperPanel() {
  return (
    <aside className="space-y-4">
      <Card className="border-primary-soft bg-primary-soft">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-background-dark">
              <span className="material-symbols-outlined text-base">lightbulb</span>
            </span>
            Hướng dẫn Nhanh
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground-muted">
            Để có kết quả chính xác, hãy xác định rõ đối tượng mục tiêu và tiếng nói thương hiệu.
            AI ưu tiên creator có tương tác thật thay vì người theo dõi ảo.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="material-symbols-outlined text-base text-foreground-muted">
              history_edu
            </span>
            Mẫu Gợi ý (Prompt)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {PROMPT_TEMPLATES.map((template) => (
            <button
              key={template.label}
              type="button"
              className="w-full rounded-xl border border-primary-soft bg-card p-3 text-left transition-colors hover:bg-primary-soft"
            >
              <p className="text-xs font-bold uppercase text-primary">{template.label}</p>
              <p className="mt-1 text-sm italic text-foreground-muted">{template.content}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="material-symbols-outlined text-base text-foreground-muted">
              history
            </span>
            Tìm kiếm Gần đây
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {RECENT_SEARCHES.map((search) => (
            <div key={search.id} className="flex items-start gap-3 rounded-lg p-2">
              <span className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-muted text-foreground-muted">
                <span className="material-symbols-outlined text-sm">search</span>
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{search.title}</p>
                <p className="text-xs text-foreground-muted">{search.meta}</p>
              </div>
            </div>
          ))}

          <button type="button" className="w-full text-sm font-medium text-primary hover:underline">
            Xem Toàn bộ Lịch sử
          </button>
        </CardContent>
      </Card>
    </aside>
  );
}
