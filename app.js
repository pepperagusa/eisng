import { classify, TIERS, MIN, MAX } from "./classify.js";

const ROLLS_PER_DAY = 7;
const STORE_KEY = "eisng:v1";
const SPIN_MS = 900;

const $ = (id) => document.getElementById(id);
const fmt = (n) => n.toLocaleString("en-US");
const total = MAX - MIN + 1;
const oneIn = (count) => `1 in ${fmt(Math.round(total / count))}`;

// ---- storage: { days: { "YYYY-MM-DD": [{ n, t, r, at }] } } ----
function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORE_KEY));
    if (data && typeof data.days === "object") return data;
  } catch {}
  return { days: {} };
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {}
}

function todayKey(d = new Date()) {
  const p = (x) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function randomNumber() {
  // Unbiased integer in [MIN, MAX] using rejection sampling.
  const range = total;
  const limit = Math.floor(2 ** 32 / range) * range;
  const buf = new Uint32Array(1);
  do crypto.getRandomValues(buf); while (buf[0] >= limit);
  return MIN + (buf[0] % range);
}

let state = load();
let spinning = false;

function rollsToday() {
  return state.days[todayKey()] || [];
}

// ---- rendering ----
function showResult(roll, animate) {
  const card = $("card");
  const tier = TIERS[roll.t];
  card.className = `card t-${tier.id} tier-${tier.id}`;
  $("badge").textContent = tier.name;
  $("number").textContent = fmt(roll.n);
  $("reason").textContent = roll.r;
  $("odds").textContent = `${tier.name} numbers: ${oneIn(tier.count)}`;
  if (animate) {
    card.classList.remove("reveal");
    void card.offsetWidth;
    card.classList.add("reveal");
  }
}

function renderControls() {
  const left = ROLLS_PER_DAY - rollsToday().length;
  $("roll").disabled = spinning || left <= 0;
  if (left > 0) {
    $("left").textContent = `${left} of ${ROLLS_PER_DAY} rolls left today`;
  } else {
    $("left").textContent = `All rolls used. New rolls in ${untilMidnight()}.`;
  }
}

function untilMidnight() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const mins = Math.ceil((next - now) / 60000);
  const h = Math.floor(mins / 60), m = mins % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

function renderToday() {
  const rolls = rollsToday();
  $("today").innerHTML = "";
  for (let i = 0; i < ROLLS_PER_DAY; i++) {
    const li = document.createElement("li");
    const roll = rolls[i];
    if (roll) {
      const tier = TIERS[roll.t];
      li.className = `t-${tier.id}`;
      li.title = `${tier.name}: ${roll.r}`;
      li.innerHTML = `<span class="t"></span>${fmt(roll.n)}`;
      li.firstChild.textContent = tier.name;
    } else {
      li.className = "empty";
      li.textContent = i + 1;
    }
    $("today").append(li);
  }
}

function renderLegend() {
  const mine = Array(TIERS.length).fill(0);
  for (const rolls of Object.values(state.days)) for (const r of rolls) mine[r.t]++;
  $("legend").innerHTML = "";
  TIERS.forEach((tier, i) => {
    const li = document.createElement("li");
    li.className = `t-${tier.id}`;
    li.innerHTML = `<span class="dot"></span><span class="name"></span><span class="chance"></span><span class="mine"></span>`;
    li.querySelector(".name").textContent = tier.name;
    li.querySelector(".chance").textContent = oneIn(tier.count);
    const m = li.querySelector(".mine");
    m.textContent = `×${mine[i]}`;
    m.title = "Times you've rolled this";
    if (!mine[i]) m.classList.add("zero");
    $("legend").append(li);
  });
}

function renderHistory() {
  const today = todayKey();
  const days = Object.keys(state.days).filter((d) => d !== today).sort().reverse();
  const box = $("history");
  box.innerHTML = "";
  if (!days.length) {
    box.innerHTML = `<p class="empty-note">Past days will show up here.</p>`;
    return;
  }
  for (const day of days) {
    const rolls = state.days[day];
    const best = rolls.reduce((a, b) => (b.t > a.t ? b : a), rolls[0]);
    const bestTier = TIERS[best.t];
    const el = document.createElement("div");
    el.className = `day t-${bestTier.id}`;
    el.innerHTML = `<div class="day-head"><span class="date"></span><span class="best"></span></div><div class="day-rolls"></div>`;
    el.querySelector(".date").textContent = new Date(day + "T12:00").toLocaleDateString(undefined, {
      weekday: "short", month: "short", day: "numeric", year: "numeric",
    });
    el.querySelector(".best").textContent = `Best: ${bestTier.name}`;
    for (const r of rolls) {
      const chip = document.createElement("span");
      chip.className = `chip t-${TIERS[r.t].id}`;
      chip.title = `${TIERS[r.t].name}: ${r.r}`;
      chip.textContent = fmt(r.n);
      el.querySelector(".day-rolls").append(chip);
    }
    box.append(el);
  }
}

function renderAll() {
  renderControls();
  renderToday();
  renderLegend();
  renderHistory();
}

// ---- rolling ----
function roll() {
  if (spinning || rollsToday().length >= ROLLS_PER_DAY) return;

  const day = todayKey();
  const n = randomNumber();
  const { tier, reason } = classify(n);
  const result = { n, t: tier, r: reason, at: Date.now() };

  // Save before the animation so a refresh can't re-roll.
  (state.days[day] ||= []).push(result);
  save();

  spinning = true;
  renderControls();
  const card = $("card");
  card.className = "card tier-none spinning";
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const start = performance.now();

  const tick = (now) => {
    if (!reduced && now - start < SPIN_MS) {
      $("number").textContent = fmt(randomNumber());
      requestAnimationFrame(tick);
      return;
    }
    spinning = false;
    showResult(result, true);
    renderAll();
  };
  requestAnimationFrame(tick);
}

$("roll").addEventListener("click", roll);

// Pick up a new day (or rolls from another tab) without a reload.
setInterval(() => { if (!spinning) renderControls(); }, 30_000);
let shownDay = todayKey();
function refresh() {
  if (spinning) return;
  state = load();
  if (todayKey() !== shownDay) {
    shownDay = todayKey();
    $("card").className = "card tier-none";
    $("badge").textContent = "Ready";
    $("number").textContent = "——";
    $("reason").textContent = "A new day. Seven fresh rolls.";
    $("odds").textContent = "";
  }
  renderAll();
}
document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(); });
addEventListener("storage", (e) => { if (e.key === STORE_KEY) refresh(); });
setInterval(() => { if (todayKey() !== shownDay) refresh(); }, 30_000);

// Initial view: show today's latest roll if there is one.
const last = rollsToday().at(-1);
if (last) showResult(last, false);
renderAll();
