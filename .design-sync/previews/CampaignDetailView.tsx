import { CampaignDetailView } from 'client';

function img(w: number, h: number, bg: string, label: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><rect width='${w}' height='${h}' fill='${bg}'/><text x='50%' y='54%' font-family='Arial' font-size='${Math.round(h / 4)}' fill='white' text-anchor='middle' dominant-baseline='middle'>${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const detail = {
  id: 'CDN-2024-0187',
  title: 'Sữa Rửa Mặt Cocoon x Beauty KOLs',
  status: 'active' as const,
  externalIdLabel: 'Mã chiến dịch: CDN-2024-0187',
  createdByLabel: 'Tạo bởi Nguyễn Thu Trang',
  stats: [
    { id: 's1', label: 'Ngân sách', value: '40 triệu', metaLabel: 'Đã dùng 58%', metaVariant: 'secondary' as const, icon: 'payments' as const },
    { id: 's2', label: 'Thời gian', value: '18 ngày', metaLabel: 'Còn 6 ngày', metaVariant: 'warning' as const, icon: 'calendar_month' as const },
    { id: 's3', label: 'KOL tham gia', value: '32', metaLabel: '4 chờ duyệt', metaVariant: 'warning' as const, icon: 'groups' as const },
    { id: 's4', label: 'Chuyển đổi', value: '1.240', metaLabel: '+18% tuần này', metaVariant: 'success' as const, icon: 'shopping_cart' as const },
  ],
  kpis: [
    { id: 'k1', label: 'Tỷ lệ hoàn thành', valueLabel: '82%', percent: 82, strokeClass: 'stroke-orange-500' },
    { id: 'k2', label: 'Tương tác mục tiêu', valueLabel: '6,4%', percent: 64, strokeClass: 'stroke-emerald-500' },
    { id: 'k3', label: 'Ngân sách đã dùng', valueLabel: '58%', percent: 58, strokeClass: 'stroke-sky-500' },
  ],
  creators: [
    { id: 'c1', name: 'Hoà Minzy', avatarUrl: img(80, 80, '#e63946', 'HM'), reachLabel: '1,8 triệu', engagementLabel: '6,4%', status: 'live' as const },
    { id: 'c2', name: 'Call Me Duy', avatarUrl: img(80, 80, '#457b9d', 'CD'), reachLabel: '920K', engagementLabel: '8,1%', status: 'live' as const },
    { id: 'c3', name: 'Trinh Phạm', avatarUrl: img(80, 80, '#f4a261', 'TP'), reachLabel: '1,2 triệu', engagementLabel: '5,7%', status: 'pending_post' as const },
  ],
  brief: {
    niches: ['Làm đẹp', 'Skincare', 'Review mỹ phẩm'],
    platforms: ['instagram', 'tiktok', 'youtube'] as const,
    audience: 'Nữ giới 18–30 tuổi tại các thành phố lớn, quan tâm chăm sóc da và mỹ phẩm thuần chay.',
    pdfBriefLabel: 'Xem brief đầy đủ (PDF)',
  },
  recentContent: [
    { id: 'ct1', thumbnailUrl: img(144, 144, '#e63946', 'Reel'), title: 'Unbox sữa rửa mặt Cocoon cà phê', authorName: 'Hoà Minzy', timeLabel: '2 giờ trước', state: 'pending_review' as const },
    { id: 'ct2', thumbnailUrl: img(144, 144, '#2a9d8f', 'Video'), title: 'Trải nghiệm 7 ngày dùng bí đao', authorName: 'Chan La Cà', timeLabel: '3 ngày trước', state: 'approved' as const },
  ],
  totalContentCount: 27,
};

export function FullDetail() {
  return (
    <div style={{ width: 1200 }}>
      <CampaignDetailView detail={detail} />
    </div>
  );
}
