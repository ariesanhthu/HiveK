import { cn } from "@/lib/utils";
import { Rocket, ClipboardCheck, BadgeCheck, TrendingUp } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  badgeLabel: string;
  badgeType: "success" | "warning" | "neutral" | string;
  iconKey: string;
}

export function MetricsCard({ title, value, badgeLabel, badgeType, iconKey }: MetricCardProps) {
  // Map icons
  const renderIcon = () => {
    switch (iconKey) {
      case "rocket":
        return <Rocket className="h-5 w-5 text-orange-500" />;
      case "clipboard":
        return <ClipboardCheck className="h-5 w-5 text-blue-500" />;
      case "checkcircle":
        return <BadgeCheck className="h-5 w-5 text-purple-500" />;
      case "trendingup":
        return <TrendingUp className="h-5 w-5 text-emerald-500" />;
      default:
        return <Rocket className="h-5 w-5 text-slate-500" />;
    }
  };

  // Map badge styles
  let badgeClass = "bg-slate-100 text-slate-500";
  if (badgeType === "success") {
    badgeClass = "bg-emerald-50 text-emerald-600";
  } else if (badgeType === "warning") {
    badgeClass = "bg-orange-50 text-orange-600";
  }

  // Map icon background
  let iconBgClass = "bg-slate-50";
  if (iconKey === "rocket") iconBgClass = "bg-orange-50";
  if (iconKey === "clipboard") iconBgClass = "bg-blue-50";
  if (iconKey === "checkcircle") iconBgClass = "bg-purple-50";
  if (iconKey === "trendingup") iconBgClass = "bg-emerald-50";

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconBgClass)}>
          {renderIcon()}
        </div>
        <div className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold", badgeClass)}>
          {badgeLabel}
        </div>
      </div>
      
      <div className="mt-6 flex flex-col gap-1">
        <span className="text-sm font-semibold text-slate-500">{title}</span>
        <span className="text-3xl font-black text-slate-900">{value}</span>
      </div>
    </div>
  );
}
