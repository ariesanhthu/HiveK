import { Card } from "@/components/ui/card";

export default function CampaignDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 pb-16 pt-8 md:px-10">
      <div className="animate-pulse space-y-4 border-b border-primary-soft pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <Card className="h-9 w-64 rounded-xl border-primary-soft bg-muted" />
          <Card className="h-7 w-20 rounded-full border-0 bg-muted" />
        </div>
        <Card className="h-4 w-full max-w-lg border-0 bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="h-32 rounded-2xl border-primary-soft bg-muted/80"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <Card className="h-72 rounded-2xl border-primary-soft bg-muted/60" />
          <Card className="h-64 rounded-2xl border-primary-soft bg-muted/60" />
        </div>
        <div className="space-y-6 lg:col-span-4">
          <Card className="h-56 rounded-2xl border-primary-soft bg-muted/60" />
          <Card className="h-72 rounded-2xl border-primary-soft bg-muted/60" />
        </div>
      </div>
    </div>
  );
}
