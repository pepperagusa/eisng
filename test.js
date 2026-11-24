import assert from "node:assert/strict";
import { classify, TIERS, MIN, MAX } from "./classify.js";
import { ACHIEVEMENTS, achievementsFor, score } from "./achievements.js";
import { countAll } from "./scripts/count.js";

// Categories: counts match and each tier is rarer than the last.
const counts = Array(TIERS.length).fill(0);
for (let n = MIN; n <= MAX; n++) counts[classify(n).tier]++;
TIERS.forEach((t, i) =>
  assert.equal(counts[i], t.count, `${t.name}: counted ${counts[i]}, TIERS says ${t.count}`));
for (let i = 1; i < counts.length; i++)
  assert.ok(counts[i] < counts[i - 1], `${TIERS[i].name} must be rarer than ${TIERS[i - 1].name}`);

const expect = {
  1: "impossible", 777777: "impossible", 123456: "impossible", 1000000: "impossible",
  121212: "extreme", 500000: "extreme", 7: "extreme",
  123321: "insane", 456456: "insane", 42: "insane",
  4545: "rare", 112232: "rare", 482347: "cool", 982145: "common",
};
for (const [n, id] of Object.entries(expect))
  assert.equal(TIERS[classify(+n).tier].id, id, `${n} should be ${id}`);

// Achievements: unique ids, counts.js up to date, every one earnable.
assert.equal(new Set(ACHIEVEMENTS.map((a) => a.id)).size, ACHIEVEMENTS.length, "duplicate achievement id");
const real = countAll();
const stale = ACHIEVEMENTS.filter((a) => a.count !== real[a.id]).map((a) => a.id);
assert.ok(!stale.length, `counts.js is out of date (${stale.slice(0, 5).join(", ")}…). Run: npm run counts`);
const never = ACHIEVEMENTS.filter((a) => !real[a.id]).map((a) => a.id);
assert.ok(!never.length, `No number earns: ${never.join(", ")}`);

const has = (n, id) => achievementsFor(n).find((w) => w.a.id === id);
assert.equal(has(121474, "dupe2").detail, "1 & 4");
for (const [n, id] of [[121474, "even-end"], [1000000, "million"], [1729, "m-taxicab"], [153, "m-armstrong"],
  [8128, "m-perfect"], [583, "code-583"], [101999, "year-1999"], [46, "div-23"], [9376, "m-automorphic"],
  [341341, "echo"], [44445, "run-4-4"], [345678, "hood10k-34"], [123321, "m-lucky-ticket"]])
  assert.ok(has(n, id), `${n} should earn ${id}`);
assert.ok(!has(12345, "code-583"));

console.log("ok —", TIERS.map((t, i) => `${t.name} ${counts[i]}`).join(", "),
  `| ${ACHIEVEMENTS.length} achievements | 121474 scores ${score(achievementsFor(121474))}`);
