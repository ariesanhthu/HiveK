import { Card } from "@/components/ui/card";

export default function CampaignsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 pb-16 pt-8 md:px-10">
      <div className="animate-pulse space-y-8">
        <div className="space-y-3">
          <Card className="h-9 w-64 max-w-full rounded-xl border-primary-soft bg-muted" />
          <Card className="h-4 w-full max-w-xl rounded-lg border-0 bg-muted" />
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card
              key={i}
              className="h-10 w-24 rounded-full border-primary-soft bg-muted"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="overflow-hidden rounded-2xl border-primary-soft p-2"
            >
              <div className="aspect-[16/10] rounded-xl bg-muted" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-24 rounded-full bg-muted" />
                <div className="h-5 w-full rounded bg-muted" />
                <div className="h-4 w-32 rounded bg-muted" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
