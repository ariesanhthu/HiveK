import { writeFileSync } from "fs";
import { join } from "path";
import { NextResponse } from "next/server";
import { KOL_SEEDS } from "@/data/mock-data";
import { fetchMultipleYouTubeChannels } from "@/features/kol-ranking/services/youtube-api";
import { fetchMultiplePublicYouTubeChannels } from "@/features/kol-ranking/services/youtube-public-scraper";
import { invalidateYoutubeCache } from "@/features/kol-ranking/server/ranking-dataset";

export const dynamic = "force-dynamic";

const CACHE_PATH = join(process.cwd(), "src", "data", ".kol-cache.json");

type SyncResultEntry = {
  id: string;
  handle: string;
  status: "synced" | "not_found" | "skipped";
  name?: string;
  avatarUrl?: string;
  followers?: number;
};

export async function POST(): Promise<Response> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const handles = KOL_SEEDS.map((s) => s.youtubeHandle);
  let source: "youtube-api" | "public-scrape" = "public-scrape";
  let channelMap = new Map<
    string,
    { title: string; avatarUrl: string; subscriberCount?: number }
  >();

  if (apiKey) {
    try {
      const apiMap = await fetchMultipleYouTubeChannels(handles, apiKey);
      channelMap = new Map(
        Array.from(apiMap.entries()).map(([handle, item]) => [
          handle,
          {
            title: item.title,
            avatarUrl: item.avatarUrl,
            subscriberCount: item.subscriberCount,
          },
        ])
      );
      source = "youtube-api";
    } catch {
      channelMap = new Map();
    }
  }

  if (channelMap.size === 0) {
    const publicMap = await fetchMultiplePublicYouTubeChannels(handles);
    channelMap = new Map(
      Array.from(publicMap.entries()).map(([handle, item]) => [
        handle,
        {
          title: item.title,
          avatarUrl: item.avatarUrl,
        },
      ])
    );
    source = "public-scrape";
  }

  const cache: Record<string, { name: string; avatarUrl: string; followers: number; syncedAt: string }> = {};
  const results: SyncResultEntry[] = [];

  for (const seed of KOL_SEEDS) {
    const channelData = channelMap.get(seed.youtubeHandle);

    if (!channelData) {
      results.push({ id: seed.id, handle: seed.youtubeHandle, status: "not_found" });
      continue;
    }

    cache[seed.id] = {
      name: seed.name,
      avatarUrl: channelData.avatarUrl,
      followers: channelData.subscriberCount ?? seed.followers,
      syncedAt: new Date().toISOString(),
    };

    results.push({
      id: seed.id,
      handle: seed.youtubeHandle,
      status: "synced",
      name: seed.name,
      avatarUrl: channelData.avatarUrl,
      followers: channelData.subscriberCount ?? seed.followers,
    });
  }

  try {
    writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), "utf-8");
    invalidateYoutubeCache();
  } catch (err) {
    return NextResponse.json(
      {
        error: "Failed to write cache file",
        details: err instanceof Error ? err.message : "Unknown error",
        results,
      },
      { status: 500 }
    );
  }

  const syncedCount = results.filter((r) => r.status === "synced").length;

  return NextResponse.json({
    message: `Synced ${syncedCount}/${KOL_SEEDS.length} KOLs from YouTube`,
    source,
    results,
  });
}

export function GET(): Response {
  return NextResponse.json({
    description: "POST to sync KOL data from YouTube API or public scrape fallback",
    optionalEnv: "YOUTUBE_API_KEY",
    kolCount: KOL_SEEDS.length,
    handles: KOL_SEEDS.map((s) => ({ id: s.id, name: s.name, handle: s.youtubeHandle })),
  });
}
