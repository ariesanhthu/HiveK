// Client-only by usage: imported exclusively from the "use client"
// FeatureShowcaseSection, so no directive needed (a directive here would make
// this a client entry and its function props would trip Next's serializable
// props check).
import { motion } from 'framer-motion';
import { GALAXY_FEATURES, type GalaxyFeature, type GalaxyFeatureId } from './galaxy-data';

// Normalize raw orbitPercent values (defined up to 108) so the widest ring
// fits inside the container with a small margin for the satellite dot.
const MAX_ORBIT_PERCENT = Math.max(...GALAXY_FEATURES.map((f) => f.orbitPercent));
const ORBIT_SCALE = 88 / MAX_ORBIT_PERCENT;

/** Ring diameter as a fraction (0..1) of the galaxy container size. */
const orbitFraction = (f: GalaxyFeature) => (f.orbitPercent * ORBIT_SCALE) / 100;

/**
 * All planets share one angular velocity: with per-planet periods the evenly
 * spaced start angles drift apart within seconds and the planets bunch up on
 * one side of the sun. A single period keeps the even spacing forever.
 */
const ORBIT_PERIOD_SECONDS = 48;

/** Evenly spread start angles so the planets never line up or cluster. */
const planetStartAngle = (index: number) => 15 + (360 / GALAXY_FEATURES.length) * index;

/**
 * Fake-3D tilt: the orbital plane is squashed with scaleY and every planet
 * counter-scales back. Mathematically S·R(θ)·T(r)·R(−θ)·S⁻¹ reduces to a pure
 * translation along an ellipse, so planets stay undistorted while orbiting on
 * a tilted-looking plane — without preserve-3d (whose layer rasterization
 * shows rectangular artifacts on some GPUs). 0.8 ≈ a gentle top-down tilt.
 */
const TILT_SQUASH = 0.8;

/** Solar-system flourish per planet (visual only, not feature data). */
const PLANET_RING: GalaxyFeatureId = 'campaigns';

/** Moon orbit radius as a multiple of the planet size, by moon index. */
const moonOrbit = (i: number) => 0.72 + i * 0.26;

/**
 * Infinite rotations run as CSS animations (compositor thread), NOT framer
 * loops (main-thread rAF) — with ~30 concurrent orbits the JS versions caused
 * visible jank. The start angle is encoded as a negative animation-delay.
 * Keyframes (hk-spin / hk-spin-rev, …) are defined in FeatureShowcaseSection.
 */
function spinStyle(durationSeconds: number, startAngleDeg: number, reverse = false) {
  const angle = ((startAngleDeg % 360) + 360) % 360;
  return {
    animation: `${reverse ? 'hk-spin-rev' : 'hk-spin'} ${durationSeconds}s linear infinite`,
    animationDelay: `${(-(angle / 360) * durationSeconds).toFixed(3)}s`,
  } as const;
}

// Deterministic asteroid belt between the two outer orbits (seeded LCG so
// SSR and client render identically).
function seededAsteroids(count: number, seed: number) {
  let s = seed;
  const rand = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
  return Array.from({ length: count }, (_, id) => ({
    id,
    angle: rand() * 360,
    radius: 0.485 + rand() * 0.035, // fraction of --gsize, between orbits 4 and 5
    size: rand() * 1.6 + 0.8,
    opacity: rand() * 0.5 + 0.25,
  }));
}

const ASTEROIDS = seededAsteroids(52, 13);

/**
 * A shaded planet sphere with its halo, Saturn ring and sub-feature moons.
 * Reused by the orbiting satellites and by the zoomed close-up view —
 * `sizeCss` is any CSS length. In `detailed` mode (close-up) the moons grow,
 * get their icon and a label chip; otherwise they are tiny plain dots.
 */
export function PlanetSphere({
  feature,
  sizeCss,
  isSelected,
  detailed = false,
}: {
  feature: GalaxyFeature;
  sizeCss: string;
  isSelected: boolean;
  detailed?: boolean;
}) {
  return (
    <span
      className='relative flex items-center justify-center'
      style={{ width: sizeCss, height: sizeCss }}
    >
      {
        /* Halo — radial gradient, no huge box-shadow (renders cleanly in
          transformed layers). */
      }
      <span
        className='pointer-events-none absolute inset-[-70%] rounded-full'
        style={{
          background: `radial-gradient(circle, color-mix(in srgb, ${feature.color} ${
            isSelected ? 45 : 18
          }%, transparent) 0%, transparent 68%)`,
          transition: 'background .3s',
        }}
        aria-hidden
      />

      {/* Saturn-style ring, drawn behind the sphere. */}
      {feature.id === PLANET_RING && (
        <span
          className='pointer-events-none absolute rounded-[50%] border'
          style={{
            width: '185%',
            height: '52%',
            transform: 'rotate(-24deg)',
            borderWidth: 2,
            borderColor: `color-mix(in srgb, ${feature.color} 65%, transparent)`,
          }}
          aria-hidden
        />
      )}

      {/* The sphere: lit from the upper-left like a real planet. */}
      <span
        className='relative flex h-full w-full items-center justify-center rounded-full'
        style={{
          background:
            `radial-gradient(circle at 32% 28%, color-mix(in srgb, ${feature.color} 45%, #ffffff) 0%, ${feature.color} 46%, color-mix(in srgb, ${feature.color} 45%, #000000) 100%)`,
          boxShadow: 'inset -4px -6px 12px rgba(0,0,0,0.45)',
        }}
      >
        <span
          className='material-symbols-outlined text-white/95'
          style={{ fontSize: `calc(${sizeCss} * 0.44)` }}
          aria-hidden
        >
          {feature.icon}
        </span>

        {/* Light sweep across the surface in close-up — hints at rotation. */}
        {detailed && (
          <span
            className='pointer-events-none absolute inset-0 overflow-hidden rounded-full'
            aria-hidden
          >
            <span
              className='absolute inset-0'
              style={{
                background:
                  'linear-gradient(115deg, transparent 32%, rgba(255,255,255,0.16) 46%, transparent 60%)',
                animation: 'hk-sheen 5.2s ease-in-out infinite',
              }}
            />
          </span>
        )}
      </span>

      {
        /* Moon orbit guides, only visible in the close-up. Sizes are all
          proportional to sizeCss so the close-up can be a small planet scaled
          up by the camera zoom and still look identical. */
      }
      {detailed
        && feature.moons.map((moon, i) => (
          <span
            key={moon.label}
            className='pointer-events-none absolute rounded-full border border-dashed border-white/15'
            style={{
              width: `calc(${sizeCss} * ${(moonOrbit(i) * 2).toFixed(3)})`,
              height: `calc(${sizeCss} * ${(moonOrbit(i) * 2).toFixed(3)})`,
              borderWidth: `calc(${sizeCss} * 0.0034)`,
            }}
            aria-hidden
          />
        ))}

      {/* Sub-feature moons orbiting the planet. */}
      {feature.moons.map((moon, i) => {
        const startAngle = (360 / feature.moons.length) * i - 90;
        const duration = 9 + i * 5;
        const moonSize = detailed ? 0.17 : 0.14;
        return (
          <span
            key={moon.label}
            className='pointer-events-none absolute left-1/2 top-1/2'
            style={{ width: 0, height: 0, ...spinStyle(duration, startAngle) }}
            aria-hidden={!detailed}
          >
            <span
              className='absolute left-0 top-0'
              style={{ transform: `translateX(calc(${sizeCss} * ${moonOrbit(i).toFixed(3)}))` }}
            >
              {/* Counter-rotation keeps the moon's icon and label upright. */}
              <span
                className='absolute left-0 top-0 block'
                style={spinStyle(duration, startAngle, true)}
              >
                {
                  /* Centering via framer x/y (not translate classes) so the
                    staggered entrance scale doesn't override it. */
                }
                <motion.span
                  className='absolute flex flex-col items-center'
                  style={{ x: '-50%', y: '-50%', gap: `calc(${sizeCss} * 0.013)` }}
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: detailed ? 0.3 + i * 0.14 : 0,
                    type: 'spring',
                    stiffness: 260,
                    damping: 18,
                  }}
                >
                  <span
                    className='flex items-center justify-center rounded-full'
                    style={{
                      width: `calc(${sizeCss} * ${moonSize})`,
                      height: `calc(${sizeCss} * ${moonSize})`,
                      background:
                        'radial-gradient(circle at 35% 30%, #f3f4f6 0%, #9ca3af 60%, #4b5563 100%)',
                      boxShadow: 'inset -2px -3px 6px rgba(0,0,0,0.4)',
                    }}
                  >
                    {detailed && (
                      <span
                        className='material-symbols-outlined text-gray-800'
                        style={{ fontSize: `calc(${sizeCss} * ${moonSize} * 0.6)` }}
                      >
                        {moon.icon}
                      </span>
                    )}
                  </span>
                  {detailed && (
                    <span
                      className='whitespace-nowrap rounded-full border border-white/15 font-bold text-white/90'
                      style={{
                        backgroundColor: 'rgba(7, 11, 24, 0.75)',
                        fontSize: `calc(${sizeCss} * 0.034)`,
                        padding: `calc(${sizeCss} * 0.007) calc(${sizeCss} * 0.034)`,
                        borderWidth: `calc(${sizeCss} * 0.0034)`,
                      }}
                    >
                      {moon.label}
                    </span>
                  )}
                </motion.span>
              </span>
            </span>
          </span>
        );
      })}
    </span>
  );
}

type GalaxyOrbitProps = {
  selectedId: GalaxyFeatureId;
  /** Planet currently zoomed into by the section's camera dive, if any. */
  zoomedId: GalaxyFeatureId | null;
  onSelect: (id: GalaxyFeatureId) => void;
};

function Planet({
  feature,
  startAngle,
  isSelected,
  detailed,
  onSelect,
}: {
  feature: GalaxyFeature;
  startAngle: number;
  isSelected: boolean;
  /** True while the camera is zoomed into this planet: moons get labels. */
  detailed: boolean;
  onSelect: (id: GalaxyFeatureId) => void;
}) {
  const radius = orbitFraction(feature) / 2;
  const dotSize = `calc(var(--gsize) * ${(feature.size / 620).toFixed(4)})`;

  return (
    // hk-orbit marks the orbital spinners so the section can pause just the
    // orbital motion while zoomed (moons keep animating).
    <div
      className='hk-orbit absolute left-1/2 top-1/2'
      style={{ width: 0, height: 0, ...spinStyle(ORBIT_PERIOD_SECONDS, startAngle) }}
    >
      <div
        className='absolute left-0 top-0'
        style={{ transform: `translateX(calc(var(--gsize) * ${radius.toFixed(4)}))` }}
      >
        {/* Counter z-rotation cancels the orbit rotation for the content. */}
        <div className='hk-orbit' style={spinStyle(ORBIT_PERIOD_SECONDS, startAngle, true)}>
          {/* Counter-squash restores the planet's true shape. */}
          <div style={{ transform: `scaleY(${(1 / TILT_SQUASH).toFixed(4)})` }}>
            <motion.button
              type='button'
              data-planet-id={feature.id}
              onClick={() => onSelect(feature.id)}
              aria-label={`Phóng to ${feature.label}`}
              aria-pressed={isSelected}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              animate={{ scale: isSelected && !detailed ? 1.2 : 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className='pointer-events-auto absolute flex -translate-x-1/2 -translate-y-1/2 cursor-zoom-in items-center justify-center'
              style={{ width: dotSize, height: dotSize }}
            >
              <PlanetSphere
                feature={feature}
                sizeCss={dotSize}
                isSelected={isSelected}
                detailed={detailed}
              />

              {
                /* Floating label chip for the selected planet (hidden while
                  zoomed — the moon labels take over). */
              }
              <motion.span
                initial={false}
                animate={{
                  opacity: isSelected && !detailed ? 1 : 0,
                  y: isSelected && !detailed ? 0 : -6,
                  scale: isSelected && !detailed ? 1 : 0.85,
                }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                className='pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full border px-3 py-1 text-[11px] font-bold text-white'
                style={{
                  backgroundColor: `color-mix(in srgb, ${feature.color} 30%, #070b18)`,
                  borderColor: `color-mix(in srgb, ${feature.color} 60%, transparent)`,
                }}
              >
                {feature.label}
              </motion.span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Sun() {
  return (
    <div style={{ transform: `scaleY(${(1 / TILT_SQUASH).toFixed(4)})` }}>
      <div
        className='relative flex flex-col items-center justify-center rounded-full'
        style={{
          width: 'calc(var(--gsize) * 0.15)',
          height: 'calc(var(--gsize) * 0.15)',
          background:
            'radial-gradient(circle at 38% 35%, #fffbeb 0%, #fde68a 28%, #f59e0b 62%, #d97706 100%)',
          animation: 'hk-pulse 4s ease-in-out infinite',
        }}
      >
        {/* Corona — layered radial gradients instead of box-shadow. */}
        <span
          className='pointer-events-none absolute inset-[-90%] rounded-full'
          style={{
            background:
              'radial-gradient(circle, rgba(245,158,11,0.5) 0%, rgba(245,158,11,0.18) 35%, transparent 68%)',
          }}
          aria-hidden
        />
        <span
          className='pointer-events-none absolute inset-[-45%] rounded-full'
          style={{
            background: 'radial-gradient(circle, rgba(253,230,138,0.55) 0%, transparent 65%)',
            animation: 'hk-glow 2.6s ease-in-out infinite',
          }}
          aria-hidden
        />
        <span
          className='material-symbols-outlined relative text-amber-950'
          style={{ fontSize: 'calc(var(--gsize) * 0.05)' }}
          aria-hidden
        >
          hive
        </span>
        <span
          className='relative px-1 font-black uppercase tracking-wide text-amber-950'
          style={{ fontSize: 'calc(var(--gsize) * 0.018)' }}
        >
          Hive-K
        </span>
      </div>
    </div>
  );
}

export function GalaxyOrbit({ selectedId, zoomedId, onSelect }: GalaxyOrbitProps) {
  const selected = GALAXY_FEATURES.find((f) => f.id === selectedId);

  return (
    <div
      className='relative mx-auto select-none [--gsize:min(92vw,420px)] sm:[--gsize:min(88vw,560px)] lg:[--gsize:min(66vw,780px)]'
      style={{
        width: 'var(--gsize)',
        height: 'calc(var(--gsize) * 0.9)',
        maxWidth: '100%',
      }}
    >
      {/* Ambient nebula behind the whole system, tinted by selection. */}
      <div
        className='pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px]'
        style={{
          width: 'calc(var(--gsize) * 0.5)',
          height: 'calc(var(--gsize) * 0.4)',
          backgroundColor: `color-mix(in srgb, ${
            selected?.color ?? 'var(--color-primary)'
          } 22%, transparent)`,
          transition: 'background-color .6s',
        }}
        aria-hidden
      />

      {/* The tilted (squashed) orbital plane. */}
      <div
        className='absolute left-1/2 top-1/2 flex items-center justify-center'
        style={{
          width: 'var(--gsize)',
          height: 'var(--gsize)',
          marginLeft: 'calc(var(--gsize) * -0.5)',
          marginTop: 'calc(var(--gsize) * -0.5)',
          transform: `scaleY(${TILT_SQUASH})`,
        }}
      >
        {/* Orbit rings — the selected feature's ring lights up in its color. */}
        {GALAXY_FEATURES.map((f) => {
          const isSelected = f.id === selectedId;
          return (
            <div
              key={f.id}
              className={`pointer-events-none absolute rounded-full border ${
                isSelected ? '' : 'border-dashed'
              }`}
              style={{
                width: `calc(var(--gsize) * ${orbitFraction(f).toFixed(4)})`,
                height: `calc(var(--gsize) * ${orbitFraction(f).toFixed(4)})`,
                borderColor: isSelected
                  ? `color-mix(in srgb, ${f.color} 60%, transparent)`
                  : 'color-mix(in srgb, #ffffff 16%, transparent)',
                boxShadow: isSelected
                  ? `0 0 34px color-mix(in srgb, ${f.color} 20%, transparent), inset 0 0 34px color-mix(in srgb, ${f.color} 10%, transparent)`
                  : 'none',
                transition: 'border-color .4s, box-shadow .4s',
              }}
            />
          );
        })}

        {/* Asteroid belt drifting between the outer orbits. */}
        <div
          className='pointer-events-none absolute left-1/2 top-1/2'
          style={{ width: 0, height: 0, ...spinStyle(140, 0) }}
          aria-hidden
        >
          {ASTEROIDS.map((a) => (
            <span
              key={a.id}
              className='absolute rounded-full bg-white'
              style={{
                width: a.size,
                height: a.size,
                opacity: a.opacity,
                transform: `rotate(${a.angle}deg) translateX(calc(var(--gsize) * ${
                  a.radius.toFixed(4)
                }))`,
              }}
            />
          ))}
        </div>

        {/* Gravity ripples radiating along the orbital plane. */}
        {[0, 1.6].map((delay) => (
          <span
            key={delay}
            className='pointer-events-none absolute rounded-full border border-primary/40'
            style={{
              width: 'calc(var(--gsize) * 0.18)',
              height: 'calc(var(--gsize) * 0.18)',
              animation: `hk-ripple 3.2s ease-out ${delay}s infinite`,
            }}
          />
        ))}

        <Sun />

        {GALAXY_FEATURES.map((feature, index) => (
          <Planet
            key={feature.id}
            feature={feature}
            startAngle={planetStartAngle(index)}
            isSelected={feature.id === selectedId}
            detailed={feature.id === zoomedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
