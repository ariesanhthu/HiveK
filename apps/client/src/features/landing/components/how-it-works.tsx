"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useReducer, useRef } from "react";
import { useScrollProgress, sub, lerp } from "@/features/landing/components/use-scroll-progress";

/**
 * Ported from a Claude Design canvas (Hive-K "How it works" demo).
 * Two feature sections whose mock UIs are driven by a scripted animation
 * timeline: typing effects, a moving/clicking cursor, zoom, and screen
 * transitions (Facebook / Instagram / inbox). The whole loop restarts.
 *
 * Colors come from the app's CSS variables (--color-primary etc.) which
 * already match the original design, so this reads correctly in the theme.
 */

const ZOOM_SCALE = 1.45;

const BOT_INTRO_TEXT =
  "Chào bạn! Điền thông tin dưới đây để mình khởi tạo Hive-K cho bạn:";
const BRAND_NAME = "Coffee House";
const POST_TEXT =
  "Ưu đãi cuối tuần – giảm 30% toàn bộ sản phẩm, áp dụng đến Chủ Nhật.";
const INBOX_REPLY_TEXT =
  "Dạ, ưu đãi giảm 30% áp dụng đến hết Chủ Nhật ạ. Anh/chị ghé cửa hàng hoặc đặt online đều được nhé!";

type StepDef = {
  title: string;
  desc: string;
  isLetter: boolean;
  letter?: string;
  icon?: string;
  brand: string;
  ring: string;
  color: string;
};

const STEP_DEFS: StepDef[] = [
  { title: "Điền form khởi tạo", desc: "Hive-K AI tự động gửi form yêu cầu", isLetter: false, icon: "assignment", brand: "var(--color-primary)", ring: "rgba(245,158,11,0.22)", color: "var(--color-background-dark)" },
  { title: "Xác nhận Facebook", desc: "Cho phép Hive-K quản lý trang", isLetter: true, letter: "f", brand: "#1877F2", ring: "rgba(24,119,242,0.22)", color: "#fff" },
  { title: "Xác nhận Instagram", desc: "Cho phép Hive-K quản lý tài khoản", isLetter: false, icon: "photo_camera", brand: "linear-gradient(45deg,#feda75,#d62976 45%,#962fbf 75%,#4f5bd5)", ring: "rgba(214,41,118,0.25)", color: "#fff" },
  { title: "Hoàn tất", desc: "Cả 2 nền tảng đã sẵn sàng", isLetter: false, icon: "task_alt", brand: "#22c55e", ring: "rgba(34,197,94,0.22)", color: "#fff" },
];

const STEP_DEFS2: StepDef[] = [
  { title: "Nhập nội dung bài đăng", desc: "Nội dung, thời gian, nền tảng", isLetter: false, icon: "edit_note", brand: "var(--color-primary)", ring: "rgba(245,158,11,0.22)", color: "var(--color-background-dark)" },
  { title: "Hive-K tự động đăng bài", desc: "Đăng đồng thời lên các nền tảng", isLetter: false, icon: "bolt", brand: "var(--color-primary)", ring: "rgba(245,158,11,0.22)", color: "var(--color-background-dark)" },
  { title: "Thông báo hoàn tất", desc: "Nhận thông báo ngay trên điện thoại", isLetter: false, icon: "notifications", brand: "#22c55e", ring: "rgba(34,197,94,0.22)", color: "#fff" },
  { title: "Trả lời tin nhắn đa nền tảng", desc: "Một hộp thư — AI trả lời mọi kênh", isLetter: false, icon: "forum", brand: "var(--color-primary)", ring: "rgba(245,158,11,0.22)", color: "var(--color-background-dark)" },
];

type ConvDef = {
  name: string;
  preview: string;
  plat: string;
  initial: string;
  badgeBg: string;
  badgeIcon: string;
  isLetter: boolean;
};

const CONV_DEFS: ConvDef[] = [
  { name: "Minh Anh", preview: "Ưu đãi cuối tuần còn không shop?", plat: "Facebook", initial: "M", badgeBg: "#1877F2", badgeIcon: "f", isLetter: true },
  { name: "thu.hằng", preview: "Giảm 30% tới khi nào vậy ạ?", plat: "Instagram", initial: "T", badgeBg: "linear-gradient(45deg,#feda75,#d62976 45%,#962fbf 75%,#4f5bd5)", badgeIcon: "photo_camera", isLetter: false },
  { name: "Quốc Bảo", preview: "Đặt online có ship không?", plat: "TikTok", initial: "Q", badgeBg: "#010101", badgeIcon: "music_note", isLetter: false },
];

type State = {
  activeScreen: "chat" | "facebook" | "instagram";
  cursorX: number;
  cursorY: number;
  clicking: boolean;
  cursorVisible: boolean;
  zoomActive: boolean;
  botTyping: boolean;
  chatShowAi: boolean;
  formShown: boolean;
  formBrandTyped: string;
  formBrandTypingActive: boolean;
  formComplete: boolean;
  showFinalMsg: boolean;
  fbConnected: boolean;
  igConnected: boolean;
  fbStep: "ask" | "done";
  igStep: "ask" | "done";
  intro1: boolean;

  p2Screen: "plan" | "loading" | "mobile" | "inbox";
  p2PostTyped: string;
  p2TypingActive: boolean;
  p2TimeSelected: boolean;
  p2FbSelected: boolean;
  p2IgSelected: boolean;
  p2FbPosted: boolean;
  p2IgPosted: boolean;
  p2LoadingDone: boolean;
  p2FbNotifShown: boolean;
  p2IgNotifShown: boolean;
  p2ActiveConv: number;
  p2ReplyTyped: string;
  p2ReplyTypingActive: boolean;
  p2ReplySent: boolean;
  p2CursorX: number;
  p2CursorY: number;
  p2Clicking: boolean;
  p2CursorVisible: boolean;
  intro2: boolean;
};

const initialState: State = {
  activeScreen: "chat",
  cursorX: 370, cursorY: 230, clicking: false, cursorVisible: false, zoomActive: false,
  botTyping: false, chatShowAi: false, formShown: false,
  formBrandTyped: "", formBrandTypingActive: false,
  formComplete: false, showFinalMsg: false,
  fbConnected: false, igConnected: false,
  fbStep: "ask", igStep: "ask",
  intro1: true,

  p2Screen: "plan",
  p2PostTyped: "", p2TypingActive: false,
  p2TimeSelected: false, p2FbSelected: false, p2IgSelected: false,
  p2FbPosted: false, p2IgPosted: false, p2LoadingDone: false,
  p2FbNotifShown: false, p2IgNotifShown: false,
  p2ActiveConv: 0, p2ReplyTyped: "", p2ReplyTypingActive: false, p2ReplySent: false,
  p2CursorX: 370, p2CursorY: 150, p2Clicking: false, p2CursorVisible: true,
  intro2: true,
};

function reducer(state: State, patch: Partial<State>): State {
  return { ...state, ...patch };
}

type StepRow = {
  title: string;
  desc: string;
  showCheck: boolean;
  showLetter: boolean;
  showIcon: boolean;
  letter: string;
  icon: string;
  circleStyle: React.CSSProperties;
  titleStyle: React.CSSProperties;
  descStyle: React.CSSProperties;
  gap: string;
};

function styleFromString(css: string): React.CSSProperties {
  const out: Record<string, string> = {};
  css.split(";").forEach((decl) => {
    const i = decl.indexOf(":");
    if (i === -1) return;
    const prop = decl.slice(0, i).trim();
    const val = decl.slice(i + 1).trim();
    if (!prop) return;
    const camel = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    out[camel] = val;
  });
  return out as React.CSSProperties;
}

function computeSteps(defs: StepDef[], currentStep: number) {
  const stepCount = defs.length;
  const progressPct = ((currentStep - 1) / (stepCount - 1)) * 100;
  const gradient = `linear-gradient(to bottom, #4ade80 0%, #4ade80 ${progressPct}%, rgba(255,255,255,0.14) ${progressPct}%, rgba(255,255,255,0.14) 100%)`;
  const steps: StepRow[] = defs.map((d, idx) => {
    const num = idx + 1;
    const status = num < currentStep ? "done" : num === currentStep ? "active" : "pending";
    const circleBg = status === "done" ? "#123524" : status === "active" ? d.brand : "#1c2739";
    const circleColor = status === "done" ? "#4ade80" : status === "active" ? d.color : "#64748b";
    const circleBorder = status === "pending" ? "1.5px solid rgba(255,255,255,0.14)" : status === "done" ? "1.5px solid rgba(74,222,128,0.4)" : "1.5px solid transparent";
    const ringShadow = status === "active" ? `0 0 0 5px ${d.ring}` : "none";
    return {
      title: d.title,
      desc: d.desc,
      showCheck: status === "done",
      showLetter: status !== "done" && d.isLetter,
      showIcon: status !== "done" && !d.isLetter,
      letter: d.letter || "",
      icon: d.icon || "",
      circleStyle: styleFromString(`width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:0.95rem; flex:0 0 auto; position:relative; z-index:1; transition:all 0.35s; background:${circleBg}; color:${circleColor}; border:${circleBorder}; box-shadow:${ringShadow}`),
      titleStyle: styleFromString(`font-weight:700; font-size:0.92rem; transition:color 0.3s; color:${status === "pending" ? "var(--color-foreground-muted)" : "var(--color-foreground)"}`),
      descStyle: styleFromString(`font-size:0.8rem; margin-top:2px; transition:color 0.3s; color:var(--color-foreground-muted)`),
      gap: idx === defs.length - 1 ? "0px" : "26px",
    };
  });
  return { steps, gradient };
}

const HiveIcon: React.FC<{ size: number; padding?: number; radius?: number }> = ({ size, padding = 5, radius = 9 }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      borderRadius: radius,
      background: "#fff",
      padding,
      boxSizing: "border-box",
      flex: "0 0 auto",
    }}
  >
    <Image src="/logo.png" alt="Hive-K" width={size} height={size} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
  </span>
);

const Sym: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <span className="material-symbols-outlined" style={style}>
    {children}
  </span>
);

export const HowItWorks: React.FC = () => {
  const [s, dispatch] = useReducer(reducer, initialState);
  const set = useCallback((patch: Partial<State>) => dispatch(patch), []);

  // Tiến độ cuộn của 2 sân khấu demo — diễn theo px, kéo lên tua ngược.
  const sp1 = useScrollProgress<HTMLElement>();
  const sp2 = useScrollProgress<HTMLElement>();

  // Keep timers so we can clear on unmount. Two independent lanes (section 1 & 2).
  const alive = useRef(false);
  const t1 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t2 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(s);
  stateRef.current = s;

  const wait1 = (ms: number, fn: () => void) => {
    t1.current = setTimeout(() => {
      if (alive.current) fn();
    }, ms);
  };
  const wait2 = (ms: number, fn: () => void) => {
    t2.current = setTimeout(() => {
      if (alive.current) fn();
    }, ms);
  };

  // ---- animation timelines ----
  useEffect(() => {
    alive.current = true;

    // ===== SECTION 1 =====
    const moveAndClick = (x: number, y: number, onArrive?: () => void) => {
      set({ cursorX: x, cursorY: y });
      wait1(560, () => {
        set({ clicking: true });
        wait1(260, () => {
          set({ clicking: false });
          onArrive?.();
        });
      });
    };

    const runConnect = () => {
      set({
        intro1: true,
        activeScreen: "chat",
        botTyping: false, chatShowAi: false, formShown: false,
        formBrandTyped: "", formBrandTypingActive: false,
        formComplete: false, showFinalMsg: false,
        fbConnected: false, igConnected: false,
        fbStep: "ask", igStep: "ask",
        cursorX: 370, cursorY: 230, cursorVisible: false, zoomActive: false,
      });
      wait1(1700, () => {
        set({ intro1: false, botTyping: true });
        wait1(900, () => {
          set({ botTyping: false, chatShowAi: true });
          wait1(350, () => {
            set({ formShown: true });
            wait1(500, () => {
              set({ zoomActive: true, cursorVisible: true });
              moveAndClick(240, 184, typeBrand);
            });
          });
        });
      });
    };

    const typeBrand = () => {
      let i = 0;
      set({ formBrandTypingActive: true });
      const step = () => {
        i++;
        set({ formBrandTyped: BRAND_NAME.slice(0, i) });
        if (i < BRAND_NAME.length) {
          wait1(55, step);
        } else {
          set({ formBrandTypingActive: false });
          wait1(400, () => moveAndClick(110, 256, gotoFacebook));
        }
      };
      wait1(150, step);
    };

    const gotoFacebook = () => {
      set({ activeScreen: "facebook", fbStep: "ask", zoomActive: false });
      wait1(1100, () => {
        set({ zoomActive: true });
        moveAndClick(414, 297, confirmFacebook);
      });
    };
    const confirmFacebook = () => {
      set({ fbStep: "done" });
      wait1(1200, returnFromFacebook);
    };
    const returnFromFacebook = () => {
      set({ activeScreen: "chat", fbConnected: true, zoomActive: false });
      wait1(1100, () => {
        set({ zoomActive: true });
        moveAndClick(265, 256, gotoInstagram);
      });
    };
    const gotoInstagram = () => {
      set({ activeScreen: "instagram", igStep: "ask", zoomActive: false });
      wait1(1100, () => {
        set({ zoomActive: true });
        moveAndClick(414, 297, confirmInstagram);
      });
    };
    const confirmInstagram = () => {
      set({ igStep: "done" });
      wait1(1200, returnFromInstagram);
    };
    const returnFromInstagram = () => {
      set({ activeScreen: "chat", igConnected: true, zoomActive: false });
      wait1(1100, () => {
        set({ zoomActive: true });
        moveAndClick(372, 336, submitComplete);
      });
    };
    const submitComplete = () => {
      set({ formComplete: true });
      wait1(500, () => {
        set({ showFinalMsg: true, zoomActive: false, cursorVisible: false });
        wait1(3600, runConnect);
      });
    };

    // ===== SECTION 2 =====
    const moveAndClick2 = (x: number, y: number, onArrive?: () => void) => {
      set({ p2CursorX: x, p2CursorY: y });
      wait2(560, () => {
        set({ p2Clicking: true });
        wait2(260, () => {
          set({ p2Clicking: false });
          onArrive?.();
        });
      });
    };

    const runPublish = () => {
      set({
        intro2: true,
        p2Screen: "plan",
        p2PostTyped: "", p2TypingActive: false,
        p2TimeSelected: false, p2FbSelected: false, p2IgSelected: false,
        p2FbPosted: false, p2IgPosted: false, p2LoadingDone: false,
        p2FbNotifShown: false, p2IgNotifShown: false,
        p2ActiveConv: 0, p2ReplyTyped: "", p2ReplyTypingActive: false, p2ReplySent: false,
        p2CursorX: 370, p2CursorY: 150, p2CursorVisible: false,
      });
      wait2(1700, () => {
        set({ intro2: false, p2CursorVisible: true });
        wait2(500, () => moveAndClick2(370, 150, p2TypeContent));
      });
    };

    const p2TypeContent = () => {
      let i = 0;
      set({ p2TypingActive: true });
      const step = () => {
        i++;
        set({ p2PostTyped: POST_TEXT.slice(0, i) });
        if (i < POST_TEXT.length) {
          wait2(18, step);
        } else {
          set({ p2TypingActive: false });
          wait2(350, () => moveAndClick2(110, 242, p2PickTime));
        }
      };
      wait2(150, step);
    };
    const p2PickTime = () => {
      set({ p2TimeSelected: true });
      wait2(450, () => moveAndClick2(450, 242, p2PickFb));
    };
    const p2PickFb = () => {
      set({ p2FbSelected: true });
      wait2(400, () => moveAndClick2(607, 242, p2PickIg));
    };
    const p2PickIg = () => {
      set({ p2IgSelected: true });
      wait2(450, () => moveAndClick2(614, 416, p2Submit));
    };
    const p2Submit = () => {
      set({ p2Screen: "loading", p2CursorVisible: false });
      wait2(700, () => {
        set({ p2FbPosted: true });
        wait2(700, () => {
          set({ p2IgPosted: true });
          wait2(700, p2LoadingComplete);
        });
      });
    };
    const p2LoadingComplete = () => {
      set({ p2LoadingDone: true });
      wait2(1300, p2GotoMobile);
    };
    const p2GotoMobile = () => {
      set({ p2Screen: "mobile" });
      wait2(600, () => {
        set({ p2FbNotifShown: true });
        wait2(750, () => {
          set({ p2IgNotifShown: true });
          wait2(2200, p2GotoInbox);
        });
      });
    };
    const p2GotoInbox = () => {
      set({ p2Screen: "inbox", p2CursorX: 300, p2CursorY: 90, p2CursorVisible: true });
      wait2(700, () => moveAndClick2(112, 156, p2OpenConv));
    };
    const p2OpenConv = () => {
      set({ p2ActiveConv: 1 });
      wait2(800, () => moveAndClick2(500, 400, p2TypeReply));
    };
    const p2TypeReply = () => {
      let i = 0;
      set({ p2ReplyTypingActive: true });
      const step = () => {
        i++;
        set({ p2ReplyTyped: INBOX_REPLY_TEXT.slice(0, i) });
        if (i < INBOX_REPLY_TEXT.length) {
          wait2(16, step);
        } else {
          set({ p2ReplyTypingActive: false });
          wait2(400, () => moveAndClick2(650, 400, p2SendReply));
        }
      };
      wait2(150, step);
    };
    const p2SendReply = () => {
      set({ p2ReplySent: true, p2CursorVisible: false });
      wait2(3000, runPublish);
    };

    runConnect();
    runPublish();

    return () => {
      alive.current = false;
      if (t1.current) clearTimeout(t1.current);
      if (t2.current) clearTimeout(t2.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- derived render values (mirrors the design's renderVals) ----
  const isChat = s.activeScreen === "chat";
  const isFb = s.activeScreen === "facebook";
  const isIg = s.activeScreen === "instagram";
  const currentStep = s.showFinalMsg ? 4 : isIg || (isChat && s.igConnected) ? 3 : isFb || (isChat && s.fbConnected) ? 2 : 1;
  const stepResult = computeSteps(STEP_DEFS, currentStep);

  const isPlan2 = s.p2Screen === "plan";
  const isLoading2 = s.p2Screen === "loading";
  const isMobile2 = s.p2Screen === "mobile";
  const isInbox2 = s.p2Screen === "inbox";
  const currentStep2 = isInbox2 ? 4 : isMobile2 ? 3 : isLoading2 ? 2 : 1;
  const stepResult2 = computeSteps(STEP_DEFS2, currentStep2);

  const activeConv = CONV_DEFS[s.p2ActiveConv];

  const z1 = s.zoomActive ? ZOOM_SCALE : 1;
  const zoomStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    transform: `scale(${z1})`,
    transformOrigin: `${s.cursorX}px ${s.cursorY}px`,
    transition: "transform 0.55s cubic-bezier(.4,0,.2,1), transform-origin 0.55s cubic-bezier(.4,0,.2,1)",
    willChange: "transform",
  };
  const z2 = s.zoomActive ? ZOOM_SCALE : 1; // section 2 has no zoom in the timeline; keep 1
  const zoomStyle2: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    transform: `scale(${isPlan2 || isInbox2 ? 1 : 1})`,
    transformOrigin: `${s.p2CursorX}px ${s.p2CursorY}px`,
    transition: "transform 0.55s cubic-bezier(.4,0,.2,1), transform-origin 0.55s cubic-bezier(.4,0,.2,1)",
    willChange: "transform",
  };
  void z2;

  const chromeLabel = isChat ? "Hive-K AI · Kết nối tài khoản" : isFb ? "facebook.com" : "instagram.com";
  const chromeDotColor = isChat ? "var(--color-primary)" : isFb ? "#1877F2" : "linear-gradient(45deg,#feda75,#d62976 45%,#962fbf 75%,#4f5bd5)";

  const chromeLabel2 = isPlan2 ? "Hive-K AI · Lên lịch đăng bài" : isLoading2 ? "Hive-K AI · Đang đăng bài" : isMobile2 ? "Điện thoại của bạn" : "Hive-K AI · Hộp thư hợp nhất";
  const chromeDotColor2 = isMobile2 ? "#22c55e" : "var(--color-primary)";

  const fbFormChipStyle = styleFromString(
    s.fbConnected
      ? "background:rgba(74,222,128,0.14); color:#4ade80; border:1.5px solid rgba(74,222,128,0.35)"
      : "background:rgba(255,255,255,0.06); color:#e2e8f0; border:1.5px solid rgba(255,255,255,0.14)"
  );
  const igFormChipStyle = styleFromString(
    s.igConnected
      ? "background:rgba(74,222,128,0.14); color:#4ade80; border:1.5px solid rgba(74,222,128,0.35)"
      : "background:rgba(255,255,255,0.06); color:#e2e8f0; border:1.5px solid rgba(255,255,255,0.14)"
  );
  const submitBtnStyle = styleFromString(
    s.formComplete ? "background:rgba(74,222,128,0.16); color:#4ade80" : "background:var(--color-primary); color:var(--color-background-dark)"
  );

  const p2TimeChipStyle = styleFromString(
    s.p2TimeSelected
      ? "background:rgba(245,158,11,0.16); color:var(--color-primary); border:1.5px solid rgba(245,158,11,0.3)"
      : "background:rgba(255,255,255,0.06); color:#94a3b8; border:1.5px solid rgba(255,255,255,0.14)"
  );
  const p2FbPillStyle = styleFromString(
    s.p2FbSelected
      ? "background:rgba(24,119,242,0.16); color:#5b9bf5; border:1.5px solid rgba(24,119,242,0.35)"
      : "background:rgba(255,255,255,0.06); color:#94a3b8; border:1.5px solid rgba(255,255,255,0.14)"
  );
  const p2IgPillStyle = styleFromString(
    s.p2IgSelected
      ? "background:rgba(214,41,118,0.16); color:#e8759e; border:1.5px solid rgba(214,41,118,0.35)"
      : "background:rgba(255,255,255,0.06); color:#94a3b8; border:1.5px solid rgba(255,255,255,0.14)"
  );
  const p2SubmitStyle = styleFromString(
    s.p2TimeSelected && s.p2FbSelected && s.p2IgSelected
      ? "background:var(--color-primary); color:var(--color-background-dark)"
      : "background:rgba(255,255,255,0.08); color:#64748b"
  );

  const cursor = (x: number, y: number, clicking: boolean, visible: boolean) => (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 30,
        height: 30,
        transform: `translate(${x}px,${y}px)`,
        opacity: visible ? 1 : 0,
        transition: "transform 0.55s cubic-bezier(.4,0,.2,1), opacity 0.3s",
        pointerEvents: "none",
        zIndex: 80,
      }}
    >
      <span style={{ position: "absolute", left: 2, top: 2, width: 22, height: 22, borderRadius: "50%", background: "#fff", boxShadow: "0 3px 10px rgba(0,0,0,0.4)" }} />
      <Sym style={{ position: "relative", left: 3, top: 1, fontSize: 20, color: "#111", display: "inline-block", transform: "scaleX(-1)" }}>near_me</Sym>
      {clicking && (
        <div style={{ position: "absolute", left: -6, top: -6, width: 42, height: 42, borderRadius: "50%", border: "2px solid var(--color-primary)", animation: "hk-clickPulse 0.4s ease-out" }} />
      )}
    </div>
  );

  return (
    // Background/starfield come from the parent `.landing-root`; this stays
    // transparent so it adapts to light/dark mode.
    <div style={{ background: "transparent" }}>
      <style>{`
        @keyframes hk-blink { 0%,50% { opacity:1 } 51%,100% { opacity:0 } }
        @keyframes hk-clickPulse { from { transform:scale(0.5); opacity:1; } to { transform:scale(1.3); opacity:0; } }
        @keyframes hk-spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes hk-typingBounce { 0%,60%,100% { opacity:0.35; transform:translateY(0); } 30% { opacity:1; transform:translateY(-3px); } }
        .hk-caret { display:inline-block; width:2px; height:1.05em; background:#fff; margin-left:2px; vertical-align:-2px; animation:hk-blink 1.05s step-end infinite; }
        .hk-typing-dot { width:6px; height:6px; border-radius:50%; background:#94a3b8; display:inline-block; animation:hk-typingBounce 1.1s ease-in-out infinite; }
        .hk-mock { position:relative; width:740px; flex:0 0 auto; background:#0e1522; border:1px solid rgba(255,255,255,0.10); border-radius:16px; box-shadow:0 34px 76px rgba(0,0,0,0.5); overflow:hidden; text-align:left; }
        .hk-mock-chrome { display:flex; align-items:center; gap:7px; padding:11px 14px; background:#141c2c; border-bottom:1px solid rgba(255,255,255,0.08); }
        .hk-stage { position:relative; height:460px; overflow:hidden; }
        .hk-dot { width:10px; height:10px; border-radius:50%; display:inline-block; }
      `}</style>

      {/* HERO — sân khấu mở màn */}
      <div id="hero" className="landing-stage">
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "88px 24px 24px", width: "100%" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(245,158,11,0.16)", color: "var(--color-primary)", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.06em", padding: "8px 16px", borderRadius: 9999 }}>
            <Sym style={{ fontSize: 16 }}>auto_awesome</Sym> NỀN TẢNG KOL MARKETING VẬN HÀNH BẰNG AI
          </div>
          <h1 style={{ fontSize: "3.4rem", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.08, margin: "24px auto 16px", color: "var(--color-foreground)", maxWidth: 820 }}>
            Một trợ lý AI cho <span className="shine-text">toàn bộ</span> mạng xã hội của bạn
          </h1>
          <p style={{ fontSize: "1.15rem", lineHeight: 1.6, color: "var(--color-foreground-muted)", margin: "0 auto", maxWidth: 600 }}>
            Kết nối tài khoản, lên lịch đăng bài và trả lời tin nhắn đa nền tảng — tất cả trong Hive-K.
          </p>
        </div>
      </div>

      {/* SECTION 1 — sân khấu "Kết nối" */}
      {/* KHÔNG transform trực tiếp lên <section> (snap-target) — snap area tính
          theo border box SAU transform nên sẽ làm điểm snap trôi; hiệu ứng đặt
          ở wrapper con bên trong. */}
      <section id="s1" ref={sp1.ref} className="landing-stage" style={{ padding: "24px" }}>
        <span className="stage-ghost" aria-hidden>KẾT NỐI</span>
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "flex-start",
            gap: 48,
            flexWrap: "wrap",
            justifyContent: "center",
            opacity: sub(sp1.p, 0, 0.55),
            transform: `translateY(${lerp(64, 0, sub(sp1.p, 0, 0.7))}px) scale(${lerp(0.94, 1, sub(sp1.p, 0, 0.7))})`,
          }}
        >
          <div style={{ position: "absolute", top: -30, left: 320, width: 760, height: 340, background: "radial-gradient(ellipse, rgba(245,158,11,0.14), transparent 66%)", pointerEvents: "none" }} />
          <div style={{ width: 380, flex: "0 0 auto", textAlign: "left", paddingTop: 24 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(245,158,11,0.16)", color: "var(--color-primary)", fontWeight: 700, fontSize: "0.76rem", letterSpacing: "0.08em", padding: "6px 13px", borderRadius: 9999 }}>
              <Sym style={{ fontSize: 15 }}>hub</Sym> KẾT NỐI TỰ ĐỘNG
            </div>
            <h2 style={{ fontSize: "2.3rem", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.12, margin: "18px 0 14px", color: "var(--color-foreground)" }}>
              Kết nối tài khoản <span style={{ color: "var(--color-primary)" }}>chỉ bằng một câu chat</span>
            </h2>
            <p style={{ fontSize: "1.02rem", lineHeight: 1.6, color: "var(--color-foreground-muted)", margin: "0 0 28px" }}>
              Hive-K AI gửi form khởi tạo, bạn xác nhận Facebook &amp; Instagram — xong.
            </p>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 17, top: 18, bottom: 18, width: 2, background: stepResult.gradient, zIndex: 0, transition: "background 0.4s" }} />
              {stepResult.steps.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", position: "relative", zIndex: 1, paddingBottom: step.gap }}>
                  <div style={step.circleStyle}>
                    {step.showCheck && <Sym style={{ fontSize: 18 }}>check</Sym>}
                    {step.showLetter && step.letter}
                    {step.showIcon && <Sym style={{ fontSize: 16 }}>{step.icon}</Sym>}
                  </div>
                  <div>
                    <div style={step.titleStyle}>{step.title}</div>
                    <div style={step.descStyle}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hk-mock">
            <div className="hk-mock-chrome">
              <span className="hk-dot" style={{ background: "#ef4444" }} />
              <span className="hk-dot" style={{ background: "#f59e0b" }} />
              <span className="hk-dot" style={{ background: "#22c55e" }} />
              <span style={{ marginLeft: 8, display: "inline-flex", alignItems: "center", gap: 6, color: "#94a3b8", fontSize: "0.74rem", fontWeight: 600 }}>
                <span style={{ width: 13, height: 13, borderRadius: 4, display: "inline-block", background: chromeDotColor }} />
                {chromeLabel}
              </span>
            </div>
            <div className="hk-stage">
              <div style={zoomStyle}>
                {/* CHAT */}
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", opacity: isChat ? 1 : 0, transition: "opacity 0.4s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", background: "#141c2c", borderBottom: "1px solid rgba(255,255,255,0.08)", flex: "0 0 auto" }}>
                    <HiveIcon size={30} radius={9} />
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem" }}>Hive-K AI</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, marginLeft: "auto", color: "#4ade80", fontSize: "0.7rem", fontWeight: 600 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />Đang hoạt động
                    </span>
                  </div>
                  <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 10, justifyContent: "flex-end", overflow: "hidden" }}>
                    {s.botTyping && (
                      <div style={{ alignSelf: "flex-start", background: "#1e293b", padding: "12px 16px", borderRadius: "14px 14px 14px 3px", display: "inline-flex", gap: 5, alignItems: "center" }}>
                        <span className="hk-typing-dot" style={{ animationDelay: "0s" }} />
                        <span className="hk-typing-dot" style={{ animationDelay: "0.15s" }} />
                        <span className="hk-typing-dot" style={{ animationDelay: "0.3s" }} />
                      </div>
                    )}
                    {s.chatShowAi && (
                      <div style={{ alignSelf: "flex-start", maxWidth: "85%", background: "#1e293b", color: "#e2e8f0", fontSize: "0.85rem", lineHeight: 1.45, padding: "10px 14px", borderRadius: "14px 14px 14px 3px" }}>{BOT_INTRO_TEXT}</div>
                    )}
                    {s.formShown && (
                      <div style={{ alignSelf: "flex-start", width: 440, background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px 14px 14px 3px", padding: 18, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 16 }}>
                        <div>
                          <div style={{ color: "#94a3b8", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.05em", marginBottom: 6 }}>TÊN THƯƠNG HIỆU / TRANG</div>
                          <div style={{ background: "#0e1522", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "0 12px", height: 38, boxSizing: "border-box", color: "#e2e8f0", fontSize: "0.82rem", display: "flex", alignItems: "center", overflow: "hidden", whiteSpace: "nowrap" }}>
                            {s.formBrandTyped}
                            {s.formBrandTypingActive && <span className="hk-caret" />}
                          </div>
                        </div>
                        <div>
                          <div style={{ color: "#94a3b8", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.05em", marginBottom: 6 }}>KẾT NỐI NỀN TẢNG</div>
                          <div style={{ display: "flex", gap: 10 }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontWeight: 700, fontSize: "0.78rem", padding: "8px 14px", borderRadius: 9, whiteSpace: "nowrap", ...fbFormChipStyle }}>
                              <span style={{ width: 17, height: 17, borderRadius: 5, background: "#1877F2", color: "#fff", fontWeight: 900, fontSize: "0.62rem", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>f</span>
                              {s.fbConnected ? "Đã kết nối ✓" : "Facebook"}
                            </span>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontWeight: 700, fontSize: "0.78rem", padding: "8px 14px", borderRadius: 9, whiteSpace: "nowrap", ...igFormChipStyle }}>
                              <span style={{ width: 17, height: 17, borderRadius: 5, background: "linear-gradient(45deg,#feda75,#d62976 45%,#962fbf 75%,#4f5bd5)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
                                <Sym style={{ fontSize: 11, color: "#fff" }}>photo_camera</Sym>
                              </span>
                              {s.igConnected ? "Đã kết nối ✓" : "Instagram"}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 9999, fontWeight: 800, fontSize: "0.82rem", transition: "background 0.3s,color 0.3s", ...submitBtnStyle }}>
                            <Sym style={{ fontSize: 16 }}>{s.formComplete ? "check" : "arrow_forward"}</Sym>
                            {s.formComplete ? "Đã hoàn tất" : "Hoàn tất khởi tạo"}
                          </span>
                        </div>
                      </div>
                    )}
                    {s.showFinalMsg && (
                      <div style={{ alignSelf: "flex-start", width: 440, background: "linear-gradient(160deg, rgba(245,158,11,0.14), rgba(30,41,59,0.7))", border: "1px solid rgba(245,158,11,0.25)", borderRadius: "14px 14px 14px 3px", padding: 18, boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <Sym style={{ fontSize: 28, color: "#4ade80" }}>check_circle</Sym>
                          <div>
                            <div style={{ color: "#fff", fontWeight: 800, fontSize: "0.95rem" }}>Khởi tạo thành công!</div>
                            <div style={{ color: "#94a3b8", fontSize: "0.78rem", marginTop: 2 }}>Hive-K đã sẵn sàng quản lý 2 nền tảng của bạn</div>
                          </div>
                        </div>
                        <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />
                        <div>
                          <div style={{ color: "#94a3b8", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.05em", marginBottom: 10 }}>BẠN CÓ THỂ THỬ NGAY</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {[
                              { icon: "send", label: "Đăng bài lên đa nền tảng" },
                              { icon: "schedule", label: "Lên lịch đăng tự động" },
                              { icon: "forum", label: "Trả lời bình luận & tin nhắn" },
                            ].map((c) => (
                              <span key={c.label} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#e2e8f0", fontSize: "0.76rem", fontWeight: 600, padding: "8px 12px", borderRadius: 9999 }}>
                                <Sym style={{ fontSize: 15, color: "var(--color-primary)" }}>{c.icon}</Sym>{c.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 20px", background: "#141c2c", borderTop: "1px solid rgba(255,255,255,0.08)", flex: "0 0 auto" }}>
                    <div style={{ flex: 1, background: "#0e1522", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: 9999, padding: "10px 16px", color: "#64748b", fontSize: "0.82rem", overflow: "hidden", whiteSpace: "nowrap" }}>Nhập tin nhắn...</div>
                    <span style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--color-primary)", color: "var(--color-background-dark)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
                      <Sym style={{ fontSize: 18 }}>send</Sym>
                    </span>
                  </div>
                </div>

                {/* FACEBOOK */}
                <div style={{ position: "absolute", inset: 0, background: "#f0f2f5", opacity: isFb ? 1 : 0, transition: "opacity 0.4s", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 420, background: "#fff", borderRadius: 14, boxShadow: "0 20px 50px rgba(0,0,0,0.18)", padding: 32, boxSizing: "border-box" }}>
                    {isFb && s.fbStep === "ask" && (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 18 }}>
                          <span style={{ width: 52, height: 52, borderRadius: 14, background: "#f8f9fa", border: "1px solid rgba(0,0,0,0.06)", display: "inline-flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box", padding: 9 }}>
                            <Image src="/logo.png" alt="Hive-K" width={34} height={34} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                          </span>
                          <Sym style={{ fontSize: 22, color: "#c7cbd1" }}>link</Sym>
                          <span style={{ width: 52, height: 52, borderRadius: 14, background: "#1877F2", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: "1.5rem" }}>f</span>
                        </div>
                        <div style={{ textAlign: "center", fontWeight: 800, fontSize: "1.05rem", color: "#050505", marginBottom: 8 }}>Hive-K muốn kết nối với Facebook</div>
                        <div style={{ textAlign: "center", color: "#65676b", fontSize: "0.82rem", lineHeight: 1.5, marginBottom: 22 }}>Ứng dụng sẽ có thể đăng bài và quản lý trang của bạn thay bạn.</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                          <span style={{ padding: "10px 20px", borderRadius: 8, background: "#e4e6e9", color: "#050505", fontWeight: 700, fontSize: "0.85rem" }}>Không</span>
                          <span style={{ padding: "10px 26px", borderRadius: 8, background: "#1877F2", color: "#fff", fontWeight: 700, fontSize: "0.85rem", whiteSpace: "nowrap" }}>Có, kết nối</span>
                        </div>
                      </div>
                    )}
                    {isFb && s.fbStep === "done" && (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "20px 0" }}>
                        <Sym style={{ fontSize: 56, color: "#22c55e" }}>check_circle</Sym>
                        <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#050505" }}>Đã kết nối với Facebook</div>
                        <div style={{ color: "#65676b", fontSize: "0.82rem" }}>Đang quay lại Hive-K…</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* INSTAGRAM */}
                <div style={{ position: "absolute", inset: 0, background: "#fafafa", opacity: isIg ? 1 : 0, transition: "opacity 0.4s", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 420, background: "#fff", borderRadius: 14, boxShadow: "0 20px 50px rgba(0,0,0,0.18)", padding: 32, boxSizing: "border-box" }}>
                    {isIg && s.igStep === "ask" && (
                      <div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginBottom: 18 }}>
                          <span style={{ width: 52, height: 52, borderRadius: 14, background: "#f8f9fa", border: "1px solid rgba(0,0,0,0.06)", display: "inline-flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box", padding: 9 }}>
                            <Image src="/logo.png" alt="Hive-K" width={34} height={34} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                          </span>
                          <Sym style={{ fontSize: 22, color: "#c7cbd1" }}>link</Sym>
                          <span style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(45deg,#feda75,#d62976 45%,#962fbf 75%,#4f5bd5)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                            <Sym style={{ fontSize: 26, color: "#fff" }}>photo_camera</Sym>
                          </span>
                        </div>
                        <div style={{ textAlign: "center", fontWeight: 800, fontSize: "1.05rem", color: "#050505", marginBottom: 8 }}>Hive-K muốn kết nối với Instagram</div>
                        <div style={{ textAlign: "center", color: "#65676b", fontSize: "0.82rem", lineHeight: 1.5, marginBottom: 22 }}>Ứng dụng sẽ có thể đăng bài và quản lý tài khoản của bạn thay bạn.</div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                          <span style={{ padding: "10px 20px", borderRadius: 8, background: "#e4e6e9", color: "#050505", fontWeight: 700, fontSize: "0.85rem" }}>Không</span>
                          <span style={{ padding: "10px 26px", borderRadius: 8, background: "linear-gradient(45deg,#feda75,#d62976 45%,#962fbf 75%,#4f5bd5)", color: "#fff", fontWeight: 700, fontSize: "0.85rem", whiteSpace: "nowrap" }}>Có, kết nối</span>
                        </div>
                      </div>
                    )}
                    {isIg && s.igStep === "done" && (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "20px 0" }}>
                        <Sym style={{ fontSize: 56, color: "#22c55e" }}>check_circle</Sym>
                        <div style={{ fontWeight: 800, fontSize: "1.05rem", color: "#050505" }}>Đã kết nối với Instagram</div>
                        <div style={{ color: "#65676b", fontSize: "0.82rem" }}>Đang quay lại Hive-K…</div>
                      </div>
                    )}
                  </div>
                </div>

                {cursor(s.cursorX, s.cursorY, s.clicking, s.cursorVisible)}
              </div>

              {/* INTRO 1 */}
              <div style={{ position: "absolute", inset: 0, zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 40px", background: "rgba(6,10,18,0.92)", opacity: s.intro1 ? 1 : 0, pointerEvents: "none", transition: "opacity 0.5s" }}>
                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, borderRadius: 16, background: "rgba(245,158,11,0.16)", color: "var(--color-primary)", marginBottom: 18 }}>
                    <Sym style={{ fontSize: 28 }}>hub</Sym>
                  </div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#fff", margin: "8px 0 10px", letterSpacing: "-0.02em" }}>Kết nối tài khoản</div>
                  <div style={{ fontSize: "0.95rem", color: "#94a3b8", maxWidth: 420, margin: "0 auto" }}>Liên kết Facebook &amp; Instagram chỉ bằng một cuộc trò chuyện.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — sân khấu "Tự động" */}
      <section
        id="s2"
        ref={sp2.ref}
        className="landing-stage"
        style={{
          padding: "24px",
          opacity: sub(sp2.p, 0, 0.55),
          transform: `translateY(${lerp(64, 0, sub(sp2.p, 0, 0.7))}px) scale(${lerp(0.94, 1, sub(sp2.p, 0, 0.7))})`,
        }}
      >
        <span className="stage-ghost" aria-hidden>TỰ ĐỘNG</span>
        <div style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 48, flexDirection: "row-reverse", flexWrap: "wrap", justifyContent: "center" }}>
          <div style={{ position: "absolute", top: -30, right: 320, width: 760, height: 340, background: "radial-gradient(ellipse, rgba(245,158,11,0.14), transparent 66%)", pointerEvents: "none" }} />
          <div style={{ width: 380, flex: "0 0 auto", textAlign: "left", paddingTop: 24 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(245,158,11,0.16)", color: "var(--color-primary)", fontWeight: 700, fontSize: "0.76rem", letterSpacing: "0.08em", padding: "6px 13px", borderRadius: 9999 }}>
              <Sym style={{ fontSize: 15 }}>send</Sym> ĐĂNG &amp; TRẢ LỜI
            </div>
            <h2 style={{ fontSize: "2.3rem", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.12, margin: "18px 0 14px", color: "var(--color-foreground)" }}>
              Lên lịch đăng bài, <span style={{ color: "var(--color-primary)" }}>AI trả lời mọi kênh</span>
            </h2>
            <p style={{ fontSize: "1.02rem", lineHeight: 1.6, color: "var(--color-foreground-muted)", margin: "0 0 28px" }}>
              Đăng đúng lịch hẹn, rồi gom mọi tin nhắn về một hộp thư để AI trả lời.
            </p>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 17, top: 18, bottom: 18, width: 2, background: stepResult2.gradient, zIndex: 0, transition: "background 0.4s" }} />
              {stepResult2.steps.map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", position: "relative", zIndex: 1, paddingBottom: step.gap }}>
                  <div style={step.circleStyle}>
                    {step.showCheck && <Sym style={{ fontSize: 18 }}>check</Sym>}
                    {step.showLetter && step.letter}
                    {step.showIcon && <Sym style={{ fontSize: 16 }}>{step.icon}</Sym>}
                  </div>
                  <div>
                    <div style={step.titleStyle}>{step.title}</div>
                    <div style={step.descStyle}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="hk-mock">
            <div className="hk-mock-chrome">
              <span className="hk-dot" style={{ background: "#ef4444" }} />
              <span className="hk-dot" style={{ background: "#f59e0b" }} />
              <span className="hk-dot" style={{ background: "#22c55e" }} />
              <span style={{ marginLeft: 8, display: "inline-flex", alignItems: "center", gap: 6, color: "#94a3b8", fontSize: "0.74rem", fontWeight: 600 }}>
                <span style={{ width: 13, height: 13, borderRadius: 4, display: "inline-block", background: chromeDotColor2 }} />
                {chromeLabel2}
              </span>
            </div>
            <div className="hk-stage">
              <div style={zoomStyle2}>
                {/* PLAN */}
                <div style={{ position: "absolute", inset: 0, opacity: isPlan2 ? 1 : 0, transition: "opacity 0.4s" }}>
                  <div style={{ position: "absolute", left: 36, top: 24, right: 36 }}>
                    <div style={{ color: "#fff", fontWeight: 800, fontSize: "1.05rem" }}>Tạo bài đăng mới</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.78rem", marginTop: 4 }}>Nhập nội dung, thời gian và nền tảng cần đăng</div>
                  </div>
                  <div style={{ position: "absolute", left: 36, top: 88, right: 36 }}>
                    <div style={{ color: "#94a3b8", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.04em", marginBottom: 6 }}>NỘI DUNG BÀI ĐĂNG</div>
                    <div style={{ background: "#0e1522", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 14px", color: "#e2e8f0", fontSize: "0.82rem", lineHeight: 1.5, height: 76, boxSizing: "border-box", overflow: "hidden" }}>
                      {s.p2PostTyped}
                      {s.p2TypingActive && <span className="hk-caret" />}
                    </div>
                  </div>
                  <div style={{ position: "absolute", left: 36, top: 204, width: 170 }}>
                    <div style={{ color: "#94a3b8", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.04em", marginBottom: 8 }}>THỜI GIAN ĐĂNG</div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 9, fontSize: "0.8rem", fontWeight: 700, whiteSpace: "nowrap", ...p2TimeChipStyle }}>
                      <Sym style={{ fontSize: 15 }}>schedule</Sym>{s.p2TimeSelected ? "Hôm nay, 18:00" : "Chọn thời gian đăng"}
                    </div>
                  </div>
                  <div style={{ position: "absolute", left: 380, top: 204, right: 36 }}>
                    <div style={{ color: "#94a3b8", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.04em", marginBottom: 8 }}>NỀN TẢNG ĐĂNG BÀI</div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontWeight: 700, fontSize: "0.78rem", padding: "8px 14px", borderRadius: 9, whiteSpace: "nowrap", ...p2FbPillStyle }}>
                        <span style={{ width: 17, height: 17, borderRadius: 5, background: "#1877F2", color: "#fff", fontWeight: 900, fontSize: "0.62rem", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>f</span>
                        Facebook{s.p2FbSelected && <Sym style={{ fontSize: 14 }}>check</Sym>}
                      </span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontWeight: 700, fontSize: "0.78rem", padding: "8px 14px", borderRadius: 9, whiteSpace: "nowrap", ...p2IgPillStyle }}>
                        <span style={{ width: 17, height: 17, borderRadius: 5, background: "linear-gradient(45deg,#feda75,#d62976 45%,#962fbf 75%,#4f5bd5)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
                          <Sym style={{ fontSize: 11, color: "#fff" }}>photo_camera</Sym>
                        </span>
                        Instagram{s.p2IgSelected && <Sym style={{ fontSize: 14 }}>check</Sym>}
                      </span>
                    </div>
                  </div>
                  <div style={{ position: "absolute", left: 36, right: 36, bottom: 24, display: "flex", justifyContent: "flex-end" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: 9999, fontWeight: 800, fontSize: "0.85rem", transition: "background 0.3s,color 0.3s", ...p2SubmitStyle }}>
                      <Sym style={{ fontSize: 17 }}>event_available</Sym>Lên lịch đăng
                    </span>
                  </div>
                </div>

                {/* LOADING */}
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: isLoading2 ? 1 : 0, transition: "opacity 0.4s" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
                    {isLoading2 && !s.p2LoadingDone && (
                      <div>
                        <div style={{ width: 56, height: 56, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.14)", borderTopColor: "var(--color-primary)", animation: "hk-spin 0.8s linear infinite", margin: "0 auto 20px" }} />
                        <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", textAlign: "center", marginBottom: 18 }}>Đang đăng bài lên các nền tảng...</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 220 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Sym style={{ fontSize: 18, color: s.p2FbPosted ? "#4ade80" : "#64748b", animation: s.p2FbPosted ? undefined : "hk-spin 0.9s linear infinite" }}>{s.p2FbPosted ? "check_circle" : "sync"}</Sym>
                            <span style={{ color: "#cbd5e1", fontSize: "0.82rem", fontWeight: 600 }}>Facebook</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <Sym style={{ fontSize: 18, color: s.p2IgPosted ? "#4ade80" : "#64748b", animation: s.p2IgPosted ? undefined : "hk-spin 0.9s linear infinite" }}>{s.p2IgPosted ? "check_circle" : "sync"}</Sym>
                            <span style={{ color: "#cbd5e1", fontSize: "0.82rem", fontWeight: 600 }}>Instagram</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {isLoading2 && s.p2LoadingDone && (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                        <Sym style={{ fontSize: 60, color: "#22c55e" }}>check_circle</Sym>
                        <div style={{ color: "#fff", fontWeight: 800, fontSize: "1.05rem", textAlign: "center" }}>Đã đăng bài thành công lên 2 nền tảng!</div>
                        <div style={{ color: "#94a3b8", fontSize: "0.82rem" }}>Đang mở điện thoại của bạn…</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* MOBILE */}
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: isMobile2 ? 1 : 0, transition: "opacity 0.4s", background: "#182233" }}>
                  <div style={{ width: 230, height: 420, background: "#000", borderRadius: 34, padding: 8, boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}>
                    <div style={{ width: "100%", height: "100%", borderRadius: 26, background: "linear-gradient(160deg,#1e293b,#0f172a 55%,#111827)", overflow: "hidden", position: "relative" }}>
                      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 80, height: 20, background: "#000", borderRadius: "0 0 12px 12px", zIndex: 5 }} />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px 0", color: "#fff", fontSize: "0.62rem", fontWeight: 700 }}>
                        <span>9:41</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Sym style={{ fontSize: 12 }}>signal_cellular_alt</Sym>
                          <Sym style={{ fontSize: 12 }}>wifi</Sym>
                          <Sym style={{ fontSize: 13 }}>battery_full</Sym>
                        </span>
                      </div>
                      <div style={{ position: "absolute", top: 46, left: 10, right: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "flex", gap: 9, alignItems: "flex-start", background: "rgba(255,255,255,0.97)", borderRadius: 13, padding: "9px 11px", boxShadow: "0 8px 20px rgba(0,0,0,0.3)", opacity: s.p2FbNotifShown ? 1 : 0, transform: s.p2FbNotifShown ? "translateY(0)" : "translateY(-14px)", transition: "opacity 0.4s, transform 0.4s" }}>
                          <span style={{ width: 24, height: 24, borderRadius: 7, background: "#1877F2", color: "#fff", fontWeight: 900, fontSize: "0.68rem", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>f</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                              <span style={{ fontWeight: 800, fontSize: "0.66rem", color: "#0f172a" }}>Facebook</span>
                              <span style={{ fontSize: "0.58rem", color: "#94a3b8" }}>Bây giờ</span>
                            </div>
                            <div style={{ fontSize: "0.64rem", color: "#334155", lineHeight: 1.35, marginTop: 2 }}>Bài viết của bạn đã được đăng thành công</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 9, alignItems: "flex-start", background: "rgba(255,255,255,0.97)", borderRadius: 13, padding: "9px 11px", boxShadow: "0 8px 20px rgba(0,0,0,0.3)", opacity: s.p2IgNotifShown ? 1 : 0, transform: s.p2IgNotifShown ? "translateY(0)" : "translateY(-14px)", transition: "opacity 0.4s, transform 0.4s" }}>
                          <span style={{ width: 24, height: 24, borderRadius: 7, background: "linear-gradient(45deg,#feda75,#d62976 45%,#962fbf 75%,#4f5bd5)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
                            <Sym style={{ fontSize: 13, color: "#fff" }}>photo_camera</Sym>
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                              <span style={{ fontWeight: 800, fontSize: "0.66rem", color: "#0f172a" }}>Instagram</span>
                              <span style={{ fontSize: "0.58rem", color: "#94a3b8" }}>Bây giờ</span>
                            </div>
                            <div style={{ fontSize: "0.64rem", color: "#334155", lineHeight: 1.35, marginTop: 2 }}>Bài viết của bạn đã được đăng thành công</div>
                          </div>
                        </div>
                      </div>
                      <div style={{ position: "absolute", bottom: 7, left: "50%", transform: "translateX(-50%)", width: 90, height: 4, background: "rgba(255,255,255,0.4)", borderRadius: 2 }} />
                    </div>
                  </div>
                </div>

                {/* INBOX */}
                <div style={{ position: "absolute", inset: 0, display: "flex", opacity: isInbox2 ? 1 : 0, transition: "opacity 0.4s", background: "#0e1522" }}>
                  <div style={{ width: 238, flex: "0 0 auto", borderRight: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: "16px 16px 10px" }}>
                      <div style={{ color: "#fff", fontWeight: 800, fontSize: "0.92rem", display: "flex", alignItems: "center", gap: 7 }}>
                        <Sym style={{ fontSize: 18, color: "var(--color-primary)" }}>all_inbox</Sym>Hộp thư hợp nhất
                      </div>
                      <div style={{ color: "#94a3b8", fontSize: "0.7rem", marginTop: 3 }}>Tất cả nền tảng · 1 nơi duy nhất</div>
                    </div>
                    <div style={{ padding: "4px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
                      {CONV_DEFS.map((conv, idx) => {
                        const active = idx === s.p2ActiveConv;
                        return (
                          <div key={conv.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 10, transition: "background 0.3s", background: active ? "rgba(245,158,11,0.1)" : "transparent" }}>
                            <div style={{ position: "relative", flex: "0 0 auto" }}>
                              <span style={{ width: 34, height: 34, borderRadius: "50%", background: "#1e293b", color: "#cbd5e1", fontWeight: 800, fontSize: "0.82rem", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{conv.initial}</span>
                              <span style={{ position: "absolute", right: -2, bottom: -2, width: 16, height: 16, borderRadius: 5, border: "2px solid #0e1522", display: "inline-flex", alignItems: "center", justifyContent: "center", background: conv.badgeBg }}>
                                {conv.isLetter ? (
                                  <span style={{ color: "#fff", fontWeight: 900, fontSize: "0.5rem" }}>{conv.badgeIcon}</span>
                                ) : (
                                  <Sym style={{ fontSize: 9, color: "#fff" }}>{conv.badgeIcon}</Sym>
                                )}
                              </span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ fontWeight: 700, fontSize: "0.8rem", color: active ? "#fff" : "#cbd5e1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{conv.name}</span>
                              </div>
                              <div style={{ color: "#64748b", fontSize: "0.71rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 1 }}>{conv.preview}</div>
                            </div>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-primary)", flex: "0 0 auto", opacity: active ? 0 : 1, transition: "opacity 0.3s" }} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 18px", borderBottom: "1px solid rgba(255,255,255,0.08)", flex: "0 0 auto" }}>
                      <div style={{ position: "relative", flex: "0 0 auto" }}>
                        <span style={{ width: 32, height: 32, borderRadius: "50%", background: "#1e293b", color: "#cbd5e1", fontWeight: 800, fontSize: "0.78rem", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{activeConv.initial}</span>
                        <span style={{ position: "absolute", right: -2, bottom: -2, width: 15, height: 15, borderRadius: 5, border: "2px solid #0e1522", display: "inline-flex", alignItems: "center", justifyContent: "center", background: activeConv.badgeBg }}>
                          {activeConv.isLetter ? (
                            <span style={{ color: "#fff", fontWeight: 900, fontSize: "0.48rem" }}>{activeConv.badgeIcon}</span>
                          ) : (
                            <Sym style={{ fontSize: 9, color: "#fff" }}>{activeConv.badgeIcon}</Sym>
                          )}
                        </span>
                      </div>
                      <div>
                        <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>{activeConv.name}</div>
                        <div style={{ color: "#94a3b8", fontSize: "0.68rem" }}>qua {activeConv.plat}</div>
                      </div>
                      <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(245,158,11,0.14)", color: "var(--color-primary)", fontWeight: 700, fontSize: "0.68rem", padding: "6px 11px", borderRadius: 9999, whiteSpace: "nowrap" }}>
                        <Sym style={{ fontSize: 14 }}>auto_awesome</Sym>AI trả lời tự động
                      </span>
                    </div>
                    <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 12, justifyContent: "flex-end", overflow: "hidden" }}>
                      <div style={{ alignSelf: "flex-start", maxWidth: "78%", background: "#1e293b", color: "#e2e8f0", fontSize: "0.82rem", lineHeight: 1.45, padding: "10px 14px", borderRadius: "14px 14px 14px 3px" }}>{activeConv.preview}</div>
                      {s.p2ReplySent && (
                        <div style={{ alignSelf: "flex-end", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, maxWidth: "80%" }}>
                          <div style={{ background: "var(--color-primary)", color: "var(--color-background-dark)", fontSize: "0.82rem", lineHeight: 1.45, padding: "10px 14px", borderRadius: "14px 14px 3px 14px", fontWeight: 500 }}>{s.p2ReplyTyped}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#4ade80", fontSize: "0.66rem", fontWeight: 600 }}>
                            <Sym style={{ fontSize: 13 }}>done_all</Sym>Hive-K AI đã gửi
                          </div>
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderTop: "1px solid rgba(255,255,255,0.08)", flex: "0 0 auto" }}>
                      <div style={{ flex: 1, background: "#0e1522", border: "1.5px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: "10px 15px", fontSize: "0.8rem", lineHeight: 1.4, minHeight: 20, maxHeight: 60, overflow: "hidden", color: s.p2ReplySent || !s.p2ReplyTyped ? "#64748b" : "#e2e8f0" }}>
                        {s.p2ReplySent ? "Nhập tin nhắn..." : s.p2ReplyTyped || "Nhập tin nhắn..."}
                        {s.p2ReplyTypingActive && <span className="hk-caret" />}
                      </div>
                      <span style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--color-primary)", color: "var(--color-background-dark)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
                        <Sym style={{ fontSize: 18 }}>send</Sym>
                      </span>
                    </div>
                  </div>
                </div>

                {cursor(s.p2CursorX, s.p2CursorY, s.p2Clicking, s.p2CursorVisible)}
              </div>

              {/* INTRO 2 */}
              <div style={{ position: "absolute", inset: 0, zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 40px", background: "rgba(6,10,18,0.92)", opacity: s.intro2 ? 1 : 0, pointerEvents: "none", transition: "opacity 0.5s" }}>
                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, borderRadius: 16, background: "rgba(245,158,11,0.16)", color: "var(--color-primary)", marginBottom: 18 }}>
                    <Sym style={{ fontSize: 28 }}>send</Sym>
                  </div>
                  <div style={{ fontSize: "1.8rem", fontWeight: 900, color: "#fff", margin: "8px 0 10px", letterSpacing: "-0.02em" }}>Đăng &amp; trả lời</div>
                  <div style={{ fontSize: "0.95rem", color: "#94a3b8", maxWidth: 420, margin: "0 auto" }}>Lên lịch đăng bài rồi để AI trả lời mọi tin nhắn.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
