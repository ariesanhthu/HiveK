import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  type DashboardBarPoint,
  type DashboardLinePoint,
  type DashboardPeriod,
} from "@/features/business-dashboard/types";

type DashboardPerformanceProps = {
  campaignTrend: DashboardLinePoint[];
  conversionTrend: DashboardBarPoint[];
  period: DashboardPeriod;
  onPeriodChange: (period: DashboardPeriod) => void;
};

type CampaignLineDatum = DashboardLinePoint & { campaign: number };
type ConversionBarDatum = DashboardBarPoint & { conversion: number };

const chartConfig = {
  campaign: {
    label: "Điểm chiến dịch",
    color: "var(--color-primary)",
  },
  conversion: {
    label: "Chuyển đổi",
    color: "var(--color-secondary)",
  },
} satisfies ChartConfig;

export function DashboardPerformance({
  campaignTrend,
  conversionTrend,
  period,
  onPeriodChange,
}: DashboardPerformanceProps) {
  const campaignData: CampaignLineDatum[] = campaignTrend.map((point) => ({
    ...point,
    campaign: point.value,
  }));
  const conversionData: ConversionBarDatum[] = conversionTrend.map((point) => ({
    ...point,
    conversion: point.value,
  }));

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>Hiệu suất Chiến dịch</CardTitle>
            <CardDescription>Đánh giá hiệu quả và Tương tác</CardDescription>
          </div>
          <Badge variant="success">+12%</Badge>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-48 w-full rounded-xl bg-primary-soft p-2">
            <LineChart accessibilityLayer data={campaignData} margin={{ left: 8, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis hide domain={["dataMin - 6", "dataMax + 6"]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                dataKey="campaign"
                type="monotone"
                stroke="var(--color-campaign)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: "var(--color-campaign)" }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div>
            <CardTitle>Xu hướng Chuyển đổi</CardTitle>
            <CardDescription>Chỉ số chuyển đổi</CardDescription>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-primary-soft bg-muted p-1">
            <button
              type="button"
              onClick={() => onPeriodChange("weekly")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                period === "weekly"
                  ? "bg-primary text-background-dark"
                  : "text-foreground-muted hover:bg-primary-soft hover:text-foreground"
              }`}
            >
              Tuần
            </button>
            <button
              type="button"
              onClick={() => onPeriodChange("monthly")}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                period === "monthly"
                  ? "bg-primary text-background-dark"
                  : "text-foreground-muted hover:bg-primary-soft hover:text-foreground"
              }`}
            >
              Tháng
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-48 w-full rounded-xl bg-primary-soft p-2">
            <BarChart accessibilityLayer data={conversionData} margin={{ left: 8, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis hide domain={[0, 100]} />
              <ChartTooltip
                content={<ChartTooltipContent valueFormatter={(value) => `${value}%`} />}
              />
              <Bar
                dataKey="conversion"
                fill="var(--color-conversion)"
                radius={[8, 8, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </section>
  );
}
