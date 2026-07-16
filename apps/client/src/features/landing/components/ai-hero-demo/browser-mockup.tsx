import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

export function BrowserMockup({
  chromeLabel,
  chromeDotStyle,
  zoomStyle,
  children,
}: {
  chromeLabel: string;
  chromeDotStyle: React.CSSProperties;
  /** Camera-dive transform applied to the whole screen stack. */
  zoomStyle: React.CSSProperties;
  children: ReactNode;
}) {
  return (
    <div className="relative w-full max-w-[740px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0e1522] text-left shadow-[0_34px_76px_rgba(0,0,0,0.5)] lg:w-[740px]">
      <div className="flex items-center gap-1.5 border-b border-white/[0.08] bg-[#141c2c] px-3.5 py-2.5">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500" />
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
        <span className="ml-2 flex items-center gap-1.5 text-[0.74rem] font-semibold text-slate-400">
          <span className="inline-block h-3.5 w-3.5 rounded" style={chromeDotStyle} />
          <AnimatePresence mode="wait">
            <motion.span
              key={chromeLabel}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
            >
              {chromeLabel}
            </motion.span>
          </AnimatePresence>
        </span>
      </div>

      <div className="relative h-[460px] overflow-hidden">
        <div className="absolute inset-0" style={zoomStyle}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function DemoCursor({
  x,
  y,
  visible,
  clicking,
}: {
  x: number;
  y: number;
  visible: boolean;
  clicking: boolean;
}) {
  return (
    <div
      className="pointer-events-none absolute left-0 top-0 z-[80] h-[30px] w-[30px] transition-[transform,opacity] duration-[550ms] ease-[cubic-bezier(.4,0,.2,1)]"
      style={{ transform: `translate(${x}px, ${y}px)`, opacity: visible ? 1 : 0 }}
    >
      <span className="absolute left-[2px] top-[2px] h-[22px] w-[22px] rounded-full bg-white shadow-[0_3px_10px_rgba(0,0,0,0.4)]" />
      <span
        className="material-symbols-outlined absolute left-[3px] top-[1px] text-[20px] text-neutral-900"
        style={{ transform: "scaleX(-1)" }}
        aria-hidden
      >
        near_me
      </span>
      {clicking && (
        <span className="absolute -left-1.5 -top-1.5 h-[42px] w-[42px] animate-[hk-click-pulse_0.4s_ease-out] rounded-full border-2 border-primary" />
      )}
    </div>
  );
}
