import { CampaignsGrid } from 'client';

function cover(bg: string, label: string) {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='200'><rect width='320' height='200' fill='${bg}'/><text x='50%' y='54%' font-family='Arial' font-size='22' fill='white' text-anchor='middle' dominant-baseline='middle'>${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const items = [
  {
    id: 'cmp1',
    image: cover('#e63946', 'Cocoon'),
    category: 'Làm đẹp',
    title: 'Sữa Rửa Mặt Cocoon x Beauty KOLs',
    priceRange: '15 – 40 triệu',
    status: 'active' as const,
  },
  {
    id: 'cmp2',
    image: cover('#457b9d', 'Xiaomi'),
    category: 'Công nghệ',
    title: 'Review Điện Thoại Xiaomi 14T Series',
    priceRange: '30 – 80 triệu',
    status: 'active' as const,
  },
  {
    id: 'cmp3',
    image: cover('#f4a261', 'TheFace'),
    category: 'Thời trang',
    title: 'Ra Mắt BST Nước Hoa TheFaceHolic',
    priceRange: '20 – 50 triệu',
    status: 'draft' as const,
  },
  {
    id: 'cmp4',
    image: cover('#2a9d8f', 'Highlands'),
    category: 'Ẩm thực',
    title: 'Chiến Dịch Cà Phê Phin Highlands Tết',
    priceRange: '10 – 25 triệu',
    status: 'closed' as const,
  },
];

export function Grid() {
  return (
    <div style={{ width: 1100 }}>
      <CampaignsGrid items={items} />
    </div>
  );
}

export function Empty() {
  return (
    <div style={{ width: 900 }}>
      <CampaignsGrid items={[]} />
    </div>
  );
}
