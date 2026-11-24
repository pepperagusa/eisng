// Achievements a number can earn: ~70 hand-written "Classics" plus generated
// families (hidden codes, years, divisibility…), about 2,000 in total.
//
// Each achievement has an id, name, desc and group. Points come from how many
// of the 1,000,000 numbers earn it (counts.js, made by `npm run counts`), so
// rarer achievements are worth more.

import { MAX } from "./classify.js";
import COUNTS from "./counts.js";

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

// Smallest prime factor of every number up to MAX (for factor-based checks).
let spfTable;
function spf() {
  if (!spfTable) {
    spfTable = new Int32Array(MAX + 1);
    for (let i = 2; i <= MAX; i++) {
      if (spfTable[i]) continue;
      for (let j = i; j <= MAX; j += i) if (!spfTable[j]) spfTable[j] = i;
    }
  }
  return spfTable;
}
// Prime factorisation as [[prime, power], ...]
function factor(n) {
  const t = spf(), out = [];
  while (n > 1) {
    const p = t[n];
    let k = 0;
    while (n % p === 0) { n /= p; k++; }
    out.push([p, k]);
  }
  return out;
}
function sigma(n) { // sum of all divisors
  return factor(n).reduce((acc, [p, k]) => acc * ((p ** (k + 1) - 1) / (p - 1)), 1);
}
const digitSum = (n) => [...String(n)].reduce((a, b) => a + +b, 0);
const reverse = (n) => +[...String(n)].reverse().join("");
function isHappy(n) {
  const seen = new Set();
  while (n !== 1 && !seen.has(n)) {
    seen.add(n);
    n = [...String(n)].reduce((a, b) => a + b * b, 0);
  }
  return n === 1;
}
const isPerfectPower = (n) => {
  if (n === 1) return true;
  const f = factor(n);
  const g = f.reduce((a, [, k]) => gcd(a, k), 0);
  return g > 1;
};
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const seqSet = (next, start) => { // numbers ≤ MAX from a sequence
  const out = new Set();
  for (let x of start) out.add(x);
  let arr = [...start];
  while (true) {
    const v = next(arr);
    if (v > MAX) break;
    out.add(v); arr.push(v);
  }
  return out;
};
const LUCAS = seqSet((a) => a.at(-1) + a.at(-2), [2, 1]);
const CATALAN = seqSet((a) => (a.at(-1) * 2 * (2 * a.length - 1)) / (a.length + 1), [1]);
const ARMSTRONG = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 153, 370, 371, 407, 1634, 8208, 9474,
  54748, 92727, 93084, 548834]);
const PERFECT = new Set([6, 28, 496, 8128]);
const TAXICAB = new Set([1729, 4104, 13832, 20683, 32832, 39312, 40033, 46683, 64232, 65728,
  110656, 110808, 134379, 149389, 165464, 171288, 195841, 216027, 216125, 262656, 314496,
  320264, 327763, 373464, 402597, 439101, 443889, 513000, 513856, 515375, 525824, 558441,
  593047, 684019, 704977, 805688, 842751, 885248, 886464, 920673, 955016, 984067, 994688]);

// Longest run of each digit, like 7 → 3 in "477712"
function digitRuns(s) {
  const r = Array(10).fill(0);
  let cur = 0;
  for (let i = 0; i < s.length; i++) {
    cur = i && s[i] === s[i - 1] ? cur + 1 : 1;
    if (cur > r[+s[i]]) r[+s[i]] = cur;
  }
  return r;
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
    runOf: digitRuns(s),
  };
}

// ---- Classics: hand-written achievements ----
const CLASSICS = [
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


// ---- Generated families ----
// Each family lists its achievements and has `earn(c, add)`, which calls
// add(id, detail?) for every achievement in the family the number earns.
// Ids that a Classic already covers are skipped so nothing is doubled up.

const pad = (x, w) => String(x).padStart(w, "0");
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
const TIMES = ["", "", "two", "three", "four", "five", "six"];
const plural = (d) => `${d}s`;

function substrings(s, len) {
  const out = new Set();
  for (let i = 0; i + len <= s.length; i++) out.add(s.slice(i, i + len));
  return out;
}

const FAMILIES = [
  {
    group: "Classics",
    list: CLASSICS,
    earn(c, add) {
      for (const a of CLASSICS) {
        const r = a.test(c);
        if (r) add(a.id, r === true ? "" : r);
      }
    },
  },
  {
    group: "Hidden codes",
    list: range(0, 999).map((x) => pad(x, 3)).filter((x) => !["007", "314", "365", "404", "777"].includes(x))
      .map((x) => ({ id: `code-${x}`, name: `Code ${x}`, desc: `Has ${x} in it` })),
    earn(c, add) { for (const x of substrings(c.s, 3)) add(`code-${x}`); },
  },
  {
    group: "Hidden pairs",
    list: range(0, 99).map((x) => pad(x, 2)).filter((x) => x !== "42")
      .map((x) => ({ id: `pair-${x}`, name: `Spot the ${x}`, desc: `Has ${x} in it` })),
    earn(c, add) { for (const x of substrings(c.s, 2)) add(`pair-${x}`); },
  },
  {
    group: "Years",
    list: range(1900, 2099).map((y) => ({ id: `year-${y}`, name: `Year ${y}`, desc: `Has ${y} in it` })),
    earn(c, add) { for (const x of substrings(c.s, 4)) if (x >= "1900" && x <= "2099") add(`year-${x}`); },
  },
  {
    group: "Starts with",
    list: [
      ...range(1, 9).map((d) => ({ id: `start-${d}`, name: `Opens on ${d}`, desc: `Starts with ${d}` })),
      ...range(10, 99).map((x) => ({ id: `start-${x}`, name: `Opens on ${x}`, desc: `Starts with ${x} (3+ digits)` })),
    ],
    earn(c, add) {
      add(`start-${c.s[0]}`);
      if (c.L >= 3) add(`start-${c.s.slice(0, 2)}`);
    },
  },
  {
    group: "Ends with",
    list: [
      ...range(1, 9).map((d) => ({ id: `end-${d}`, name: `Lands on ${d}`, desc: `Ends with ${d}` })),
      ...range(1, 99).map((x) => pad(x, 2)).map((x) => ({ id: `end-${x}`, name: `Lands on ${x}`, desc: `Ends with ${x} (3+ digits)` })),
    ],
    earn(c, add) {
      add(`end-${c.s.at(-1)}`);
      if (c.L >= 3) add(`end-${c.s.slice(-2)}`);
    },
  },
  {
    group: "Bookends",
    list: range(1, 9).map((d) => ({ id: `bookend-${d}`, name: `${d} Bookends`, desc: `Starts and ends with ${d}` })),
    earn(c, add) { if (c.L >= 2 && c.s[0] === c.s.at(-1)) add(`bookend-${c.s[0]}`); },
  },
  {
    group: "Divisible by",
    list: range(2, 100).filter((k) => ![2, 7, 9, 10, 11, 100].includes(k))
      .map((k) => ({ id: `div-${k}`, name: `Divides by ${k}`, desc: `A multiple of ${k}` })),
    earn(c, add) { for (let k = 3; k <= 100; k++) if (c.n % k === 0) add(`div-${k}`); },
  },
  {
    group: "Neighborhoods",
    list: [
      ...range(0, 9).map((k) => ({ id: `hood100k-${k}`, name: k ? `${k}00K Club` : "Under 100K",
        desc: k ? `Between ${k}00,000 and ${k}99,999` : "Below 100,000" })),
      ...range(0, 99).map((k) => ({ id: `hood10k-${k}`, name: k ? `The ${k * 10}Ks` : "Under 10K",
        desc: k ? `Between ${(k * 10000).toLocaleString("en-US")} and ${(k * 10000 + 9999).toLocaleString("en-US")}` : "Below 10,000" })),
    ],
    earn(c, add) {
      if (c.n >= MAX) return;
      add(`hood100k-${Math.floor(c.n / 100000)}`);
      add(`hood10k-${Math.floor(c.n / 10000)}`);
    },
  },
  {
    group: "Digit sums",
    list: [
      ...range(1, 54).filter((x) => x !== 7).map((x) => ({ id: `sum-${x}`, name: `Sum of ${x}`, desc: `Digits add up to exactly ${x}` })),
      ...range(1, 8).map((r) => ({ id: `root-${r}`, name: `Root ${r}`, desc: `Keep adding the digits and you get ${r}` })),
    ],
    earn(c, add) {
      if (c.sum !== 7) add(`sum-${c.sum}`);
      const r = 1 + ((c.n - 1) % 9);
      if (r !== 9) add(`root-${r}`);
    },
  },
  {
    group: "Digit counts",
    list: [
      ...range(0, 9).flatMap((d) => range(2, 6).map((k) => ({
        id: `count-${d}-${k}`, name: `${TIMES[k][0].toUpperCase() + TIMES[k].slice(1)} ${plural(d)}`,
        desc: `Exactly ${k} ${plural(d)}, anywhere` }))),
      ...range(1, 9).map((d) => ({ id: `no-${d}`, name: `No ${plural(d)}`, desc: `Not a single ${d}` })),
      ...range(1, 6).map((k) => ({ id: `kinds-${k}`, name: `${k}-Digit Palette`, desc: `Uses exactly ${k} different digit${k > 1 ? "s" : ""}` })),
      ...range(1, 6).map((k) => ({ id: `len-${k}`, name: `${k}-Digit Number`, desc: `Has exactly ${k} digit${k > 1 ? "s" : ""}` })),
      ...range(0, 6).map((k) => ({ id: `evens-${k}`, name: `${k} Even Digit${k === 1 ? "" : "s"}`, desc: `Exactly ${k} even digit${k === 1 ? "" : "s"} (6-digit numbers)` })),
    ],
    earn(c, add) {
      c.counts.forEach((k, d) => {
        if (k >= 2) add(`count-${d}-${k}`);
        if (!k && d) add(`no-${d}`);
      });
      add(`kinds-${c.shape.length}`);
      if (c.L <= 6) add(`len-${c.L}`);
      if (c.L === 6) add(`evens-${c.d.filter((x) => x % 2 === 0).length}`);
    },
  },
  {
    group: "Runs",
    list: range(0, 9).flatMap((d) => range(2, 6).filter((k) => !(d === 7 && k === 3)).map((k) => ({
      id: `run-${d}-${k}`, name: `${k}× ${d} Streak`, desc: `${k} ${plural(d)} in a row (or more)` }))),
    earn(c, add) {
      c.runOf.forEach((len, d) => { for (let k = 2; k <= len; k++) if (!(d === 7 && k === 3)) add(`run-${d}-${k}`); });
    },
  },
  {
    group: "Math collectibles",
    list: [
      { id: "m-twin", name: "Twin Prime", desc: "A prime with another prime 2 away", test: (n) => isPrime(n) && (isPrime(n - 2) || isPrime(n + 2)) },
      { id: "m-palprime", name: "Palindromic Prime", desc: "A prime that reads the same backwards (2+ digits)", test: (n) => n > 9 && isPrime(n) && reverse(n) === n },
      { id: "m-emirp", name: "Emirp", desc: "A prime that's a different prime backwards", test: (n) => isPrime(n) && reverse(n) !== n && isPrime(reverse(n)) },
      { id: "m-sophie", name: "Sophie Germain Prime", desc: "A prime p where 2p + 1 is prime too", test: (n) => isPrime(n) && isPrime(2 * n + 1) },
      { id: "m-sumprime", name: "Prime Sum", desc: "The digits add up to a prime", test: (n) => isPrime(digitSum(n)) },
      { id: "m-sumsquare", name: "Square Sum", desc: "The digits add up to a perfect square", test: (n) => isSquare(digitSum(n)) },
      { id: "m-primesq", name: "Prime Squared", desc: "A prime times itself", test: (n) => isPrime(Math.round(Math.sqrt(n))) && isSquare(n) },
      { id: "m-semiprime", name: "Semiprime", desc: "Exactly two primes multiplied together", test: (n) => factor(n).reduce((a, [, k]) => a + k, 0) === 2 },
      { id: "m-sphenic", name: "Sphenic", desc: "Three different primes multiplied together", test: (n) => { const f = factor(n); return f.length === 3 && f.every(([, k]) => k === 1); } },
      { id: "m-squarefree", name: "Square-Free", desc: "No square number (other than 1) divides it", test: (n) => factor(n).every(([, k]) => k === 1) },
      { id: "m-powerful", name: "Powerful", desc: "Every prime factor appears at least twice", test: (n) => n > 1 && factor(n).every(([, k]) => k >= 2) },
      { id: "m-abundant", name: "Abundant", desc: "Its divisors add up to more than itself", test: (n) => sigma(n) - n > n },
      { id: "m-perfect", name: "Perfect Number", desc: "Its divisors add up to exactly itself (6, 28, 496, 8128)", test: (n) => PERFECT.has(n) },
      { id: "m-harshad", name: "Harshad", desc: "Divisible by the sum of its digits", test: (n) => n % digitSum(n) === 0 },
      { id: "m-zuck", name: "Self-Divider", desc: "Divisible by every one of its digits", test: (n) => !String(n).includes("0") && [...String(n)].every((x) => n % x === 0) },
      { id: "m-happy", name: "Happy Number", desc: "Square the digits and add, again and again, and you reach 1", test: (n) => isHappy(n) },
      { id: "m-armstrong", name: "Armstrong Number", desc: "Equals the sum of its digits each raised to the number of digits (like 153)", test: (n) => ARMSTRONG.has(n) },
      { id: "m-automorphic", name: "Automorphic", desc: "Its square ends in itself (like 76² = 5776)", test: (n) => BigInt(n) ** 2n % 10n ** BigInt(String(n).length) === BigInt(n) },
      { id: "m-lucas", name: "Lucas Number", desc: "In the Lucas sequence (2, 1, 3, 4, 7, 11…)", test: (n) => LUCAS.has(n) },
      { id: "m-catalan", name: "Catalan Number", desc: "In the Catalan sequence (1, 2, 5, 14, 42…)", test: (n) => CATALAN.has(n) },
      { id: "m-tetra", name: "Tetrahedral", desc: "A pyramid of stacked triangles (1, 4, 10, 20…)", test: (n) => { const k = Math.round(Math.cbrt(6 * n)); return [k - 1, k, k + 1].some((x) => x > 0 && (x * (x + 1) * (x + 2)) / 6 === n); } },
      { id: "m-pentagonal", name: "Pentagonal", desc: "A pentagon number (1, 5, 12, 22…)", test: (n) => { const x = (1 + Math.sqrt(1 + 24 * n)) / 6; return Number.isInteger(x); } },
      { id: "m-hexagonal", name: "Hexagonal", desc: "A hexagon number (1, 6, 15, 28…)", test: (n) => { const x = (1 + Math.sqrt(1 + 8 * n)) / 4; return Number.isInteger(x); } },
      { id: "m-perfectpower", name: "Perfect Power", desc: "Some number raised to a power of 2 or more", test: (n) => isPerfectPower(n) },
      { id: "m-pow3", name: "Power of Three", desc: "3 × 3 × 3 × …", test: (n) => { while (n % 3 === 0) n /= 3; return n === 1; } },
      { id: "m-pow5", name: "Power of Five", desc: "5 × 5 × 5 × …", test: (n) => { while (n % 5 === 0) n /= 5; return n === 1; } },
      { id: "m-taxicab", name: "Taxicab", desc: "Two different sums of two cubes (like 1729)", test: (n) => TAXICAB.has(n) },
      { id: "m-lucky-ticket", name: "Lucky Ticket", desc: "First three digits add up to the same as the last three", test: (n) => n >= 100000 && n < MAX && digitSum(Math.floor(n / 1000)) === digitSum(n % 1000) },
      { id: "m-sum-product", name: "Sum Equals Product", desc: "Digits added equal digits multiplied (like 123)", test: (n) => { const d = [...String(n)].map(Number); return d.length > 1 && d.reduce((a, b) => a + b) === d.reduce((a, b) => a * b); } },
      { id: "m-reverse-bigger", name: "Mirror Upgrade", desc: "Backwards it's more than double", test: (n) => reverse(n) > 2 * n },
    ],
    earn(c, add) { for (const a of this.list) if (a.test(c.n)) add(a.id); },
  },
];

// ---- assembly ----
function pointsFor(count) {
  const raw = 10 * Math.sqrt(MAX / count);
  const step = raw < 100 ? 5 : raw < 1000 ? 25 : raw < 5000 ? 250 : 1000;
  return Math.max(5, Math.round(raw / step) * step);
}

export const GROUPS = FAMILIES.map((f) => f.group);
export const ACHIEVEMENTS = FAMILIES.flatMap((f) =>
  f.list.map(({ id, name, desc }) => ({
    id, name, desc, group: f.group,
    count: COUNTS[id],
    points: COUNTS[id] ? pointsFor(COUNTS[id]) : 0,
  }))
);
const BY_ID = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));

// All achievement ids a number earns, with details: Map(id → detail)
export function earnedIds(n) {
  const c = context(n);
  const won = new Map();
  for (const f of FAMILIES) f.earn(c, (id, detail = "") => won.set(id, detail));
  return won;
}

// Returns [{ a, detail }] for a number, most points first.
const cache = new Map();
export function achievementsFor(n) {
  if (cache.has(n)) return cache.get(n);
  const won = [];
  for (const [id, detail] of earnedIds(n)) {
    const a = BY_ID.get(id);
    if (a) won.push({ a, detail });
  }
  won.sort((x, y) => y.a.points - x.a.points);
  if (cache.size > 5000) cache.clear();
  cache.set(n, won);
  return won;
}

export const score = (won) => won.reduce((t, w) => t + w.a.points, 0);
export { pointsFor, COUNTS };
