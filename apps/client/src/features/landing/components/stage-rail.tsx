"use client";

import React, { useEffect, useState } from "react";

export type StageDef = { id: string; label: string };

/**
 * Chấm điều hướng "sân khấu" bên phải màn hình. Chấm sáng theo sân khấu đang
 * chiếm giữa viewport; click để chuyển cảnh. Ẩn trên mobile.
 */
export const StageRail: React.FC<{ stages: StageDef[] }> = ({ stages }) => {
  const [active, setActive] = useState(stages[0]?.id);

  useEffect(() => {
    // Sân khấu nào cắt qua dải giữa màn hình thì coi là đang diễn.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    stages.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [stages]);

  return (
    <nav className="stage-rail hidden lg:flex" aria-label="Chuyển giữa các phần">
      {stages.map((s) => (
        <button
          key={s.id}
          type="button"
          data-label={s.label}
          data-active={active === s.id}
          aria-label={s.label}
          aria-current={active === s.id ? "true" : undefined}
          onClick={() =>
            document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" })
          }
        />
      ))}
    </nav>
  );
};
