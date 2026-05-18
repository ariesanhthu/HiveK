import React from "react";

export function CampaignsPageHeader() {
  return (
    <header className="mb-2 mt-4 space-y-4">
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
        </span>
        Đang mở booking
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl lg:text-5xl">
        Chiến dịch hợp tác trải nghiệm
      </h1>
      <p className="max-w-2xl text-base text-muted-foreground md:text-lg leading-relaxed">
        Khám phá thương vụ hợp tác KOL/KOC theo ngành hàng và mức ngân sách phù hợp. 
        Tham gia ngay để kết nối với các nhãn hàng hàng đầu.
      </p>
    </header>
  );
}
