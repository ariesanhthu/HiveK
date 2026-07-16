import { FindEntryForm } from 'client';

const initialValue = {
  campaignOption: 'Ra mắt Mùa hè 2024',
  nicheCategory: 'Đời sống & Thời trang',
  summary:
    'Ra mắt dòng son kem lì mới cho mùa hè, hướng tới nữ giới 18-28 tuổi yêu thích trang điểm tự nhiên.',
  campaignName: 'Ra mắt Son Mùa hè',
  creatorType: 'both' as const,
  objective: 'awareness' as const,
  targetPlatforms: ['tiktok', 'instagram'] as ('tiktok' | 'instagram' | 'youtube')[],
  niche: 'Đời sống',
  targetRegion: 'Việt Nam',
  budgetTier: 'growth' as const,
  minReach: 50000,
  minCtr: 2.5,
  conversionTarget: 3.0,
  budgetRangeMaxK: 25,
  followerRangeMaxK: 800,
};

export function Default() {
  return (
    <div style={{ width: 1040 }}>
      <FindEntryForm
        initialValue={initialValue}
        isSubmitting={false}
        errorMessage={null}
        onSubmit={async () => {}}
      />
    </div>
  );
}
