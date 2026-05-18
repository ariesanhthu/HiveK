export type PublicYouTubeChannelData = {
  title: string;
  avatarUrl: string;
  channelUrl: string;
};

function extractMetaContent(html: string, property: string): string {
  const pattern = new RegExp(
    `<meta\\s+(?:property|name)="${property}"\\s+content="([^"]+)"`,
    "i"
  );
  return pattern.exec(html)?.[1] ?? "";
}

export async function fetchPublicYouTubeChannel(
  handle: string
): Promise<PublicYouTubeChannelData | null> {
  const cleanHandle = handle.replace(/^@/, "");
  const channelUrl = `https://www.youtube.com/@${encodeURIComponent(cleanHandle)}`;
  const response = await fetch(channelUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    return null;
  }

  const html = await response.text();
  const title = extractMetaContent(html, "og:title").replace(
    /\s*-\s*YouTube\s*$/i,
    ""
  );
  const avatarUrl = extractMetaContent(html, "og:image");

  if (!title || !avatarUrl) {
    return null;
  }

  return {
    title,
    avatarUrl,
    channelUrl,
  };
}

export async function fetchMultiplePublicYouTubeChannels(
  handles: string[]
): Promise<Map<string, PublicYouTubeChannelData>> {
  const results = new Map<string, PublicYouTubeChannelData>();

  await Promise.all(
    handles.map(async (handle) => {
      const data = await fetchPublicYouTubeChannel(handle);
      if (data) {
        results.set(handle.replace(/^@/, ""), data);
      }
    })
  );

  return results;
}
