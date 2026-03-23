import type { Metadata } from "next";
import { KolRankingPage } from "@/features/kol-ranking/components/kol-ranking-page";
import {
  DEFAULT_RANKING_FILTERS,
  getKolRankings,
} from "@/features/kol-ranking/server/get-kol-rankings";

export const metadata: Metadata = {
  title: "KOL Ranking | KOLConnect",
  description:
    "Live KOL ranking page with filters, pagination and real-time score updates.",
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
