import { CampaignStatsGrid } from 'client';

const stats = [
  { id: 's1', label: 'Lượt tiếp cận', value: '2,4 triệu', icon: 'visibility', metaLabel: '+18% tuần này', metaVariant: 'success' as const },
  { id: 's2', label: 'Tương tác', value: '186K', icon: 'favorite', metaLabel: '+9%', metaVariant: 'success' as const },
  { id: 's3', label: 'KOL tham gia', value: '32', icon: 'group', metaLabel: '4 chờ duyệt', metaVariant: 'warning' as const },
  { id: 's4', label: 'Chi phí / lượt', value: '1.240₫', icon: 'payments', metaLabel: 'Ổn định', metaVariant: 'secondary' as const },
];

export function Default() {
  return (
    <div style={{ width: 860 }}>
      <CampaignStatsGrid stats={stats} />
    </div>
  );
}
