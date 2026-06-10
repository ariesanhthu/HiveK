"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { RadarMetric } from "@/features/kol-analysis/types";

type ProfileRadarChartProps = {
  data: RadarMetric[];
};

const chartConfig = {
  value: {
    label: "Score",
    color: "#3b82f6",
  },
} satisfies ChartConfig;

export function ProfileRadarChart({ data }: ProfileRadarChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[360px] w-full">
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="rgba(100,116,139,0.28)" />
        <PolarAngleAxis dataKey="metric" tick={{ fill: "var(--color-foreground-muted)", fontSize: 12 }} />
        <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "var(--color-foreground-muted)", fontSize: 11 }} />
        <ChartTooltip content={<ChartTooltipContent hideLabel valueFormatter={(value) => `${value}`} />} />
        <Radar
          dataKey="value"
          fill="var(--color-value)"
          fillOpacity={0.22}
          stroke="var(--color-value)"
          strokeWidth={2}
        />
      </RadarChart>
    </ChartContainer>
  );
}

