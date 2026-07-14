import { AnalyticsPanel } from 'client';

function avatar(hue: number) {
  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72"><rect width="72" height="72" fill="hsl(${hue},70%,88%)"/><circle cx="36" cy="28" r="15" fill="hsl(${hue},65%,55%)"/><rect x="14" y="46" width="44" height="26" rx="12" fill="hsl(${hue},65%,55%)"/></svg>`,
    )
  );
}

const profiles = [
  {
    id: 'kol-01', name: 'Nguyễn Linh Chi', niche: 'Làm đẹp', platform: 'TikTok', followers: 1_280_000,
    rating: 4.7, engagementRate: 6.42, avatarUrl: avatar(330), youtubeHandle: 'linhchibeauty',
    sentimentScoreComponent: 82.5, engagementQuality: 78.1, topicAuthority: 74.9, controversyRisk: 1.8, kolScore: 87.64,
  },
  {
    id: 'kol-02', name: 'Trần Minh Quang', niche: 'Công nghệ', platform: 'YouTube', followers: 542_000,
    rating: 4.4, engagementRate: 3.18, avatarUrl: avatar(210), youtubeHandle: 'quangtech',
    sentimentScoreComponent: 71.2, engagementQuality: 64.8, topicAuthority: 88.3, controversyRisk: 6.9, kolScore: 72.09,
  },
  {
    id: 'kol-03', name: 'Phạm Thu Hà', niche: 'Đời sống', platform: 'Instagram', followers: 890_000,
    rating: 4.5, engagementRate: 5.11, avatarUrl: avatar(20), youtubeHandle: 'thuha.daily',
    sentimentScoreComponent: 76.4, engagementQuality: 71.2, topicAuthority: 69.5, controversyRisk: 4.2, kolScore: 80.31,
  },
];

const radarMetrics = [
  { metric: 'Cảm xúc', value: 82.5 },
  { metric: 'Tương tác', value: 78.1 },
  { metric: 'Chuyên môn', value: 74.9 },
  { metric: 'Độ tin cậy', value: 88.2 },
  { metric: 'Tăng trưởng', value: 71.6 },
];

const scoreHistogram = [
  { label: '40-50', count: 8 },
  { label: '50-60', count: 21 },
  { label: '60-70', count: 46 },
  { label: '70-80', count: 88 },
  { label: '80-90', count: 61 },
  { label: '90-100', count: 24 },
];

const controversyHistogram = [
  { label: '0-2', count: 92 },
  { label: '2-4', count: 74 },
  { label: '4-6', count: 45 },
  { label: '6-8', count: 22 },
  { label: '8-10', count: 15 },
];

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
];

const platformRisk = [
  { platform: 'TikTok', min: 1.2, avg: 3.8, max: 7.4 },
  { platform: 'Instagram', min: 1.8, avg: 4.6, max: 8.1 },
  { platform: 'YouTube', min: 2.1, avg: 5.2, max: 9.0 },
];

const audienceTree = [
  { label: 'TikTok', followers: 4_120_000, kolScore: 81.4 },
  { label: 'Instagram', followers: 2_680_000, kolScore: 74.2 },
  { label: 'YouTube', followers: 1_940_000, kolScore: 78.9 },
];

export function Default() {
  return (
    <div style={{ width: 1120 }}>
      <AnalyticsPanel
        profiles={profiles}
        selectedProfile={profiles[0]}
        selectedProfileId={profiles[0].id}
        radarMetrics={radarMetrics}
        scoreHistogram={scoreHistogram}
        controversyHistogram={controversyHistogram}
        platformScores={platformScores}
        nicheEngagement={nicheEngagement}
        scatterPoints={scatterPoints}
        platformRisk={platformRisk}
        audienceTree={audienceTree}
        onSelectedProfileChange={() => {}}
      />
    </div>
  );
}
