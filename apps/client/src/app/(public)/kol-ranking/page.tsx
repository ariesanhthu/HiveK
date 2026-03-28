import type { Metadata } from "next";
import { KolRankingPage } from "@/features/kol-ranking/components/kol-ranking-page";
import {
  DEFAULT_RANKING_FILTERS,
  getKolRankings,
} from "@/features/kol-ranking/server/get-kol-rankings";

export const metadata: Metadata = {
  title: "Bảng xếp hạng KOL | KOLConnect",
  description:
    "Bảng xếp hạng KOL trực tuyến với bộ lọc, phân trang và cập nhật điểm số theo thời gian thực.",
};

export default function Page() {
  const initialData = getKolRankings(DEFAULT_RANKING_FILTERS);

  return (
    <KolRankingPage
      initialData={initialData}
      initialFilters={DEFAULT_RANKING_FILTERS}
    />
  );
}
