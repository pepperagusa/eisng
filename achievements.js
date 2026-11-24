// Achievements a number can earn. Each `test` returns false when not earned,
// or true / a detail string (like "1 & 4") when earned.
// `count` = how many of the 1,000,000 numbers earn it (checked by test.js).
// Points come from that count, so rarer achievements are worth more.

import { MAX } from "./classify.js";

// ---- helpers ----
let primeSieve;
function isPrime(n) {
  if (!primeSieve) {
    primeSieve = new Uint8Array(MAX + 1).fill(1);
    primeSieve[0] = primeSieve[1] = 0;
    for (let i = 2; i * i <= MAX; i++)
      if (primeSieve[i]) for (let j = i * i; j <= MAX; j += i) primeSieve[j] = 0;
  }
  return primeSieve[n] === 1;
}

const isSquare = (n) => Number.isInteger(Math.sqrt(n));
const isCube = (n) => Math.round(Math.cbrt(n)) ** 3 === n;
const isTriangular = (n) => isSquare(8 * n + 1);
const FIB = new Set([1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584,
  4181, 6765, 10946, 17711, 28657, 46368, 75025, 121393, 196418, 317811, 514229, 832040]);
const FACTORIALS = new Set([1, 2, 6, 24, 120, 720, 5040, 40320, 362880]);
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const list = (arr) =>
  arr.length <= 1 ? String(arr[0]) : `${arr.slice(0, -1).join(", ")} & ${arr.at(-1)}`;

function run(s, test) {
  let best = 1, cur = 1;
  for (let i = 1; i < s.length; i++) {
    cur = test(+s[i - 1], +s[i]) ? cur + 1 : 1;
    best = Math.max(best, cur);
  }
  return best;
}

export function context(n) {
  const s = String(n);
  const d = [...s].map(Number);
  const counts = Array(10).fill(0);
  for (const x of d) counts[x]++;
  const repeated = counts.map((c, i) => (c > 1 ? i : -1)).filter((i) => i >= 0);
  const sum = d.reduce((a, b) => a + b, 0);
  const shape = counts.filter(Boolean).sort((a, b) => b - a); // like [3, 2, 1]
  return {
    n, s, d, L: s.length, counts, repeated, sum, shape,
    zeros: s.length - s.replace(/0+$/, "").length,
    same: run(s, (a, b) => a === b),
    up: run(s, (a, b) => b === a + 1),
    down: run(s, (a, b) => b === a - 1),
  };
}

// ---- the achievements ----
const A = [
  // Endings & parity
  { id: "even-end", name: "Even Steven", desc: "Ends in an even digit", test: (c) => c.d.at(-1) % 2 === 0 },
  { id: "odd-end", name: "Odd Ball", desc: "Ends in an odd digit", test: (c) => c.d.at(-1) % 2 === 1 },
  { id: "all-even", name: "All Even", desc: "Every digit is even", test: (c) => c.d.every((x) => x % 2 === 0) },
  { id: "all-odd", name: "All Odd", desc: "Every digit is odd", test: (c) => c.d.every((x) => x % 2 === 1) },
  { id: "alternating", name: "Ping Pong", desc: "Digits alternate odd and even (4+ digits)",
    test: (c) => c.L >= 4 && c.d.every((x, i) => i === 0 || x % 2 !== c.d[i - 1] % 2) },
  { id: "high", name: "High Roller", desc: "Every digit is 5 or higher", test: (c) => c.d.every((x) => x >= 5) },
  { id: "low", name: "Low Rider", desc: "Every digit is 4 or lower", test: (c) => c.L >= 3 && c.d.every((x) => x <= 4) },

  // Duplicates
  { id: "dupe", name: "Duplicates", desc: "A digit shows up more than once",
    test: (c) => c.repeated.length > 0 && list(c.repeated) },
  { id: "dupe2", name: "Double Duplicates", desc: "Two different digits repeat",
    test: (c) => c.repeated.length === 2 && list(c.repeated) },
  { id: "dupe3", name: "Triple Duplicates", desc: "Three different digits repeat",
    test: (c) => c.repeated.length === 3 && list(c.repeated) },
  { id: "unique", name: "No Repeats", desc: "Every digit is different (5+ digits)",
    test: (c) => c.L >= 5 && c.repeated.length === 0 },
  { id: "trio", name: "Trio", desc: "A digit shows up 3 times",
    test: (c) => c.shape[0] === 3 && String(c.counts.indexOf(3)) },
  { id: "quad", name: "Quad", desc: "A digit shows up 4 or more times",
    test: (c) => c.shape[0] >= 4 && String(c.counts.findIndex((x) => x >= 4)) },
  { id: "full-house", name: "Full House", desc: "One digit 3 times and another twice",
    test: (c) => c.shape[0] === 3 && c.shape[1] === 2 },
  { id: "two-trios", name: "Two Trios", desc: "Two different digits, 3 times each",
    test: (c) => c.shape[0] === 3 && c.shape[1] === 3 },
  { id: "two-kinds", name: "Two-Tone", desc: "Made of only two different digits (4+ digits)",
    test: (c) => c.L >= 4 && c.shape.length === 2 },

  // Next to each other
  { id: "twins", name: "Twins", desc: "Two same digits side by side", test: (c) => c.same >= 2 },
  { id: "triplets", name: "Triplets", desc: "Three same digits in a row", test: (c) => c.same >= 3 },
  { id: "quads", name: "Four of a Kind", desc: "Four same digits in a row", test: (c) => c.same >= 4 },
  { id: "five-kind", name: "Five of a Kind", desc: "Five same digits in a row", test: (c) => c.same >= 5 },
  { id: "repdigit", name: "Repdigit", desc: "Every digit is the same (2+ digits)",
    test: (c) => c.L >= 2 && c.same === c.L },
  { id: "pairs3", name: "Pair Parade", desc: "Three side-by-side pairs, like 112233",
    test: (c) => /^(\d)\1(\d)\2(\d)\3$/.test(c.s) },
  { id: "sandwich", name: "Sandwich", desc: "A digit between two matching digits, like 474",
    test: (c) => /(\d)(?!\1)\d\1/.test(c.s) },

  // Order & shape
  { id: "step3", name: "Step Up", desc: "Three digits counting up or down, like 345",
    test: (c) => Math.max(c.up, c.down) >= 3 },
  { id: "step4", name: "Staircase", desc: "Four digits counting up or down, like 6789",
    test: (c) => Math.max(c.up, c.down) >= 4 },
  { id: "step5", name: "Escalator", desc: "Five digits counting up or down",
    test: (c) => Math.max(c.up, c.down) >= 5 },
  { id: "rising", name: "Always Rising", desc: "Each digit is bigger than the last (3+ digits)",
    test: (c) => c.L >= 3 && c.d.every((x, i) => i === 0 || x > c.d[i - 1]) },
  { id: "falling", name: "Always Falling", desc: "Each digit is smaller than the last (3+ digits)",
    test: (c) => c.L >= 3 && c.d.every((x, i) => i === 0 || x < c.d[i - 1]) },
  { id: "zigzag", name: "Zigzag", desc: "Digits go up, down, up, down… (5+ digits)",
    test: (c) => {
      if (c.L < 5) return false;
      const diffs = c.d.slice(1).map((x, i) => Math.sign(x - c.d[i]));
      return diffs.every((x, i) => x !== 0 && (i === 0 || x === -diffs[i - 1]));
    } },
  { id: "bookends", name: "Bookends", desc: "Starts and ends with the same digit",
    test: (c) => c.L >= 2 && c.s[0] === c.s.at(-1) },
  { id: "palindrome", name: "Palindrome", desc: "Reads the same backwards (3+ digits)",
    test: (c) => c.L >= 3 && c.s === [...c.s].reverse().join("") },
  { id: "echo", name: "Echo", desc: "The same block twice, like 381381 or 4747",
    test: (c) => c.L % 2 === 0 && c.L >= 4 && c.s.slice(0, c.L / 2) === c.s.slice(c.L / 2) },
  { id: "binary", name: "Binary", desc: "Only 0s and 1s (3+ digits)",
    test: (c) => c.L >= 3 && /^[01]+$/.test(c.s) },

  // Round numbers
  { id: "zero-free", name: "Zero Free", desc: "No zeros at all", test: (c) => !c.s.includes("0") },
  { id: "round10", name: "Ten-Round", desc: "Ends in 0", test: (c) => c.zeros >= 1 },
  { id: "round100", name: "Hundred-Round", desc: "Ends in 00", test: (c) => c.zeros >= 2 },
  { id: "round1000", name: "Thousand-Round", desc: "Ends in 000", test: (c) => c.zeros >= 3 },
  { id: "round10k", name: "Ten-Thousand-Round", desc: "Ends in 0000", test: (c) => c.zeros >= 4 },
  { id: "round100k", name: "Hundred-Thousand-Round", desc: "Ends in 00000", test: (c) => c.zeros >= 5 },

  // Size
  { id: "small", name: "Small Fry", desc: "Under 1,000", test: (c) => c.n < 1000 },
  { id: "tiny", name: "Tiny", desc: "Under 100", test: (c) => c.n < 100 },
  { id: "top", name: "Top Shelf", desc: "990,000 or higher", test: (c) => c.n >= 990000 },
  { id: "million", name: "The Million", desc: "Exactly 1,000,000", test: (c) => c.n === 1000000 },
  { id: "halfway", name: "Halfway There", desc: "Exactly 500,000", test: (c) => c.n === 500000 },
  { id: "one", name: "Number One", desc: "Exactly 1", test: (c) => c.n === 1 },

  // Maths
  { id: "prime", name: "Prime Time", desc: "A prime number", test: (c) => isPrime(c.n) },
  { id: "div9", name: "Nine Lives", desc: "Divisible by 9", test: (c) => c.n % 9 === 0 },
  { id: "div11", name: "Eleven Up", desc: "Divisible by 11", test: (c) => c.n % 11 === 0 },
  { id: "div7", name: "Lucky Split", desc: "Divisible by 7", test: (c) => c.n % 7 === 0 },
  { id: "square", name: "Perfect Square", desc: "Some whole number times itself",
    test: (c) => isSquare(c.n) && `${Math.sqrt(c.n)}²` },
  { id: "cube", name: "Perfect Cube", desc: "Some whole number cubed",
    test: (c) => isCube(c.n) && `${Math.round(Math.cbrt(c.n))}³` },
  { id: "pow2", name: "Power of Two", desc: "2 × 2 × 2 × …", test: (c) => (c.n & (c.n - 1)) === 0 && `2^${Math.log2(c.n)}` },
  { id: "triangle", name: "Triangle", desc: "A triangular number (1, 3, 6, 10, …)", test: (c) => isTriangular(c.n) },
  { id: "fib", name: "Fibonacci", desc: "In the Fibonacci sequence", test: (c) => FIB.has(c.n) },
  { id: "factorial", name: "Factorial", desc: "Like 5! = 120", test: (c) => FACTORIALS.has(c.n) },
  { id: "sum-low", name: "Featherweight", desc: "Digits add up to 5 or less", test: (c) => c.sum <= 5 && `sum ${c.sum}` },
  { id: "sum-high", name: "Heavyweight", desc: "Digits add up to 45 or more", test: (c) => c.sum >= 45 && `sum ${c.sum}` },
  { id: "sum-7", name: "Magic Seven", desc: "Digits add up to exactly 7", test: (c) => c.sum === 7 },

  // Hidden numbers
  { id: "seven", name: "Lucky Seven", desc: "Has a 7 in it", test: (c) => c.s.includes("7") },
  { id: "777", name: "Jackpot", desc: "Has 777 in it", test: (c) => c.s.includes("777") },
  { id: "42", name: "The Answer", desc: "Has 42 in it", test: (c) => c.s.includes("42") },
  { id: "007", name: "Secret Agent", desc: "Has 007 in it", test: (c) => c.s.includes("007") },
  { id: "404", name: "Not Found", desc: "Has 404 in it", test: (c) => c.s.includes("404") },
  { id: "365", name: "Every Day", desc: "Has 365 in it", test: (c) => c.s.includes("365") },
  { id: "314", name: "Slice of Pi", desc: "Has 314 in it", test: (c) => c.s.includes("314") },
  { id: "1234", name: "Count Off", desc: "Has 1234 in it", test: (c) => c.s.includes("1234") },
  { id: "countdown", name: "Liftoff", desc: "Ends with 321", test: (c) => c.s.endsWith("321") },
  { id: "pi", name: "Pi", desc: "Exactly 314,159", test: (c) => c.n === 314159 },

  // Looks like…
  { id: "date", name: "Calendar Day", desc: "Reads as a date: MM DD YY",
    test: (c) => {
      if (c.L !== 6) return false;
      const m = +c.s.slice(0, 2), d = +c.s.slice(2, 4);
      return m >= 1 && m <= 12 && d >= 1 && d <= DAYS_IN_MONTH[m - 1] && `${c.s.slice(0, 2)}/${c.s.slice(2, 4)}/${c.s.slice(4)}`;
    } },
  { id: "time", name: "Clockwork", desc: "Reads as a time: HH MM SS",
    test: (c) => {
      if (c.L !== 6) return false;
      const h = +c.s.slice(0, 2), m = +c.s.slice(2, 4), sec = +c.s.slice(4);
      return h < 24 && m < 60 && sec < 60 && `${c.s.slice(0, 2)}:${c.s.slice(2, 4)}:${c.s.slice(4)}`;
    } },
];

// Filled in from enumerating every number; test.js checks these.
const COUNTS = {
  "42": 49401,
  "314": 3999,
  "365": 3999,
  "404": 3979,
  "777": 3700,
  "1234": 300,
  "even-end": 500000,
  "odd-end": 500000,
  "all-even": 15624,
  "all-odd": 19530,
  "alternating": 34875,
  "high": 19530,
  "low": 15601,
  "dupe": 831430,
  "dupe2": 255798,
  "dupe3": 9720,
  "unique": 163296,
  "trio": 138033,
  "quad": 11854,
  "full-house": 39690,
  "two-trios": 810,
  "two-kinds": 4294,
  "twins": 402130,
  "triplets": 35920,
  "quads": 2701,
  "five-kind": 181,
  "repdigit": 45,
  "pairs3": 900,
  "sandwich": 304479,
  "step3": 58287,
  "step4": 3860,
  "step5": 220,
  "rising": 420,
  "falling": 792,
  "zigzag": 133320,
  "bookends": 99999,
  "palindrome": 1980,
  "echo": 990,
  "binary": 61,
  "zero-free": 597870,
  "round10": 100000,
  "round100": 10000,
  "round1000": 1000,
  "round10k": 100,
  "round100k": 10,
  "small": 999,
  "tiny": 99,
  "top": 10001,
  "million": 1,
  "halfway": 1,
  "one": 1,
  "prime": 78498,
  "div9": 111111,
  "div11": 90909,
  "div7": 142857,
  "square": 1000,
  "cube": 100,
  "pow2": 20,
  "triangle": 1413,
  "fib": 29,
  "factorial": 9,
  "sum-low": 462,
  "sum-high": 5005,
  "sum-7": 792,
  "seven": 468559,
  "007": 2889,
  "countdown": 1000,
  "pi": 1,
  "date": 9200,
  "time": 50400,
};

function pointsFor(count) {
  const raw = 10 * Math.sqrt(MAX / count);
  const step = raw < 100 ? 5 : raw < 1000 ? 25 : raw < 5000 ? 250 : 1000;
  return Math.max(5, Math.round(raw / step) * step);
}

export const ACHIEVEMENTS = A.map((a) => ({
  ...a,
  count: COUNTS[a.id],
  get points() { return pointsFor(this.count); },
}));

// Returns [{ a, detail }] for a number, rarest first.
export function achievementsFor(n) {
  const c = context(n);
  const won = [];
  for (const a of ACHIEVEMENTS) {
    const r = a.test(c);
    if (r) won.push({ a, detail: r === true ? "" : r });
  }
  return won.sort((x, y) => y.a.points - x.a.points);
}

export const score = (won) => won.reduce((t, w) => t + w.a.points, 0);
export { pointsFor, COUNTS };
