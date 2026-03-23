import React from "react";

type TopPerformerRow = {
  avatar: string;
  name: string;
  handle: string;
  category: string;
  engagement: string;
  engagementPercent: number;
  followers: string;
  trend: "up" | "flat";
};

const rows: TopPerformerRow[] = [
  {
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB-OPDEKL3Qr6FbZHI4FI_zPXUHmNpjs5GMpcFAiC2CasZ8J47U5rBbVI6zYZ-p-tvgJGTrrWJ5uPQAnOOWrcUfLTCAR9NkLhu502n56sXHLULo8jW-CwfkAfvRcw8Ns_RGfvpOI_csQ0O5qsM1MLjYcFyHaMGkKV4FDd5ngw2K4LnqzoHgbX1K10i9R6uqF6ebC5triGumMIYaF9-YOO797eQfIpEbJru1VpCTJzK2NEm6WE8NuJfyqQ1hnywmfNFCX2cKOUKsesU",
    name: "Sarah Jenkins",
    handle: "@sarahj_style",
    category: "Lifestyle",
    engagement: "7.8%",
    engagementPercent: 78,
    followers: "1.2M",
    trend: "up",
  },
  {
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDW6lxKWxE83KniVA3OkWlQ_llx8lmHkcpXJULM33wYWIwGsRQ3KXK6HkkcmTvceaaYOX4HWhfgGVGDs4r6B1atQZsRuGtYE3a4QOBaYake3nTEaztn44H4EZJrU98W8vNwAu-iDEYDN_U4m1bQwGLU9188CJTlwS2b0kNHyTNlybCWPjs98dp6ayfEWELTd6oLqLxIveESfkIYsJMp1IjJ7cYPKv7NxRa8cS_BEQTj5rZ9xqjAkpnhePc6Eg7VkyUbwA_haos3Gu0",
    name: "Alex Rivera",
    handle: "@techalex_rv",
    category: "Tech",
    engagement: "6.2%",
    engagementPercent: 62,
    followers: "850K",
    trend: "up",
  },
  {
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA-HdaKa8ksv4j_e2SXDjD_j4fRXZU3Wt8JJalv2ir0nvq77aXQQcbEToqG7sySGgyThT4l3w1dAGtFgE-DimQtFHXlOQfi6iwHsHT0qQ8V85E1mY4xD5P7EPOIS8OnS4S4_YqA6B9i62bbNIzWZIghE6j7QKLo-nap4pVBwoO0WIefqaUCPZuM1ZCWziAHP4k1xq9hACC2wc7bJgcCVibgf3Z3UVl1AIzNLmfx0KBZbjQ34xqIG-DuPqdSm9y5q9C9_PR5QZcHwE4",
    name: "Mia Wong",
    handle: "@mia.glow",
    category: "Beauty",
    engagement: "9.1%",
    engagementPercent: 91,
    followers: "2.4M",
    trend: "flat",
  },
];

export const TopPerformersSection: React.FC = () => {
  return (
    <section className="py-24" aria-labelledby="top-performers-heading">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2
              id="top-performers-heading"
              className="text-3xl font-black text-foreground"
            >
              Top Performers
            </h2>
            <p className="mt-2 text-muted">
              The most impactful creators this week
            </p>
          </div>
          <a
            href="#"
            className="flex items-center gap-1 font-bold text-primary hover:underline"
          >
            View all rankings
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </a>
        </div>

        <div className="overflow-hidden rounded-2xl border border-primary-soft bg-card shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-primary/5 text-sm font-bold uppercase tracking-wider text-muted">
              <tr>
                <th className="px-6 py-4">Creator</th>
                <th className="px-6 py-4">Category</th>
                <th className="hidden px-6 py-4 md:table-cell">
                  Engagement Rate
                </th>
                <th className="px-6 py-4">Followers</th>
                <th className="px-6 py-4 text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-soft">
              {rows.map((row) => (
                <tr
                  key={row.handle}
                  className="transition-colors hover:bg-primary/5"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={row.avatar}
                        alt={`Portrait of ${row.name}`}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-bold text-foreground">
                          {row.name}
                        </div>
                        <div className="text-xs text-muted">
                          {row.handle}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground-muted">
                    {row.category}
                  </td>
                  <td className="hidden px-6 py-4 md:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${row.engagementPercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold">{row.engagement}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-foreground">
                    {row.followers}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`material-symbols-outlined ${
                        row.trend === "up"
                          ? "text-success"
                          : "text-primary"
                      }`}
                    >
                      {row.trend === "up" ? "trending_up" : "trending_flat"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

