/* ===== Tleng Quest — ER Golf y Gramática Lab ===== */

/* ---------- ER GOLF ---------- */
route("ergolf", (el, [cid]) => {
  if (!cid) { chalListView(el, { title: "ER Golf", icon: "✳️", list: ER_CHALLENGES, base: "ergolf",
    intro: "Escribí una expresión regular que capture EXACTAMENTE el lenguaje. Sintaxis: símbolos de Σ, λ, |, *, +, ?, paréntesis. Menos caracteres que el par ⇒ birdie 🐦 (XP extra)." }); return; }
  const ch = ER_CHALLENGES.find((c) => c.id === cid);
  if (!ch) { el.innerHTML = "<p>Desafío no encontrado.</p>"; return; }
  el.innerHTML = `
  <div class="crumb"><a href="#/lab">Laboratorio</a> / <a href="#/ergolf">ER Golf</a> / ${ch.name}</div>
  <div class="card mb"><div class="flex"><span class="tag cy">ER</span><span class="tag">${"★".repeat(ch.dif)}</span>
    <span class="tag">Σ = {${ch.sigma.split("").join(",")}}</span><span class="tag vi">par: ${ch.par} chars</span>
    <div class="spacer"></div>${chalDone(ch.id) ? '<span class="tag ok">✓ superado</span>' : `<span class="tag warn" style="background:rgba(217,119,6,.16);color:var(--warn-hi)">${ch.xp} XP</span>`}</div>
    <h2 style="margin:.4em 0">${ch.name}</h2><p style="margin:0">${ch.desc}</p>
    <details style="margin-top:8px"><summary style="cursor:pointer;color:var(--warn-hi)">💡 Pista</summary><p style="color:var(--ink2)">${ch.hint}</p></details>
  </div>
  <div class="card"><div class="flex">
    <input type="text" id="erx" placeholder="tu expresión regular…" style="flex:1;font-family:monospace;font-size:1.1rem" maxlength="60">
    <button class="btn sm ghost" id="erlam">+λ</button>
    <button class="btn ok" id="erok">⛳ Verificar</button></div>
    <div style="color:var(--muted);font-size:.82rem;margin-top:6px">Se compila con Thompson a un AFND-λ y se compara contra todas las cadenas hasta largo ${ch.maxLen}.</div>
    <div id="erout" class="mt"></div></div>`;
  const inp = document.getElementById("erx");
  document.getElementById("erlam").onclick = () => { inp.value += "λ"; inp.focus(); };
  const run = () => {
    const out = document.getElementById("erout");
    const src = inp.value.trim();
    if (!src) return;
    let nfa;
    try { nfa = reToNFA(reParse(src, ch.sigma)); }
    catch (e) { out.innerHTML = `<div class="q-explain" style="border-color:var(--bad)">Sintaxis: ${e.message}</div>`; return; }
    const res = verify((w) => reAccepts(nfa, w), ch);
    if (res.pass) {
      const len = src.length;
      const birdie = len <= ch.par;
      out.innerHTML = `<div class="q-explain" style="border-color:var(--ok)">🏆 <b>¡CORRECTA!</b> ${res.total} cadenas verificadas.
        Tu ER mide <b>${len}</b> (par: ${ch.par}) ${birdie ? "→ 🐦 <b>BIRDIE</b> ¡+15 XP extra!" : "→ podés intentar acortarla"}.</div>
        <div class="center mt"><a class="btn ok" href="#/ergolf">← Más hoyos</a></div>`;
      if (!chalDone(ch.id)) { chalWin(ch); if (birdie) State.addXP(15, "birdie 🐦"); }
    } else {
      out.innerHTML = `<div class="q-explain" style="border-color:var(--bad)"><b>❌ ${res.failCount} de ${res.total} cadenas fallan.</b></div>
      <table><tr><th>cadena</th><th>debería</th><th>tu ER</th></tr>
      ${res.fails.map((f) => `<tr><td><code>${f.w}</code></td><td>${f.want ? "✅ aceptar" : "❌ rechazar"}</td><td>${f.got ? "aceptó" : "rechazó"}</td></tr>`).join("")}</table>`;
    }
  };
  document.getElementById("erok").onclick = run;
  inp.addEventListener("keydown", (e) => { if (e.key === "Enter") run(); });
});

/* ---------- GRAMÁTICA LAB ---------- */
route("gramlab", (el, [cid]) => {
  if (!cid) { chalListView(el, { title: "Gramática Lab", icon: "🌳", list: CFG_CHALLENGES, base: "gramlab",
    intro: "Escribí una GLC (una producción por línea: <code>S -> a S b | λ</code>). La convierto a Forma Normal de Chomsky y verifico con CYK contra todo el lenguaje. El primer no terminal es el distinguido." }); return; }
  const ch = CFG_CHALLENGES.find((c) => c.id === cid);
  if (!ch) { el.innerHTML = "<p>Desafío no encontrado.</p>"; return; }
  el.innerHTML = `
  <div class="crumb"><a href="#/lab">Laboratorio</a> / <a href="#/gramlab">Gramática Lab</a> / ${ch.name}</div>
  <div class="card mb"><div class="flex"><span class="tag vi">GLC</span><span class="tag">${"★".repeat(ch.dif)}</span>
    <span class="tag">Σ = {${ch.sigma.split("").join(",")}}</span>
    <div class="spacer"></div>${chalDone(ch.id) ? '<span class="tag ok">✓ superado</span>' : `<span class="tag warn" style="background:rgba(217,119,6,.16);color:var(--warn-hi)">${ch.xp} XP</span>`}</div>
    <h2 style="margin:.4em 0">${ch.name}</h2><p style="margin:0">${ch.desc}</p>
    <details style="margin-top:8px"><summary style="cursor:pointer;color:var(--warn-hi)">💡 Pista</summary><p style="color:var(--ink2)">${ch.hint}</p></details>
  </div>
  <div class="card">
    <textarea id="cfgsrc" rows="6" spellcheck="false" placeholder="S -> a S b | λ"
      style="width:100%;font-family:monospace;font-size:1.05rem;background:var(--surface2);color:var(--ink);border:1px solid var(--border);border-radius:10px;padding:10px 14px;resize:vertical"></textarea>
    <div class="flex mt"><button class="btn sm ghost" id="cfglam">+λ</button>
      <div style="color:var(--muted);font-size:.82rem">No terminales: UNA mayúscula. Terminales: minúsculas/símbolos. Alternativas con |.</div>
      <div class="spacer"></div><button class="btn ok" id="cfgok">🌳 Verificar</button></div>
    <div id="cfgout" class="mt"></div></div>`;
  const ta = document.getElementById("cfgsrc");
  document.getElementById("cfglam").onclick = () => { ta.value += "λ"; ta.focus(); };
  document.getElementById("cfgok").onclick = () => {
    const out = document.getElementById("cfgout");
    let cnf;
    try {
      const g = cfgParse(ta.value);
      const badT = g.rules.flatMap((r) => r.rhs).filter((s) => !/^[A-Z]$/.test(s) && !ch.sigma.includes(s));
      if (badT.length) throw new Error(`Terminal '${badT[0]}' fuera de Σ = {${ch.sigma.split("").join(",")}}`);
      cnf = cfgToCNF(g);
    } catch (e) { out.innerHTML = `<div class="q-explain" style="border-color:var(--bad)">${e.message}</div>`; return; }
    const res = verify((w) => cykAccepts(cnf, w), ch);
    if (res.error) { out.innerHTML = `<div class="q-explain" style="border-color:var(--bad)">${res.error}</div>`; return; }
    if (res.pass) {
      out.innerHTML = `<div class="q-explain" style="border-color:var(--ok)">🏆 <b>¡GRAMÁTICA CORRECTA!</b> ${res.total} cadenas verificadas con CYK.</div>
        <div class="center mt"><a class="btn ok" href="#/gramlab">← Más lenguajes</a></div>`;
      chalWin(ch);
    } else {
      const overs = res.fails.filter((f) => f.got && !f.want).length;
      const unders = res.fails.filter((f) => !f.got && f.want).length;
      out.innerHTML = `<div class="q-explain" style="border-color:var(--bad)"><b>❌ ${res.failCount} de ${res.total} cadenas fallan.</b>
        ${overs && !unders ? "Tu gramática <b>genera de más</b> (sobra lenguaje)." : ""}
        ${unders && !overs ? "Tu gramática <b>no llega</b> a generar todo (¿caso base? ¿λ?)." : ""}</div>
      <table><tr><th>cadena</th><th>debería</th><th>tu GLC</th></tr>
      ${res.fails.map((f) => `<tr><td><code>${f.w}</code></td><td>${f.want ? "✅ generar" : "❌ no generar"}</td><td>${f.got ? "genera" : "no genera"}</td></tr>`).join("")}</table>`;
    }
  };
});
