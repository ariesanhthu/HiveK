import { KolComparisonTable } from 'client';

const candidates = [
  {
    id: 'kc1',
    name: 'Mai Anh Beauty',
    type: 'KOL' as const,
    niche: 'Làm đẹp',
    platform: 'tiktok' as const,
    followers: 860000,
    engagementRate: 6.4,
    fitScore: 92,
    estimatedCpaUsd: 4.8,
    avgRoi: 4.7,
    estimatedCostPerPostUsd: 1200,
  },
  {
    id: 'kc2',
    name: 'Trần Quốc Huy',
    type: 'KOC' as const,
    niche: 'Công nghệ',
    platform: 'youtube' as const,
    followers: 245000,
    engagementRate: 5.1,
    fitScore: 84,
    estimatedCpaUsd: 5.6,
    avgRoi: 4.2,
    estimatedCostPerPostUsd: 780,
  },
  {
    id: 'kc3',
    name: 'Phạm Ngọc Lan',
    type: 'KOL' as const,
    niche: 'Thời trang',
    platform: 'instagram' as const,
    followers: 1320000,
    engagementRate: 4.3,
    fitScore: 88,
    estimatedCpaUsd: 6.1,
    avgRoi: 4.5,
    estimatedCostPerPostUsd: 1650,
  },
];

export function Default() {
  return (
    <div style={{ width: 1000 }}>
      <KolComparisonTable candidates={candidates} onBack={() => {}} onRestart={() => {}} />
    </div>
  );
}
