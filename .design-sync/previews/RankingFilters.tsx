import { RankingFilters } from 'client';

const filters = {
  niche: 'Làm đẹp' as const,
  platform: 'TikTok' as const,
  followerRange: '500k-1m' as const,
  search: 'Linh Chi',
  page: 1,
  pageSize: 20,
};

const emptyFilters = {
  niche: 'all' as const,
  platform: 'all' as const,
  followerRange: 'all' as const,
  search: '',
  page: 1,
  pageSize: 20,
};

export function WithSelection() {
  return (
    <div style={{ width: 960 }}>
      <RankingFilters filters={filters} onChange={() => {}} />
    </div>
  );
}

export function Empty() {
  return (
    <div style={{ width: 960 }}>
      <RankingFilters filters={emptyFilters} onChange={() => {}} />
    </div>
  );
}
