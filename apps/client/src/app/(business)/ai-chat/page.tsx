import { Suspense } from "react";

import { AiChatPage } from "@/features/ai-chat";

export default function AiChatRoutePage() {
  return (
    <Suspense
      fallback={
        <main className="flex h-dvh w-full items-center justify-center bg-slate-50">
          <span className="sr-only">Đang nạp Agent workspace</span>
          <div
            className="h-full w-full animate-pulse bg-[linear-gradient(90deg,#f8fafc_0%,#ffffff_48%,#f8fafc_100%)]"
            aria-hidden
          />
        </main>
      }
    >
      <AiChatPage />
    </Suspense>
  );
}
