import { ChartContainer, ChartTooltip, ChartTooltipContent } from 'client';
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

const fmt = (v: number | string) => `${new Intl.NumberFormat('vi-VN').format(Number(v))}K`;

// ChartTooltip is recharts' Tooltip re-export — it renders the floating
// ChartTooltipContent card on pointer hover. Here it is wired into a real bar
// chart of KOL reach-by-platform. (The floating card itself is captured
// standalone in the ChartTooltipContent preview, since a static screenshot has
// no hover pointer to trigger the overlay.)
export function ActiveTooltip() {
  return (
    <div style={{ width: 480, height: 280 }}>
      <ChartContainer config={config} className='h-full w-full' style={{ width: 480, height: 280 }}>
        <BarChart width={480} height={280} data={data} margin={{ top: 48 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey='platform' tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={36} />
          <ChartTooltip content={<ChartTooltipContent valueFormatter={fmt} />} />
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
