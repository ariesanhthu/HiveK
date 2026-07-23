import { KpiOverview } from 'client';

const kpis = [
  {
    id: 'k1',
    label: 'Tổng KOL',
    value: '248',
    caption: 'Hồ sơ đã phân tích trong đợt này',
    icon: 'groups',
  },
  {
    id: 'k2',
    label: 'Điểm KOL TB',
    value: '74.8',
    caption: 'Trung bình toàn danh mục',
    icon: 'trending_up',
  },
  {
    id: 'k3',
    label: 'Tương tác TB',
    value: '4.26%',
    caption: 'Engagement rate trung bình',
    icon: 'favorite',
  },
  {
    id: 'k4',
    label: 'Follower TB',
    value: '612K',
    caption: 'Quy mô audience trung vị',
    icon: 'group',
  },
  {
    id: 'k5',
    label: 'Rủi ro cao',
    value: '17',
    caption: 'KOL có controversy risk > 60',
    icon: 'warning',
  },
  {
    id: 'k6',
    label: 'Lĩnh vực nổi bật',
    value: 'Làm đẹp',
    caption: 'Niche có điểm cao nhất',
    icon: 'star',
  },
];

export function Default() {
  return (
    <div style={{ width: 1120 }}>
      <KpiOverview kpis={kpis} />
    </div>
  );
}
