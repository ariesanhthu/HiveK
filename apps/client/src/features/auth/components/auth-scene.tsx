// Deterministic star field (seeded LCG) so SSR/client markup match exactly.
function seededStars(count: number, seed: number) {
  let s = seed;
  const rand = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
  return Array.from({ length: count }, (_, id) => ({
    id,
    top: rand() * 100,
    left: rand() * 100,
    size: rand() * 1.7 + 1,
    delay: rand() * 5,
    duration: rand() * 3 + 2.5,
  }));
}

const STARS = seededStars(80, 23);

/**
 * Full-page scene behind every auth screen: standing on a planet's horizon
 * looking out at the Hive-K galaxy. Same visual language as the landing's
 * feature-galaxy section (deep space, nebulas, orbit rings, glowing rim).
 * Only a handful of cheap compositor animations (twinkle + 2 orbiting dots).
 */
export function AuthScene() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ backgroundColor: "#0b1020" }}
      aria-hidden
    >
      {/* Nebulas */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(45% 50% at 12% 12%, color-mix(in srgb, var(--color-primary) 12%, transparent) 0%, transparent 70%), radial-gradient(50% 55% at 88% 30%, color-mix(in srgb, var(--color-tech-blue) 9%, transparent) 0%, transparent 70%)",
        }}
      />

      {/* Stars — a third of them twinkle */}
      {STARS.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: star.size,
            height: star.size,
            ...(star.id % 3 === 0
              ? {
                  animation: `hk-auth-twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
                }
              : { opacity: 0.4 }),
          }}
        />
      ))}

      {/* Shooting star */}
      <span
        className="absolute right-[12%] top-[10%] h-px w-28"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.85))",
          animation: "hk-auth-shoot 11s linear 3s infinite",
        }}
      />

      {/* Orbit rings around the planet below — one small moon each */}
      {[
        { size: "150vmax", duration: 90, dotColor: "var(--color-primary)" },
        { size: "115vmax", duration: 60, dotColor: "var(--color-tech-blue)" },
      ].map((ring) => (
        <div
          key={ring.size}
          className="absolute left-1/2 top-full"
          style={{ width: 0, height: 0 }}
        >
          <div
            className="absolute rounded-full border border-dashed border-white/8"
            style={{
              width: ring.size,
              height: ring.size,
              transform: "translate(-50%, -50%)",
            }}
          />
          <div style={{ animation: `hk-auth-spin ${ring.duration}s linear infinite` }}>
            <span
              className="absolute rounded-full"
              style={{
                width: 7,
                height: 7,
                transform: `translateX(calc(${ring.size} / 2)) translateY(-50%)`,
                backgroundColor: ring.dotColor,
                boxShadow: `0 0 12px 2px color-mix(in srgb, ${ring.dotColor} 60%, transparent)`,
              }}
            />
          </div>
        </div>
      ))}

      {/* Planet horizon at the bottom of the viewport */}
      <div
        className="absolute left-1/2 top-full h-[90vmax] w-[90vmax] -translate-x-1/2 -translate-y-[16%] rounded-full sm:-translate-y-[20%]"
        style={{
          background:
            "radial-gradient(circle at 50% 18%, #16204a 0%, #101733 34%, #0c1226 60%, #0b1020 100%)",
          boxShadow:
            "0 -2px 24px color-mix(in srgb, var(--color-primary) 35%, transparent), 0 -18px 90px color-mix(in srgb, var(--color-primary) 18%, transparent), inset 0 24px 60px color-mix(in srgb, var(--color-primary) 10%, transparent)",
          borderTop: "1px solid color-mix(in srgb, var(--color-primary) 55%, transparent)",
        }}
      />

      <style>{`
        @keyframes hk-auth-twinkle {
          0%, 100% { opacity: 0.12; }
          50% { opacity: 0.9; }
        }
        @keyframes hk-auth-spin { to { transform: rotate(360deg); } }
        @keyframes hk-auth-shoot {
          0% { transform: translate3d(0, 0, 0) rotate(-28deg); opacity: 0; }
          4% { opacity: 1; }
          16% { transform: translate3d(-48vw, 26vh, 0) rotate(-28deg); opacity: 0; }
          100% { transform: translate3d(-48vw, 26vh, 0) rotate(-28deg); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="hk-auth"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
