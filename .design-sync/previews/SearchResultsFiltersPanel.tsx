import { useState } from 'react';
import { SearchResultsFiltersPanel } from 'client';

export function Default() {
  const [filters, setFilters] = useState({
    platforms: ['tiktok'] as ('tiktok' | 'instagram' | 'youtube')[],
    nicheIds: ['beauty'] as string[],
    followerMinK: 150,
    engagementMinPercent: 3,
  });

  return (
    <div style={{ width: 300 }}>
      <SearchResultsFiltersPanel
        filters={filters}
        onClearAll={() =>
          setFilters({ platforms: [], nicheIds: [], followerMinK: 0, engagementMinPercent: 0 })
        }
        onTogglePlatform={(p) =>
          setFilters((f) => ({
            ...f,
            platforms: f.platforms.includes(p)
              ? f.platforms.filter((x) => x !== p)
              : [...f.platforms, p],
          }))
        }
        onToggleNiche={(id) =>
          setFilters((f) => ({
            ...f,
            nicheIds: f.nicheIds.includes(id)
              ? f.nicheIds.filter((x) => x !== id)
              : [...f.nicheIds, id],
          }))
        }
        onFollowerMinKChange={(v) => setFilters((f) => ({ ...f, followerMinK: v }))}
        onEngagementMinChange={(v) => setFilters((f) => ({ ...f, engagementMinPercent: v }))}
      />
    </div>
  );
}
