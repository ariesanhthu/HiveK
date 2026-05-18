import { Card } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="min-h-[60vh] bg-muted/40 px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto max-w-4xl space-y-6 animate-pulse">
        <Card className="h-3 w-full rounded-t-2xl border-0 bg-primary/20" />
        <Card className="border-primary-soft p-8 md:p-10">
          <div className="mx-auto h-8 w-48 rounded-full bg-muted" />
          <div className="mx-auto mt-6 h-8 w-3/4 max-w-md rounded-lg bg-muted" />
          <div className="mx-auto mt-4 h-4 w-full max-w-lg rounded bg-muted" />
          <div className="mt-10 flex flex-col gap-6 sm:flex-row">
            <div className="h-28 w-28 shrink-0 rounded-xl bg-muted" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-48 rounded bg-muted" />
              <div className="h-4 w-40 rounded bg-muted" />
              <div className="h-4 w-full max-w-xs rounded bg-muted" />
            </div>
            <div className="h-32 flex-1 rounded-xl bg-muted sm:max-w-[180px]" />
          </div>
        </Card>
      </div>
    </div>
  );
}
