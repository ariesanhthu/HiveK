import type { ReactNode } from "react";

type WorkspaceSectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function WorkspaceSectionHeading({
  eyebrow,
  title,
  description,
  action,
}: WorkspaceSectionHeadingProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-amber-700">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-2xl font-extrabold tracking-[-0.025em] text-foreground sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-foreground-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
