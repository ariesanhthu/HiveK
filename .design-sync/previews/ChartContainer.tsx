import { ChartContainer } from 'client';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const config = {
  reach: { label: 'Lượt tiếp cận', color: '#f59e0b' },
} as const;

const data = [
  { platform: 'TikTok', reach: 1240 },
  { platform: 'Instagram', reach: 860 },
  { platform: 'Facebook', reach: 540 },
  { platform: 'YouTube', reach: 320 },
];

export function BarByPlatform() {
  return (
    <div style={{ width: 480, height: 260 }}>
      <ChartContainer config={config} className='h-full w-full' style={{ width: 480, height: 260 }}>
        <BarChart width={480} height={260} data={data}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey='platform' tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={36} />
          <Bar
            dataKey='reach'
            fill='var(--color-reach)'
            radius={[6, 6, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
