import {
  getKolRankings,
  parseKolRankingFilters,
} from "@/features/kol-ranking/server/get-kol-rankings";

const STREAM_INTERVAL_MS = 3_000;
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const filters = parseKolRankingFilters(requestUrl.searchParams);

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const sendPayload = () => {
        const payload = getKolRankings(filters);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
        );
      };

      sendPayload();
      const intervalId = setInterval(sendPayload, STREAM_INTERVAL_MS);

      request.signal.addEventListener("abort", () => {
        clearInterval(intervalId);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
