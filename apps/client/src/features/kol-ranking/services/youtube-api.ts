const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

type YouTubeChannelSnippet = {
  title: string;
  description: string;
  thumbnails: {
    default?: { url: string };
    medium?: { url: string };
    high?: { url: string };
  };
};

type YouTubeChannelStatistics = {
  subscriberCount: string;
  viewCount: string;
  videoCount: string;
  hiddenSubscriberCount: boolean;
};

type YouTubeChannelItem = {
  id: string;
  snippet: YouTubeChannelSnippet;
  statistics: YouTubeChannelStatistics;
};

type YouTubeChannelListResponse = {
  items: YouTubeChannelItem[];
};

export type YouTubeChannelData = {
  channelId: string;
  title: string;
  avatarUrl: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
};

export async function fetchYouTubeChannel(
  handle: string,
  apiKey: string
): Promise<YouTubeChannelData | null> {
  /**
   * Fetch a single YouTube channel by handle via Data API v3.
   *
   * Args:
   *   handle: YouTube handle without @ prefix.
   *   apiKey: YouTube Data API v3 key.
   * Returns:
   *   Channel data or null if not found.
   * Raises:
   *   Error on network/API failures.
   */
  const cleanHandle = handle.replace(/^@/, "");
  const url = new URL(`${YOUTUBE_API_BASE}/channels`);
  url.searchParams.set("part", "snippet,statistics");
  url.searchParams.set("forHandle", cleanHandle);
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString(), {
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`YouTube API error ${response.status}: ${body}`);
  }

  const data: YouTubeChannelListResponse = await response.json();
  const channel = data.items?.[0];
  if (!channel) return null;

  const thumbnail =
    channel.snippet.thumbnails.high?.url ??
    channel.snippet.thumbnails.medium?.url ??
    channel.snippet.thumbnails.default?.url ??
    "";

  return {
    channelId: channel.id,
    title: channel.snippet.title,
    avatarUrl: thumbnail,
    subscriberCount: Number(channel.statistics.subscriberCount) || 0,
    viewCount: Number(channel.statistics.viewCount) || 0,
    videoCount: Number(channel.statistics.videoCount) || 0,
  };
}

export async function fetchMultipleYouTubeChannels(
  handles: string[],
  apiKey: string
): Promise<Map<string, YouTubeChannelData>> {
  /**
   * Fetch multiple YouTube channels in parallel.
   *
   * Args:
   *   handles: Array of YouTube handles.
   *   apiKey: YouTube Data API v3 key.
   * Returns:
   *   Map of handle → channel data (only successful fetches).
   */
  const results = new Map<string, YouTubeChannelData>();

  const errors: Array<{ handle: string; error: string }> = [];

  const promises = handles.map(async (handle) => {
    try {
      const data = await fetchYouTubeChannel(handle, apiKey);
      if (data) {
        results.set(handle.replace(/^@/, ""), data);
      }
    } catch (err) {
      errors.push({
        handle,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });

  await Promise.all(promises);

  if (errors.length > 0 && results.size === 0) {
    throw new Error(
      `All fetches failed. First error: ${errors[0].error}`
    );
  }

  return results;
}
