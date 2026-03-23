import { Badge } from "@/components/ui/badge";
import {
  type DashboardActivity,
  type DashboardActivityStatus,
} from "@/features/business-dashboard/types";

type DashboardRecentActivitiesProps = {
  activities: DashboardActivity[];
};

function getStatusLabel(status: DashboardActivityStatus): string {
  if (status === "review") return "Review";
  if (status === "active") return "Active";
  if (status === "paid") return "Paid";
  return "Alert";
}

function getStatusVariant(
  status: DashboardActivityStatus
): "warning" | "success" | "secondary" | "default" {
  if (status === "review") return "warning";
  if (status === "active") return "success";
  if (status === "paid") return "secondary";
  return "default";
}

export function DashboardRecentActivities({
  activities,
}: DashboardRecentActivitiesProps) {
  return (
    <section className="rounded-2xl border border-primary-soft bg-card">
      <div className="flex items-center justify-between border-b border-primary-soft px-4 py-3 md:px-5">
        <h2 className="text-lg font-bold text-foreground">Recent Activities</h2>
        <button
          type="button"
          className="text-sm font-semibold text-primary transition-opacity hover:opacity-80"
        >
          View all
        </button>
      </div>

      <div className="divide-y divide-primary-soft">
        {activities.map((activity) => (
          <article
            key={activity.id}
            className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 md:px-5"
          >
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                <span className="material-symbols-outlined text-base">{activity.icon}</span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{activity.title}</p>
                <p className="text-xs text-foreground-muted">{activity.description}</p>
              </div>
            </div>

            <div className="ml-auto flex flex-col items-end gap-1">
              <span className="text-xs text-foreground-muted">{activity.timeLabel}</span>
              <Badge variant={getStatusVariant(activity.status)}>
                {getStatusLabel(activity.status)}
              </Badge>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
