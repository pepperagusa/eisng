// Decides how unique a number (1–1,000,000) is.
// Each rule that matches gives a tier; the number gets the highest one.

// count = how many of the 1,000,000 possible numbers land in that tier.
// test.js recounts these, so run `npm test` after changing any rule.
export const TIERS = [
  { id: "common", name: "Common", count: 507680 },
  { id: "uncommon", name: "Uncommon", count: 317797 },
  { id: "cool", name: "Cool", count: 115438 },
  { id: "rare", name: "Rare", count: 55873 },
  { id: "insane", name: "Insane", count: 2718 },
  { id: "extreme", name: "Extreme", count: 471 },
  { id: "impossible", name: "Impossible", count: 23 },
];

export const MIN = 1;
export const MAX = 1_000_000;

const SPECIAL = {
  1: "The One",
  1000000: "The Million",
  314159: "Pi",
  271828: "Euler's number",
  161803: "Golden ratio",
};

function longestRun(s, test) {
  let best = 1, cur = 1;
  for (let i = 1; i < s.length; i++) {
    cur = test(s[i - 1], s[i]) ? cur + 1 : 1;
    if (cur > best) best = cur;
  }
  return best;
}

function repeatedBlock(s) {
  for (let len = 1; len <= s.length / 2; len++) {
    if (s.length % len) continue;
    if (s.slice(0, len).repeat(s.length / len) === s) return len;
  }
  return 0;
}

// Returns { tier: 0–6, reason: string }
export function classify(n) {
  const s = String(n);
  const L = s.length;
  const same = longestRun(s, (a, b) => a === b);
  const up = longestRun(s, (a, b) => +b === +a + 1);
  const down = longestRun(s, (a, b) => +b === +a - 1);
  const seq = Math.max(up, down);
  const zeros = L - s.replace(/0+$/, "").length;
  const round = zeros === L - 1 && L > 1; // like 500000
  const palindrome = L >= 3 && s === [...s].reverse().join("");
  const block = repeatedBlock(s);
  const distinct = new Set(s).size;
  const pairs = (s.match(/(\d)\1/g) || []).length; // like 11 22 33

  const hits = [];
  const add = (tier, reason) => hits.push({ tier, reason });

  // Impossible
  if (SPECIAL[n]) add(6, SPECIAL[n]);
  if (L === 6 && same === 6) add(6, "Six of a kind");
  if (L === 6 && seq === 6) add(6, "Perfect sequence");

  // Extreme
  if (L === 1) add(5, "Single digit");
  if (L === 6 && round) add(5, "Perfectly round");
  if (L === 5 && same === 5) add(5, "Five of a kind");
  if (L === 6 && same === 5) add(5, "Five in a row");
  if (L === 6 && block === 2) add(5, "Repeating pair");
  if (seq === 5) add(5, "Five-step sequence");

  // Insane
  if (L === 2) add(4, "Two-digit number");
  if (L >= 2 && L <= 4 && same === L) add(4, "Repdigit");
  if (round) add(4, "Perfectly round");
  if (L === 6 && zeros === 4) add(4, "Very round");
  if (L === 6 && block === 3) add(4, "Repeating triple");
  if (L === 6 && palindrome) add(4, "Palindrome");
  if (L === 6 && pairs === 3) add(4, "Three pairs");

  // Rare
  if (L === 3) add(3, "Three-digit number");
  if (zeros === 3) add(3, "Round thousand");
  if (same === 4) add(3, "Four in a row");
  if (seq === 4) add(3, "Four-step sequence");
  if (palindrome) add(3, "Palindrome");
  if (block) add(3, "Repeating pattern");
  if (L === 6 && distinct === 2) add(3, "Only two digits");
  if (seq === 3 && same === 3) add(3, "Triple and sequence");
  if (pairs === 2) add(3, "Two pairs");

  // Cool
  if (zeros === 2) add(2, "Round hundred");
  if (same === 3) add(2, "Three in a row");
  if (seq === 3) add(2, "Three-step sequence");
  if (L === 6 && distinct === 3) add(2, "Only three digits");

  // Uncommon
  if (zeros === 1) add(1, "Ends in zero");
  if (L === 6 && distinct === 4) add(1, "Only four digits");
  if (L === 6 && s[0] === s[L - 1]) add(1, "Same start and end");

  if (!hits.length) return { tier: 0, reason: "Ordinary number" };
  return hits.reduce((a, b) => (b.tier > a.tier ? b : a));
}
