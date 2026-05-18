export type DashboardNavItem = {
  id: string;
  label: string;
  icon: string;
  href: string;
  isActive: boolean;
};

export type DashboardMetricTrend = "up" | "down";

export type DashboardMetric = {
  id: string;
  label: string;
  value: string;
  trendValue: string;
  trendDirection: DashboardMetricTrend;
  icon: string;
};

export type DashboardLinePoint = {
  label: string;
  value: number;
};

export type DashboardBarPoint = {
  label: string;
  value: number;
};

export type DashboardActivityStatus = "review" | "active" | "paid" | "alert";

export type DashboardActivity = {
  id: string;
  title: string;
  description: string;
  timeLabel: string;
  status: DashboardActivityStatus;
  icon: string;
};

export type DashboardPeriod = "weekly" | "monthly";

export type DashboardData = {
  navItems: DashboardNavItem[];
  metrics: DashboardMetric[];
  campaignTrend: DashboardLinePoint[];
  conversionTrend: DashboardBarPoint[];
  activities: DashboardActivity[];
};
