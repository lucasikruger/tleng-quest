/* ===== Tleng Quest — Boss Battles (ejercicios de finales reales) ===== */

const BOSS_AVATAR = { Becher: "🧙‍♀️", Jacobo: "🧙‍♂️", "Castaño": "🧝", "?": "👻" };

/* recorte que no parte fórmulas $...$ a la mitad */
function excerpt(md, n) {
  let s = md.slice(0, n);
  if (((s.match(/\$/g) || []).length) % 2) s = s.slice(0, s.lastIndexOf("$"));
  return s;
}

route("boss", (el, [bid]) => {
  const bank = window.FINALES || [];
  if (!bank.length) { el.innerHTML = "<p>⏳ Los boss battles todavía no están generados (falta data/bank.js).</p>"; return; }

  if (!bid) {
    // Becher primero: es quien tomó el último final
    const sorted = [...bank].sort((a, b2) => (b2.toma === "Becher") - (a.toma === "Becher"));
    el.innerHTML = `
    <div class="crumb"><a href="#/">Inicio</a> / Boss Battles</div>
    <h1>🏆 Boss Battles</h1>
    <p style="color:var(--ink2)">Ejercicios de <b>finales reales</b>. Intentá resolverlo en papel; las pistas
    te bajan la recompensa (100 → 70 → 50 → 30 XP). Cuando lo tengas, revelá la respuesta modelo y marcá
    honestamente si te salió.</p>
    <div class="card mb" style="border-color:var(--warn)"><div class="flex"><span style="font-size:1.6rem">🧙‍♀️</span>
      <div><b style="color:var(--warn-hi)">⭐ Prioridad: los de Becher</b>
      <div style="color:var(--ink2);font-size:.88rem">Tomó el último final. Sus ejercicios (algoritmo + complejidad, conteo, V/F) van primero en la lista — y podés <a href="#/oral/becher">simular un final entero con ella</a>.</div></div></div></div>
    <div class="grid c2">${sorted.map((b) => {
      const st = State.bossState(b.id);
      return `<div class="card click" onclick="go('boss/${b.id}')">
        <div class="flex"><span style="font-size:1.5rem">${BOSS_AVATAR[b.toma] || "👻"}</span>
          <span class="tag">${b.fecha}</span><span class="tag vi">${b.toma}</span>
          <span class="tag ${b.dificultad >= 3 ? "hot" : ""}">${"💀".repeat(b.dificultad)}</span>
          <div class="spacer"></div>${st && st.done ? '<span class="tag ok">✓ vencido</span>' : ""}</div>
        <p style="font-size:.92rem;margin:.6em 0 0;color:var(--ink2)">${excerpt(b.enunciado, 130)}…</p>
        <div class="chips" style="margin-bottom:0">${b.temas.map((t) =>
          `<span class="chip">${TOPIC_LABEL(t)}</span>`).join("")}</div>
      </div>`; }).join("")}
    </div>`;
    katexify(el);
    return;
  }

  const b = bank.find((x) => x.id === bid);
  if (!b) { el.innerHTML = "<p>Boss no encontrado.</p>"; return; }
  const st = State.bossState(b.id) || { hints: 0, done: false, revealed: false };

  el.innerHTML = `
  <div class="crumb"><a href="#/boss">Boss Battles</a> / ${b.fecha}</div>
  <div class="q-head">
    <span style="font-size:2rem">${BOSS_AVATAR[b.toma] || "👻"}</span>
    <div><b>${b.toma}</b><div style="font-size:.8rem;color:var(--muted)">${b.fecha} · ${b.formato} · ${"💀".repeat(b.dificultad)}</div></div>
    <div class="spacer"></div>
    ${st.done ? '<span class="tag ok">✓ vencido</span>' : `<span class="tag warn" style="background:rgba(217,119,6,.16);color:var(--warn-hi)" id="reward">recompensa: ${[100, 70, 50, 30][st.hints]} XP</span>`}
  </div>
  <div class="card"><h3>📜 Enunciado</h3><div>${mdRender(b.enunciado)}</div>
    <div class="chips">${b.temas.map((t) => {
      const tm = TEMA_BY_N[t];
      return tm ? `<a class="chip" href="#/doc/${tm.id}">${TOPIC_LABEL(t)}</a>` : `<span class="chip">${TOPIC_LABEL(t)}</span>`;
    }).join("")}</div>
  </div>
  <div class="card mt"><h3>💡 Pistas</h3><div id="hints"></div><div id="hintbtn"></div></div>
  <div class="mt" id="ansbox"></div>`;
  katexify(el);

  const paintHints = () => {
    document.getElementById("hints").innerHTML = b.pistas.slice(0, st.hints).map((p, i) =>
      `<div class="q-explain" style="border-color:var(--warn)"><b>Pista ${i + 1}:</b> ${p}</div>`).join("") ||
      `<p style="color:var(--muted)">Todavía no pediste pistas. 💪</p>`;
    document.getElementById("hintbtn").innerHTML = st.hints < 3 && !st.revealed ?
      `<button class="btn warn sm hint-btn" id="gethint">Pedir pista ${st.hints + 1}/3 (baja la recompensa)</button>` : "";
    const g = document.getElementById("gethint");
    if (g) g.onclick = () => { st.hints++; State.setBoss(b.id, st); render(); };
    katexify(document.getElementById("hints"));
  };
  const paintAns = () => {
    const box = document.getElementById("ansbox");
    if (!st.revealed) {
      box.innerHTML = `<div class="center"><button class="btn vi" id="reveal">👁 Revelar respuesta modelo</button></div>`;
      document.getElementById("reveal").onclick = () => { st.revealed = true; State.setBoss(b.id, st); render(); };
    } else {
      box.innerHTML = `<div class="boss-ans"><h3>✅ Respuesta modelo</h3>${mdRender(b.respuesta)}</div>
      ${!st.done ? `<div class="center mt">
        <p style="color:var(--ink2)">¿Te salió (aunque sea el esqueleto) antes de revelar?</p>
        <button class="btn ok" id="won">💪 Sí, boss vencido (+${[100, 70, 50, 30][st.hints]} XP)</button>
        <button class="btn ghost" id="lost">😅 No — lo repaso y vuelvo</button></div>` : ""}`;
      katexify(box);
      const w = document.getElementById("won"), l = document.getElementById("lost");
      if (w) w.onclick = () => { st.done = true; State.setBoss(b.id, st);
        State.addXP([100, 70, 50, 30][st.hints], "boss vencido"); party(); render(); };
      if (l) l.onclick = () => { st.revealed = false; st.hints = 0; State.setBoss(b.id, st); go("boss"); };
    }
  };
  paintHints(); paintAns();
});
