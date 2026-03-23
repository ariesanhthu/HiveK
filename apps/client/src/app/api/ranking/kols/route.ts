import { NextResponse } from "next/server";
import {
  getKolRankings,
  parseKolRankingFilters,
} from "@/features/kol-ranking/server/get-kol-rankings";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const filters = parseKolRankingFilters(requestUrl.searchParams);
  const payload = getKolRankings(filters);

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
