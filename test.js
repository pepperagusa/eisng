import assert from "node:assert/strict";
import { classify, TIERS, MIN, MAX } from "./classify.js";
import { ACHIEVEMENTS, context, achievementsFor } from "./achievements.js";

const counts = Array(TIERS.length).fill(0);
const won = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, 0]));
for (let n = MIN; n <= MAX; n++) {
  counts[classify(n).tier]++;
  const c = context(n);
  for (const a of ACHIEVEMENTS) if (a.test(c)) won[a.id]++;
}
const stale = ACHIEVEMENTS.filter((a) => a.count !== won[a.id]);
assert.ok(!stale.length, "Achievement counts out of date. Paste into COUNTS:\n" +
  JSON.stringify(won, null, 2));
assert.equal(new Set(ACHIEVEMENTS.map((a) => a.id)).size, ACHIEVEMENTS.length, "duplicate achievement id");
TIERS.forEach((t, i) =>
  assert.equal(counts[i], t.count, `${t.name}: counted ${counts[i]}, TIERS says ${t.count}`)
);
for (let i = 1; i < counts.length; i++)
  assert.ok(counts[i] < counts[i - 1], `${TIERS[i].name} must be rarer than ${TIERS[i - 1].name}`);

const expect = {
  1: "impossible", 777777: "impossible", 123456: "impossible", 1000000: "impossible",
  121212: "extreme", 500000: "extreme", 7: "extreme",
  123321: "insane", 456456: "insane", 42: "insane",
  4545: "rare", 482347: "cool", 112232: "rare", 982145: "common",
};
for (const [n, id] of Object.entries(expect))
  assert.equal(TIERS[classify(+n).tier].id, id, `${n} should be ${id}`);

const names = (n) => achievementsFor(n).map((w) => w.a.id + (w.detail ? `(${w.detail})` : ""));
assert.deepEqual(achievementsFor(121474).find((w) => w.a.id === "dupe2").detail, "1 & 4");
assert.ok(names(121474).includes("even-end"));
assert.ok(names(1000000).includes("million"));

console.log("ok —", TIERS.map((t, i) => `${t.name} ${counts[i]}`).join(", "), `| ${ACHIEVEMENTS.length} achievements`);
