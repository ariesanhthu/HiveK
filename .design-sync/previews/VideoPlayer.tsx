import { VideoPlayer } from 'client';

const poster = 'data:image/svg+xml;utf8,'
  + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f59e0b"/><stop offset="1" stop-color="#7c2d12"/>
      </linearGradient></defs>
      <rect width="640" height="360" fill="url(#g)"/>
      <circle cx="500" cy="90" r="120" fill="#ffffff" opacity="0.12"/>
      <text x="40" y="300" font-family="Arial" font-size="30" font-weight="bold" fill="#ffffff">Review Serum Vitamin C</text>
      <text x="40" y="335" font-family="Arial" font-size="20" fill="#ffffff" opacity="0.85">Mai Anh Beauty · Trải nghiệm 4 tuần</text>
    </svg>`,
  );

const kol = {
  id: 'k1',
  name: 'Mai Anh Beauty',
  avatarUrl: '',
  niche: 'Làm đẹp & Chăm sóc da',
  rating: 4.8,
  ratingCount: 1284,
  reach: '860K',
  isVerified: true,
  reviewQuote: '',
  videoThumbnailUrl: poster,
  videoEmbedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
};

export function Default() {
  return (
    <div style={{ width: 620 }}>
      <VideoPlayer kol={kol} />
    </div>
  );
}
