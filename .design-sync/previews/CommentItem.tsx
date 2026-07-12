import { CommentItem } from 'client';

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

export function Default() {
  return (
    <div style={{ width: 560 }}>
      <CommentItem
        comment={{
          id: 'c1',
          authorName: 'Nguyễn Thị Lan Hương',
          authorAvatarUrl: avatar('#fde68a', '#92400e', 'LH'),
          content:
            'Mình đã dùng serum này theo review của chị và da sáng lên rõ rệt sau 3 tuần. Rất đáng tiền, sẽ mua lại!',
          createdAt: iso(42),
        }}
      />
    </div>
  );
}
