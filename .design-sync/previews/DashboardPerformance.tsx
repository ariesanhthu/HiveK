import { useState } from 'react';
import { DashboardPerformance } from 'client';

const campaignTrend = [
  { label: 'T2', value: 62 },
  { label: 'T3', value: 68 },
  { label: 'T4', value: 74 },
  { label: 'T5', value: 71 },
  { label: 'T6', value: 82 },
  { label: 'T7', value: 88 },
  { label: 'CN', value: 91 },
];

const conversionTrend = [
  { label: 'Tuần 1', value: 34 },
  { label: 'Tuần 2', value: 48 },
  { label: 'Tuần 3', value: 41 },
  { label: 'Tuần 4', value: 67 },
];

export function Default() {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  return (
    <div style={{ width: 960 }}>
      <DashboardPerformance
        campaignTrend={campaignTrend}
        conversionTrend={conversionTrend}
        period={period}
        onPeriodChange={setPeriod}
      />
    </div>
  );
}
