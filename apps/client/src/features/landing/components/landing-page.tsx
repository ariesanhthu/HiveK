"use client";

import React from "react";
import { HowItWorks } from "@/features/landing/components/how-it-works";
import { StageBenefits } from "@/features/landing/components/stage-benefits";
import { StageLeaderboard } from "@/features/landing/components/stage-leaderboard";
import { StageCampaigns } from "@/features/landing/components/stage-campaigns";
import { StageJoin } from "@/features/landing/components/stage-join";
import { StageRail, type StageDef } from "@/features/landing/components/stage-rail";
import {
  LandingThemeProvider,
  LandingThemeToggle,
  useLandingTheme,
} from "@/features/landing/components/landing-theme";

const STAGES: StageDef[] = [
  { id: "hero", label: "MỞ MÀN" },
  { id: "s1", label: "KẾT NỐI" },
  { id: "s2", label: "TỰ ĐỘNG" },
  { id: "st-platform", label: "SỨC MẠNH" },
  { id: "st-kol", label: "BẢNG VÀNG" },
  { id: "st-campaigns", label: "CHIẾN DỊCH" },
  { id: "st-join", label: "GIA NHẬP" },
];

/** Một slide 100vw×100vh trên sàn trình diễn, kèm chữ ghost phía sau. */
const Stage: React.FC<{
  id: string;
  ghost?: string;
  children: React.ReactNode;
}> = ({ id, ghost, children }) => (
  <section id={id} className="landing-stage">
    {ghost ? (
      <span className="stage-ghost" aria-hidden>
        {ghost}
      </span>
    ) : null}
    <div className="w-full">{children}</div>
  </section>
);

/** Ẩn navbar từ sân khấu demo thứ 2 (#s2) trở xuống; cuộn ngược lên thì hiện. */
const NavAutoHide: React.FC = () => {
  React.useEffect(() => {
    const root = document.documentElement;
    // Gọi thẳng (không rAF): phép đo rẻ, và rAF bị throttle ở tab nền.
    const update = () => {
      const s2 = document.getElementById("s2");
      if (!s2) return;
      const hidden = s2.getBoundingClientRect().top < window.innerHeight * 0.3;
      if (hidden) root.setAttribute("data-landing-nav", "hidden");
      else root.removeAttribute("data-landing-nav");
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    // scrollend bắt cả cú nhảy programmatic / snap-settle không kèm scroll event
    window.addEventListener("scrollend", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("scrollend", update);
      root.removeAttribute("data-landing-nav");
    };
  }, []);
  return null;
};

const LandingInner: React.FC = () => {
  const { mode } = useLandingTheme();
  const dark = mode === "dark";

  const shell = dark
    ? "dark bg-background-dark text-foreground landing-dark"
    : "bg-background-light text-foreground landing-light";

  return (
    <div className={`landing-root ${shell}`}>
      {/* Aurora hổ phách trôi phía sau mọi sân khấu */}
      <div className="landing-aurora" aria-hidden>
        <span />
        <span />
        <span />
      </div>

      {/* Hero + 2 sân khấu demo */}
      <HowItWorks />

      <Stage id="st-platform" ghost="SỨC MẠNH">
        <StageBenefits />
      </Stage>

      <Stage id="st-kol" ghost="BẢNG VÀNG">
        <StageLeaderboard />
      </Stage>

      <Stage id="st-campaigns" ghost="CHIẾN DỊCH">
        <StageCampaigns />
      </Stage>

      <Stage id="st-join" ghost="GIA NHẬP">
        <StageJoin />
      </Stage>

      <NavAutoHide />
      <StageRail stages={STAGES} />
      <LandingThemeToggle />
    </div>
  );
};

export const LandingPage: React.FC = () => {
  return (
    <LandingThemeProvider>
      <LandingInner />
    </LandingThemeProvider>
  );
};
