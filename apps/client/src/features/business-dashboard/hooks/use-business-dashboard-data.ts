"use client";

import { useMemo, useState } from "react";
import {
  type DashboardActivity,
  type DashboardBarPoint,
  type DashboardData,
  type DashboardLinePoint,
  type DashboardMetric,
  type DashboardPeriod,
} from "@/features/business-dashboard/types";
import { useBusinessNavItems } from "@/features/business-dashboard/hooks/use-business-nav-items";

const METRICS: DashboardMetric[] = [
  {
    id: "active-campaigns",
    label: "Chiến dịch Hoạt động",
    value: "12",
    trendValue: "+2.5%",
    trendDirection: "up",
    icon: "rocket_launch",
  },
  {
    id: "total-spend",
    label: "Tổng Chi tiêu",
    value: "$45,200",
    trendValue: "-1.2%",
    trendDirection: "down",
    icon: "payments",
  },
  {
    id: "avg-roi",
    label: "ROI Trung bình",
    value: "4.2x",
    trendValue: "+0.8%",
    trendDirection: "up",
    icon: "trending_up",
  },
  {
    id: "total-kols",
    label: "Tổng số KOL",
    value: "1,240",
    trendValue: "+15%",
    trendDirection: "up",
    icon: "groups",
  },
];

const CAMPAIGN_TREND_WEEKLY: DashboardLinePoint[] = [
  { label: "T2", value: 38 },
  { label: "T3", value: 44 },
  { label: "T4", value: 34 },
  { label: "T5", value: 56 },
  { label: "T6", value: 72 },
  { label: "T7", value: 28 },
  { label: "CN", value: 76 },
];

const CAMPAIGN_TREND_MONTHLY: DashboardLinePoint[] = [
  { label: "Tuần 1", value: 40 },
  { label: "Tuần 2", value: 52 },
  { label: "Tuần 3", value: 47 },
  { label: "Tuần 4", value: 67 },
];

const CONVERSION_WEEKLY: DashboardBarPoint[] = [
  { label: "Tuần 1", value: 58 },
  { label: "Tuần 2", value: 72 },
  { label: "Tuần 3", value: 42 },
  { label: "Tuần 4", value: 66 },
];

const CONVERSION_MONTHLY: DashboardBarPoint[] = [
  { label: "Tháng 1", value: 52 },
  { label: "Tháng 2", value: 68 },
  { label: "Tháng 3", value: 74 },
  { label: "Tháng 4", value: 62 },
];

const ACTIVITIES: DashboardActivity[] = [
  {
    id: "activity-1",
    title: "Ra mắt Công nghệ Mùa hè",
    description: "Chi tiết chiến dịch được cập nhật bởi Sarah J.",
    timeLabel: "2 giờ trước",
    status: "review",
    icon: "edit_square",
  },
  {
    id: "activity-2",
    title: "Đã thêm KOL mới",
    description: "Alex Rivera đã tham gia chiến dịch 'Gaming Pro'.",
    timeLabel: "5 giờ trước",
    status: "active",
    icon: "person_add",
  },
  {
    id: "activity-3",
    title: "Đã xử lý thanh toán",
    description: "Hóa đơn #3490 đã được thanh toán cho chiến dịch Beauty Vibes.",
    timeLabel: "Hôm qua",
    status: "paid",
    icon: "credit_card",
  },
  {
    id: "activity-4",
    title: "Cảnh báo Ngân sách",
    description: "Chiến dịch 'Thời trang Mùa thu' đã sử dụng 90% ngân sách.",
    timeLabel: "2 ngày trước",
    status: "alert",
    icon: "warning",
  },
];

export function useBusinessDashboardData(): DashboardData & {
  period: DashboardPeriod;
  setPeriod: (period: DashboardPeriod) => void;
} {
  const [period, setPeriod] = useState<DashboardPeriod>("weekly");
  const navItems = useBusinessNavItems();

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
    navItems,
    metrics: METRICS,
    campaignTrend,
    conversionTrend,
    activities: ACTIVITIES,
  };
}
