// ── Container Fabricators Kenya — Logo
// Layout: Text LEFT  |  Circular CF emblem RIGHT
// Colors: #C94C1A (rust) for CONTAINER, arcs, C shape
//         #E07820 (orange) for FABRICATORS, F bars, chevron

type Variant = 'full' | 'navbar' | 'icon'

const RUST   = '#C94C1A'
const ORANGE = '#E07820'
const FONT   = "var(--font-barlow),'Barlow Condensed','Arial Black',sans-serif"

// ── Circular CF emblem, defined with center at origin ─────────────────────
// Outer arc r=52, inner r=36. Dasharray ratios derived from the reference
// emblem so the gap falls consistently at the top-right (~21% of circumference).
// All path coordinates are in the local coordinate system (cx=0, cy=0).
function EmblemMark({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx},${cy})`}>
      {/* Outer broken arc */}
      <circle r={52} stroke={RUST} strokeWidth={9}
        strokeDasharray="258 69" strokeDashoffset="-34"
        strokeLinecap="round" fill="none" />

      {/* Inner broken arc */}
      <circle r={36} stroke={RUST} strokeWidth={6}
        strokeDasharray="178 48" strokeDashoffset="-24"
        strokeLinecap="round" fill="none" />

      {/* C shape — opens to the right, endpoints at ~1 o'clock and ~5 o'clock */}
      <path
        d="M 23,-33 Q 5,-36 -25,-35 Q -30,-35 -29,-6 L -29,6 Q -30,35 -25,35 Q 5,36 23,33"
        stroke={RUST} strokeWidth={18}
        fill="none" strokeLinecap="round" strokeLinejoin="round"
      />

      {/* Top F bar (longer) */}
      <line x1="-1" y1="-20" x2="33" y2="-20"
        stroke={ORANGE} strokeWidth={18} strokeLinecap="round" />

      {/* Middle F bar (shorter) */}
      <line x1="-1" y1="0" x2="23" y2="0"
        stroke={ORANGE} strokeWidth={18} strokeLinecap="round" />

      {/* Right-pointing chevron arrow */}
      <polyline points="18,-12 34,0 18,12"
        stroke={ORANGE} strokeWidth={14}
        fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  )
}

// ── Public API ────────────────────────────────────────────────────────────
export default function Logo({
  variant = 'full',
  className,
}: {
  variant?: Variant
  className?: string
}) {

  // ICON — emblem only, no text
  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 120 120"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Container Fabricators Kenya"
      >
        <EmblemMark cx={60} cy={60} />
      </svg>
    )
  }

  // FULL & NAVBAR — text LEFT, emblem RIGHT
  // viewBox is 500×120 so width:height ≈ 4.2:1
  // At h-10 (40px) the rendered width ≈ 167px, fits cleanly in navbar
  return (
    <svg
      viewBox="0 0 500 120"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Container Fabricators Kenya"
    >
      {/* ── Text (left side) ── */}
      <text
        x="0" y="52"
        fontFamily={FONT} fontWeight="900" fontSize="52"
        fill={RUST} letterSpacing={2}
        textAnchor="start"
      >
        CONTAINER
      </text>
      <text
        x="0" y="105"
        fontFamily={FONT} fontWeight="900" fontSize="52"
        fill={ORANGE} letterSpacing={2}
        textAnchor="start"
      >
        FABRICATORS
      </text>

      {/* ── Emblem (right side) ── */}
      <EmblemMark cx={420} cy={60} />
    </svg>
  )
}
