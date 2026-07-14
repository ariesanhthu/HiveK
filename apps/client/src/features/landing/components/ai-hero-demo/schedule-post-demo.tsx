"use client";

import { useEffect, useRef, useState } from "react";
import { POST_TEXT, SCHEDULE_STEPS } from "./hero-demo-data";
import { ProcessSteps } from "./process-steps";
import { BrowserMockup, DemoCursor } from "./browser-mockup";

type Screen = "plan" | "loading" | "mobile";

const ZOOM_SCALE = 1.6;

type State = {
  cursorX: number;
  cursorY: number;
  clicking: boolean;
  cursorVisible: boolean;
  screen: Screen;
  postTyped: string;
  typingActive: boolean;
  timeSelected: boolean;
  fbSelected: boolean;
  igSelected: boolean;
  fbPosted: boolean;
  igPosted: boolean;
  loadingDone: boolean;
  fbNotifShown: boolean;
  igNotifShown: boolean;
};

const INITIAL_STATE: State = {
  cursorX: 370,
  cursorY: 150,
  clicking: false,
  cursorVisible: true,
  screen: "plan",
  postTyped: "",
  typingActive: false,
  timeSelected: false,
  fbSelected: false,
  igSelected: false,
  fbPosted: false,
  igPosted: false,
  loadingDone: false,
  fbNotifShown: false,
  igNotifShown: false,
};

/**
 * Form-first scheduling demo ("2a" in the design handoff): user fills a post
 * form (content/time/platforms), Hive-K posts to each platform, then a phone
 * notification screen confirms success — mirroring runLoop2() in
 * Canvas.dc.html.
 */
export function SchedulePostDemo({ active }: { active: boolean }) {
  const [state, setState] = useState<State>(INITIAL_STATE);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const aliveRef = useRef(true);

  const patch = (next: Partial<State>) => setState((prev) => ({ ...prev, ...next }));

  const moveAndClick = (x: number, y: number, onArrive: () => void) => {
    patch({ cursorX: x, cursorY: y });
    timerRef.current = setTimeout(() => {
      if (!aliveRef.current) return;
      patch({ clicking: true });
      timerRef.current = setTimeout(() => {
        if (!aliveRef.current) return;
        patch({ clicking: false });
        onArrive();
      }, 260);
    }, 560);
  };

  const typeContent = () => {
    let i = 0;
    patch({ typingActive: true });
    const step = () => {
      if (!aliveRef.current) return;
      i++;
      patch({ postTyped: POST_TEXT.slice(0, i) });
      if (i < POST_TEXT.length) {
        timerRef.current = setTimeout(step, 18);
      } else {
        patch({ typingActive: false });
        timerRef.current = setTimeout(() => moveAndClick(110, 242, pickTime), 350);
      }
    };
    timerRef.current = setTimeout(step, 150);
  };

  const pickTime = () => {
    patch({ timeSelected: true });
    timerRef.current = setTimeout(() => moveAndClick(450, 242, pickFb), 450);
  };
  const pickFb = () => {
    patch({ fbSelected: true });
    timerRef.current = setTimeout(() => moveAndClick(607, 242, pickIg), 400);
  };
  const pickIg = () => {
    patch({ igSelected: true });
    timerRef.current = setTimeout(() => moveAndClick(614, 416, submit), 450);
  };
  const submit = () => {
    patch({ screen: "loading", cursorVisible: false });
    timerRef.current = setTimeout(() => {
      if (!aliveRef.current) return;
      patch({ fbPosted: true });
      timerRef.current = setTimeout(() => {
        if (!aliveRef.current) return;
        patch({ igPosted: true });
        timerRef.current = setTimeout(loadingComplete, 700);
      }, 700);
    }, 700);
  };
  const loadingComplete = () => {
    patch({ loadingDone: true });
    timerRef.current = setTimeout(gotoMobile, 1300);
  };
  const gotoMobile = () => {
    patch({ screen: "mobile" });
    timerRef.current = setTimeout(() => {
      if (!aliveRef.current) return;
      patch({ fbNotifShown: true });
      timerRef.current = setTimeout(() => {
        if (!aliveRef.current) return;
        patch({ igNotifShown: true });
        timerRef.current = setTimeout(runLoop, 2600);
      }, 750);
    }, 600);
  };

  const runLoop = () => {
    setState(INITIAL_STATE);
    timerRef.current = setTimeout(() => moveAndClick(370, 150, typeContent), 500);
  };

  useEffect(() => {
    if (!active) return;
    aliveRef.current = true;
    runLoop();
    return () => {
      aliveRef.current = false;
      clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const isPlan = state.screen === "plan";
  const isLoading = state.screen === "loading";
  const isMobile = state.screen === "mobile";
  const currentStep = isMobile ? 3 : isLoading ? 2 : 1;

  const zoomScale = state.cursorVisible ? ZOOM_SCALE : 1;
  const zoomStyle: React.CSSProperties = {
    transform: `scale(${zoomScale})`,
    transformOrigin: `${state.cursorX}px ${state.cursorY}px`,
    transition: "transform 0.55s cubic-bezier(.4,0,.2,1), transform-origin 0.55s cubic-bezier(.4,0,.2,1)",
    willChange: "transform",
  };

  const timeChipStyle: React.CSSProperties = state.timeSelected
    ? { background: "rgba(245,158,11,0.16)", color: "var(--color-primary)", border: "1.5px solid rgba(245,158,11,0.3)" }
    : { background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1.5px solid rgba(255,255,255,0.14)" };
  const fbPillStyle: React.CSSProperties = state.fbSelected
    ? { background: "rgba(24,119,242,0.16)", color: "#5b9bf5", border: "1.5px solid rgba(24,119,242,0.35)" }
    : { background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1.5px solid rgba(255,255,255,0.14)" };
  const igPillStyle: React.CSSProperties = state.igSelected
    ? { background: "rgba(214,41,118,0.16)", color: "#e8759e", border: "1.5px solid rgba(214,41,118,0.35)" }
    : { background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1.5px solid rgba(255,255,255,0.14)" };
  const submitStyle: React.CSSProperties =
    state.timeSelected && state.fbSelected && state.igSelected
      ? { background: "var(--color-primary)", color: "var(--color-background-dark)" }
      : { background: "rgba(255,255,255,0.08)", color: "#64748b" };

  const chromeLabel = isPlan
    ? "Hive-K AI · Lên lịch đăng bài"
    : isLoading
      ? "Hive-K AI · Đang đăng bài"
      : "Điện thoại của bạn";
  const chromeDotStyle: React.CSSProperties = {
    background: isMobile ? "#22c55e" : "var(--color-primary)",
  };

  return (
    <div className="flex w-full flex-col gap-6 lg:flex-row lg:items-start lg:justify-center">
      <div className="w-full max-w-[400px] shrink-0 pt-1.5 text-left">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-4 py-1.5 text-[0.8rem] font-bold tracking-wide text-primary">
          <span className="material-symbols-outlined text-base" aria-hidden>
            bolt
          </span>
          MỘT LẦN LÊN LỊCH · TỰ ĐỘNG ĐĂNG
        </div>
        <h1 className="my-3.5 text-4xl font-black leading-[1.1] tracking-tight text-foreground md:text-5xl">
          Lên lịch đăng bài, <span className="text-primary">AI lo phần còn lại</span>
        </h1>
        <p className="mb-6 max-w-[420px] text-base leading-relaxed text-foreground-muted">
          Chọn nội dung, thời gian và nền tảng — Hive-K tự động đăng đúng lịch hẹn.
        </p>

        <ProcessSteps title="Lên lịch đăng bài tự động" steps={SCHEDULE_STEPS} currentStep={currentStep} />
      </div>

      <div className="flex w-full justify-center lg:w-auto lg:justify-start">
        <BrowserMockup chromeLabel={chromeLabel} chromeDotStyle={chromeDotStyle} zoomStyle={zoomStyle}>
          {/* SCREEN: PLAN FORM */}
          <div
            className="absolute inset-0 transition-opacity duration-300"
            style={{ opacity: isPlan ? 1 : 0 }}
          >
            <div className="absolute left-9 right-9 top-6">
              <div className="text-[1.05rem] font-extrabold text-white">Tạo bài đăng mới</div>
              <div className="mt-1 text-[0.78rem] text-slate-400">
                Nhập nội dung, thời gian và nền tảng cần đăng
              </div>
            </div>

            <div className="absolute left-9 right-9 top-[88px]">
              <div className="mb-1.5 text-[0.72rem] font-bold tracking-wide text-slate-400">
                NỘI DUNG BÀI ĐĂNG
              </div>
              <div className="h-[76px] overflow-hidden rounded-[10px] border-[1.5px] border-white/[0.12] bg-[#0e1522] px-3.5 py-3 text-[0.82rem] leading-relaxed text-slate-200">
                {state.postTyped}
                {state.typingActive && <span className="hk-caret ml-0.5 inline-block h-[1.05em] w-0.5 bg-white" />}
              </div>
            </div>

            <div className="absolute left-9 top-[204px] w-[170px]">
              <div className="mb-2 text-[0.72rem] font-bold tracking-wide text-slate-400">THỜI GIAN ĐĂNG</div>
              <div
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-[9px] px-3.5 py-2.5 text-[0.8rem] font-bold"
                style={timeChipStyle}
              >
                <span className="material-symbols-outlined text-[15px]" aria-hidden>
                  schedule
                </span>
                {state.timeSelected ? "Hôm nay, 18:00" : "Chọn thời gian đăng"}
              </div>
            </div>

            <div className="absolute right-9 top-[204px] left-[380px]">
              <div className="mb-2 text-[0.72rem] font-bold tracking-wide text-slate-400">
                NỀN TẢNG ĐĂNG BÀI
              </div>
              <div className="flex gap-3">
                <span
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-[9px] px-3.5 py-2 text-[0.78rem] font-bold"
                  style={fbPillStyle}
                >
                  <span className="inline-flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[5px] bg-[#1877F2] text-[0.62rem] font-black text-white">
                    f
                  </span>
                  Facebook
                  {state.fbSelected && (
                    <span className="material-symbols-outlined text-[14px]" aria-hidden>
                      check
                    </span>
                  )}
                </span>
                <span
                  className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-[9px] px-3.5 py-2 text-[0.78rem] font-bold"
                  style={igPillStyle}
                >
                  <span className="inline-flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[5px] bg-[linear-gradient(45deg,#feda75,#d62976_45%,#962fbf_75%,#4f5bd5)]">
                    <span className="material-symbols-outlined text-[11px] text-white" aria-hidden>
                      photo_camera
                    </span>
                  </span>
                  Instagram
                  {state.igSelected && (
                    <span className="material-symbols-outlined text-[14px]" aria-hidden>
                      check
                    </span>
                  )}
                </span>
              </div>
            </div>

            <div className="absolute bottom-6 left-9 right-9 flex justify-end">
              <span
                className="inline-flex items-center gap-2 rounded-full px-5.5 py-2.75 text-[0.85rem] font-extrabold transition-colors duration-300"
                style={submitStyle}
              >
                <span className="material-symbols-outlined text-[17px]" aria-hidden>
                  event_available
                </span>
                Lên lịch đăng
              </span>
            </div>
          </div>

          {/* SCREEN: LOADING */}
          <div
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
            style={{ opacity: isLoading ? 1 : 0 }}
          >
            <div className="flex flex-col items-center gap-4.5">
              {isLoading && !state.loadingDone && (
                <div>
                  <div className="mx-auto mb-5 h-14 w-14 animate-spin rounded-full border-[3px] border-white/[0.14] border-t-primary" />
                  <div className="mb-4.5 text-center text-[0.95rem] font-bold text-white">
                    Đang đăng bài lên các nền tảng...
                  </div>
                  <div className="flex w-[220px] flex-col gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`material-symbols-outlined text-[18px] ${state.fbPosted ? "text-emerald-400" : "animate-spin text-slate-500"}`}
                        aria-hidden
                      >
                        {state.fbPosted ? "check_circle" : "sync"}
                      </span>
                      <span className="text-[0.82rem] font-semibold text-slate-300">Facebook</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`material-symbols-outlined text-[18px] ${state.igPosted ? "text-emerald-400" : "animate-spin text-slate-500"}`}
                        aria-hidden
                      >
                        {state.igPosted ? "check_circle" : "sync"}
                      </span>
                      <span className="text-[0.82rem] font-semibold text-slate-300">Instagram</span>
                    </div>
                  </div>
                </div>
              )}
              {isLoading && state.loadingDone && (
                <div className="flex flex-col items-center gap-3">
                  <span className="material-symbols-outlined text-[60px] text-emerald-500" aria-hidden>
                    check_circle
                  </span>
                  <div className="text-center text-[1.05rem] font-extrabold text-white">
                    Đã đăng bài thành công lên 2 nền tảng!
                  </div>
                  <div className="text-[0.82rem] text-slate-400">Đang mở điện thoại của bạn…</div>
                </div>
              )}
            </div>
          </div>

          {/* SCREEN: MOBILE NOTIFICATIONS */}
          <div
            className="absolute inset-0 flex items-center justify-center bg-[#182233] transition-opacity duration-300"
            style={{ opacity: isMobile ? 1 : 0 }}
          >
            <div className="h-[420px] w-[230px] rounded-[34px] bg-black p-2 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
              <div className="relative h-full w-full overflow-hidden rounded-[26px] bg-[linear-gradient(160deg,#1e293b,#0f172a_55%,#111827)]">
                <div className="absolute left-1/2 top-0 z-[5] h-5 w-20 -translate-x-1/2 rounded-b-xl bg-black" />
                <div className="flex items-center justify-between px-4.5 pt-3 text-[0.62rem] font-bold text-white">
                  <span>9:41</span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]" aria-hidden>
                      signal_cellular_alt
                    </span>
                    <span className="material-symbols-outlined text-[12px]" aria-hidden>
                      wifi
                    </span>
                    <span className="material-symbols-outlined text-[13px]" aria-hidden>
                      battery_full
                    </span>
                  </span>
                </div>
                <div className="absolute left-2.5 right-2.5 top-[46px] flex flex-col gap-2">
                  <div
                    className="flex items-start gap-2.5 rounded-[13px] bg-white/[0.97] p-2.5 shadow-[0_8px_20px_rgba(0,0,0,0.3)] transition-[opacity,transform] duration-400"
                    style={{
                      opacity: state.fbNotifShown ? 1 : 0,
                      transform: state.fbNotifShown ? "translateY(0)" : "translateY(-14px)",
                    }}
                  >
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] bg-[#1877F2] text-[0.68rem] font-black text-white">
                      f
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-1.5">
                        <span className="text-[0.66rem] font-extrabold text-neutral-900">Facebook</span>
                        <span className="text-[0.58rem] text-neutral-400">Bây giờ</span>
                      </div>
                      <div className="mt-0.5 text-[0.64rem] leading-snug text-neutral-600">
                        Bài viết của bạn đã được đăng thành công
                      </div>
                    </div>
                  </div>
                  <div
                    className="flex items-start gap-2.5 rounded-[13px] bg-white/[0.97] p-2.5 shadow-[0_8px_20px_rgba(0,0,0,0.3)] transition-[opacity,transform] duration-400"
                    style={{
                      opacity: state.igNotifShown ? 1 : 0,
                      transform: state.igNotifShown ? "translateY(0)" : "translateY(-14px)",
                    }}
                  >
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] bg-[linear-gradient(45deg,#feda75,#d62976_45%,#962fbf_75%,#4f5bd5)]">
                      <span className="material-symbols-outlined text-[13px] text-white" aria-hidden>
                        photo_camera
                      </span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-1.5">
                        <span className="text-[0.66rem] font-extrabold text-neutral-900">Instagram</span>
                        <span className="text-[0.58rem] text-neutral-400">Bây giờ</span>
                      </div>
                      <div className="mt-0.5 text-[0.64rem] leading-snug text-neutral-600">
                        Bài viết của bạn đã được đăng thành công
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-[7px] left-1/2 h-1 w-[90px] -translate-x-1/2 rounded-full bg-white/40" />
              </div>
            </div>
          </div>

          <DemoCursor x={state.cursorX} y={state.cursorY} visible={state.cursorVisible} clicking={state.clicking} />
        </BrowserMockup>
      </div>
    </div>
  );
}
