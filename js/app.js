/* ===== Tleng Quest — núcleo: markdown, router, vistas ===== */

/* ---------- markdown + KaTeX (protege $...$ de marked) ---------- */
function mdRender(md) {
  const stash = [];
  // proteger $$...$$ y $...$ antes de marked
  let txt = md.replace(/\$\$([\s\S]+?)\$\$/g, (m) => { stash.push(m); return `%%MATH${stash.length - 1}%%`; });
  txt = txt.replace(/\$([^\$\n]+?)\$/g, (m) => { stash.push(m); return `%%MATH${stash.length - 1}%%`; });
  let html = window.marked ? marked.parse(txt) : `<pre>${txt.replace(/</g, "&lt;")}</pre>`;
  html = html.replace(/%%MATH(\d+)%%/g, (_, i) => stash[+i]);
  return html;
}
function katexify(el) {
  if (window.renderMathInElement) {
    renderMathInElement(el, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
      ],
      throwOnError: false,
    });
  }
}
/* enlaces internos de los .md: (XX.md) -> ruta interna; (../...) -> archivo del repo */
function fixLinks(el) {
  el.querySelectorAll("a[href]").forEach((a) => {
    const h = a.getAttribute("href");
    if (/^https?:/.test(h) || h.startsWith("#/")) return;
    const m = h.match(/^([\w\-]+)\.md(#.*)?$/);
    if (m && window.CONTENT && CONTENT[m[1]]) { a.setAttribute("href", "#/doc/" + m[1]); return; }
    if (h.startsWith("../")) { a.setAttribute("target", "_blank"); return; }
    a.removeAttribute("href");
  });
}

/* ---------- datos: temas + ranking "qué toman" ---------- */
const TEMAS = [
  { id: "01_lenguajes", n: "01", icon: "🔤", name: "Lenguajes", desc: "Alfabetos, operaciones, inducción" },
  { id: "02_automatas_finitos", n: "02", icon: "⚙️", name: "Autómatas finitos", desc: "AFD, AFND, subconjuntos" },
  { id: "03_pumping_regular", n: "03", icon: "🎈", name: "Pumping regular", desc: "No-regularidad en 4 pasos", hot: true },
  { id: "04_expresiones_regulares", n: "04", icon: "✳️", name: "Expresiones regulares", desc: "Derivadas, Arden" },
  { id: "05_determinizacion_minimizacion", n: "05", icon: "🪓", name: "Determinización y minimización", desc: "Subconjuntos, ≡ₖ, mínimo", hot: true },
  { id: "06_gramaticas_regulares", n: "06", icon: "🧬", name: "Gramáticas regulares", desc: "GR ↔ AF" },
  { id: "07_automatas_pila", n: "07", icon: "🥞", name: "Autómatas de pila", desc: "Pila vacía vs estado final" },
  { id: "08_glc", n: "08", icon: "🌳", name: "Gramáticas libres de contexto", desc: "Plantillas, ambigüedad" },
  { id: "09_pumping_lic", n: "09", icon: "🎈", name: "Pumping LIC", desc: "No-LIC en 5 partes", hot: true },
  { id: "10_ap_deterministicos", n: "10", icon: "🗼", name: "AP determinísticos", desc: "Jerarquía de Chomsky" },
  { id: "11_gramaticas_atributos", n: "11", icon: "🏷️", name: "Gramáticas de atributos", desc: "Sintetizado vs heredado" },
  { id: "12_parsing_ll1", n: "12", icon: "🎯", name: "Parsing LL(1)", desc: "PRIMEROS, SIGUIENTES, tabla", hot: true },
];
const TEMA_BY_ID = Object.fromEntries(TEMAS.map((t) => [t.id, t]));
const TEMA_BY_N = Object.fromEntries(TEMAS.map((t) => [t.n, t]));

/* ranking real: frecuencia en 20 finales (2008–2024) */
const RANKING = [
  { name: "Parsing LL/LR + PRIMEROS/SIGUIENTES", freq: 15, tema: "12", entender: [
      "La receta entera de memoria: recursión izq → factorizar → ANULABLE/PRIMEROS/SIGUIENTES → SD → tabla.",
      "POR QUÉ funciona: SD disjuntos ⟺ podés decidir con 1 símbolo de lookahead.",
      "Detectar un conflicto en la tabla y explicar cómo arreglarlo (o por qué no se puede).",
      "Trampa: eliminar recursión mecánicamente a veces deja conflicto → rediseñar desde el lenguaje." ] },
  { name: "Lema de Pumping para LIC", freq: 10, tema: "09", entender: [
      "Enunciado exacto: $z=uvwxy$, $|vwx|\\le p$, $|vx|\\ge 1$ — se bombean DOS tramos a la vez.",
      "El guion: yo elijo $z$ e $i$; el rival elige $p$ y la descomposición (análisis por casos de dónde cae $vwx$).",
      "Clásicos: $a^nb^nc^n$ y $ww$ no son LIC.",
      "Alternativa por clausura: LIC ∩ regular es LIC → intersectá y llevalo a un no-LIC conocido." ] },
  { name: "Equivalencias GR↔AF, ER↔AF, AFND↔AFD", freq: 9, tema: "02", entender: [
      "Las CONSTRUCCIONES, no solo el enunciado: subconjuntos ($2^n$), clausura-λ, derivadas, Arden, estado↔no terminal.",
      "Saber demostrar la corrección por inducción en $|w|$ (es LA demo que piden).",
      "Costo de cada dirección: determinizar puede explotar exponencialmente; el resto es polinomial." ] },
  { name: "Minimización e indistinguibilidad", freq: 6, tema: "05", entender: [
      "Refinamiento $\\equiv_0, \\equiv_1, \\dots$ hasta punto fijo, y por qué termina (≤ n−1 pasos).",
      "Teorema del mínimo: existencia + unicidad salvo renombre (cociente por ≡).",
      "Antes de minimizar: sacar inaccesibles. Equivalencia de 2 AFDs = minimizar y comparar (o dif. simétrica vacía)." ] },
  { name: "AP: pila vacía ↔ estado final, determinismo", freq: 5, tema: "07", entender: [
      "Las dos construcciones de la equivalencia EF ↔ PV (fondo nuevo $X_0$, vaciado final).",
      "APD ⊊ AP: palíndromos $ww^r$ necesitan adivinar el centro (no-determinismo esencial).",
      "AP por pila vacía determinístico ⟹ lenguaje libre de prefijos." ] },
  { name: "Algoritmos de decisión + complejidad", freq: 5, tema: "03", entender: [
      "El sello de Becher: 'dar un algoritmo que decida X, justificar correctitud, dar complejidad'.",
      "Regulares: vacío ($\\exists w, |w|<n$), infinito ($n\\le|w|<2n$), equivalencia (dif. simétrica). Todo decidible.",
      "LIC: pertenencia CYK $O(n^3)$, vacío/finitud sí; equivalencia y ambigüedad INDECIDIBLES." ] },
  { name: "Clausura de LIC (y contraejemplo de ∩)", freq: 4, tema: "08", entender: [
      "Cerrados: unión, concatenación, estrella, reverso, ∩ con regular. NO cerrados: intersección, complemento.",
      "El contraejemplo canónico: $a^nb^nc^* \\cap a^*b^nc^n = a^nb^nc^n$.",
      "Cada 'sí' con su construcción de gramáticas ($S\\to S_1|S_2$, etc.)." ] },
  { name: "Conteo de autómatas", freq: 4, tema: "02", entender: [
      "¿Cuántos AFD con $k$ estados sobre $\\Sigma$? Contar funciones: $\\delta$ son $|Q|^{|Q|\\cdot|\\Sigma|}$ opciones × iniciales × subconjuntos finales.",
      "AFND: $\\delta$ va a $\\mathcal{P}(Q)$ → $2^{|Q|^2|\\Sigma|}$ sabores. AP: agregá $\\Gamma$ y las cadenas que apilás (acotadas).",
      "Es combinatoria pura: escribí la tupla y contá componente por componente." ] },
];

/* quién toma — Becher tomó el último final registrado (2024-05-08 / 2023) y es
   la autora del entrenamiento jun-2024: PREPARATE PARA SU ESTILO */
const TOMADORES = [
  { who: "Becher", star: true, style: "Escrito (a veces a libro abierto). Pide: algoritmo + correctitud + complejidad, V/F justificado, conteo de autómatas. Sus preguntas de entrenamiento jun-2024 son EL simulacro perfecto." },
  { who: "Jacobo", style: "Oral u escrito. Demostraciones clásicas de la teórica: equivalencias, pumping, minimización. En oral: pizarrón, ~40 min, te va guiando." },
  { who: "Castaño", style: "Suele tomar la parte de parsers (LL/LR, PRIMEROS/SIGUIENTES) en orales mixtos." },
];

/* ---------- router ---------- */
const ROUTES = {};
function route(path, fn) { ROUTES[path] = fn; }
function nav() { return location.hash.replace(/^#\/?/, "").split("/").filter(Boolean); }
function go(h) { location.hash = h; }

function render() {
  const parts = nav();
  const key = parts[0] || "home";
  const fn = ROUTES[key] || ROUTES.home;
  const app = document.getElementById("app");
  app.innerHTML = "";
  fn(app, parts.slice(1));
  // nav activo
  document.querySelectorAll("#nav a").forEach((a) => {
    a.classList.toggle("on", a.dataset.r === key);
  });
  window.scrollTo(0, 0);
}

const UI = {
  updateXP() {
    const lvl = State.levelName(), pct = State.levelPct();
    document.getElementById("xpbox").innerHTML =
      `<div class="lvl">Nv.${State.level() + 1} · ${lvl} — <b>${State.d.xp} XP</b></div>
       <div class="bar"><i style="width:${pct}%"></i></div>`;
  },
};

/* ---------- vistas ---------- */
route("home", (el) => {
  const acc = State.quizAcc();
  const hasCamino = typeof ISLAS !== "undefined";
  const cur = hasCamino ? caminoCurrent() : 0;
  const conq = hasCamino ? ISLAS.filter((i) => islaProgress(i).conquered).length : 0;
  el.innerHTML = `
  <div class="center mb">
    <h1 style="font-size:2.1rem;margin-bottom:4px">🎮 Tleng <span style="color:var(--accent-hi)">Quest</span></h1>
    <p style="color:var(--ink2);max-width:560px;margin:0 auto">La misión: <b>APROBAR el final</b> de
    Teoría de Lenguajes (1C 2024). Conquistá isla por isla hasta la Mesa Final.</p>
  </div>
  ${hasCamino ? `
  <div class="card click mb" style="border-color:var(--accent);background:linear-gradient(135deg,var(--surface),rgba(8,145,178,.12))" onclick="go(conqDone() ? 'camino' : 'isla/${cur}')">
    <div class="flex"><span style="font-size:2.6rem">${ISLAS[cur].icon}</span>
      <div><span class="tag cy">TU PRÓXIMA PARADA · isla ${cur + 1}/${ISLAS.length}</span>
        <h2 style="margin:.2em 0">${ISLAS[cur].name}</h2>
        <p style="color:var(--ink2);margin:0">${ISLAS[cur].sub}</p></div>
      <div class="spacer"></div><span class="btn">▶ Continuar</span></div>
    <div class="pbar ok mt"><i style="width:${(100 * conq) / ISLAS.length}%"></i></div>
    <div style="color:var(--muted);font-size:.8rem;margin-top:4px">${conq}/${ISLAS.length} islas conquistadas · <a href="#/camino">ver el mapa completo 🗺️</a></div>
  </div>` : ""}
  <div class="grid c4 mb">
    <div class="statile"><div class="n" style="color:var(--accent-hi)">${State.d.xp}</div><div class="l">XP</div></div>
    <div class="statile"><div class="n">${State.readCount()}/12</div><div class="l">Temas leídos</div></div>
    <div class="statile"><div class="n" style="color:var(--violet-hi)">${acc === null ? "—" : acc + "%"}</div><div class="l">Precisión quiz</div></div>
    <div class="statile"><div class="n" style="color:var(--warn-hi)">${State.bossWins()}/${(window.FINALES || []).length || "?"}</div><div class="l">Bosses vencidos</div></div>
  </div>
  <div class="card mb" style="border-color:var(--warn)"><div class="flex">
    <span style="font-size:1.8rem">🧙‍♀️</span>
    <div><b style="color:var(--warn-hi)">⭐ Becher tomó el último final</b>
      <div style="color:var(--ink2);font-size:.9rem">Su estilo: algoritmo + correctitud + <b>complejidad</b>, V/F justificado, conteo de autómatas.${TLENG.claude ? " Entrenala en el simulador." : ""}</div></div>
    <div class="spacer"></div>${TLENG.claude ? '<a class="btn sm warn" href="#/oral/becher">🎤 Simulacro con Becher</a>' : ""}</div></div>
  <div class="grid c2 mb">
    <div class="card click" onclick="go('quetoman')"><span class="tag hot">Inteligencia</span>
      <h3>🎯 Qué toman</h3><p style="color:var(--ink2)">Ranking real de 20 finales: qué cae y qué hay que entender.</p></div>
    <div class="card click" onclick="go('lab')"><span class="tag cy">Construir</span>
      <h3>🔬 Laboratorio</h3><p style="color:var(--ink2)">38 desafíos: dibujá autómatas, AP, regex golf y gramáticas verificadas.</p></div>
    <div class="card click" onclick="go('arcade')"><span class="tag vi">Juego</span>
      <h3>🕹️ Arcade</h3><p style="color:var(--ink2)">Quiz, flashcards, simulador, duelo de pumping, mapa de Chomsky.</p></div>
    <div class="card click" onclick="go('boss')"><span class="tag warn" style="background:rgba(217,119,6,.16);color:var(--warn-hi)">Desafío</span>
      <h3>🏆 Boss Battles</h3><p style="color:var(--ink2)">Ejercicios de finales reales con pistas progresivas.</p></div>
  </div>
  <h2>🔥 Lo que más cae</h2>
  <div class="rank">${RANKING.slice(0, 4).map((r, i) => rankRow(r, i)).join("")}</div>
  <p class="center mt"><a href="#/quetoman" class="btn ghost sm">Ver ranking completo →</a></p>`;
  katexify(el);
});
function conqDone() { return typeof ISLAS !== "undefined" && ISLAS.every((i) => islaProgress(i).conquered); }

function rankRow(r, i) {
  const t = TEMA_BY_N[r.tema];
  const pct = Math.round((r.freq / 20) * 100);
  return `<div class="row" onclick="go('quetoman')">
    <div class="pos">${i + 1}</div>
    <div><div class="name">${r.name}</div>
      <div class="bar"><i style="width:${pct}%"></i></div></div>
    <div class="n">${r.freq}<span style="color:var(--muted);font-size:.75em">/20</span></div>
  </div>`;
}

route("quetoman", (el) => {
  State.d.sawRanking = 1; State.save();
  el.innerHTML = `
  <div class="crumb"><a href="#/">Inicio</a> / Qué toman</div>
  <h1>🎯 Qué toman en el final</h1>
  <p style="color:var(--ink2)">Análisis de <b>20 finales reales (2008–2024)</b> + las preguntas de entrenamiento
  de Becher (jun-2024). El final <b>no es como el parcial</b>: piden <b>demostrar</b>, dar <b>algoritmos de
  decisión con complejidad</b> y justificar V/F. Cada tarjeta te dice <b>qué hay que entender</b> (no memorizar).</p>
  <div class="grid c3 mb mt">${TOMADORES.map((t) => { const star = t.star; return
    `<div class="card" style="${star ? "border-color:var(--warn)" : ""}">
      <h3>${star ? "🧙‍♀️" : "👤"} ${t.who} ${star ? "⭐" : ""}</h3>
      ${star ? '<span class="tag hot">TOMÓ EL ÚLTIMO FINAL — prepará SU estilo</span>' : ""}
      <p style="color:var(--ink2);font-size:.92rem;margin-top:6px">${t.style}</p>
      ${star && TLENG.claude ? '<a class="btn sm warn" href="#/oral/becher">🎤 Simulacro con Becher</a>' : ""}</div>`; }).join("")}
  </div>
  ${RANKING.map((r, i) => {
    const t = TEMA_BY_N[r.tema];
    const pct = Math.round((r.freq / 20) * 100);
    return `<div class="card mb">
      <div class="flex"><span class="tag ${i < 3 ? "hot" : "cy"}">#${i + 1} · salió en ${r.freq} de 20 finales</span>
        <div class="spacer"></div>
        <a class="btn sm ghost" href="#/doc/${t.id}">📖 Tema ${t.n}</a>
        <a class="btn sm vi" href="#/quiz/${r.tema}">⚡ Quiz</a></div>
      <h3 style="margin-top:10px">${r.name}</h3>
      <div class="pbar mb" style="max-width:340px"><i style="width:${pct}%"></i></div>
      <b style="color:var(--ink2);font-size:.85rem;text-transform:uppercase;letter-spacing:.5px">Qué hay que entender</b>
      <ul>${r.entender.map((e) => `<li>${e}</li>`).join("")}</ul>
    </div>`; }).join("")}
  <div class="card"><h3>📋 El detalle completo</h3>
    <p>Formato, fechas, clásicos y estrategia: <a href="#/doc/COMO_ES_EL_FINAL">Cómo es el final</a> ·
    las demos que hay que saber: <a href="#/doc/TEOREMAS_PARA_EL_FINAL">Teoremas para el final</a></p></div>`;
  katexify(el);
});

route("temas", (el) => {
  el.innerHTML = `
  <div class="crumb"><a href="#/">Inicio</a> / Temas</div>
  <h1>📚 Los 12 temas</h1>
  <p style="color:var(--ink2)">En orden de cursada. 🔥 = de los más tomados en finales. Leé un tema y ganás XP.</p>
  <div class="grid c3">${TEMAS.map((t) => `
    <div class="card click" onclick="go('doc/${t.id}')">
      <div class="flex"><span style="font-size:1.5rem">${t.icon}</span>
        <span class="tag">${t.n}</span>${t.hot ? '<span class="tag hot">🔥</span>' : ""}
        <div class="spacer"></div>${State.isRead(t.id) ? '<span class="tag ok">✓ leído</span>' : ""}</div>
      <h3>${t.name}</h3><p style="color:var(--ink2);font-size:.9rem;margin:0">${t.desc}</p>
    </div>`).join("")}
  </div>
  <h2 class="mt">Transversales</h2>
  <div class="grid c2">
    <div class="card click" onclick="go('doc/TRUCOS')"><h3>🎩 Trucos y patrones</h3><p style="color:var(--ink2)">El machete de mañas: "cuando ves X hacé Y".</p></div>
    <div class="card click" onclick="go('teoremas')"><h3>📜 Teoremas (checklist)</h3><p style="color:var(--ink2)">Marcá los que ya sabés demostrar.</p></div>
    <div class="card click" onclick="go('doc/FORMULARIO')"><h3>📄 Formulario</h3><p style="color:var(--ink2)">Una carilla para el día del final.</p></div>
    <div class="card click" onclick="go('doc/COMO_ES_EL_FINAL')"><h3>🧭 Cómo es el final</h3><p style="color:var(--ink2)">Formato, quién toma, estrategia.</p></div>
  </div>`;
});

route("doc", (el, [id]) => {
  const doc = window.CONTENT && CONTENT[id];
  if (!doc) { el.innerHTML = "<p>Documento no encontrado.</p>"; return; }
  const t = TEMA_BY_ID[id];
  const idx = t ? TEMAS.indexOf(t) : -1;
  el.innerHTML = `
  <div class="crumb"><a href="#/">Inicio</a> / <a href="#/temas">Temas</a> / ${t ? t.name : id}</div>
  <div id="docbody">${mdRender(doc.md)}</div>
  <div class="card mt"><div class="flex">
    ${idx > 0 ? `<a class="btn ghost sm" href="#/doc/${TEMAS[idx - 1].id}">← ${TEMAS[idx - 1].n}</a>` : ""}
    <div class="spacer"></div>
    <button class="btn sm ${State.isRead(id) ? "ghost" : "ok"}" id="markread">
      ${State.isRead(id) ? "✓ Ya lo leíste" : "✅ Marcar como leído (+50 XP)"}</button>
    ${t ? `<a class="btn sm vi" href="#/quiz/${t.n}">⚡ Quiz del tema</a>` : ""}
    ${idx >= 0 && idx < TEMAS.length - 1 ? `<a class="btn ghost sm" href="#/doc/${TEMAS[idx + 1].id}">${TEMAS[idx + 1].n} →</a>` : ""}
  </div></div>`;
  katexify(el); fixLinks(el);
  if (typeof injectWidgets === "function") injectWidgets(el, id);
  const mb = document.getElementById("markread");
  if (mb) mb.onclick = () => {
    if (State.markRead(id)) { State.addXP(50, "tema leído"); render(); if (State.readCount() === 12) party(); }
  };
});
/* leer transversales también cuenta como misión */
route._docRead = null;

/* teoremas con checklist */
route("teoremas", (el) => {
  const doc = CONTENT["TEOREMAS_PARA_EL_FINAL"];
  el.innerHTML = `
  <div class="crumb"><a href="#/">Inicio</a> / Teoremas</div>
  <h1>📜 Teoremas para el final</h1>
  <p style="color:var(--ink2)">Marcá <b>"lo sé demostrar"</b> en cada uno. Objetivo: 100% antes de la fecha.</p>
  <div class="card mb"><div class="flex"><b id="theopct"></b><div class="spacer"></div></div>
    <div class="pbar ok mt" style="margin-top:8px"><i id="theobar" style="width:0"></i></div></div>
  <div id="theolist"></div>`;
  // partir el md por ### (cada teorema) manteniendo jerarquía de ## como títulos
  const md = doc.md;
  const parts = md.split(/\n(?=#{2,3} )/);
  const list = document.getElementById("theolist");
  let total = 0;
  parts.forEach((chunk, i) => {
    const m = chunk.match(/^(#{2,3}) (.+)/);
    if (!m) return;
    if (m[1] === "##") {
      const h = document.createElement("h2");
      h.innerHTML = m[2];
      list.appendChild(h);
      const rest = chunk.replace(/^## .+\n?/, "").trim();
      if (rest) { const p = document.createElement("div"); p.innerHTML = mdRender(rest); list.appendChild(p); }
      return;
    }
    total++;
    const id = "th" + i;
    const body = chunk.replace(/^### .+\n?/, "");
    const d = document.createElement("details");
    d.className = "theo" + (State.theoKnown(id) ? " known" : "");
    d.innerHTML = `<summary><input type="checkbox" ${State.theoKnown(id) ? "checked" : ""}
        onclick="event.stopPropagation()"> <span>${m[2]}</span></summary>
      <div class="body">${mdRender(body)}</div>`;
    d.querySelector("input").addEventListener("change", (ev) => {
      const was = State.theoKnown(id);
      State.setTheo(id, ev.target.checked);
      d.classList.toggle("known", ev.target.checked);
      if (ev.target.checked && !was) State.addXP(20, "teorema dominado");
      updTheo();
    });
    list.appendChild(d);
  });
  function updTheo() {
    const k = State.theoCount();
    document.getElementById("theopct").textContent = `${k} / ${total} dominados`;
    document.getElementById("theobar").style.width = total ? (100 * k / total) + "%" : "0";
    if (k === total && total > 0) party();
  }
  updTheo();
  katexify(list); fixLinks(list);
});

/* arcade hub */
route("arcade", (el) => {
  el.innerHTML = `
  <div class="crumb"><a href="#/">Inicio</a> / Arcade</div>
  <h1>🕹️ Arcade</h1>
  <div class="grid c2">
    <div class="card click" style="border-color:var(--accent)" onclick="go('lab')"><h3>🔬 Laboratorio</h3>
      <p style="color:var(--ink2)">Constructor de autómatas (AFD/AFND), AP con pila animada, ER Golf y Gramática Lab. 38 desafíos verificados exhaustivamente.</p>
      <span class="tag cy">el corazón del juego</span></div>
    ${TLENG.claude ? `<div class="card click" style="border-color:var(--warn)" onclick="go('oral')"><h3>🎤 Final oral simulado</h3>
      <p style="color:var(--ink2)">Claude te toma el final con el estilo real de Becher ⭐ o Jacobo, y te pone nota.</p>
      <span class="tag warn" style="background:rgba(217,119,6,.16);color:var(--warn-hi)">con IA</span></div>` : ""}
    <div class="card click" onclick="go('quiz')"><h3>⚡ Quiz rápido</h3>
      <p style="color:var(--ink2)">10 preguntas, feedback inmediato, rachas y XP. Elegí tema o todo mezclado.</p>
      <span class="tag vi">${(window.QUIZ || []).length} preguntas</span></div>
    <div class="card click" onclick="go('cards')"><h3>🃏 Flashcards</h3>
      <p style="color:var(--ink2)">Definiciones, teoremas y trucos. Tocá para dar vuelta.</p>
      <span class="tag vi">${(window.CARDS || []).length} cartas · ${State.cardsKnownCount()} dominadas</span></div>
    <div class="card click" onclick="go('sim')"><h3>⚙️ Simulador de AFD</h3>
      <p style="color:var(--ink2)">Escribí una cadena y mirá al autómata consumirla paso a paso.</p></div>
    <div class="card click" onclick="go('pumping')"><h3>🎈 Duelo de Pumping</h3>
      <p style="color:var(--ink2)">Vos elegís $z$ e $i$, el adversario descompone. ¿Rompés el lenguaje?</p></div>
    <div class="card click" onclick="go('chomsky')"><h3>🗺️ Mapa de Chomsky</h3>
      <p style="color:var(--ink2)">La jerarquía interactiva: tocá cada nivel y mirá qué lo reconoce.</p></div>
    <div class="card click" onclick="go('boss')"><h3>🏆 Boss Battles</h3>
      <p style="color:var(--ink2)">Ejercicios de finales reales con pistas progresivas.</p>
      <span class="tag warn" style="background:rgba(217,119,6,.16);color:var(--warn-hi)">${State.bossWins()} vencidos</span></div>
  </div>`;
  katexify(el);
});

/* trucos con búsqueda */
route("trucos", (el) => {
  const doc = CONTENT["TRUCOS"];
  el.innerHTML = `
  <div class="crumb"><a href="#/">Inicio</a> / Trucos</div>
  <h1>🎩 Trucos y patrones</h1>
  <input type="text" id="tsearch" class="searchbox" placeholder="Buscar… (ej: pumping, derivada, palíndromo)">
  <div id="tbody">${mdRender(doc.md)}</div>`;
  katexify(el); fixLinks(el);
  const body = document.getElementById("tbody");
  // secciones = h2/h3 hasta el próximo
  const sections = [];
  let cur = null;
  [...body.children].forEach((node) => {
    if (/^H[23]$/.test(node.tagName)) { cur = { head: node, nodes: [] }; sections.push(cur); }
    else if (cur) cur.nodes.push(node);
  });
  document.getElementById("tsearch").addEventListener("input", (ev) => {
    const q = ev.target.value.toLowerCase().trim();
    sections.forEach((s) => {
      const txt = (s.head.textContent + " " + s.nodes.map((n) => n.textContent).join(" ")).toLowerCase();
      const show = !q || txt.includes(q);
      s.head.style.display = show ? "" : "none";
      s.nodes.forEach((n) => (n.style.display = show ? "" : "none"));
    });
  });
});

/* ---------- ⚙️ Config: estado de Claude ---------- */
route("config", (el) => {
  el.innerHTML = `
  <div class="crumb"><a href="#/">Inicio</a> / Config</div>
  <h1>⚙️ Configuración</h1>
  <div class="card mb" style="border-color:var(--warn)"><h3>📅 Sobre el material</h3>
    <p style="color:var(--ink2)">Todo el contenido corresponde a la <b>cursada 1C 2024</b> (anterior al 2C 2024).
    El programa, las prácticas y quién toma el final pueden haber cambiado en cuatrimestres posteriores
    — verificá siempre el programa vigente.</p></div>
  <div class="card mb"><h3>🤖 Chat con Claude</h3>
    <p style="color:var(--ink2)">El final oral simulado y el profe particular necesitan una API key de Anthropic (la pone cada usuario).</p>
    <div class="flex">
      <span class="verdict ${TLENG.claude ? "acc" : "rej"}" style="font-size:.95rem;padding:6px 14px">${TLENG.claude ? "✅ habilitado" : "🔌 desactivado"}</span>
      <button class="btn sm ghost" onclick="TLENG.setClaude(${!TLENG.claude})">${TLENG.claude ? "Desactivar" : "Activar"} en este navegador</button>
      ${TLENG.claude ? '<a class="btn sm" href="#/ajustes">🔑 Poner mi API key</a>' : ""}
    </div>
    <p style="color:var(--muted);font-size:.82rem;margin-top:10px">Para el <b>deploy público</b>: dejá <code>claude: false</code> en <code>config.js</code> y no se carga el SDK ni se ofrece la función. Este toggle solo afecta a tu navegador (localStorage), y podés pasar <code>?claude=0</code> en la URL.</p>
  </div>`;
});

/* ---------- aviso al entrar (una vez, se puede volver a ver en ⚙️) ---------- */
function showEntryNotice() {
  if (localStorage.getItem("tlengquest_notice")) return;
  const ov = document.createElement("div");
  ov.style.cssText = "position:fixed;inset:0;z-index:200;background:rgba(10,11,16,.82);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px";
  ov.innerHTML = `<div class="card" style="max-width:460px;text-align:center;border-color:var(--warn)">
    <div style="font-size:2.6rem">📅</div>
    <h2 style="margin:.3em 0">Ojo con la fecha</h2>
    <p style="color:var(--ink2)">Este material es de la cursada <b>1C 2024</b> (antes del 2C 2024).
    El programa, las prácticas y quién toma el final <b>pueden haber cambiado</b> después
    — usalo como guía, pero chequeá el programa vigente de tu cuatrimestre.</p>
    <button class="btn" id="noticeok">Entendido, arrancar 🚀</button></div>`;
  document.body.appendChild(ov);
  ov.querySelector("#noticeok").onclick = () => { localStorage.setItem("tlengquest_notice", "1"); ov.remove(); };
}

/* ---------- arranque ---------- */
window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", () => {
  State.load();
  // gating del nav según flags
  if (!TLENG.claude) { const n = document.querySelector('#nav a[data-r="oral"]'); if (n) n.remove(); }
  UI.updateXP();
  render();
  showEntryNotice();
});
