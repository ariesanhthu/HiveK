import { KolInfoCard } from 'client';

function avatar(bg: string, fg: string, initials: string): string {
  return (
    'data:image/svg+xml;utf8,'
    + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120"><rect width="120" height="120" fill="${bg}"/><text x="60" y="78" font-family="Arial" font-size="48" font-weight="bold" fill="${fg}" text-anchor="middle">${initials}</text></svg>`,
    )
  );
}

const kol = {
  id: 'k1',
  name: 'Mai Anh Beauty',
  avatarUrl: avatar('#fde68a', '#92400e', 'MA'),
  niche: 'Làm đẹp & Chăm sóc da',
  rating: 4.8,
  ratingCount: 1284,
  reach: '860K',
  isVerified: true,
  reviewQuote: '',
  videoThumbnailUrl: '',
  videoEmbedUrl: '',
};

export function Default() {
  return (
    <div style={{ width: 420 }}>
      <KolInfoCard kol={kol} />
    </div>
  );
}
