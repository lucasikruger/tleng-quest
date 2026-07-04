/* ===== Tleng Quest — estado del juego (localStorage) ===== */
const LEVELS = [
  [0,    "λ — Cadena vacía"],
  [150,  "Autómata Finito"],
  [400,  "Determinista"],
  [800,  "Bombeador Serial"],
  [1400, "Libre de Contexto"],
  [2200, "LL(1) sin conflictos"],
  [3200, "Máquina de Turing"],
  [4500, "🏆 Jefe de Cátedra"],
];

const State = {
  d: null,
  load() {
    try { this.d = JSON.parse(localStorage.getItem("tlengquest")) || {}; }
    catch (e) { this.d = {}; }
    this.d = Object.assign(
      { xp: 0, read: {}, quiz: { hist: [], byTopic: {} }, cards: {}, theo: {}, boss: {}, bestStreak: 0 },
      this.d
    );
  },
  save() { localStorage.setItem("tlengquest", JSON.stringify(this.d)); },

  addXP(n, why) {
    this.d.xp += n; this.save();
    UI.updateXP();
    toast(`+${n} XP${why ? " · " + why : ""}`);
  },
  level() {
    let li = 0;
    LEVELS.forEach(([xp], i) => { if (this.d.xp >= xp) li = i; });
    return li;
  },
  levelName() { return LEVELS[this.level()][1]; },
  levelPct() {
    const li = this.level();
    if (li >= LEVELS.length - 1) return 100;
    const [lo] = LEVELS[li], [hi] = LEVELS[li + 1];
    return Math.round(100 * (this.d.xp - lo) / (hi - lo));
  },

  // -- temas leídos
  markRead(id) {
    if (this.d.read[id]) return false;
    this.d.read[id] = Date.now(); this.save(); return true;
  },
  isRead(id) { return !!this.d.read[id]; },
  readCount() { return Object.keys(this.d.read).filter(k => /^\d/.test(k)).length; },

  // -- quiz
  recQuiz(topic, ok) {
    const t = this.d.quiz.byTopic[topic] || { ok: 0, tot: 0 };
    t.tot++; if (ok) t.ok++;
    this.d.quiz.byTopic[topic] = t; this.save();
  },
  quizAcc() {
    let ok = 0, tot = 0;
    Object.values(this.d.quiz.byTopic).forEach(t => { ok += t.ok; tot += t.tot; });
    return tot ? Math.round(100 * ok / tot) : null;
  },

  // -- flashcards: id -> nivel de dominio (0 nunca vista / 1 repasar / 2 la sé)
  cardKnown(id) { return this.d.cards[id] === 2; },
  setCard(id, v) { this.d.cards[id] = v; this.save(); },
  cardsKnownCount() { return Object.values(this.d.cards).filter(v => v === 2).length; },

  // -- teoremas dominados
  theoKnown(id) { return !!this.d.theo[id]; },
  setTheo(id, v) { if (v) this.d.theo[id] = 1; else delete this.d.theo[id]; this.save(); },
  theoCount() { return Object.keys(this.d.theo).length; },

  // -- boss battles: id -> {done, hints}
  bossState(id) { return this.d.boss[id] || null; },
  setBoss(id, st) { this.d.boss[id] = st; this.save(); },
  bossWins() { return Object.values(this.d.boss).filter(b => b.done).length; },
};

function toast(msg) {
  let box = document.getElementById("toast");
  if (!box) { box = document.createElement("div"); box.id = "toast"; document.body.appendChild(box); }
  const el = document.createElement("div");
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(() => el.remove(), 1700);
}

function party() {
  if (window.confetti) {
    confetti({ particleCount: 120, spread: 75, origin: { y: 0.7 },
      colors: ["#0891b2", "#7c3aed", "#059669", "#d97706"] });
  }
}
