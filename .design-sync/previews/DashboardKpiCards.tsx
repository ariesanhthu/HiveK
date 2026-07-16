import { DashboardKpiCards } from 'client';

const metrics = [
  {
    id: 'm1',
    label: 'Chiến dịch đang chạy',
    value: '12',
    trendValue: '+3 so với tháng trước',
    trendDirection: 'up' as const,
    icon: 'campaign',
  },
  {
    id: 'm2',
    label: 'Tổng lượt tiếp cận',
    value: '4,8 triệu',
    trendValue: '+18,2%',
    trendDirection: 'up' as const,
    icon: 'groups',
  },
  {
    id: 'm3',
    label: 'Tỷ lệ chuyển đổi',
    value: '3,7%',
    trendValue: '-0,4% tuần này',
    trendDirection: 'down' as const,
    icon: 'trending_up',
  },
  {
    id: 'm4',
    label: 'Ngân sách đã dùng',
    value: '284tr ₫',
    trendValue: '+12,5%',
    trendDirection: 'up' as const,
    icon: 'account_balance_wallet',
  },
];

export function Default() {
  return (
    <div style={{ width: 900 }}>
      <DashboardKpiCards metrics={metrics} />
    </div>
  );
}
