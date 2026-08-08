/**
 * AvatarIcon.jsx
 *
 * Renders a briefcase icon on a deterministic gradient background.
 * Each name consistently produces the same palette so the icon is
 * recognisable across page reloads without storing anything.
 */

import React from "react";

/* ── Palette ─────────────────────────────────────────────────────── */
const PALETTES = [
  ["#1d4ed8", "#6366f1"],
  ["#7c3aed", "#a855f7"],
  ["#0d9488", "#14b8a6"],
  ["#dc2626", "#f43f5e"],
  ["#d97706", "#f59e0b"],
  ["#0369a1", "#0ea5e9"],
  ["#15803d", "#22c55e"],
  ["#be185d", "#ec4899"],
  ["#0e7490", "#06b6d4"],
  ["#92400e", "#f97316"],
  ["#1e3a8a", "#3b82f6"],
  ["#4a044e", "#d946ef"],
  ["#064e3b", "#10b981"],
  ["#312e81", "#818cf8"],
  ["#7f1d1d", "#ef4444"],
  ["#134e4a", "#2dd4bf"],
];

function hashStr(s = "") {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(31, h) + s.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

/* ── Component ───────────────────────────────────────────────────── */
export default function AvatarIcon({ name = "", size = 44, className = "", style = {} }) {
  const hash      = hashStr(name);
  const [g1, g2]  = PALETTES[hash % PALETTES.length];
  const gradId    = `av-${hash}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={name}
      className={className}
      style={{ flexShrink: 0, ...style }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor={g1} />
          <stop offset="100%" stopColor={g2} />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="100" height="100" fill={`url(#${gradId})`} />

      {/*
        Briefcase icon — scaled to fit nicely inside 100×100.
        Original path is a 512×512 outline briefcase; scaled ~0.135× and centered.

        Handle (top bar)
        Body (main rect with rounded corners)
        Clasp (center latch)
        Belt curve (the horizontal arc midway)
      */}

      {/* Handle */}
      <path
        d="M36,14 L36,10 Q36,6 40,6 L60,6 Q64,6 64,10 L64,14"
        fill="none"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      />

      {/* Body */}
      <rect
        x="10" y="22" width="80" height="68"
        rx="10" ry="10"
        fill="none"
        stroke="white"
        strokeWidth="6"
        strokeLinejoin="round"
        opacity="0.95"
      />

      {/* Belt / strap line */}
      <path
        d="M10,52 Q20,62 43,62 L43,68 Q43,74 50,74 Q57,74 57,68 L57,62 Q80,62 90,52"
        fill="none"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.95"
      />

      {/* Clasp box (slightly filled so it reads clearly) */}
      <rect
        x="43" y="58" width="14" height="14"
        rx="3" ry="3"
        fill="white"
        opacity="0.25"
      />
    </svg>
  );
}
