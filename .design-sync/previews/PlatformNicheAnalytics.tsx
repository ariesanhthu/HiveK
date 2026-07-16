import { PlatformNicheAnalytics } from 'client';

const platformScores = [
  { platform: 'TikTok', kolScore: 81.4 },
  { platform: 'Instagram', kolScore: 74.2 },
  { platform: 'YouTube', kolScore: 78.9 },
];

const nicheEngagement = [
  { niche: 'Làm đẹp', engagementRate: 6.4, fill: '#ec4899' },
  { niche: 'Game', engagementRate: 4.8, fill: '#8b5cf6' },
  { niche: 'Đời sống', engagementRate: 5.2, fill: '#3b82f6' },
  { niche: 'Công nghệ', engagementRate: 3.1, fill: '#14b8a6' },
  { niche: 'Thể hình', engagementRate: 4.0, fill: '#f59e0b' },
];

const scatterPoints = [
  { name: 'Linh Chi', niche: 'Làm đẹp', engagementQuality: 78, kolScore: 87.6, followers: 1_280_000 },
  { name: 'Minh Quang', niche: 'Công nghệ', engagementQuality: 65, kolScore: 72.1, followers: 542_000 },
  { name: 'Thu Hà', niche: 'Đời sống', engagementQuality: 71, kolScore: 80.3, followers: 890_000 },
  { name: 'Đức Anh', niche: 'Game', engagementQuality: 58, kolScore: 66.4, followers: 320_000 },
  { name: 'Bảo Ngọc', niche: 'Thể hình', engagementQuality: 69, kolScore: 76.8, followers: 610_000 },
  { name: 'Hoàng Long', niche: 'Công nghệ', engagementQuality: 62, kolScore: 70.2, followers: 245_000 },
];

const audienceTree = [
  { label: 'TikTok', followers: 4_120_000, kolScore: 81.4 },
  { label: 'Instagram', followers: 2_680_000, kolScore: 74.2 },
  { label: 'YouTube', followers: 1_940_000, kolScore: 78.9 },
];

export function Default() {
  return (
    <div style={{ width: 1080 }}>
      <PlatformNicheAnalytics
        platformScores={platformScores}
        nicheEngagement={nicheEngagement}
        scatterPoints={scatterPoints}
        audienceTree={audienceTree}
      />
    </div>
  );
}
