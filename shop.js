// Icon shop: 10 original cube icons, cheapest to most expensive.
// Each `art(uid)` returns SVG markup for a 64×64 cube; `uid` keeps gradient
// ids unique when the same icon is drawn more than once on a page.

const OUT = "#0b0b10"; // outline colour

const frame = (fill, inner = "") =>
  `<rect x="3" y="3" width="58" height="58" rx="6" fill="${fill}" stroke="${OUT}" stroke-width="4"/>${inner}`;
const eyes = (fill = OUT, y = 20, size = 9) =>
  `<rect x="15" y="${y}" width="${size}" height="${size}" fill="${fill}"/><rect x="${49 - size}" y="${y}" width="${size}" height="${size}" fill="${fill}"/>`;

export const ICONS = [
  {
    id: "sunny", name: "Sunny", price: 10000,
    art: () => frame("#fde047",
      `<rect x="11" y="11" width="42" height="42" rx="3" fill="#facc15" stroke="${OUT}" stroke-width="3"/>` +
      eyes() + `<path d="M20 38 Q32 48 44 38" fill="none" stroke="${OUT}" stroke-width="4" stroke-linecap="round"/>`),
  },
  {
    id: "grump", name: "Grump", price: 30000,
    art: () => frame("#ef4444",
      `<rect x="11" y="11" width="42" height="42" rx="3" fill="#dc2626" stroke="${OUT}" stroke-width="3"/>` +
      `<path d="M14 17 L27 22 M50 17 L37 22" stroke="${OUT}" stroke-width="4" stroke-linecap="round"/>` +
      eyes(OUT, 24, 8) + `<rect x="20" y="40" width="24" height="5" fill="${OUT}"/>`),
  },
  {
    id: "checker", name: "Checker", price: 50000,
    art: () => frame("#22d3ee",
      `<rect x="5" y="5" width="27" height="27" fill="#0e7490"/><rect x="32" y="32" width="27" height="27" fill="#0e7490"/>` +
      `<rect x="3" y="3" width="58" height="58" rx="6" fill="none" stroke="${OUT}" stroke-width="4"/>` +
      `<rect x="20" y="20" width="24" height="24" fill="#ecfeff" stroke="${OUT}" stroke-width="3"/>` +
      `<rect x="25" y="27" width="5" height="5" fill="${OUT}"/><rect x="34" y="27" width="5" height="5" fill="${OUT}"/>` +
      `<rect x="26" y="36" width="12" height="3" fill="${OUT}"/>`),
  },
  {
    id: "zap", name: "Zap", price: 65000,
    art: () => frame("#7c3aed",
      `<rect x="11" y="11" width="42" height="42" rx="3" fill="#6d28d9" stroke="${OUT}" stroke-width="3"/>` +
      `<path d="M36 8 L18 36 H30 L26 56 L46 26 H34 L38 8 Z" fill="#fde047" stroke="${OUT}" stroke-width="3" stroke-linejoin="round"/>`),
  },
  {
    id: "visor", name: "Visor", price: 95000,
    art: () => frame("#94a3b8",
      `<rect x="9" y="9" width="46" height="46" rx="3" fill="#64748b" stroke="${OUT}" stroke-width="3"/>` +
      `<rect x="12" y="20" width="40" height="12" rx="3" fill="#0f172a" stroke="${OUT}" stroke-width="2"/>` +
      `<rect x="16" y="24" width="32" height="4" rx="2" fill="#22d3ee"/>` +
      `<rect x="18" y="40" width="4" height="7" fill="${OUT}"/><rect x="26" y="40" width="4" height="7" fill="${OUT}"/>` +
      `<rect x="34" y="40" width="4" height="7" fill="${OUT}"/><rect x="42" y="40" width="4" height="7" fill="${OUT}"/>`),
  },
  {
    id: "spook", name: "Spook", price: 120000,
    art: () => frame("#f1f5f9",
      `<circle cx="22" cy="26" r="8" fill="${OUT}"/><circle cx="42" cy="26" r="8" fill="${OUT}"/>` +
      `<circle cx="24" cy="24" r="2.5" fill="#a3e635"/><circle cx="44" cy="24" r="2.5" fill="#a3e635"/>` +
      `<path d="M16 44 H48" stroke="${OUT}" stroke-width="3"/>` +
      `<path d="M21 40 V48 M27 40 V48 M33 40 V48 M39 40 V48 M45 40 V48" stroke="${OUT}" stroke-width="2.5"/>`),
  },
  {
    id: "blaze", name: "Blaze", price: 150000,
    art: (u) => `<defs><linearGradient id="bl${u}" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stop-color="#dc2626"/><stop offset="1" stop-color="#fb923c"/></linearGradient></defs>` +
      frame(`url(#bl${u})`,
        `<path d="M32 10 C40 20 48 26 46 40 C45 49 38 54 32 54 C26 54 19 49 18 40 C17 31 24 28 25 20 C29 26 30 28 32 30 C34 24 33 17 32 10 Z" fill="#fde047" stroke="${OUT}" stroke-width="3" stroke-linejoin="round"/>` +
        `<path d="M32 32 C36 38 40 41 38 47 C37 50 35 51 32 51 C29 51 27 50 26 47 C25 43 29 40 32 32 Z" fill="#fff7ed"/>`),
  },
  {
    id: "monarch", name: "Monarch", price: 175000,
    art: () => frame("#1e3a8a",
      `<rect x="9" y="9" width="46" height="46" rx="3" fill="#1d4ed8" stroke="#fbbf24" stroke-width="3"/>` +
      `<path d="M14 30 L18 14 L26 23 L32 10 L38 23 L46 14 L50 30 Z" fill="#fbbf24" stroke="${OUT}" stroke-width="3" stroke-linejoin="round"/>` +
      `<circle cx="32" cy="22" r="2.5" fill="#ef4444"/>` +
      eyes("#fbbf24", 36, 7) + `<rect x="25" y="47" width="14" height="3" fill="#fbbf24"/>`),
  },
  {
    id: "nebula", name: "Nebula", price: 190000,
    art: (u) => `<defs><radialGradient id="nb${u}" cx=".35" cy=".3" r=".9">
        <stop offset="0" stop-color="#c026d3"/><stop offset=".55" stop-color="#4c1d95"/><stop offset="1" stop-color="#0f0a2e"/></radialGradient></defs>` +
      frame(`url(#nb${u})`,
        `<g fill="#fff"><circle cx="14" cy="16" r="1.5"/><circle cx="50" cy="12" r="1.2"/><circle cx="46" cy="48" r="1.5"/>` +
        `<circle cx="12" cy="50" r="1"/><circle cx="26" cy="54" r="1.2"/><circle cx="54" cy="32" r="1"/></g>` +
        `<path d="M32 18 L35 29 L46 32 L35 35 L32 46 L29 35 L18 32 L29 29 Z" fill="#fef9c3" stroke="${OUT}" stroke-width="2" stroke-linejoin="round"/>`),
  },
  {
    id: "prism", name: "Prism", price: 230000, animated: true,
    art: (u) => `<defs><linearGradient id="pr${u}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f43f5e"><animate attributeName="stop-color" values="#f43f5e;#facc15;#22d3ee;#a855f7;#f43f5e" dur="4s" repeatCount="indefinite"/></stop>
        <stop offset="1" stop-color="#22d3ee"><animate attributeName="stop-color" values="#22d3ee;#a855f7;#f43f5e;#facc15;#22d3ee" dur="4s" repeatCount="indefinite"/></stop>
      </linearGradient></defs>` +
      frame(`url(#pr${u})`,
        `<path d="M32 9 L53 32 L32 55 L11 32 Z" fill="#ffffff" fill-opacity=".85" stroke="${OUT}" stroke-width="3" stroke-linejoin="round"/>` +
        `<path d="M32 9 L32 55 M11 32 L53 32" stroke="${OUT}" stroke-width="1.5" opacity=".5"/>` +
        `<rect x="22" y="24" width="6" height="6" fill="${OUT}"/><rect x="36" y="24" width="6" height="6" fill="${OUT}"/>`),
  },
];

let uidCounter = 0;
export function iconSVG(id, size = 48) {
  const icon = ICONS.find((i) => i.id === id);
  if (!icon) return "";
  return `<svg viewBox="0 0 64 64" width="${size}" height="${size}" role="img" aria-label="${icon.name}">${icon.art(++uidCounter)}</svg>`;
}
