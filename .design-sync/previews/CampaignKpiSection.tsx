import { CampaignKpiSection } from 'client';

const kpis = [
  { id: 'k1', label: 'Tỷ lệ hoàn thành', valueLabel: '82%', percent: 82, strokeClass: 'stroke-orange-500' },
  { id: 'k2', label: 'Tương tác mục tiêu', valueLabel: '6,4%', percent: 64, strokeClass: 'stroke-emerald-500' },
  { id: 'k3', label: 'Ngân sách đã dùng', valueLabel: '58%', percent: 58, strokeClass: 'stroke-sky-500' },
  { id: 'k4', label: 'Nội dung đã duyệt', valueLabel: '19/27', percent: 70, strokeClass: 'stroke-violet-500' },
];

export function FourDonuts() {
  return (
    <div style={{ width: 780 }}>
      <CampaignKpiSection kpis={kpis} />
    </div>
  );
}
