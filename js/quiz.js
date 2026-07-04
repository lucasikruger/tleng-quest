/* ===== Tleng Quest — quiz arcade + flashcards ===== */

function shuffle(a) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const TOPIC_LABEL = (n) =>
  n === "teo" ? "Teoría de final" : (TEMA_BY_N[n] ? `${TEMA_BY_N[n].icon} ${TEMA_BY_N[n].name}` : n);

/* ---------- QUIZ ---------- */
let Q = null; // partida en curso

route("quiz", (el, [topic]) => {
  const bank = window.QUIZ || [];
  if (!bank.length) { el.innerHTML = "<p>⏳ El banco de preguntas todavía no está generado (falta data/bank.js).</p>"; return; }

  if (!topic) {
    // selector de tema
    const counts = {};
    bank.forEach((q) => (counts[q.topic] = (counts[q.topic] || 0) + 1));
    const topics = Object.keys(counts).sort();
    el.innerHTML = `
    <div class="crumb"><a href="#/">Inicio</a> / <a href="#/arcade">Arcade</a> / Quiz</div>
    <h1>⚡ Quiz rápido</h1>
    <p style="color:var(--ink2)">10 preguntas al azar. +10 XP por acierto, la racha multiplica. Elegí:</p>
    <div class="grid c3">
      <div class="card click" onclick="go('quiz/all')"><h3>🎲 Todo mezclado</h3>
        <span class="tag vi">${bank.length} preguntas</span></div>
      ${topics.map((t) => {
        const st = State.d.quiz.byTopic[t];
        const acc = st && st.tot ? Math.round((100 * st.ok) / st.tot) + "%" : "—";
        return `<div class="card click" onclick="go('quiz/${t}')">
          <h3 style="font-size:1rem">${TOPIC_LABEL(t)}</h3>
          <div class="flex"><span class="tag">${counts[t]} pregs</span>
          <span class="tag ${st && st.tot ? "cy" : ""}">precisión ${acc}</span></div></div>`;
      }).join("")}
    </div>`;
    return;
  }

  // armar partida
  const pool = topic === "all" ? bank : bank.filter((q) => q.topic === topic);
  if (!pool.length) { el.innerHTML = "<p>No hay preguntas de ese tema.</p>"; return; }
  Q = { qs: shuffle(pool).slice(0, 10), i: 0, ok: 0, streak: 0, topic, answered: false };
  drawQ(el);
});

function drawQ(el) {
  const q = Q.qs[Q.i];
  // barajar opciones preservando cuál es la correcta
  const order = shuffle(q.options.map((_, i) => i));
  Q.order = order;
  el.innerHTML = `
  <div class="crumb"><a href="#/arcade">Arcade</a> / <a href="#/quiz">Quiz</a> / ${TOPIC_LABEL(Q.topic === "all" ? q.topic : Q.topic)}</div>
  <div class="q-head">
    <span class="tag">${Q.i + 1} / ${Q.qs.length}</span>
    <span class="tag ${q.level === 3 ? "hot" : q.level === 2 ? "vi" : ""}">nivel ${q.level}</span>
    ${q.source && !/\.md|\//i.test(q.source) ? `<span class="tag cy">${q.source}</span>` : ""}
    <div class="spacer"></div>
    <span class="streak">${Q.streak > 1 ? "🔥×" + Q.streak : ""}</span>
    <span class="tag ok">✓ ${Q.ok}</span>
  </div>
  <div class="pbar mb"><i style="width:${(100 * Q.i) / Q.qs.length}%"></i></div>
  <div class="card"><h3 style="font-weight:600">${q.q}</h3>
    <div id="opts">${order.map((oi, k) =>
      `<button class="q-opt" data-oi="${oi}">${String.fromCharCode(65 + k)}. ${q.options[oi]}</button>`).join("")}
    </div>
    <div id="qfoot"></div>
  </div>`;
  katexify(el);
  el.querySelectorAll(".q-opt").forEach((b) =>
    b.addEventListener("click", () => answerQ(el, +b.dataset.oi, b)));
}

function answerQ(el, oi, btn) {
  if (Q.answered) return;
  Q.answered = true;
  const q = Q.qs[Q.i];
  const ok = oi === q.correct;
  State.recQuiz(q.topic, ok);
  el.querySelectorAll(".q-opt").forEach((b) => {
    b.disabled = true;
    if (+b.dataset.oi === q.correct) b.classList.add(ok ? "sel-ok" : "reveal");
  });
  if (ok) {
    btn.classList.add("sel-ok");
    Q.ok++; Q.streak++;
    if (Q.streak > State.d.bestStreak) { State.d.bestStreak = Q.streak; State.save(); }
    const bonus = Math.min(Q.streak - 1, 5) * 2;
    State.addXP(10 + bonus, bonus ? `racha ×${Q.streak}` : "");
  } else {
    btn.classList.add("sel-bad");
    Q.streak = 0;
  }
  const foot = document.getElementById("qfoot");
  foot.innerHTML = `
    <div class="q-explain">${ok ? "✅" : "❌"} <b>${ok ? "¡Bien ahí!" : "Nop."}</b> ${q.explain}</div>
    <div class="center mt"><button class="btn" id="nextq">${Q.i + 1 < Q.qs.length ? "Siguiente →" : "Ver resultado 🏁"}</button></div>`;
  katexify(foot);
  document.getElementById("nextq").onclick = () => {
    Q.i++; Q.answered = false;
    if (Q.i < Q.qs.length) drawQ(el); else endQ(el);
  };
}

function endQ(el) {
  // mejor puntaje por tema (misiones del camino): cuenta en rondas completas (8+)
  if (Q.qs.length >= 8 && Q.topic !== "all") {
    State.d.quiz.best = State.d.quiz.best || {};
    if (Q.ok > (State.d.quiz.best[Q.topic] || 0)) { State.d.quiz.best[Q.topic] = Q.ok; State.save(); }
  }
  const pct = Math.round((100 * Q.ok) / Q.qs.length);
  const msg = pct >= 90 ? "🏆 ¡Nivel final asegurado!" : pct >= 70 ? "💪 Muy bien, puliendo detalles."
    : pct >= 50 ? "📖 Vas bien, repasá el tema." : "🔁 A leer el tema y volver.";
  if (pct >= 80) party();
  el.innerHTML = `
  <div class="center" style="padding-top:40px">
    <h1 style="font-size:3rem;margin:0">${Q.ok}/${Q.qs.length}</h1>
    <p style="font-size:1.2rem">${msg}</p>
    <div class="pbar ${pct >= 70 ? "ok" : ""}" style="max-width:320px;margin:14px auto"><i style="width:${pct}%"></i></div>
    <div class="flex" style="justify-content:center;margin-top:20px">
      <button class="btn" onclick="go('quiz/${Q.topic}');render()">🔁 Otra ronda</button>
      <a class="btn ghost" href="#/quiz">Cambiar tema</a>
      <a class="btn vi" href="#/arcade">Arcade</a>
    </div>
  </div>`;
}

/* ---------- FLASHCARDS ---------- */
let FC = null;

route("cards", (el, [topic]) => {
  const bank = window.CARDS || [];
  if (!bank.length) { el.innerHTML = "<p>⏳ Las flashcards todavía no están generadas (falta data/bank.js).</p>"; return; }

  if (!topic) {
    const types = {};
    bank.forEach((c) => (types[c.type] = (types[c.type] || 0) + 1));
    el.innerHTML = `
    <div class="crumb"><a href="#/">Inicio</a> / <a href="#/arcade">Arcade</a> / Flashcards</div>
    <h1>🃏 Flashcards</h1>
    <p style="color:var(--ink2)">${bank.length} cartas · <b style="color:var(--ok-hi)">${State.cardsKnownCount()} dominadas</b>.
    Las que marcás "repasar" vuelven más seguido.</p>
    <div class="grid c3">
      <div class="card click" onclick="go('cards/all')"><h3>🎲 Todas</h3><span class="tag vi">${bank.length}</span></div>
      ${Object.keys(types).map((ty) =>
        `<div class="card click" onclick="go('cards/${ty}')"><h3 style="text-transform:capitalize">${ty}s</h3>
         <span class="tag">${types[ty]}</span></div>`).join("")}
    </div>`;
    return;
  }

  const pool = topic === "all" ? bank : bank.filter((c) => c.type === topic || c.topic === topic);
  // priorizar: nunca vistas y "repasar" primero, dominadas al final
  const w = (c) => (State.d.cards[c.id] === 2 ? 2 : State.d.cards[c.id] === 1 ? 0 : 1);
  FC = { deck: shuffle(pool).sort((a, b) => w(a) - w(b)), i: 0, flip: false, topic };
  drawCard(el);
});

function drawCard(el) {
  if (FC.i >= FC.deck.length) {
    el.innerHTML = `<div class="center" style="padding-top:50px"><h1>🎉 Mazo completo</h1>
      <p><b style="color:var(--ok-hi)">${State.cardsKnownCount()}</b> cartas dominadas en total.</p>
      <div class="flex" style="justify-content:center"><button class="btn" onclick="go('cards/${FC.topic}');render()">🔁 De nuevo</button>
      <a class="btn ghost" href="#/cards">Elegir mazo</a></div></div>`;
    party(); return;
  }
  const c = FC.deck[FC.i];
  el.innerHTML = `
  <div class="crumb"><a href="#/arcade">Arcade</a> / <a href="#/cards">Flashcards</a></div>
  <div class="q-head"><span class="tag">${FC.i + 1} / ${FC.deck.length}</span>
    <span class="tag vi">${c.type}</span><span class="tag">${TOPIC_LABEL(c.topic)}</span>
    ${State.cardKnown(c.id) ? '<span class="tag ok">dominada</span>' : ""}</div>
  <div class="fcwrap mt"><div class="fc ${FC.flip ? "flip" : ""}" id="fc">
    <div class="face"><div style="font-size:1.15rem;text-align:center">${c.front}</div>
      <span class="hint">tocá para dar vuelta</span></div>
    <div class="face back"><div>${mdRender(c.back)}</div><span class="hint">tocá para volver</span></div>
  </div></div>
  <div class="center mt" id="fcbtns">${FC.flip ? `
    <button class="btn bad sm" style="background:var(--bad)" id="fcno">🔁 Repasar</button>
    <button class="btn ok sm" id="fcyes">✅ La sabía (+5 XP)</button>` : `
    <button class="btn ghost sm" id="fcskip">Saltar →</button>`}
  </div>`;
  katexify(el);
  document.getElementById("fc").onclick = () => { FC.flip = !FC.flip; drawCard(el); };
  const yes = document.getElementById("fcyes"), no = document.getElementById("fcno"), skip = document.getElementById("fcskip");
  if (yes) yes.onclick = (e) => { e.stopPropagation(); const first = !State.cardKnown(c.id);
    State.setCard(c.id, 2); if (first) State.addXP(5); FC.i++; FC.flip = false; drawCard(el); };
  if (no) no.onclick = (e) => { e.stopPropagation(); State.setCard(c.id, 1);
    FC.deck.push(c); FC.i++; FC.flip = false; drawCard(el); };
  if (skip) skip.onclick = () => { FC.i++; FC.flip = false; drawCard(el); };
}
