"use client";

import type { ReactNode } from "react";

type FlowPageHeaderProps = {
  nav?: ReactNode;
  title: ReactNode;
  actions?: ReactNode;
};

export function FlowPageHeader({ nav, title, actions }: FlowPageHeaderProps) {
  return (
    <header className="space-y-2">
      {nav ? <div>{nav}</div> : null}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">{title}</div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}

