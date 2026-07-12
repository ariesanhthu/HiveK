import { OverviewPanel } from 'client';

function avatar(hue: number) {
  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72"><rect width="72" height="72" fill="hsl(${hue},70%,88%)"/><circle cx="36" cy="28" r="15" fill="hsl(${hue},65%,55%)"/><rect x="14" y="46" width="44" height="26" rx="12" fill="hsl(${hue},65%,55%)"/></svg>`,
    )
  );
}

const kpis = [
  { id: 'k1', label: 'Tổng KOL', value: '248', caption: 'Hồ sơ đã phân tích', icon: 'groups' },
  { id: 'k2', label: 'Điểm KOL TB', value: '74.8', caption: 'Trung bình danh mục', icon: 'trending_up' },
  { id: 'k3', label: 'Tương tác TB', value: '4.26%', caption: 'Engagement rate', icon: 'favorite' },
  { id: 'k4', label: 'Follower TB', value: '612K', caption: 'Quy mô audience', icon: 'group' },
  { id: 'k5', label: 'Rủi ro cao', value: '17', caption: 'Risk > 60', icon: 'warning' },
  { id: 'k6', label: 'Niche nổi bật', value: 'Làm đẹp', caption: 'Điểm cao nhất', icon: 'star' },
];

const ranking = [
  {
    id: 'kol-01', name: 'Nguyễn Linh Chi', niche: 'Làm đẹp', platform: 'TikTok', followers: 1_280_000,
    rating: 4.7, engagementRate: 6.42, avatarUrl: avatar(330), youtubeHandle: 'linhchibeauty',
    sentimentScoreComponent: 82.5, engagementQuality: 78.1, topicAuthority: 74.9, controversyRisk: 1.8, kolScore: 87.64,
  },
  {
    id: 'kol-02', name: 'Phạm Thu Hà', niche: 'Đời sống', platform: 'Instagram', followers: 890_000,
    rating: 4.5, engagementRate: 5.11, avatarUrl: avatar(20), youtubeHandle: 'thuha.daily',
    sentimentScoreComponent: 76.4, engagementQuality: 71.2, topicAuthority: 69.5, controversyRisk: 4.2, kolScore: 80.31,
  },
  {
    id: 'kol-03', name: 'Trần Minh Quang', niche: 'Công nghệ', platform: 'YouTube', followers: 542_000,
    rating: 4.4, engagementRate: 3.18, avatarUrl: avatar(210), youtubeHandle: 'quangtech',
    sentimentScoreComponent: 71.2, engagementQuality: 64.8, topicAuthority: 88.3, controversyRisk: 6.9, kolScore: 72.09,
  },
  {
    id: 'kol-04', name: 'Lê Bảo Ngọc', niche: 'Thể hình', platform: 'TikTok', followers: 610_000,
    rating: 4.3, engagementRate: 4.05, avatarUrl: avatar(150), youtubeHandle: 'baongoc.fit',
    sentimentScoreComponent: 68.9, engagementQuality: 69.4, topicAuthority: 72.1, controversyRisk: 3.1, kolScore: 76.82,
  },
];

export function Default() {
  return (
    <div style={{ width: 1120 }}>
      <OverviewPanel kpis={kpis} ranking={ranking} />
    </div>
  );
}
