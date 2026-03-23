"use client";

import { useMemo, useState } from "react";
import {
  type DashboardActivity,
  type DashboardBarPoint,
  type DashboardData,
  type DashboardLinePoint,
  type DashboardMetric,
  type DashboardNavItem,
  type DashboardPeriod,
} from "@/features/business-dashboard/types";

const NAV_ITEMS: DashboardNavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard", href: "/dashboard", isActive: true },
  { id: "campaigns", label: "Campaigns", icon: "campaign", href: "#", isActive: false },
  { id: "discovery", label: "KOL Discovery", icon: "travel_explore", href: "#", isActive: false },
  { id: "analytics", label: "Analytics", icon: "bar_chart", href: "#", isActive: false },
  { id: "settings", label: "Settings", icon: "settings", href: "#", isActive: false },
];

const METRICS: DashboardMetric[] = [
  {
    id: "active-campaigns",
    label: "Active Campaigns",
    value: "12",
    trendValue: "+2.5%",
    trendDirection: "up",
    icon: "rocket_launch",
  },
  {
    id: "total-spend",
    label: "Total Spend",
    value: "$45,200",
    trendValue: "-1.2%",
    trendDirection: "down",
    icon: "payments",
  },
  {
    id: "avg-roi",
    label: "Avg ROI",
    value: "4.2x",
    trendValue: "+0.8%",
    trendDirection: "up",
    icon: "trending_up",
  },
  {
    id: "total-kols",
    label: "Total KOLs",
    value: "1,240",
    trendValue: "+15%",
    trendDirection: "up",
    icon: "groups",
  },
];

const CAMPAIGN_TREND_WEEKLY: DashboardLinePoint[] = [
  { label: "MON", value: 38 },
  { label: "TUE", value: 44 },
  { label: "WED", value: 34 },
  { label: "THU", value: 56 },
  { label: "FRI", value: 72 },
  { label: "SAT", value: 28 },
  { label: "SUN", value: 76 },
];

const CAMPAIGN_TREND_MONTHLY: DashboardLinePoint[] = [
  { label: "W1", value: 40 },
  { label: "W2", value: 52 },
  { label: "W3", value: 47 },
  { label: "W4", value: 67 },
];

const CONVERSION_WEEKLY: DashboardBarPoint[] = [
  { label: "W1", value: 58 },
  { label: "W2", value: 72 },
  { label: "W3", value: 42 },
  { label: "W4", value: 66 },
];

const CONVERSION_MONTHLY: DashboardBarPoint[] = [
  { label: "M1", value: 52 },
  { label: "M2", value: 68 },
  { label: "M3", value: 74 },
  { label: "M4", value: 62 },
];

const ACTIVITIES: DashboardActivity[] = [
  {
    id: "activity-1",
    title: "Tech Summer Launch",
    description: "Campaign details updated by Sarah J.",
    timeLabel: "2 hours ago",
    status: "review",
    icon: "edit_square",
  },
  {
    id: "activity-2",
    title: "New KOL Onboarded",
    description: "Alex Rivera joined 'Gaming Pro' campaign.",
    timeLabel: "5 hours ago",
    status: "active",
    icon: "person_add",
  },
  {
    id: "activity-3",
    title: "Payment Processed",
    description: "Invoice #3490 settled for Beauty Vibes campaign.",
    timeLabel: "Yesterday",
    status: "paid",
    icon: "credit_card",
  },
  {
    id: "activity-4",
    title: "Budget Alert",
    description: "Campaign 'Fall Fashion' reached 90% budget.",
    timeLabel: "2 days ago",
    status: "alert",
    icon: "warning",
  },
];

export function useBusinessDashboardData(): DashboardData & {
  period: DashboardPeriod;
  setPeriod: (period: DashboardPeriod) => void;
} {
  const [period, setPeriod] = useState<DashboardPeriod>("weekly");

  const campaignTrend = useMemo(
    () => (period === "weekly" ? CAMPAIGN_TREND_WEEKLY : CAMPAIGN_TREND_MONTHLY),
    [period]
  );
  const conversionTrend = useMemo(
    () => (period === "weekly" ? CONVERSION_WEEKLY : CONVERSION_MONTHLY),
    [period]
  );

  return {
    period,
    setPeriod,
    navItems: NAV_ITEMS,
    metrics: METRICS,
    campaignTrend,
    conversionTrend,
    activities: ACTIVITIES,
  };
}
