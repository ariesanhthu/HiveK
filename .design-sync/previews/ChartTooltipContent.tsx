import { ChartContainer, ChartTooltipContent } from 'client';
import { Bar, BarChart } from 'recharts';

const config = {
  reach: { label: 'Lượt tiếp cận', color: '#f59e0b' },
  engagement: { label: 'Tương tác', color: '#3b82f6' },
} as const;

const payload = [
  { dataKey: 'reach', name: 'reach', value: 1240000, color: '#f59e0b' },
  { dataKey: 'engagement', name: 'engagement', value: 186400, color: '#3b82f6' },
];

const fmt = (v: number | string) =>
  new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(v));

// ChartTooltipContent calls useChart(), so it must live inside a ChartContainer
// (which supplies the ChartContext). The hidden chart just provides that context.
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <ChartContainer config={config} className="!block h-auto w-full">
      <BarChart width={1} height={1} data={[{ reach: 1 }]}>
        <Bar dataKey="reach" />
      </BarChart>
      {children as never}
    </ChartContainer>
  );
}

export function Dot() {
  return (
    <div style={{ width: 240, padding: 24 }}>
      <Frame>
        <div style={{ display: 'inline-block' }}>
          <ChartTooltipContent
            active
            label="TikTok"
            indicator="dot"
            payload={payload}
            valueFormatter={fmt}
          />
        </div>
      </Frame>
    </div>
  );
}

export function Line() {
  return (
    <div style={{ width: 240, padding: 24 }}>
      <Frame>
        <div style={{ display: 'inline-block' }}>
          <ChartTooltipContent
            active
            label="Chiến dịch Tết 2025"
            indicator="line"
            payload={payload}
            valueFormatter={fmt}
          />
        </div>
      </Frame>
    </div>
  );
}
