'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type {
  AnalyticsTrendPoint,
  ContentPillarPerformance,
  WorkspaceAnalytics,
} from '@/features/ai-chat/types/workspace-types';
import { BarChart3, TrendingUp } from 'lucide-react';
import { Area, Bar, BarChart, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts';

export type WorkspaceAnalyticsChartsProps = Pick<
  WorkspaceAnalytics,
  'trend' | 'contentPillars'
>;

const TREND_CONFIG = {
  reach: { label: 'Tiếp cận', color: '#f59e0b' },
  engagements: { label: 'Tương tác', color: '#3b82f6' },
  leads: { label: 'Lead', color: '#8b5cf6' },
} satisfies ChartConfig;

const PILLAR_CONFIG = {
  engagementRate: { label: 'Tỷ lệ tương tác', color: '#8b5cf6' },
} satisfies ChartConfig;

const COMPACT_NUMBER = new Intl.NumberFormat('vi-VN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function formatCompactNumber(value: number | string) {
  const numericValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numericValue)
    ? COMPACT_NUMBER.format(numericValue)
    : String(value);
}

function getTrendSummary(points: AnalyticsTrendPoint[]) {
  if (points.length === 0) {
    return 'Chưa có đủ dữ liệu theo thời gian để mô tả xu hướng.';
  }

  const first = points[0];
  const last = points[points.length - 1];
  let peak = first;

  for (const point of points) {
    if (point.engagements > peak.engagements) peak = point;
  }

  const delta = first.reach > 0
    ? Math.round(((last.reach - first.reach) / first.reach) * 100)
    : null;
  const direction = delta === null
    ? 'chưa thể so sánh'
    : delta === 0
    ? 'không đổi'
    : delta > 0
    ? `tăng ${delta}%`
    : `giảm ${Math.abs(delta)}%`;

  return `Trong ${points.length} kỳ dữ liệu, lượt tiếp cận ${direction}. Tương tác cao nhất ở ${peak.label}, đạt ${
    COMPACT_NUMBER.format(peak.engagements)
  }.`;
}

function getPillarSummary(pillars: ContentPillarPerformance[]) {
  if (pillars.length === 0) {
    return 'Chưa có đủ bài đã gắn trụ cột để so sánh hiệu quả nội dung.';
  }

  let strongest = pillars[0];

  for (const pillar of pillars) {
    if (pillar.engagementRate > strongest.engagementRate) strongest = pillar;
  }

  return `${strongest.label} có tỷ lệ tương tác cao nhất: ${
    strongest.engagementRate.toLocaleString('vi-VN')
  }% trên ${strongest.posts} bài. Dùng kết quả như tín hiệu tham khảo, không tự động thay đổi kế hoạch.`;
}

function EmptyChart({ message }: { message: string; }) {
  return (
    <div className='flex h-64 flex-col items-center justify-center rounded-xl bg-muted px-6 text-center'>
      <BarChart3 className='size-7 text-muted' aria-hidden />
      <p className='mt-3 max-w-sm text-sm font-semibold text-foreground'>Chưa đủ dữ liệu</p>
      <p className='mt-1 max-w-sm text-xs leading-5 text-foreground-muted'>{message}</p>
    </div>
  );
}

function TrendChart({ points }: { points: AnalyticsTrendPoint[]; }) {
  const summary = getTrendSummary(points);

  return (
    <Card className='min-w-0 shadow-none lg:col-span-2'>
      <CardHeader className='pb-2'>
        <div className='flex items-center gap-2'>
          <TrendingUp className='size-5 text-primary' aria-hidden />
          <h3 className='text-base font-extrabold text-foreground'>
            Xu hướng hiệu quả
          </h3>
        </div>
        <p className='text-xs leading-5 text-foreground-muted'>
          Tiếp cận, tương tác và lead theo từng kỳ đồng bộ.
        </p>
      </CardHeader>
      <CardContent>
        {points.length > 0
          ? (
            <figure aria-labelledby='analytics-trend-summary'>
              <div className='mb-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-semibold text-foreground-muted'>
                <span className='inline-flex items-center gap-1.5'>
                  <span className='size-2 rounded-full bg-amber-500' aria-hidden />
                  Tiếp cận
                </span>
                <span className='inline-flex items-center gap-1.5'>
                  <span className='size-2 rounded-full bg-blue-500' aria-hidden />
                  Tương tác
                </span>
                <span className='inline-flex items-center gap-1.5'>
                  <span className='h-0.5 w-3 bg-violet-500' aria-hidden />
                  Lead (trục riêng)
                </span>
              </div>
              <div aria-hidden='true'>
                <ChartContainer
                  config={TREND_CONFIG}
                  className='h-64 w-full sm:h-72'
                >
                  <ComposedChart
                    data={points}
                    margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                  >
                    <defs>
                      <linearGradient id='workspace-reach-fill' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='var(--color-reach)' stopOpacity={0.28} />
                        <stop offset='95%' stopColor='var(--color-reach)' stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray='3 3' />
                    <XAxis
                      dataKey='label'
                      axisLine={false}
                      tickLine={false}
                      minTickGap={24}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis
                      yAxisId='volume'
                      width={42}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value: number) => COMPACT_NUMBER.format(value)}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis yAxisId='leads' orientation='right' hide />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent valueFormatter={formatCompactNumber} />}
                    />
                    <Area
                      yAxisId='volume'
                      type='monotone'
                      dataKey='reach'
                      stroke='var(--color-reach)'
                      strokeWidth={2}
                      fill='url(#workspace-reach-fill)'
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                    <Line
                      yAxisId='volume'
                      type='monotone'
                      dataKey='engagements'
                      stroke='var(--color-engagements)'
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                    <Line
                      yAxisId='leads'
                      type='monotone'
                      dataKey='leads'
                      stroke='var(--color-leads)'
                      strokeWidth={2}
                      strokeDasharray='4 4'
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </ComposedChart>
                </ChartContainer>
              </div>
              <figcaption
                id='analytics-trend-summary'
                className='mt-3 rounded-xl bg-muted px-3 py-2 text-xs leading-5 text-foreground-muted'
              >
                <span className='font-bold text-foreground'>Tóm tắt biểu đồ:</span>
                {summary}
              </figcaption>
            </figure>
          )
          : <EmptyChart message={summary} />}
      </CardContent>
    </Card>
  );
}

function PillarChart({ pillars }: { pillars: ContentPillarPerformance[]; }) {
  const summary = getPillarSummary(pillars);

  return (
    <Card className='min-w-0 shadow-none'>
      <CardHeader className='pb-2'>
        <div className='flex items-center gap-2'>
          <BarChart3 className='size-5 text-violet-600' aria-hidden />
          <h3 className='text-base font-extrabold text-foreground'>
            Hiệu quả trụ cột
          </h3>
        </div>
        <p className='text-xs leading-5 text-foreground-muted'>
          Tỷ lệ tương tác trên các bài đã phân loại.
        </p>
      </CardHeader>
      <CardContent>
        {pillars.length > 0
          ? (
            <figure aria-labelledby='analytics-pillar-summary'>
              <div aria-hidden='true'>
                <ChartContainer config={PILLAR_CONFIG} className='h-64 w-full sm:h-72'>
                  <BarChart
                    data={pillars}
                    layout='vertical'
                    margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
                  >
                    <CartesianGrid horizontal={false} strokeDasharray='3 3' />
                    <XAxis
                      type='number'
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(value: number) => `${value}%`}
                    />
                    <YAxis
                      type='category'
                      dataKey='label'
                      axisLine={false}
                      tickLine={false}
                      width={94}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(label: string) =>
                        label.length > 15 ? `${label.slice(0, 14)}…` : label}
                    />
                    <ChartTooltip
                      cursor={{ fill: 'var(--color-muted)' }}
                      content={
                        <ChartTooltipContent
                          valueFormatter={(value) => `${value}%`}
                        />
                      }
                    />
                    <Bar
                      dataKey='engagementRate'
                      fill='var(--color-engagementRate)'
                      radius={[0, 6, 6, 0]}
                      maxBarSize={22}
                    />
                  </BarChart>
                </ChartContainer>
              </div>
              <figcaption
                id='analytics-pillar-summary'
                className='mt-3 rounded-xl bg-muted px-3 py-2 text-xs leading-5 text-foreground-muted'
              >
                <span className='font-bold text-foreground'>Tóm tắt biểu đồ:</span>
                {summary}
              </figcaption>
            </figure>
          )
          : <EmptyChart message={summary} />}
      </CardContent>
    </Card>
  );
}

export function WorkspaceAnalyticsCharts({
  trend,
  contentPillars,
}: WorkspaceAnalyticsChartsProps) {
  return (
    <section aria-label='Biểu đồ phân tích' className='grid gap-4 lg:grid-cols-3'>
      <TrendChart points={trend} />
      <PillarChart pillars={contentPillars} />
    </section>
  );
}
