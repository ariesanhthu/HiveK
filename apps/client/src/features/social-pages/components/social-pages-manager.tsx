"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import type { BackendSocialPage, BackendPlatform } from "@/server/backend/backend-types";
import {
  disconnectSocialPage,
  getFacebookOAuthUrl,
  getThreadsOAuthUrl,
} from "@/features/social-pages/server/social-pages-actions";

type SocialPagesManagerProps = {
  hasEnterprise: boolean;
  initialPages: BackendSocialPage[];
  platforms?: BackendPlatform[];
  initialError?: string;
};

const DEFAULT_PLATFORMS: BackendPlatform[] = [
  { id: "p-fb", name: "Facebook", apiStatus: "stable", baseUrl: "https://facebook.com" },
  { id: "p-th", name: "Threads", apiStatus: "stable", baseUrl: "https://threads.net" },
  { id: "p-ig", name: "Instagram", apiStatus: "maintenance", baseUrl: "https://instagram.com" },
  { id: "p-tt", name: "TikTok", apiStatus: "maintenance", baseUrl: "https://tiktok.com" },
  { id: "p-yt", name: "YouTube", apiStatus: "maintenance", baseUrl: "https://youtube.com" },
];

export function SocialPagesManager({
  hasEnterprise,
  initialPages,
  platforms: rawPlatforms = [],
  initialError,
}: SocialPagesManagerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pages, setPages] = useState<BackendSocialPage[]>(initialPages);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [loadingPlatform, setLoadingPlatform] = useState<string | null>(null);

  const displayPlatforms = rawPlatforms.length > 0 ? rawPlatforms : DEFAULT_PLATFORMS;

  useEffect(() => {
    const successParam = searchParams.get("success");
    const errorParam = searchParams.get("error");

    if (successParam === "true") {
      setNotice({
        type: "success",
        text: "Liên kết tài khoản MXH thành công!",
      });
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
      router.refresh();
    } else if (errorParam || successParam === "false") {
      setNotice({
        type: "error",
        text: errorParam ? `Liên kết thất bại: ${errorParam}` : "Liên kết trang MXH không thành công.",
      });
    }
  }, [searchParams, router]);

  const handleConnectFacebook = async () => {
    setLoadingPlatform("facebook");
    const newTab = window.open("about:blank", "_blank");
    const res = await getFacebookOAuthUrl();
    setLoadingPlatform(null);

    if (res.success && res.url) {
      if (newTab) {
        newTab.location.href = res.url;
      } else {
        window.open(res.url, "_blank", "noopener,noreferrer");
      }
    } else {
      newTab?.close();
      setNotice({
        type: "error",
        text: res.message || "Không thể lấy URL liên kết Facebook.",
      });
    }
  };

  const handleConnectThreads = async () => {
    setLoadingPlatform("threads");
    const newTab = window.open("about:blank", "_blank");
    const res = await getThreadsOAuthUrl();
    setLoadingPlatform(null);

    if (res.success && res.url) {
      if (newTab) {
        newTab.location.href = res.url;
      } else {
        window.open(res.url, "_blank", "noopener,noreferrer");
      }
    } else {
      newTab?.close();
      setNotice({
        type: "error",
        text: res.message || "Không thể lấy URL liên kết Threads.",
      });
    }
  };

  const handleDisconnect = (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn ngắt kết nối với "${name}"?`)) return;

    startTransition(async () => {
      const res = await disconnectSocialPage(id);
      if (res.success) {
        setPages((prev) => prev.filter((p) => p.id !== id));
        setNotice({
          type: "success",
          text: `Đã ngắt kết nối thành công "${name}".`,
        });
      } else {
        setNotice({
          type: "error",
          text: res.message || "Ngắt kết nối thất bại.",
        });
      }
    });
  };

  if (!hasEnterprise) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 text-amber-200">
        <div className="flex items-start gap-4">
          <span className="material-symbols-outlined text-3xl text-amber-400">
            warning
          </span>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Chưa tạo Hồ sơ Doanh nghiệp</h3>
            <p className="text-sm text-amber-200/80">
              Bạn cần tạo Hồ sơ Doanh nghiệp trước khi thực hiện liên kết các trang Facebook hoặc tài khoản Threads.
            </p>
            <Link
              href="/enterprise/setup"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-background-dark shadow-md hover:bg-amber-300"
            >
              <span className="material-symbols-outlined text-base">add_business</span>
              Tạo Hồ sơ Doanh nghiệp ngay
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notice ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
            notice.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">
              {notice.type === "success" ? "check_circle" : "error"}
            </span>
            <span>{notice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            Đóng
          </button>
        </motion.div>
      ) : null}

      {initialError ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {initialError}
        </div>
      ) : null}

      {/* Dynamic Supported Platforms List */}
      <div>
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-foreground-muted">
          Nền tảng Mạng xã hội hỗ trợ ({displayPlatforms.length})
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayPlatforms.map((platform) => {
            const nameLower = platform.name.toLowerCase();
            const isFacebook = nameLower.includes("facebook");
            const isThreads = nameLower.includes("threads");
            const isOauthAllowed = isFacebook || isThreads;

            return (
              <div
                key={platform.id}
                className="flex flex-col justify-between gap-3 rounded-2xl border border-primary-soft bg-card p-4 transition-all hover:border-primary-soft/80"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white shadow-sm ${
                        isFacebook
                          ? "bg-blue-600"
                          : isThreads
                          ? "bg-purple-600"
                          : "bg-white/10 text-foreground"
                      }`}
                    >
                      {platform.icon?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={platform.icon.url}
                          alt={platform.name}
                          className="h-6 w-6 object-contain"
                        />
                      ) : (
                        <span className="material-symbols-outlined text-xl">
                          {isFacebook
                            ? "facebook"
                            : isThreads
                            ? "alternate_email"
                            : "share"}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{platform.name}</h4>
                      <p className="text-[11px] font-mono text-foreground-muted">
                        Status: {platform.apiStatus || "stable"}
                      </p>
                    </div>
                  </div>

                  {isOauthAllowed ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      OAuth sẵn sàng
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                      Tạm khóa OAuth
                    </span>
                  )}
                </div>

                {isFacebook ? (
                  <button
                    type="button"
                    onClick={handleConnectFacebook}
                    disabled={loadingPlatform === "facebook"}
                    className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-md transition-colors hover:bg-blue-500 disabled:opacity-50"
                  >
                    {loadingPlatform === "facebook" ? (
                      <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-base">open_in_new</span>
                    )}
                    Liên kết Facebook Page
                  </button>
                ) : isThreads ? (
                  <button
                    type="button"
                    onClick={handleConnectThreads}
                    disabled={loadingPlatform === "threads"}
                    className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-bold text-white shadow-md transition-colors hover:bg-purple-500 disabled:opacity-50"
                  >
                    {loadingPlatform === "threads" ? (
                      <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-base">open_in_new</span>
                    )}
                    Liên kết Threads Account
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="mt-1 flex cursor-not-allowed items-center justify-center gap-1.5 rounded-xl border border-primary-soft bg-background-light px-3.5 py-2 text-xs font-bold text-foreground-muted"
                  >
                    <span className="material-symbols-outlined text-sm text-amber-500">lock</span>
                    <span>Chưa hỗ trợ OAuth</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Connected Social Pages Table / List */}
      <div className="rounded-2xl border border-primary-soft bg-card p-5">
        <h3 className="mb-4 text-base font-bold text-foreground">
          Danh sách trang & tài khoản đã kết nối ({pages.length})
        </h3>

        {pages.length === 0 ? (
          <div className="py-8 text-center text-sm text-foreground-muted">
            Chưa có trang Mạng xã hội nào được liên kết. Hãy nhấn nút Liên kết ở danh sách trên để bắt đầu!
          </div>
        ) : (
          <div className="space-y-3">
            {pages.map((page) => {
              const displayName = page.pageName || page.name || page.username || page.pageId;
              const isFb = page.platformCode?.toLowerCase() === "facebook";

              return (
                <div
                  key={page.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-primary-soft/60 bg-background-light p-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-white ${
                        isFb ? "bg-blue-600" : "bg-purple-600"
                      }`}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {isFb ? "facebook" : "alternate_email"}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{displayName}</span>
                        <span className="inline-flex items-center rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-primary">
                          {page.platformCode || "unknown"}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          Đã kết nối
                        </span>
                      </div>
                      <p className="text-xs text-foreground-muted">
                        Platform: <code className="rounded bg-white/10 px-1 py-0.5 text-[11px] font-mono text-primary">{page.platformCode}</code> • ID: {page.pageId} {page.followerCount ? `• ${page.followerCount.toLocaleString()} người theo dõi` : ""}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleDisconnect(page.id, displayName)}
                    className="flex items-center gap-1 rounded-xl border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">link_off</span>
                    Ngắt kết nối
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
