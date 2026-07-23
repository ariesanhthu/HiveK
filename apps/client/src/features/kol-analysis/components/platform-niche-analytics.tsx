'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type {
  AudienceTreePoint,
  NicheEngagementPoint,
  PlatformScorePoint,
  ScatterPoint,
} from '@/features/kol-analysis/types';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';

type PlatformNicheAnalyticsProps = {
  platformScores: PlatformScorePoint[];
  nicheEngagement: NicheEngagementPoint[];
  scatterPoints: ScatterPoint[];
  audienceTree: AudienceTreePoint[];
};

const platformConfig = {
  kolScore: { label: 'KOL Score', color: '#f59e0b' },
} satisfies ChartConfig;

const nicheConfig = {
  engagementRate: { label: 'Engagement', color: '#3b82f6' },
} satisfies ChartConfig;

const scatterConfig = {
  kolScore: { label: 'KOL Score', color: '#8b5cf6' },
} satisfies ChartConfig;

const audienceConfig = {
  followers: { label: 'Followers', color: '#14b8a6' },
} satisfies ChartConfig;

function formatCompact(value: number) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function PlatformNicheAnalytics({
  platformScores,
  nicheEngagement,
  scatterPoints,
  audienceTree,
}: PlatformNicheAnalyticsProps) {
  return (
    <div className='grid gap-4 xl:grid-cols-2'>
      <Card>
        <CardHeader>
          <CardTitle>Average KOL Score by Platform</CardTitle>
          <CardDescription>Platform-level scoring benchmark.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={platformConfig} className='h-72'>
            <BarChart data={platformScores}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey='platform' tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={32} />
              <ChartTooltip
                content={<ChartTooltipContent valueFormatter={(value) => `${value}`} />}
              />
              <Bar dataKey='kolScore' fill='var(--color-kolScore)' radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Average Engagement by Niche</CardTitle>
          <CardDescription>Relative engagement strength by category.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={nicheConfig} className='h-72'>
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent hideLabel valueFormatter={(value) => `${value}%`} />}
              />
              <Pie
                data={nicheEngagement}
                dataKey='engagementRate'
                nameKey='niche'
                innerRadius={64}
                outerRadius={104}
                paddingAngle={3}
              >
                {nicheEngagement.map((entry) => <Cell key={entry.niche} fill={entry.fill} />)}
              </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Engagement Quality vs Score</CardTitle>
          <CardDescription>Bubble size maps to follower volume.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={scatterConfig} className='h-72'>
            <ScatterChart>
              <CartesianGrid />
              <XAxis
                dataKey='engagementQuality'
                name='Engagement'
                tickLine={false}
                axisLine={false}
                type='number'
              />
              <YAxis
                dataKey='kolScore'
                name='Score'
                tickLine={false}
                axisLine={false}
                type='number'
              />
              <ZAxis dataKey='followers' range={[48, 360]} name='Followers' />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={() => 'Creator'}
                    valueFormatter={(value) =>
                      typeof value === 'number' && value > 1000 ? formatCompact(value) : `${value}`}
                  />
                }
              />
              <Scatter data={scatterPoints} dataKey='kolScore' fill='var(--color-kolScore)' />
            </ScatterChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Follower Distribution</CardTitle>
          <CardDescription>Aggregated audience by primary platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={audienceConfig} className='h-72'>
            <BarChart data={audienceTree} layout='vertical' margin={{ left: 16 }}>
              <CartesianGrid horizontal={false} />
              <XAxis
                type='number'
                tickFormatter={formatCompact}
                tickLine={false}
                axisLine={false}
              />
              <YAxis dataKey='label' type='category' tickLine={false} axisLine={false} width={76} />
              <ChartTooltip
                content={
                  <ChartTooltipContent valueFormatter={(value) => formatCompact(Number(value))} />
                }
              />
              <Bar dataKey='followers' fill='var(--color-followers)' radius={[0, 6, 6, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
