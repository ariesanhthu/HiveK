import { CommentSection } from 'client';

function avatar(bg: string, fg: string, initials: string): string {
  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="${bg}"/><text x="40" y="52" font-family="Arial" font-size="34" font-weight="bold" fill="${fg}" text-anchor="middle">${initials}</text></svg>`,
    )
  );
}

const now = Date.now();
const iso = (minsAgo: number) => new Date(now - minsAgo * 60_000).toISOString();

const comments = [
  {
    id: 'c1',
    authorName: 'Nguyễn Thị Lan Hương',
    authorAvatarUrl: avatar('#fde68a', '#92400e', 'LH'),
    content:
      'Serum này thật sự hiệu quả, da mình đều màu hơn hẳn sau 3 tuần. Cảm ơn chị đã review chi tiết!',
    createdAt: iso(28),
  },
  {
    id: 'c2',
    authorName: 'Trần Quốc Bảo',
    authorAvatarUrl: avatar('#bfdbfe', '#1e3a8a', 'QB'),
    content: 'Mua cho vợ dùng thử, thấy khen nên đặt thêm 2 lọ nữa. Giao hàng nhanh.',
    createdAt: iso(180),
  },
  {
    id: 'c3',
    authorName: 'Phạm Mai Anh',
    authorAvatarUrl: avatar('#fecaca', '#7f1d1d', 'MA'),
    content: 'Kết cấu thấm nhanh, không bết dính. Hợp với da dầu như mình.',
    createdAt: iso(60 * 26),
  },
  {
    id: 'c4',
    authorName: 'Lê Hoàng Nam',
    authorAvatarUrl: avatar('#bbf7d0', '#14532d', 'HN'),
    content: 'Giá hơi cao nhưng chất lượng xứng đáng. Sẽ theo dõi các review khác của KOL này.',
    createdAt: iso(60 * 24 * 4),
  },
];

export function Default() {
  return (
    <div style={{ width: 620 }}>
      <CommentSection comments={comments} />
    </div>
  );
}
