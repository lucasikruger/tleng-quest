/* ===== Tleng Quest — EL CAMINO: islas que conquistás hasta el final ===== */

/* mejores puntajes de quiz por tema (lo llena quiz.js) */
function quizBest(t) { return (State.d.quiz.best || {})[t] || 0; }
function builderDone(list, min) { return list.filter((c) => chalDone(c.id)).length >= min; }

/* misión = {icon, label, route, done()} — la isla se conquista con TODAS las misiones */
const ISLAS = [
  { id: "base", icon: "🏕️", name: "Campamento base", sub: "Conocé el terreno antes de pelear",
    mis: [
      { icon: "🧭", label: "Leer: cómo es el final (y quién lo toma)", route: "doc/COMO_ES_EL_FINAL", done: () => State.isRead("COMO_ES_EL_FINAL") },
      { icon: "🎯", label: "Mirar el ranking: qué toman", route: "quetoman", done: () => !!State.d.sawRanking },
    ] },
  { id: "01", icon: "🔤", name: "Isla Lenguajes", sub: "Cadenas, operaciones, inducción",
    mis: [
      { icon: "📖", label: "Lectura del tema", route: "doc/01_lenguajes", done: () => State.isRead("01_lenguajes") },
      { icon: "⚡", label: "Quiz: 7+ correctas", route: "quiz/01", done: () => quizBest("01") >= 7 },
    ] },
  { id: "02", icon: "⚙️", name: "Isla Autómatas", sub: "AFD, AFND, λ — acá se construye", hot: true,
    mis: [
      { icon: "📖", label: "Lectura (con simulador en vivo)", route: "doc/02_automatas_finitos", done: () => State.isRead("02_automatas_finitos") },
      { icon: "🔨", label: "Construí 4 AFDs", route: "builder", done: () => builderDone(FA_CHALLENGES.filter((c) => c.mode === "afd"), 4) },
      { icon: "🌀", label: "Construí 2 AFNDs", route: "builder", done: () => builderDone(FA_CHALLENGES.filter((c) => c.mode === "afnd"), 2) },
      { icon: "⚡", label: "Quiz: 7+ correctas", route: "quiz/02", done: () => quizBest("02") >= 7 },
    ] },
  { id: "03", icon: "🎈", name: "Isla Pumping", sub: "No-regularidad: EL tema de final", hot: true,
    mis: [
      { icon: "📖", label: "Lectura del tema", route: "doc/03_pumping_regular", done: () => State.isRead("03_pumping_regular") },
      { icon: "⚔️", label: "Ganá el Duelo de Pumping", route: "pumping/0", done: () => !!State.d.pumpWin },
      { icon: "⚡", label: "Quiz: 7+ correctas", route: "quiz/03", done: () => quizBest("03") >= 7 },
    ] },
  { id: "04", icon: "✳️", name: "Isla Regex", sub: "Derivadas, Arden, y el golf",
    mis: [
      { icon: "📖", label: "Lectura (probá ERs en vivo)", route: "doc/04_expresiones_regulares", done: () => State.isRead("04_expresiones_regulares") },
      { icon: "⛳", label: "ER Golf: 4 hoyos", route: "ergolf", done: () => builderDone(ER_CHALLENGES, 4) },
      { icon: "⚡", label: "Quiz: 7+ correctas", route: "quiz/04", done: () => quizBest("04") >= 7 },
    ] },
  { id: "05", icon: "🪓", name: "Isla Minimización", sub: "Subconjuntos, ≡ₖ, el mínimo", hot: true,
    mis: [
      { icon: "📖", label: "Lectura (mirá el mod 3 andar)", route: "doc/05_determinizacion_minimizacion", done: () => State.isRead("05_determinizacion_minimizacion") },
      { icon: "🔨", label: "Construí los AFD de módulo (★★★)", route: "builder/afd-09", done: () => chalDone("afd-09") },
      { icon: "⚡", label: "Quiz: 7+ correctas", route: "quiz/05", done: () => quizBest("05") >= 7 },
    ] },
  { id: "06", icon: "🧬", name: "Isla Gramáticas Regulares", sub: "GR ↔ AF, la equivalencia",
    mis: [
      { icon: "📖", label: "Lectura del tema", route: "doc/06_gramaticas_regulares", done: () => State.isRead("06_gramaticas_regulares") },
      { icon: "⚡", label: "Quiz: 7+ correctas", route: "quiz/06", done: () => quizBest("06") >= 7 },
    ] },
  { id: "07", icon: "🥞", name: "Isla Pila", sub: "AP: apilá, desapilá, aceptá",
    mis: [
      { icon: "📖", label: "Lectura del tema", route: "doc/07_automatas_pila", done: () => State.isRead("07_automatas_pila") },
      { icon: "🔨", label: "Construí 3 AP (con pila animada)", route: "pdalab", done: () => builderDone(PDA_CHALLENGES, 3) },
      { icon: "⚡", label: "Quiz: 7+ correctas", route: "quiz/07", done: () => quizBest("07") >= 7 },
    ] },
  { id: "08", icon: "🌳", name: "Isla GLC", sub: "Gramáticas: las plantillas de siempre",
    mis: [
      { icon: "📖", label: "Lectura del tema", route: "doc/08_glc", done: () => State.isRead("08_glc") },
      { icon: "🧪", label: "Gramática Lab: 4 lenguajes", route: "gramlab", done: () => builderDone(CFG_CHALLENGES, 4) },
      { icon: "⚡", label: "Quiz: 7+ correctas", route: "quiz/08", done: () => quizBest("08") >= 7 },
    ] },
  { id: "09", icon: "🎈", name: "Isla Pumping LIC", sub: "5 partes, 2 tramos — cae SIEMPRE", hot: true,
    mis: [
      { icon: "📖", label: "Lectura del tema", route: "doc/09_pumping_lic", done: () => State.isRead("09_pumping_lic") },
      { icon: "⚡", label: "Quiz: 7+ correctas", route: "quiz/09", done: () => quizBest("09") >= 7 },
    ] },
  { id: "10", icon: "🗼", name: "Isla Jerarquía", sub: "APD, Chomsky, el mapa completo",
    mis: [
      { icon: "📖", label: "Lectura del tema", route: "doc/10_ap_deterministicos", done: () => State.isRead("10_ap_deterministicos") },
      { icon: "🗺️", label: "Explorá el mapa de Chomsky", route: "chomsky", done: () => !!State.d.sawChomsky },
      { icon: "⚡", label: "Quiz: 7+ correctas", route: "quiz/10", done: () => quizBest("10") >= 7 },
    ] },
  { id: "11", icon: "🏷️", name: "Isla Atributos", sub: "Sintetizados, heredados, COND",
    mis: [
      { icon: "📖", label: "Lectura del tema", route: "doc/11_gramaticas_atributos", done: () => State.isRead("11_gramaticas_atributos") },
      { icon: "⚡", label: "Quiz: 7+ correctas", route: "quiz/11", done: () => quizBest("11") >= 7 },
    ] },
  { id: "12", icon: "🎯", name: "Isla LL(1)", sub: "Parsing: lo MÁS tomado en finales", hot: true,
    mis: [
      { icon: "📖", label: "Lectura del tema", route: "doc/12_parsing_ll1", done: () => State.isRead("12_parsing_ll1") },
      { icon: "⚡", label: "Quiz: perfecto 8/8 (LL(1) no perdona)", route: "quiz/12", done: () => quizBest("12") >= 8 },
    ] },
  { id: "final", icon: "🏰", name: "LA MESA FINAL", sub: "Becher te espera. Demostrá todo.", hot: true,
    mis: [
      { icon: "📜", label: "Dominá la mitad de los teoremas", route: "teoremas", done: () => State.theoCount() >= 25 },
      { icon: "🎩", label: "Leer los trucos", route: "doc/TRUCOS", done: () => State.isRead("TRUCOS") },
      { icon: "⚡", label: "Quiz de teoría: 7+ correctas", route: "quiz/teo", done: () => quizBest("teo") >= 7 },
      { icon: "🏆", label: "Vencé 6 bosses (arrancá por Becher ⭐)", route: "boss", done: () => State.bossWins() >= 6 },
      { icon: "📄", label: "Repasá el formulario", route: "doc/FORMULARIO", done: () => State.isRead("FORMULARIO") },
    ] },
];

function islaProgress(isla) {
  const done = isla.mis.filter((m) => m.done()).length;
  return { done, total: isla.mis.length, conquered: done === isla.mis.length };
}
function caminoCurrent() {
  for (let i = 0; i < ISLAS.length; i++) if (!islaProgress(ISLAS[i]).conquered) return i;
  return ISLAS.length - 1;
}

/* ---------- vista: mapa del camino ---------- */
route("camino", (el) => {
  const cur = caminoCurrent();
  const conquered = ISLAS.filter((i) => islaProgress(i).conquered).length;
  el.innerHTML = `
  <div class="center mb">
    <h1 style="margin-bottom:2px">🗺️ El Camino al Final</h1>
    <p style="color:var(--ink2)">${conquered} / ${ISLAS.length} islas conquistadas.
    ${conquered === ISLAS.length ? "🎓 <b>¡ESTÁS PARA RENDIR!</b>" : `Siguiente parada: <b style="color:var(--accent-hi)">${ISLAS[cur].name}</b>`}</p>
    <div class="pbar ok" style="max-width:420px;margin:10px auto"><i style="width:${(100 * conquered) / ISLAS.length}%"></i></div>
  </div>
  <div class="camino">${ISLAS.map((isla, i) => {
    const p = islaProgress(isla);
    const state = p.conquered ? "conq" : i === cur ? "cur" : i < cur ? "part" : "far";
    return `<div class="isla ${state} ${i % 2 ? "der" : "izq"}" onclick="go('isla/${i}')">
      <div class="orb">${p.conquered ? "✅" : isla.icon}</div>
      <div class="info">
        <div class="flex" style="gap:6px"><b>${isla.name}</b>${isla.hot ? '<span class="tag hot">🔥 final</span>' : ""}</div>
        <div style="color:var(--ink2);font-size:.85rem">${isla.sub}</div>
        <div class="pbar ${p.conquered ? "ok" : ""}" style="margin-top:6px;max-width:220px"><i style="width:${(100 * p.done) / p.total}%"></i></div>
        <div style="color:var(--muted);font-size:.78rem;margin-top:3px">${p.done}/${p.total} misiones</div>
      </div>
    </div>`;
  }).join("")}</div>`;
});

/* ---------- vista: detalle de isla ---------- */
route("isla", (el, [idx]) => {
  const i = Math.max(0, Math.min(ISLAS.length - 1, +idx || 0));
  const isla = ISLAS[i];
  const p = islaProgress(isla);
  el.innerHTML = `
  <div class="crumb"><a href="#/camino">🗺️ Camino</a> / ${isla.name}</div>
  <div class="center mb">
    <div style="font-size:3.4rem">${p.conquered ? "🏴‍☠️→🏳️" : isla.icon}</div>
    <h1 style="margin:4px 0">${isla.name} ${isla.hot ? "🔥" : ""}</h1>
    <p style="color:var(--ink2)">${isla.sub}${isla.hot ? " · <b style='color:var(--bad-hi)'>de lo más tomado en finales</b>" : ""}</p>
    ${p.conquered ? '<span class="verdict acc">🏆 ISLA CONQUISTADA</span>' : `<span class="tag vi">${p.done}/${p.total} misiones</span>`}
  </div>
  ${isla.mis.map((m) => `
    <div class="card click mb" style="margin-bottom:10px" onclick="go('${m.route}')">
      <div class="flex"><span style="font-size:1.4rem">${m.done() ? "✅" : m.icon}</span>
        <b style="${m.done() ? "color:var(--ok-hi)" : ""}">${m.label}</b>
        <div class="spacer"></div><span class="btn sm ${m.done() ? "ghost" : ""}">${m.done() ? "repasar" : "ir →"}</span></div>
    </div>`).join("")}
  <div class="center mt">
    ${i > 0 ? `<a class="btn ghost sm" href="#/isla/${i - 1}">← anterior</a>` : ""}
    <a class="btn sm" href="#/camino">🗺️ mapa</a>
    ${i < ISLAS.length - 1 ? `<a class="btn ghost sm" href="#/isla/${i + 1}">siguiente →</a>` : ""}
  </div>`;
});

/* =====================================================================
   WIDGETS EN VIVO dentro de las lecturas (los inyecta la vista doc)
   ===================================================================== */
function miniSim(container, mid, blurb) {
  const m = MACHINES.find((x) => x.id === mid);
  if (!m) return;
  const box = document.createElement("div");
  box.className = "card";
  box.style.cssText = "border-color:var(--accent);margin:18px 0";
  box.innerHTML = `<div class="flex"><span class="tag cy">🎮 EN VIVO</span><b>${m.name}</b></div>
    <p style="color:var(--ink2);font-size:.9rem;margin:.4em 0">${blurb}</p>
    <svg class="simsvg" viewBox="0 0 640 210" id="ms-${mid}"></svg>
    <div class="flex mt"><input type="text" id="msw-${mid}" placeholder="probá una cadena" maxlength="14" style="min-width:140px">
      <button class="btn sm" id="msgo-${mid}">▶</button>
      ${m.try.map((w) => `<span class="chip" data-w="${w}">${w}</span>`).join("")}
      <div class="spacer"></div><span id="msv-${mid}"></span></div>`;
  container.appendChild(box);
  const paint = (cur) => {
    const svg = box.querySelector(`#ms-${mid}`);
    const R = 24;
    let g = `<defs><marker id="mar-${mid}" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9 z" fill="#6b7089"/></marker></defs>`;
    m.edges.forEach((e) => {
      const a = m.states.find((s) => s.id === e.f), b = m.states.find((s) => s.id === e.t);
      if (e.loop) g += `<path d="M ${a.x - 11} ${a.y - R + 4} C ${a.x - 28} ${a.y - R - 38}, ${a.x + 28} ${a.y - R - 38}, ${a.x + 11} ${a.y - R + 4}" fill="none" stroke="#6b7089" stroke-width="1.5" marker-end="url(#mar-${mid})"/><text class="edge" x="${a.x}" y="${a.y - R - 30}" text-anchor="middle">${e.lbl}</text>`;
      else {
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
        const c = e.curve || 0, x1 = a.x + ux * R, y1 = a.y + uy * R, x2 = b.x - ux * (R + 4), y2 = b.y - uy * (R + 4);
        const mx = (x1 + x2) / 2 - uy * c, my = (y1 + y2) / 2 + ux * c;
        g += `<path d="M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}" fill="none" stroke="#6b7089" stroke-width="1.5" marker-end="url(#mar-${mid})"/><text class="edge" x="${mx}" y="${my + (c >= 0 ? 15 : -6)}" text-anchor="middle">${e.lbl}</text>`;
      }
    });
    m.states.forEach((s) => {
      const isC = cur === s.id;
      if (s.id === m.initial) g += `<line x1="${s.x - 64}" y1="${s.y}" x2="${s.x - R - 5}" y2="${s.y}" stroke="#6b7089" stroke-width="1.5" marker-end="url(#mar-${mid})"/>`;
      g += `<circle class="st ${isC ? "cur" : ""}" cx="${s.x}" cy="${s.y}" r="${R}"/>`;
      if (s.final) g += `<circle cx="${s.x}" cy="${s.y}" r="${R - 5}" fill="none" stroke="${isC ? "#22d3ee" : "#6b7089"}" stroke-width="1.5"/>`;
      g += `<text x="${s.x}" y="${s.y + 5}" text-anchor="middle">${s.id}</text>`;
    });
    svg.innerHTML = g;
  };
  // reescalar coords de MACHINES (que están pensadas para 640x230) — ya ok
  paint(m.initial);
  let playing = null;
  const run = () => {
    const w = box.querySelector(`#msw-${mid}`).value.trim();
    const vv = box.querySelector(`#msv-${mid}`);
    if ([...w].some((c) => !m.sigma.includes(c))) { vv.innerHTML = `<span class="tag hot">fuera de Σ</span>`; return; }
    if (playing) clearInterval(playing);
    let cur = m.initial, i = 0;
    paint(cur); vv.innerHTML = "";
    playing = setInterval(() => {
      if (i >= w.length) { clearInterval(playing); playing = null;
        const acc = m.states.find((s) => s.id === cur).final;
        vv.innerHTML = `<span class="verdict ${acc ? "acc" : "rej"}" style="font-size:.9rem;padding:4px 10px">${acc ? "✅ acepta" : "❌ rechaza"}</span>`;
        return; }
      cur = m.delta[cur][w[i]]; i++; paint(cur);
    }, 430);
  };
  box.querySelector(`#msgo-${mid}`).onclick = run;
  box.querySelector(`#msw-${mid}`).addEventListener("keydown", (e) => { if (e.key === "Enter") run(); });
  box.querySelectorAll(".chip[data-w]").forEach((c) => c.onclick = () => { box.querySelector(`#msw-${mid}`).value = c.dataset.w; run(); });
}

function miniRegex(container) {
  const box = document.createElement("div");
  box.className = "card";
  box.style.cssText = "border-color:var(--accent);margin:18px 0";
  box.innerHTML = `<div class="flex"><span class="tag cy">🎮 EN VIVO</span><b>Probador de ER</b></div>
    <p style="color:var(--ink2);font-size:.9rem;margin:.4em 0">Escribí una ER sobre {a,b} (con λ, |, *, +, ?) y una cadena: la compilo con Thompson y te digo si la acepta.</p>
    <div class="flex"><input type="text" id="mrx" placeholder="(a|b)*abb" style="font-family:monospace;min-width:150px" maxlength="30">
      <input type="text" id="mrw" placeholder="cadena" maxlength="14" style="min-width:100px">
      <button class="btn sm" id="mrgo">▶</button><span id="mrv"></span></div>`;
  container.appendChild(box);
  const run = () => {
    const v = box.querySelector("#mrv");
    try {
      const nfa = reToNFA(reParse(box.querySelector("#mrx").value.trim(), "ab"));
      const ok = reAccepts(nfa, box.querySelector("#mrw").value.trim());
      v.innerHTML = `<span class="verdict ${ok ? "acc" : "rej"}" style="font-size:.9rem;padding:4px 10px">${ok ? "✅ acepta" : "❌ rechaza"}</span>`;
    } catch (e) { v.innerHTML = `<span class="tag hot">${e.message}</span>`; }
  };
  box.querySelector("#mrgo").onclick = run;
  box.querySelectorAll("input").forEach((i) => i.addEventListener("keydown", (e) => { if (e.key === "Enter") run(); }));
}

function gameLink(container, { icon, title, blurb, route: r, btn }) {
  const box = document.createElement("div");
  box.className = "card click";
  box.style.cssText = "border-color:var(--violet);margin:18px 0";
  box.onclick = () => go(r);
  box.innerHTML = `<div class="flex"><span style="font-size:1.6rem">${icon}</span>
    <div><b>${title}</b><div style="color:var(--ink2);font-size:.88rem">${blurb}</div></div>
    <div class="spacer"></div><span class="btn sm vi">${btn} →</span></div>`;
  container.appendChild(box);
}

/* qué widget va en cada lectura (se inyectan al principio del doc) */
function injectWidgets(el, docId) {
  const host = document.createElement("div");
  const body = el.querySelector("#docbody");
  if (!body) return;
  body.insertBefore(host, body.children[1] || null);
  const t = { "02_automatas_finitos": () => { miniSim(host, "par0", "Este AFD recuerda la paridad de 0s. Miralo consumir la cadena estado por estado — esto ES 'el estado como memoria'.");
      gameLink(host, { icon: "🔨", title: "Constructor de Autómatas", blurb: "12 AFDs y 6 AFNDs para construir vos — el juez verifica todo Σ*.", route: "builder", btn: "construir" }); },
    "03_pumping_regular": () => gameLink(host, { icon: "🎈", title: "Duelo de Pumping", blurb: "Elegí z e i contra el adversario. Incluye la trampa de las tolerancias.", route: "pumping/0", btn: "jugar" }),
    "04_expresiones_regulares": () => { miniRegex(host);
      gameLink(host, { icon: "⛳", title: "ER Golf", blurb: "8 hoyos: la regex más corta gana birdie.", route: "ergolf", btn: "jugar" }); },
    "05_determinizacion_minimizacion": () => { miniSim(host, "mod3", "Horner en vivo: el estado ES el resto mod 3. Probá 110 (=6) y 101 (=5).");
      gameLink(host, { icon: "🔨", title: "Desafío módulo", blurb: "Construí el AFD de mod 3 y el de mod 5 (★★★).", route: "builder/afd-09", btn: "construir" }); },
    "06_gramaticas_regulares": () => gameLink(host, { icon: "🌀", title: "AFNDs con λ", blurb: "Las construcciones de unión/concatenación que usa la equivalencia GR↔AF.", route: "builder", btn: "construir" }),
    "07_automatas_pila": () => gameLink(host, { icon: "🥞", title: "Constructor de AP", blurb: "Armá el aⁿbⁿ y mirá la pila apilarse y desapilarse en vivo.", route: "pdalab", btn: "construir" }),
    "08_glc": () => gameLink(host, { icon: "🌳", title: "Gramática Lab", blurb: "Escribí S -> aSb | λ y CYK la verifica contra todo el lenguaje.", route: "gramlab", btn: "escribir" }),
    "09_pumping_lic": () => gameLink(host, { icon: "🎈", title: "Duelo de Pumping", blurb: "Repasá el mecanismo del duelo — en LIC bombeás DOS tramos.", route: "pumping/0", btn: "jugar" }),
    "10_ap_deterministicos": () => gameLink(host, { icon: "🗺️", title: "Mapa de Chomsky", blurb: "La jerarquía interactiva, anillo por anillo.", route: "chomsky", btn: "explorar" }),
    "12_parsing_ll1": () => gameLink(host, { icon: "🏆", title: "Boss LL(1)", blurb: "El tema MÁS tomado: hay bosses de parsing esperándote.", route: "boss", btn: "pelear" }),
  }[docId];
  if (t) t(); else host.remove();
}
