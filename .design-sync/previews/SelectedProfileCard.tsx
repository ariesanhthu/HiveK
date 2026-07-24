import { SelectedProfileCard } from 'client';

function avatar(hue: number) {
  return (
    'data:image/svg+xml;utf8,'
    + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="hsl(${hue},70%,88%)"/><circle cx="48" cy="38" r="20" fill="hsl(${hue},65%,55%)"/><rect x="20" y="62" width="56" height="34" rx="16" fill="hsl(${hue},65%,55%)"/></svg>`,
    )
  );
}

const linhChi = {
  id: 'kol-01',
  name: 'Nguyễn Linh Chi',
  niche: 'Làm đẹp',
  platform: 'TikTok',
  followers: 1_280_000,
  rating: 4.7,
  engagementRate: 6.42,
  avatarUrl: avatar(330),
  youtubeHandle: '@linhchibeauty',
  sentimentScoreComponent: 82.5,
  engagementQuality: 78.1,
  topicAuthority: 74.9,
  controversyRisk: 12.3,
  kolScore: 87.64,
};

const minhQuang = {
  id: 'kol-02',
  name: 'Trần Minh Quang',
  niche: 'Công nghệ',
  platform: 'YouTube',
  followers: 542_000,
  rating: 4.4,
  engagementRate: 3.18,
  avatarUrl: avatar(210),
  youtubeHandle: '@quangtech',
  sentimentScoreComponent: 71.2,
  engagementQuality: 64.8,
  topicAuthority: 88.3,
  controversyRisk: 34.6,
  kolScore: 72.09,
};

export function BeautyKol() {
  return (
    <div style={{ width: 360 }}>
      <SelectedProfileCard profile={linhChi} />
    </div>
  );
}

export function TechKol() {
  return (
    <div style={{ width: 360 }}>
      <SelectedProfileCard profile={minhQuang} />
    </div>
  );
}
