import { classify, TIERS, MIN, MAX } from "./classify.js";
import { ACHIEVEMENTS, GROUPS, achievementsFor, score } from "./achievements.js";
import { ICONS, iconSVG } from "./shop.js";
import { PRIZES, pickPrize, chestSVG } from "./chest.js";

// While testing: unlimited rolls. Set to false when the project is done.
const UNLIMITED = false;
const ROLLS_PER_DAY = 7;
const STORE_KEY = "eisng:v1";
const SPIN_MS = 900;

const $ = (id) => document.getElementById(id);
const fmt = (n) => n.toLocaleString("en-US");
const total = MAX - MIN + 1;
const oneIn = (count) => {
  const x = total / count;
  return `1 in ${x < 10 ? +x.toFixed(1) : fmt(Math.round(x))}`;
};

// ---- storage ----
// { days: { "YYYY-MM-DD": [{ n, t, r, at }] }, shop: { owned: [id], equipped: id|null },
//   chests: [{ day, prize, points, at }] }
const fresh = () => ({ days: {}, shop: { owned: [], equipped: null }, chests: [] });
function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORE_KEY));
    if (data && typeof data.days === "object") {
      data.shop ||= { owned: [], equipped: null };
      data.chests ||= [];
      return data;
    }
  } catch {}
  return fresh();
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

const pointsOf = (n) => score(achievementsFor(n));
const sumPoints = (rolls) => rolls.reduce((t, r) => t + pointsOf(r.n), 0);

let state = load();
let spinning = false;

// How many times each achievement has been earned: Map(id → times)
let earned = new Map();
function rebuildEarned() {
  earned = new Map();
  for (const r of Object.values(state.days).flat()) addEarned(r.n);
}
function addEarned(n) {
  for (const { a } of achievementsFor(n)) earned.set(a.id, (earned.get(a.id) || 0) + 1);
}
rebuildEarned();

function rollsToday() {
  return state.days[todayKey()] || [];
}

// ---- rendering ----
const CHIPS_SHOWN = 10;

function showResult(roll, animate, fresh = new Set()) {
  const card = $("card");
  const tier = TIERS[roll.t];
  card.className = `card t-${tier.id} tier-${tier.id}`;
  card.dataset.rolled = "yes";
  $("badge").textContent = tier.name;
  $("number").textContent = fmt(roll.n);
  $("reason").textContent = roll.r;
  $("odds").textContent = `${tier.name} numbers: ${oneIn(tier.count)}`;
  // New unlocks first, then the most points.
  const won = [...achievementsFor(roll.n)].sort((x, y) =>
    fresh.has(y.a.id) - fresh.has(x.a.id) || y.a.points - x.a.points);
  const newCount = won.filter((w) => fresh.has(w.a.id)).length;
  $("points").textContent = `+${fmt(score(won))} points`;
  $("won-summary").textContent = `${won.length} achievement${won.length === 1 ? "" : "s"}` +
    (newCount ? ` · ${newCount} new!` : "");
  const box = $("won");
  box.innerHTML = "";
  won.forEach(({ a, detail }, i) => {
    const li = document.createElement("li");
    li.className = "ach " + band(a.points) + (fresh.has(a.id) ? " new" : "");
    li.hidden = i >= CHIPS_SHOWN;
    li.title = `${a.desc} · ${oneIn(a.count)}`;
    li.innerHTML = `<span class="ach-name"></span><span class="ach-pts"></span>`;
    li.firstChild.textContent = a.name + (detail ? ` (${detail})` : "");
    li.lastChild.textContent = `+${fmt(a.points)}`;
    box.append(li);
  });
  const more = $("won-more");
  more.hidden = won.length <= CHIPS_SHOWN;
  more.textContent = `Show all ${won.length}`;
  if (animate) {
    card.classList.remove("reveal");
    void card.offsetWidth;
    card.classList.add("reveal");
  }
}

// Colour band for an achievement by how many points it's worth.
const band = (p) => (p >= 1000 ? "b-legend" : p >= 250 ? "b-epic" : p >= 75 ? "b-rare" : p >= 30 ? "b-good" : "b-basic");

function renderControls() {
  const left = ROLLS_PER_DAY - rollsToday().length;
  $("roll").disabled = spinning || (!UNLIMITED && left <= 0);
  $("test-banner").hidden = !UNLIMITED;
  if (UNLIMITED) {
    $("left").textContent = `Test mode: unlimited rolls · ${rollsToday().length} rolled today`;
  } else if (left > 0) {
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
  const all = rollsToday();
  const SHOW = 21;
  const rolls = all.slice(-SHOW);
  const hidden = all.length - rolls.length;
  $("today-title").textContent = `Today · ${fmt(sumPoints(all))} points`;
  $("today").innerHTML = "";
  const slots = UNLIMITED ? Math.max(rolls.length, 1) : ROLLS_PER_DAY;
  for (let i = 0; i < slots; i++) {
    const li = document.createElement("li");
    const roll = rolls[i];
    if (roll) {
      const tier = TIERS[roll.t];
      li.className = `t-${tier.id}`;
      li.title = `${tier.name}: ${roll.r}`;
      li.innerHTML = `<span class="t"></span>${fmt(roll.n)}<span class="p"></span>`;
      li.firstChild.textContent = tier.name;
      li.lastChild.textContent = `+${fmt(pointsOf(roll.n))}`;
    } else {
      li.className = "empty";
      li.textContent = i + 1;
    }
    $("today").append(li);
  }
  $("today-more").textContent = hidden ? `Showing the last ${SHOW} of ${all.length} rolls today.` : "";
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

function renderStats() {
  const all = Object.values(state.days).flat();
  let best = null, bestPts = -1;
  for (const r of all) {
    const p = pointsOf(r.n);
    if (p > bestPts) { best = r; bestPts = p; }
  }
  $("stat-total").textContent = fmt(balance());
  $("stat-ach").textContent = `${fmt(earned.size)} / ${fmt(ACHIEVEMENTS.length)}`;
  $("stat-best").textContent = best ? `${fmt(best.n)} · ${fmt(bestPts)}` : "—";
}

// ---- settings panel: achievement browser ----
const PAGE = 100;
let achShown = PAGE;

function filteredAchievements() {
  const q = $("ach-search").value.trim().toLowerCase();
  const group = $("ach-group").value;
  const status = $("ach-status").value;
  const sort = $("ach-sort").value;
  const list = ACHIEVEMENTS.filter((a) =>
    (!group || a.group === group) &&
    (status === "all" || (status === "unlocked") === earned.has(a.id)) &&
    (!q || a.name.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q)));
  const by = {
    easy: (x, y) => x.points - y.points || y.count - x.count,
    hard: (x, y) => y.points - x.points || x.count - y.count,
    name: (x, y) => x.name.localeCompare(y.name, undefined, { numeric: true }),
  }[sort];
  return list.sort(by);
}

function renderAchievements() {
  const pts = [...earned.keys()].reduce((t, id) => t + byId.get(id).points, 0);
  $("ach-summary").textContent =
    `${fmt(earned.size)} of ${fmt(ACHIEVEMENTS.length)} unlocked · ${fmt(pts)} of ${fmt(maxPoints)} achievement points`;
  $("ach-bar").style.width = `${(earned.size / ACHIEVEMENTS.length) * 100}%`;

  const list = filteredAchievements();
  const box = $("ach-list");
  box.innerHTML = "";
  for (const a of list.slice(0, achShown)) {
    const times = earned.get(a.id);
    const li = document.createElement("li");
    li.className = `ach-row ${band(a.points)}${times ? "" : " locked"}`;
    li.innerHTML = `<div class="ach-main"><span class="ach-name"></span><span class="ach-desc"></span></div>
      <div class="ach-side"><span class="ach-pts"></span><span class="ach-meta"></span></div>`;
    li.querySelector(".ach-name").textContent = a.name;
    li.querySelector(".ach-desc").textContent = `${a.desc} · ${a.group}`;
    li.querySelector(".ach-pts").textContent = `${fmt(a.points)} pts`;
    li.querySelector(".ach-meta").textContent = times ? `×${fmt(times)} · ${oneIn(a.count)}` : oneIn(a.count);
    box.append(li);
  }
  $("ach-count").textContent = list.length
    ? `Showing ${fmt(Math.min(achShown, list.length))} of ${fmt(list.length)}`
    : "No achievements match.";
  $("ach-more").hidden = achShown >= list.length;
}

const byId = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));
const maxPoints = ACHIEVEMENTS.reduce((t, a) => t + a.points, 0);

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
    el.querySelector(".best").textContent = `${fmt(sumPoints(rolls))} pts · Best: ${bestTier.name}`;
    for (const r of rolls) {
      const chip = document.createElement("span");
      chip.className = `chip t-${TIERS[r.t].id}`;
      chip.title = `${TIERS[r.t].name}: ${r.r} · +${fmt(pointsOf(r.n))} pts`;
      chip.textContent = fmt(r.n);
      el.querySelector(".day-rolls").append(chip);
    }
    box.append(el);
  }
}

// ---- shop ----
const chestPoints = () => state.chests.reduce((t, c) => t + c.points, 0);
const earnedPoints = () => sumPoints(Object.values(state.days).flat()) + chestPoints();
const spentPoints = () => state.shop.owned.reduce((t, id) => t + (ICONS.find((i) => i.id === id)?.price || 0), 0);
const balance = () => earnedPoints() - spentPoints();

function renderAvatar() {
  const id = state.shop.equipped;
  $("avatar").innerHTML = id ? iconSVG(id, 40) : "";
  $("avatar").hidden = !id;
  // The equipped icon also sits in the top-right corner of the roll card.
  const showOnCard = id && $("card").dataset.rolled === "yes";
  $("card-icon").innerHTML = showOnCard ? iconSVG(id, 44) : "";
  $("card-icon").hidden = !showOnCard;
}

// ---- daily chest ----
const chestOpenedToday = () => state.chests.some((c) => c.day === todayKey());
const canOpenChest = () => UNLIMITED || !chestOpenedToday();
let chestBusy = false;

function renderChest(justOpened) {
  const last = state.chests.at(-1);
  const openedToday = chestOpenedToday();
  const showOpen = justOpened || (openedToday && !UNLIMITED);
  $("chest-art").innerHTML = chestSVG(showOpen, 96);
  $("chest-art").classList.toggle("ready", canOpenChest() && !chestBusy);
  const btn = $("open-chest");
  btn.disabled = chestBusy || !canOpenChest();
  btn.textContent = openedToday && UNLIMITED ? "Open again (test mode)" : "Open chest";
  const prize = justOpened || (openedToday && last?.day === todayKey() ? last : null);
  if (prize) {
    const p = PRIZES.find((x) => x.id === prize.prize);
    $("chest-title").textContent = `${p.name} prize!`;
    $("chest-text").textContent = `+${fmt(prize.points)} points`;
    $("chest-card").className = `chest-card prize-${p.id}`;
  } else {
    $("chest-title").textContent = "Daily chest";
    $("chest-text").textContent = "Open it for bonus points. Up to 50,000!";
    $("chest-card").className = "chest-card";
  }
  $("chest-note").textContent = canOpenChest()
    ? (UNLIMITED ? "Test mode: the chest can be opened again." : "Ready to open!")
    : `Next chest in ${untilMidnight()}.`;
}

function openChest() {
  if (chestBusy || !canOpenChest()) return;
  const p = pickPrize();
  const entry = { day: todayKey(), prize: p.id, points: p.points, at: Date.now() };
  state.chests.push(entry);
  save();
  chestBusy = true;
  renderChest();
  const art = $("chest-art");
  art.classList.add("shake");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  setTimeout(() => {
    art.classList.remove("shake");
    chestBusy = false;
    renderChest(entry);
    $("chest-card").classList.add("reveal");
    renderStats();
    if ($("shop").open) renderShop();
  }, reduced ? 0 : 700);
}

function renderShop() {
  const bal = balance();
  $("shop-balance").textContent = fmt(bal);
  $("shop-earned").textContent = `Earned ${fmt(earnedPoints())} (${fmt(chestPoints())} from chests) · spent ${fmt(spentPoints())}`;
  const box = $("shop-list");
  box.innerHTML = "";
  ICONS.forEach((icon, i) => {
    const owned = state.shop.owned.includes(icon.id);
    const equipped = state.shop.equipped === icon.id;
    const li = document.createElement("li");
    li.className = "shop-item" + (owned ? " owned" : "") + (equipped ? " equipped" : "");
    li.innerHTML = `<div class="shop-art"></div><div class="shop-info"><span class="shop-rank"></span>
      <span class="shop-name"></span><span class="shop-price"></span></div><button type="button" class="shop-btn"></button>`;
    li.querySelector(".shop-art").innerHTML = iconSVG(icon.id, 64);
    li.querySelector(".shop-rank").textContent = `#${i + 1}`;
    li.querySelector(".shop-name").textContent = icon.name;
    li.querySelector(".shop-price").textContent = owned ? "Owned" : `${fmt(icon.price)} pts`;
    const btn = li.querySelector(".shop-btn");
    if (equipped) {
      btn.textContent = "Unequip";
      btn.onclick = () => { state.shop.equipped = null; save(); renderShop(); renderAvatar(); };
    } else if (owned) {
      btn.textContent = "Equip";
      btn.onclick = () => equip(icon.id);
    } else if (bal >= icon.price) {
      btn.textContent = "Buy";
      btn.classList.add("buy");
      btn.onclick = () => buy(icon);
    } else {
      btn.textContent = `Need ${fmt(icon.price - bal)}`;
      btn.disabled = true;
    }
    box.append(li);
  });
}

function buy(icon) {
  if (balance() < icon.price || state.shop.owned.includes(icon.id)) return;
  state.shop.owned.push(icon.id);
  equip(icon.id);
}
function equip(id) {
  state.shop.equipped = id;
  save();
  renderShop();
  renderAvatar();
  renderStats();
}

function renderAll() {
  renderControls();
  renderToday();
  renderLegend();
  renderStats();
  renderHistory();
  renderAvatar();
  if (!chestBusy) renderChest();
  if ($("settings").open) renderAchievements();
  if ($("shop").open) renderShop();
}

// ---- rolling ----
function roll() {
  if (spinning || (!UNLIMITED && rollsToday().length >= ROLLS_PER_DAY)) return;

  const day = todayKey();
  const n = randomNumber();
  const { tier, reason } = classify(n);
  const result = { n, t: tier, r: reason, at: Date.now() };

  // Achievements this roll unlocks for the first time.
  const fresh = new Set(achievementsFor(n).map((w) => w.a.id).filter((id) => !earned.has(id)));

  // Save before the animation so a refresh can't re-roll.
  (state.days[day] ||= []).push(result);
  save();
  addEarned(n);

  spinning = true;
  renderControls();
  const card = $("card");
  card.className = "card tier-none spinning";
  card.dataset.rolled = "yes";
  renderAvatar();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const start = performance.now();

  const tick = (now) => {
    if (!reduced && now - start < SPIN_MS) {
      $("number").textContent = fmt(randomNumber());
      requestAnimationFrame(tick);
      return;
    }
    spinning = false;
    showResult(result, true, fresh);
    renderAll();
  };
  requestAnimationFrame(tick);
}

$("roll").addEventListener("click", roll);

// Pick up a new day (or rolls from another tab) without a reload.
setInterval(() => { if (!spinning) renderControls(); if (!chestBusy) renderChest(); }, 30_000);
let shownDay = todayKey();
function refresh() {
  if (spinning) return;
  state = load();
  rebuildEarned();
  if (todayKey() !== shownDay) {
    shownDay = todayKey();
    $("card").className = "card tier-none";
    delete $("card").dataset.rolled;
    $("badge").textContent = "Ready";
    $("number").textContent = "——";
    $("reason").textContent = "A new day. Seven fresh rolls.";
    $("odds").textContent = "";
    $("points").textContent = "";
    $("won").innerHTML = "";
    $("won-summary").textContent = "";
    $("won-more").hidden = true;
  }
  renderAll();
}
document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(); });
addEventListener("storage", (e) => { if (e.key === STORE_KEY) refresh(); });
setInterval(() => { if (todayKey() !== shownDay) refresh(); }, 30_000);

$("won-more").addEventListener("click", () => {
  for (const li of $("won").children) li.hidden = false;
  $("won-more").hidden = true;
});

// ---- settings panel ----
function openSettings(tab = "how") {
  showTab(tab);
  if (!$("settings").open) $("settings").showModal();
}
function showTab(tab) {
  for (const btn of document.querySelectorAll("[data-tab]")) {
    const on = btn.dataset.tab === tab;
    btn.setAttribute("aria-selected", on);
    $(`tab-${btn.dataset.tab}`).hidden = !on;
  }
  if (tab === "achievements") { achShown = PAGE; renderAchievements(); }
}
$("open-settings").addEventListener("click", () => openSettings("how"));
$("open-chest").addEventListener("click", openChest);
$("open-shop").addEventListener("click", () => { renderShop(); $("shop").showModal(); });
$("close-shop").addEventListener("click", () => $("shop").close());
$("shop").addEventListener("click", (e) => { if (e.target === $("shop")) $("shop").close(); });
$("open-achievements").addEventListener("click", () => openSettings("achievements"));
$("close-settings").addEventListener("click", () => $("settings").close());
$("settings").addEventListener("click", (e) => { if (e.target === $("settings")) $("settings").close(); });
for (const btn of document.querySelectorAll("[data-tab]"))
  btn.addEventListener("click", () => showTab(btn.dataset.tab));

for (const g of GROUPS) $("ach-group").add(new Option(g, g));
for (const id of ["ach-group", "ach-status", "ach-sort"])
  $(id).addEventListener("change", () => { achShown = PAGE; renderAchievements(); });
let searchTimer;
$("ach-search").addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { achShown = PAGE; renderAchievements(); }, 150);
});
$("ach-more").addEventListener("click", () => { achShown += PAGE; renderAchievements(); });

$("mode-note").textContent = UNLIMITED
  ? "Test mode is on: unlimited rolls."
  : `You get ${ROLLS_PER_DAY} rolls a day. They reset at midnight.`;
$("reset").addEventListener("click", () => {
  if (!confirm("Delete all your rolls, points, achievements and icons? This can't be undone.")) return;
  state = fresh();
  save();
  delete $("card").dataset.rolled;
  rebuildEarned();
  $("card").className = "card tier-none";
  $("badge").textContent = "Ready";
  $("number").textContent = "——";
  $("reason").textContent = "Progress reset. Press the button to roll.";
  for (const id of ["odds", "points", "won-summary"]) $(id).textContent = "";
  $("won").innerHTML = "";
  $("won-more").hidden = true;
  renderAll();
});

// Initial view: show today's latest roll if there is one.
const last = rollsToday().at(-1);
if (last) showResult(last, false);
renderAll();
