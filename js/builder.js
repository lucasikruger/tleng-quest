/* ===== Tleng Quest — Laboratorio: constructor de AF (gráfico) y AP (tabla) ===== */

/* progreso de desafíos */
function chalDone(id) { State.d.builder = State.d.builder || {}; return !!State.d.builder[id]; }
function chalWin(ch) {
  State.d.builder = State.d.builder || {};
  if (!State.d.builder[ch.id]) { State.d.builder[ch.id] = 1; State.save(); State.addXP(ch.xp, "desafío superado"); party(); }
}
function chalCount(list) { return list.filter((c) => chalDone(c.id)).length; }

/* ---------- HUB del laboratorio ---------- */
route("lab", (el) => {
  const groups = [
    { key: "fa", icon: "⚙️", name: "Constructor de Autómatas", list: FA_CHALLENGES, base: "builder", desc: "Dibujá AFDs y AFNDs que reconozcan el lenguaje pedido. El juez prueba TODAS las cadenas." },
    { key: "pda", icon: "🥞", name: "Constructor de AP", list: PDA_CHALLENGES, base: "pdalab", desc: "Armá autómatas de pila transición por transición y mirá la pila animarse." },
    { key: "er", icon: "✳️", name: "ER Golf", list: ER_CHALLENGES, base: "ergolf", desc: "Escribí la regex más corta que capture el lenguaje. Menos caracteres = más puntos." },
    { key: "cfg", icon: "🌳", name: "Gramática Lab", list: CFG_CHALLENGES, base: "gramlab", desc: "Escribí una GLC y la verifico con CYK contra todo el lenguaje." },
  ];
  el.innerHTML = `
  <div class="crumb"><a href="#/">Inicio</a> / Laboratorio</div>
  <h1>🔬 Laboratorio</h1>
  <p style="color:var(--ink2)">Acá se aprende DE VERDAD: construís vos. Cada desafío se verifica
  exhaustivamente contra todas las cadenas de $\\Sigma^*$ hasta cierto largo — no se le escapa nada.</p>
  <div class="grid c2">${groups.map((g) => `
    <div class="card click" onclick="go('${g.base === "builder" ? "builder" : g.base}')">
      <h3>${g.icon} ${g.name}</h3>
      <p style="color:var(--ink2);font-size:.92rem">${g.desc}</p>
      <div class="pbar ok"><i style="width:${(100 * chalCount(g.list)) / g.list.length}%"></i></div>
      <span class="tag ok" style="margin-top:8px">${chalCount(g.list)} / ${g.list.length}</span>
    </div>`).join("")}
  </div>
  <div class="card mt"><h3>🧪 Sandbox</h3><p style="color:var(--ink2)">Editor libre: dibujá cualquier autómata y probalo con las cadenas que quieras.</p>
    <a class="btn sm" href="#/builder/sandbox">Abrir sandbox</a></div>`;
  katexify(el);
});

function chalListView(el, { title, icon, list, base, intro }) {
  el.innerHTML = `
  <div class="crumb"><a href="#/">Inicio</a> / <a href="#/lab">Laboratorio</a> / ${title}</div>
  <h1>${icon} ${title}</h1>
  <p style="color:var(--ink2)">${intro}</p>
  <div class="grid c3">${list.map((c) => `
    <div class="card click" onclick="go('${base}/${c.id}')">
      <div class="flex"><span class="tag ${c.dif >= 3 ? "hot" : c.dif === 2 ? "vi" : ""}">${"★".repeat(c.dif)}</span>
        ${c.mode ? `<span class="tag">${c.mode.toUpperCase()}</span>` : ""}
        <div class="spacer"></div>${chalDone(c.id) ? '<span class="tag ok">✓</span>' : `<span class="tag">${c.xp} XP</span>`}</div>
      <h3 style="font-size:1rem">${c.name}</h3>
      <p style="color:var(--ink2);font-size:.85rem;margin:0">${c.desc.slice(0, 80)}…</p>
    </div>`).join("")}
  </div>`;
  katexify(el);
}

/* =====================================================================
   CONSTRUCTOR DE AF — editor gráfico SVG
   ===================================================================== */
let ED = null;

route("builder", (el, [cid]) => {
  if (!cid) { chalListView(el, { title: "Constructor de Autómatas", icon: "⚙️", list: FA_CHALLENGES, base: "builder",
    intro: "Modo AFD: el juez exige determinismo y función total. Modo AFND: vale no-determinismo y λ. Dibujá con los botones del toolbar." }); return; }

  const sandbox = cid === "sandbox";
  const ch = sandbox ? null : FA_CHALLENGES.find((c) => c.id === cid);
  if (!sandbox && !ch) { el.innerHTML = "<p>Desafío no encontrado.</p>"; return; }
  const sigma = sandbox ? "ab" : ch.sigma;

  ED = { fa: { states: [], initial: null, trans: [] }, mode: "move", sel: null, pend: null,
         n: 0, sigma, ch, drag: null };

  el.innerHTML = `
  <div class="crumb"><a href="#/lab">Laboratorio</a> / <a href="#/builder">Autómatas</a> / ${sandbox ? "Sandbox" : ch.name}</div>
  ${sandbox ? `<h2>🧪 Sandbox <select id="sbsigma" style="font:inherit;background:var(--surface2);color:var(--ink);border:1px solid var(--border);border-radius:8px;padding:4px 8px">
      <option value="ab">Σ = {a,b}</option><option value="01">Σ = {0,1}</option><option value="ab#">Σ = {a,b,#}</option></select></h2>` : `
  <div class="card mb"><div class="flex">
    <span class="tag ${ch.mode === "afd" ? "cy" : "vi"}">${ch.mode.toUpperCase()}</span>
    <span class="tag">${"★".repeat(ch.dif)}</span><span class="tag">Σ = {${sigma.split("").join(",")}}</span>
    <div class="spacer"></div>${chalDone(ch.id) ? '<span class="tag ok">✓ superado</span>' : `<span class="tag warn" style="background:rgba(217,119,6,.16);color:var(--warn-hi)">${ch.xp} XP</span>`}</div>
    <h2 style="margin:.4em 0">${ch.name}</h2><p style="margin:0">${ch.desc}</p>
    <details style="margin-top:8px"><summary style="cursor:pointer;color:var(--warn-hi)">💡 Pista</summary>
      <p style="color:var(--ink2)">${ch.hint}</p></details>
  </div>`}
  <div class="flex mb" id="edtools">
    <button class="btn sm ghost on" data-m="move">✋ Mover/editar</button>
    <button class="btn sm ghost" data-m="addstate">➕ Estado</button>
    <button class="btn sm ghost" data-m="addtrans">↗ Transición</button>
    <button class="btn sm ghost" data-m="delete">🗑 Borrar</button>
    <div class="spacer"></div>
    <button class="btn sm ghost" id="edclear">Limpiar todo</button>
  </div>
  <div id="edhint" style="color:var(--muted);font-size:.85rem;margin-bottom:6px">Agregá estados con ➕ y unilos con ↗. En ✋ tocá un estado para hacerlo inicial/final.</div>
  <svg class="simsvg" id="edsvg" viewBox="0 0 760 380" style="touch-action:none"></svg>
  <div id="edpanel"></div>
  <div class="card mt"><div class="flex">
    <input type="text" id="edw" placeholder="Probar cadena (vacío = λ)" maxlength="16">
    <button class="btn sm" id="edtest">▶ Probar</button>
    <div class="spacer"></div>
    ${sandbox ? "" : `<button class="btn ok" id="edverify">⚔️ Verificar desafío</button>`}
  </div><div id="edout" class="mt"></div></div>`;

  // toolbar
  el.querySelectorAll("#edtools [data-m]").forEach((b) => b.onclick = () => {
    ED.mode = b.dataset.m; ED.sel = null; ED.pend = null;
    el.querySelectorAll("#edtools [data-m]").forEach((x) => x.classList.toggle("on", x === b));
    document.getElementById("edhint").textContent = {
      move: "Arrastrá para acomodar. Tocá un estado para marcarlo inicial ⏵ o final ◎.",
      addstate: "Tocá el lienzo donde quieras el estado nuevo.",
      addtrans: "Tocá el estado ORIGEN y después el DESTINO (el mismo dos veces = rulo).",
      delete: "Tocá un estado o la etiqueta de una transición para borrarlos.",
    }[ED.mode];
    edPaint();
  });
  const sb = document.getElementById("sbsigma");
  if (sb) sb.onchange = () => { ED.sigma = sb.value; };
  document.getElementById("edclear").onclick = () => { ED.fa = { states: [], initial: null, trans: [] }; ED.n = 0; ED.sel = null; edPaint(); };
  document.getElementById("edtest").onclick = edTest;
  document.getElementById("edw").addEventListener("keydown", (e) => { if (e.key === "Enter") edTest(); });
  const vb = document.getElementById("edverify");
  if (vb) vb.onclick = edVerify;

  const svg = document.getElementById("edsvg");
  svg.addEventListener("pointerdown", edDown);
  svg.addEventListener("pointermove", edMove);
  svg.addEventListener("pointerup", edUp);
  edPaint();
});

function edXY(ev) {
  const svg = document.getElementById("edsvg");
  const r = svg.getBoundingClientRect();
  return { x: ((ev.clientX - r.left) / r.width) * 760, y: ((ev.clientY - r.top) / r.height) * 380 };
}
function edHit(p) {
  return ED.fa.states.find((s) => Math.hypot(s.x - p.x, s.y - p.y) <= 30) || null;
}
function edDown(ev) {
  const p = edXY(ev), s = edHit(p);
  if (ED.mode === "addstate") {
    if (!s) {
      const id = "q" + ED.n++;
      ED.fa.states.push({ id, x: Math.max(35, Math.min(725, p.x)), y: Math.max(35, Math.min(345, p.y)), final: false });
      if (!ED.fa.initial) ED.fa.initial = id;
      edPaint();
    }
  } else if (ED.mode === "move") {
    if (s) { ED.drag = { s, moved: false }; }
  } else if (ED.mode === "addtrans") {
    if (s) {
      if (!ED.sel) { ED.sel = s.id; }
      else { ED.pend = { from: ED.sel, to: s.id }; ED.sel = null; }
      edPaint();
    }
  } else if (ED.mode === "delete") {
    if (s) {
      ED.fa.states = ED.fa.states.filter((x) => x !== s);
      ED.fa.trans = ED.fa.trans.filter((t) => t.from !== s.id && t.to !== s.id);
      if (ED.fa.initial === s.id) ED.fa.initial = null;
      edPaint();
    }
  }
}
function edMove(ev) {
  if (!ED || !ED.drag) return;
  const p = edXY(ev);
  ED.drag.s.x = Math.max(35, Math.min(725, p.x));
  ED.drag.s.y = Math.max(35, Math.min(345, p.y));
  ED.drag.moved = true;
  edPaint(true);
}
function edUp(ev) {
  if (!ED) return;
  if (ED.drag) {
    if (!ED.drag.moved) edSelectState(ED.drag.s); // click sin arrastre = seleccionar
    ED.drag = null;
  }
}
function edSelectState(s) {
  const panel = document.getElementById("edpanel");
  panel.innerHTML = `<div class="card" style="margin-top:8px"><div class="flex">
    <b>${s.id}</b>
    <button class="btn sm ${ED.fa.initial === s.id ? "" : "ghost"}" id="mkini">⏵ Inicial</button>
    <button class="btn sm ${s.final ? "ok" : "ghost"}" id="mkfin">◎ Final</button>
    <div class="spacer"></div><button class="btn sm ghost" id="pclose">✕</button></div></div>`;
  panel.querySelector("#mkini").onclick = () => { ED.fa.initial = s.id; edSelectState(s); edPaint(); };
  panel.querySelector("#mkfin").onclick = () => { s.final = !s.final; edSelectState(s); edPaint(); };
  panel.querySelector("#pclose").onclick = () => { panel.innerHTML = ""; };
}
/* alta de transición: pide símbolos inline */
function edAskSymbols() {
  const panel = document.getElementById("edpanel");
  const { from, to } = ED.pend;
  const syms = ED.sigma.split("").join(", ");
  panel.innerHTML = `<div class="card" style="margin-top:8px"><div class="flex">
    <b>${from} → ${to}</b>
    <input type="text" id="tsym" placeholder="símbolos: ej ${syms} o λ" style="min-width:150px" maxlength="12">
    <button class="btn sm ghost" id="addlam">+λ</button>
    <button class="btn sm ok" id="tok">Agregar</button>
    <button class="btn sm ghost" id="tcancel">✕</button></div>
    <div style="color:var(--muted);font-size:.8rem;margin-top:4px">Varios símbolos separados por coma crean varias transiciones.</div></div>`;
  const inp = panel.querySelector("#tsym");
  inp.focus();
  const commit = () => {
    const raw = inp.value.trim();
    if (!raw) return;
    for (let sym of raw.split(",").map((x) => x.trim()).filter(Boolean)) {
      if (sym === "l" || sym === "L" || sym === "&") sym = LAMBDA;
      if (sym !== LAMBDA && !ED.sigma.includes(sym)) { toast(`'${sym}' no está en Σ`); continue; }
      if (!ED.fa.trans.some((t) => t.from === from && t.to === to && t.sym === sym))
        ED.fa.trans.push({ from, sym, to });
    }
    ED.pend = null; panel.innerHTML = ""; edPaint();
  };
  panel.querySelector("#tok").onclick = commit;
  inp.addEventListener("keydown", (e) => { if (e.key === "Enter") commit(); });
  panel.querySelector("#addlam").onclick = () => { inp.value = inp.value ? inp.value + ",λ" : "λ"; inp.focus(); };
  panel.querySelector("#tcancel").onclick = () => { ED.pend = null; panel.innerHTML = ""; edPaint(); };
}

function edPaint(light) {
  const svg = document.getElementById("edsvg");
  if (!svg || !ED) return;
  if (ED.pend && !light) edAskSymbols();
  const R = 26, fa = ED.fa;
  let g = `<defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
    <path d="M0,0 L9,4.5 L0,9 z" fill="#6b7089"/></marker></defs>`;
  // agrupar transiciones por par (from,to)
  const pairs = {};
  fa.trans.forEach((t) => { const k = t.from + "→" + t.to; (pairs[k] = pairs[k] || []).push(t.sym); });
  for (const [k, syms] of Object.entries(pairs)) {
    const [fid, tid] = k.split("→");
    const a = fa.states.find((s) => s.id === fid), b = fa.states.find((s) => s.id === tid);
    if (!a || !b) continue;
    const lbl = syms.join(",");
    if (fid === tid) {
      g += `<path class="tr" d="M ${a.x - 12} ${a.y - R + 4} C ${a.x - 30} ${a.y - R - 44}, ${a.x + 30} ${a.y - R - 44}, ${a.x + 12} ${a.y - R + 4}"/>
            <text class="edge edlbl" data-k="${k}" x="${a.x}" y="${a.y - R - 34}" text-anchor="middle" style="cursor:pointer">${lbl}</text>`;
    } else {
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
      const ux = dx / d, uy = dy / d;
      const rev = pairs[tid + "→" + fid] ? 26 : 10; // curvar si hay vuelta
      const x1 = a.x + ux * R, y1 = a.y + uy * R, x2 = b.x - ux * (R + 4), y2 = b.y - uy * (R + 4);
      const mx = (x1 + x2) / 2 - uy * rev, my = (y1 + y2) / 2 + ux * rev;
      g += `<path class="tr" d="M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}"/>
            <text class="edge edlbl" data-k="${k}" x="${mx}" y="${my - 6}" text-anchor="middle" style="cursor:pointer">${lbl}</text>`;
    }
  }
  for (const s of fa.states) {
    const cur = ED.hl && ED.hl.includes(s.id);
    const sel = ED.sel === s.id;
    if (s.id === fa.initial) g += `<line class="tr" x1="${s.x - 72}" y1="${s.y}" x2="${s.x - R - 6}" y2="${s.y}"/>`;
    g += `<circle class="st ${cur ? "cur" : ""}" cx="${s.x}" cy="${s.y}" r="${R}" ${sel ? 'stroke="#fbbf24" stroke-width="3"' : ""}/>`;
    if (s.final) g += `<circle cx="${s.x}" cy="${s.y}" r="${R - 5}" fill="none" stroke="${cur ? "#22d3ee" : "#6b7089"}" stroke-width="1.6"/>`;
    g += `<text x="${s.x}" y="${s.y + 5}" text-anchor="middle" style="pointer-events:none">${s.id}</text>`;
  }
  if (!fa.states.length) g += `<text x="380" y="190" text-anchor="middle" fill="#6b7089" style="font-weight:400">➕ para agregar estados</text>`;
  svg.innerHTML = g;
  // borrar transiciones tocando la etiqueta
  svg.querySelectorAll(".edlbl").forEach((t) => t.addEventListener("pointerdown", (ev) => {
    ev.stopPropagation();
    if (ED.mode !== "delete") return;
    const [fid, tid] = t.dataset.k.split("→");
    ED.fa.trans = ED.fa.trans.filter((x) => !(x.from === fid && x.to === tid));
    edPaint();
  }));
}

function edTest() {
  const out = document.getElementById("edout");
  const w = document.getElementById("edw").value.trim();
  const errs = faValidate(ED.fa, ED.sigma, false);
  if (errs.length) { out.innerHTML = `<div class="q-explain" style="border-color:var(--bad)">${errs[0]}</div>`; return; }
  const bad = [...w].find((c) => !ED.sigma.includes(c));
  if (bad) { out.innerHTML = `<div class="q-explain" style="border-color:var(--bad)">'${bad}' no está en Σ</div>`; return; }
  // animar la traza
  const sets = faTrace(ED.fa, w);
  let i = 0;
  const iv = setInterval(() => {
    if (i >= sets.length) { clearInterval(iv); ED.hl = null;
      const acc = faAccepts(ED.fa, w);
      out.innerHTML = `<span class="verdict ${acc ? "acc" : "rej"}">${acc ? "✅ ACEPTA" : "❌ RECHAZA"} — "${w || "λ"}"</span>`;
      edPaint(true); return; }
    ED.hl = sets[i]; edPaint(true);
    out.innerHTML = `<span class="tag cy">leyendo… {${sets[i].join(",") || "∅"}}</span>`;
    i++;
  }, 420);
}

function edVerify() {
  const out = document.getElementById("edout");
  const ch = ED.ch;
  const errs = faValidate(ED.fa, ch.sigma, ch.mode === "afd");
  if (errs.length) {
    out.innerHTML = `<div class="q-explain" style="border-color:var(--bad)"><b>Estructura:</b><ul style="margin:.4em 0">${errs.slice(0, 5).map((e) => `<li>${e}</li>`).join("")}</ul></div>`;
    return;
  }
  const res = verify((w) => faAccepts(ED.fa, w), ch);
  if (res.pass) {
    out.innerHTML = `<div class="q-explain" style="border-color:var(--ok)">🏆 <b>¡PERFECTO!</b> Las ${res.total} cadenas de Σ* hasta largo ${ch.maxLen} coinciden. Autómata correcto.</div>
      <div class="center mt"><a class="btn ok" href="#/builder">← Más desafíos</a></div>`;
    chalWin(ch);
  } else {
    out.innerHTML = `<div class="q-explain" style="border-color:var(--bad)"><b>❌ ${res.failCount} de ${res.total} cadenas fallan.</b> Ejemplos:</div>
    <table><tr><th>cadena</th><th>debería</th><th>tu autómata</th></tr>
    ${res.fails.map((f) => `<tr><td><code>${f.w}</code></td><td>${f.want ? "✅ aceptar" : "❌ rechazar"}</td><td>${f.got ? "aceptó" : "rechazó"}</td></tr>`).join("")}</table>`;
  }
}

/* =====================================================================
   CONSTRUCTOR DE AP — editor por tabla con pila animada
   ===================================================================== */
let PD2 = null;
const GAMMA = "ZABC";

route("pdalab", (el, [cid]) => {
  if (!cid) { chalListView(el, { title: "Constructor de AP", icon: "🥞", list: PDA_CHALLENGES, base: "pdalab",
    intro: "Definí las transiciones δ(q, a, X) → (p, γ). La pila arranca con Z (tope a la izquierda). Elegí aceptar por estado final o pila vacía." }); return; }
  const ch = PDA_CHALLENGES.find((c) => c.id === cid);
  if (!ch) { el.innerHTML = "<p>Desafío no encontrado.</p>"; return; }
  PD2 = { pda: { states: ["q0", "q1"], initial: "q0", finals: ["q1"], accept: "final", startStack: "Z", trans: [] }, ch };

  el.innerHTML = `
  <div class="crumb"><a href="#/lab">Laboratorio</a> / <a href="#/pdalab">AP</a> / ${ch.name}</div>
  <div class="card mb"><div class="flex"><span class="tag vi">AP</span><span class="tag">${"★".repeat(ch.dif)}</span>
    <span class="tag">Σ = {${ch.sigma.split("").join(",")}} · Γ = {Z,A,B,C}</span>
    <div class="spacer"></div>${chalDone(ch.id) ? '<span class="tag ok">✓ superado</span>' : `<span class="tag warn" style="background:rgba(217,119,6,.16);color:var(--warn-hi)">${ch.xp} XP</span>`}</div>
    <h2 style="margin:.4em 0">${ch.name}</h2><p style="margin:0">${ch.desc}</p>
    <details style="margin-top:8px"><summary style="cursor:pointer;color:var(--warn-hi)">💡 Pista</summary><p style="color:var(--ink2)">${ch.hint}</p></details>
  </div>
  <div class="card">
    <div class="flex"><b>Estados:</b> <span id="pdstates"></span>
      <button class="btn sm ghost" id="pdadd">+ estado</button>
      <div class="spacer"></div>
      <b>Acepta por:</b>
      <select id="pdacc" style="font:inherit;background:var(--surface2);color:var(--ink);border:1px solid var(--border);border-radius:8px;padding:4px 8px">
        <option value="final">estado final</option><option value="empty">pila vacía</option></select></div>
    <p style="color:var(--muted);font-size:.82rem;margin:.5em 0 0">Tocá un estado para alternar si es final ◎. q0 siempre es el inicial.</p>
  </div>
  <div class="card mt"><b>Transiciones</b> — δ(estado, lee, desapila) → (estado, apila; tope a la izquierda, vacío = λ)
    <table id="pdtab" style="width:100%"><tr><th>desde</th><th>lee</th><th>desapila</th><th>apila</th><th>hacia</th><th></th></tr></table>
    <button class="btn sm ghost" id="pdrow">+ transición</button>
  </div>
  <div class="card mt"><div class="flex">
    <input type="text" id="pdw" placeholder="Probar cadena (vacío = λ)" maxlength="12">
    <button class="btn sm" id="pdtest">▶ Probar</button>
    <div class="spacer"></div>
    <button class="btn ok" id="pdverify">⚔️ Verificar desafío</button>
  </div><div id="pdout" class="mt"></div></div>`;

  document.getElementById("pdacc").onchange = (e) => { PD2.pda.accept = e.target.value; };
  document.getElementById("pdadd").onclick = () => {
    PD2.pda.states.push("q" + PD2.pda.states.length); pdPaintStates(); pdPaintRows();
  };
  document.getElementById("pdrow").onclick = () => {
    PD2.pda.trans.push({ from: "q0", read: ch.sigma[0], pop: "Z", push: "", to: "q0" }); pdPaintRows();
  };
  document.getElementById("pdtest").onclick = pdTest;
  document.getElementById("pdw").addEventListener("keydown", (e) => { if (e.key === "Enter") pdTest(); });
  document.getElementById("pdverify").onclick = pdVerify;
  pdPaintStates(); pdPaintRows();
});

function pdPaintStates() {
  const box = document.getElementById("pdstates");
  box.innerHTML = PD2.pda.states.map((s) =>
    `<span class="chip ${PD2.pda.finals.includes(s) ? "on" : ""}" data-s="${s}" style="margin-right:4px">
      ${s === PD2.pda.initial ? "⏵" : ""}${s}${PD2.pda.finals.includes(s) ? " ◎" : ""}</span>`).join("");
  box.querySelectorAll(".chip").forEach((c) => c.onclick = () => {
    const s = c.dataset.s;
    PD2.pda.finals = PD2.pda.finals.includes(s) ? PD2.pda.finals.filter((x) => x !== s) : [...PD2.pda.finals, s];
    pdPaintStates();
  });
}
function pdPaintRows() {
  const { pda, ch } = PD2;
  const tab = document.getElementById("pdtab");
  const selSt = (v) => pda.states.map((s) => `<option ${s === v ? "selected" : ""}>${s}</option>`).join("");
  const selRead = (v) => [...ch.sigma, LAMBDA].map((s) => `<option ${s === v ? "selected" : ""}>${s}</option>`).join("");
  const selPop = (v) => [...GAMMA].map((s) => `<option ${s === v ? "selected" : ""}>${s}</option>`).join("");
  tab.innerHTML = `<tr><th>desde</th><th>lee</th><th>desapila</th><th>apila</th><th>hacia</th><th></th></tr>` +
    pda.trans.map((t, i) => `<tr>
      <td><select data-i="${i}" data-f="from">${selSt(t.from)}</select></td>
      <td><select data-i="${i}" data-f="read">${selRead(t.read)}</select></td>
      <td><select data-i="${i}" data-f="pop">${selPop(t.pop)}</select></td>
      <td><input data-i="${i}" data-f="push" value="${t.push}" size="5" maxlength="4" placeholder="λ" style="font:inherit;background:var(--surface2);color:var(--ink);border:1px solid var(--border);border-radius:6px;padding:3px 6px;min-width:0"></td>
      <td><select data-i="${i}" data-f="to">${selSt(t.to)}</select></td>
      <td><button class="btn sm ghost" data-del="${i}">✕</button></td></tr>`).join("");
  tab.querySelectorAll("select,input[data-f]").forEach((n) => {
    n.style.cssText += "font:inherit;background:var(--surface2);color:var(--ink);border:1px solid var(--border);border-radius:6px;padding:3px 6px";
    n.onchange = () => {
      const t = pda.trans[+n.dataset.i];
      let v = n.value;
      if (n.dataset.f === "push") {
        v = v.trim().toUpperCase().replace(/Λ|L/g, "");
        if ([...v].some((c) => !GAMMA.includes(c))) { toast("Apilá solo símbolos de Γ = {Z,A,B,C}"); v = ""; n.value = ""; }
      }
      t[n.dataset.f] = v;
    };
  });
  tab.querySelectorAll("[data-del]").forEach((b) => b.onclick = () => { pda.trans.splice(+b.dataset.del, 1); pdPaintRows(); });
}
function pdNormalized() {
  const p = JSON.parse(JSON.stringify(PD2.pda));
  p.trans.forEach((t) => { if (!t.push) t.push = LAMBDA; });
  return p;
}
function pdTest() {
  const out = document.getElementById("pdout");
  const w = document.getElementById("pdw").value.trim();
  const bad = [...w].find((c) => !PD2.ch.sigma.includes(c));
  if (bad) { out.innerHTML = `<div class="q-explain" style="border-color:var(--bad)">'${bad}' no está en Σ</div>`; return; }
  const res = pdaAccepts(pdNormalized(), w, true);
  if (!res.ok) {
    out.innerHTML = `<span class="verdict rej">❌ RECHAZA — "${w || "λ"}"</span>${res.exhausted ? '<p style="color:var(--warn-hi)">⚠️ corté la búsqueda: ojo con loops λ que inflan la pila</p>' : ""}`;
    return;
  }
  // animación de pila: recorrer el camino aceptador
  const path = res.path;
  let i = 0;
  out.innerHTML = `<div class="flex" style="align-items:flex-start"><div>
      <div style="color:var(--muted);font-size:.8rem">entrada</div><div class="tape" id="pdtape"></div>
      <div style="color:var(--muted);font-size:.8rem">estado: <b id="pdst" style="color:var(--accent-hi)"></b></div></div>
    <div style="margin-left:26px"><div style="color:var(--muted);font-size:.8rem">pila (tope arriba)</div>
      <div id="pdstack" style="display:flex;flex-direction:column-reverse;gap:3px;min-height:120px;justify-content:flex-end"></div></div>
    </div><div id="pdverdict" class="mt"></div>`;
  const iv = setInterval(() => {
    if (i >= path.length) { clearInterval(iv);
      document.getElementById("pdverdict").innerHTML = `<span class="verdict acc">✅ ACEPTA — "${w || "λ"}" (${path.length - 1} movimientos)</span>`;
      return; }
    const c = path[i];
    document.getElementById("pdtape").innerHTML = [...w].map((ch2, k) =>
      `<span class="${k < c.i ? "done" : k === c.i ? "cur" : ""}">${ch2}</span>`).join("") || '<span class="cur">λ</span>';
    document.getElementById("pdst").textContent = c.st;
    document.getElementById("pdstack").innerHTML = [...c.stack].reverse().map((s, k, arr) =>
      `<span style="width:44px;text-align:center;padding:4px 0;border:1px solid ${k === arr.length - 1 ? "var(--accent-hi)" : "var(--border)"};border-radius:6px;background:var(--surface2);font-weight:800">${s}</span>`).join("") ||
      '<span style="color:var(--muted)">∅ vacía</span>';
    i++;
  }, 480);
}
function pdVerify() {
  const out = document.getElementById("pdout");
  const ch = PD2.ch;
  const pda = pdNormalized();
  if (!pda.trans.length) { out.innerHTML = `<div class="q-explain" style="border-color:var(--bad)">Agregá transiciones primero.</div>`; return; }
  const res = verify((w) => pdaAccepts(pda, w).ok, ch);
  if (res.pass) {
    out.innerHTML = `<div class="q-explain" style="border-color:var(--ok)">🏆 <b>¡PERFECTO!</b> Las ${res.total} cadenas hasta largo ${ch.maxLen} coinciden.</div>
      <div class="center mt"><a class="btn ok" href="#/pdalab">← Más desafíos</a></div>`;
    chalWin(ch);
  } else {
    out.innerHTML = `<div class="q-explain" style="border-color:var(--bad)"><b>❌ ${res.failCount} de ${res.total} cadenas fallan.</b></div>
    <table><tr><th>cadena</th><th>debería</th><th>tu AP</th></tr>
    ${res.fails.map((f) => `<tr><td><code>${f.w}</code></td><td>${f.want ? "✅ aceptar" : "❌ rechazar"}</td><td>${f.got ? "aceptó" : "rechazó"}</td></tr>`).join("")}</table>`;
  }
}
