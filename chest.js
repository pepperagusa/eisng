// Daily chest: one random point prize per day. Weights add up to 1000.
export const PRIZES = [
  { id: "small", name: "Small", points: 1000, weight: 500 },
  { id: "nice", name: "Nice", points: 2500, weight: 250 },
  { id: "big", name: "Big", points: 5000, weight: 150 },
  { id: "huge", name: "Huge", points: 10000, weight: 70 },
  { id: "mega", name: "Mega", points: 25000, weight: 25 },
  { id: "jackpot", name: "Jackpot!", points: 50000, weight: 5 },
];

export function pickPrize() {
  const total = PRIZES.reduce((t, p) => t + p.weight, 0);
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  let r = buf[0] % total;
  for (const p of PRIZES) {
    if (r < p.weight) return p;
    r -= p.weight;
  }
  return PRIZES[0];
}

// Original treasure-chest drawing. `open` swings the lid up.
export function chestSVG(open = false, size = 120) {
  const lid = open
    ? `<g transform="translate(0 -14) rotate(-14 20 44)">
         <path d="M14 44 Q14 22 60 22 Q106 22 106 44 Z" fill="#b45309" stroke="#0b0b10" stroke-width="4" stroke-linejoin="round"/>
         <path d="M14 44 H106" stroke="#0b0b10" stroke-width="4"/>
         <rect x="52" y="22" width="16" height="22" fill="#facc15" stroke="#0b0b10" stroke-width="3"/>
       </g>
       <ellipse cx="60" cy="50" rx="40" ry="7" fill="#fde047"/>
       <g fill="#fff"><circle cx="40" cy="44" r="2"/><circle cx="74" cy="40" r="2.5"/><circle cx="60" cy="36" r="1.6"/></g>`
    : `<path d="M14 50 Q14 26 60 26 Q106 26 106 50 Z" fill="#b45309" stroke="#0b0b10" stroke-width="4" stroke-linejoin="round"/>
       <rect x="52" y="26" width="16" height="24" fill="#facc15" stroke="#0b0b10" stroke-width="3"/>`;
  return `<svg viewBox="0 0 120 110" width="${size}" height="${size * 110 / 120}" aria-hidden="true">
    <rect x="14" y="50" width="92" height="50" rx="4" fill="#92400e" stroke="#0b0b10" stroke-width="4"/>
    <path d="M14 66 H106" stroke="#78350f" stroke-width="3"/>
    <rect x="52" y="50" width="16" height="50" fill="#facc15" stroke="#0b0b10" stroke-width="3"/>
    <rect x="54" y="56" width="12" height="14" rx="2" fill="#0b0b10"/>
    <circle cx="60" cy="62" r="2.5" fill="#facc15"/>
    ${lid}
  </svg>`;
}
