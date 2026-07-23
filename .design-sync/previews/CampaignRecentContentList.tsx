import { CampaignRecentContentList } from 'client';

function thumb(bg: string, label: string) {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='144' height='144'><rect width='144' height='144' fill='${bg}'/><text x='50%' y='54%' font-family='Arial' font-size='22' fill='white' text-anchor='middle' dominant-baseline='middle'>${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const items = [
  {
    id: 'ct1',
    thumbnailUrl: thumb('#e63946', 'Reel'),
    title: 'Unbox sữa rửa mặt Cocoon cà phê Đắk Lắk',
    authorName: 'Hoà Minzy',
    timeLabel: '2 giờ trước',
    state: 'pending_review' as const,
  },
  {
    id: 'ct2',
    thumbnailUrl: thumb('#457b9d', 'TikTok'),
    title: 'Skincare routine buổi tối với 3 bước',
    authorName: 'Trinh Phạm',
    timeLabel: 'Hôm qua',
    state: 'pending_review' as const,
  },
  {
    id: 'ct3',
    thumbnailUrl: thumb('#2a9d8f', 'Video'),
    title: 'Trải nghiệm 7 ngày dùng bí đao Cocoon',
    authorName: 'Chan La Cà',
    timeLabel: '3 ngày trước',
    state: 'approved' as const,
  },
];

export function Mixed() {
  return (
    <div style={{ width: 380 }}>
      <CampaignRecentContentList items={items} totalContentCount={27} />
    </div>
  );
}
