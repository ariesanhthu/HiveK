"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { HistogramBin, PlatformRiskPoint } from "@/features/kol-analysis/types";

type ScoreDistributionChartsProps = {
  scoreHistogram: HistogramBin[];
  controversyHistogram: HistogramBin[];
  platformRisk: PlatformRiskPoint[];
};

const scoreConfig = {
  count: { label: "Profiles", color: "#3b82f6" },
} satisfies ChartConfig;

const controversyConfig = {
  count: { label: "Profiles", color: "#f59e0b" },
} satisfies ChartConfig;

const riskConfig = {
  min: { label: "Min", color: "#22c55e" },
  avg: { label: "Avg", color: "#f59e0b" },
  max: { label: "Max", color: "#ef4444" },
} satisfies ChartConfig;

export function ScoreDistributionCharts({
  scoreHistogram,
  controversyHistogram,
  platformRisk,
}: ScoreDistributionChartsProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>KOL Score Distribution</CardTitle>
          <CardDescription>Count of profiles by score range.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={scoreConfig} className="h-64">
            <BarChart data={scoreHistogram}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={28} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Controversy Distribution</CardTitle>
          <CardDescription>Risk score spread across evaluated creators.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={controversyConfig} className="h-64">
            <BarChart data={controversyHistogram}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={28} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Risk by Platform</CardTitle>
          <CardDescription>Min, average, and max controversy risk.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={riskConfig} className="h-64">
            <LineChart data={platformRisk}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="platform" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} width={28} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="min" stroke="var(--color-min)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="avg" stroke="var(--color-avg)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="max" stroke="var(--color-max)" strokeWidth={2} dot={false} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

