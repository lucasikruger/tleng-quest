/* ===== Tleng Quest — juegos con Claude: final oral simulado + profe =====
   Módulo ES. El SDK de Anthropic SOLO se importa si TLENG.claude está ON,
   así el deploy público (claude:false) no carga nada externo ni ofrece la función. */

const CLI_PROXY = !!(window.TLENG && window.TLENG.cliProxy);

if (!window.TLENG || !window.TLENG.claude) {
  // Claude desactivado en esta build: rutas que explican y redirigen.
  const off = (el, label) => { el.innerHTML = `
    <div class="crumb"><a href="#/">Inicio</a> / ${label}</div>
    <div class="card center" style="padding:40px">
      <div style="font-size:2.6rem">🔌</div>
      <h2>${label} está desactivado en esta versión</h2>
      <p style="color:var(--ink2)">El chat con Claude no está habilitado en este deploy.
      Si es tu copia, activá <code>claude: true</code> en <code>config.js</code>
      (o abrí la app con <code>?claude=1</code>) y poné tu API key —
      o corré el server con <code>TLENG_CLI=1</code> para usar tu sesión de Claude Code sin key.</p>
      <a class="btn" href="#/camino">🗺️ Seguir con el camino</a>
      <a class="btn ghost" href="#/config">⚙️ Config</a>
    </div>`; };
  route("oral", (el) => off(el, "🎤 Final oral simulado"));
  route("profe", (el) => off(el, "👨‍🏫 Profe particular"));
  route("ajustes", (el) => off(el, "🔑 Conexión con Claude"));
  const p0 = (location.hash.replace(/^#\/?/, "").split("/")[0] || "");
  if (["oral", "profe", "ajustes"].includes(p0)) render();
} else if (CLI_PROXY) {
  // Proxy por CLI local: no hace falta API key ni SDK; se usa /api/chat.
  initClaude(null);
} else {
  // Claude ON con API key: cargar el SDK dinámicamente.
  const Anthropic = (await import("https://cdn.jsdelivr.net/npm/@anthropic-ai/sdk/+esm")).default;
  initClaude(Anthropic);
}

function initClaude(Anthropic) {

const CFG_KEY = "tlengquest_api";
function apiCfg() {
  try { return JSON.parse(localStorage.getItem(CFG_KEY)) || {}; } catch { return {}; }
}
function saveApiCfg(c) { localStorage.setItem(CFG_KEY, JSON.stringify(c)); }
function client() {
  const c = apiCfg();
  if (!c.key) return null;
  return new Anthropic({ apiKey: c.key, dangerouslyAllowBrowser: true });
}
const MODEL = () => apiCfg().model || "claude-opus-4-8";

/* ---------- AJUSTES ---------- */
route("ajustes", (el) => {
  const c = apiCfg();
  el.innerHTML = `
  <div class="crumb"><a href="#/">Inicio</a> / Ajustes</div>
  <h1>🔑 Conexión con Claude</h1>
  <div class="card">
    <p>Para el <b>final oral simulado</b> y el <b>profe particular</b> hace falta una API key de
    Anthropic (<a href="https://console.anthropic.com/settings/keys" target="_blank">conseguila acá</a>).
    Se guarda solo en el localStorage de este navegador y las llamadas van directo a la API.</p>
    <div class="flex mt"><input type="text" id="akey" placeholder="sk-ant-…" value="${c.key || ""}"
      style="flex:1;font-family:monospace" autocomplete="off">
    <select id="amodel" style="font:inherit;background:var(--surface2);color:var(--ink);border:1px solid var(--border);border-radius:8px;padding:8px">
      <option value="claude-opus-4-8" ${MODEL() === "claude-opus-4-8" ? "selected" : ""}>Opus 4.8 (mejor examinador)</option>
      <option value="claude-sonnet-5" ${MODEL() === "claude-sonnet-5" ? "selected" : ""}>Sonnet 5 (más barato)</option>
      <option value="claude-haiku-4-5" ${MODEL() === "claude-haiku-4-5" ? "selected" : ""}>Haiku 4.5 (el más barato)</option>
    </select>
    <button class="btn ok" id="asave">Guardar</button></div>
    <p style="color:var(--muted);font-size:.82rem;margin-top:10px">⚠️ No uses esta key en máquinas compartidas. Cada charla consume tokens de tu cuenta.</p>
    <div id="aout"></div>
  </div>`;
  document.getElementById("asave").onclick = async () => {
    const key = document.getElementById("akey").value.trim();
    const model = document.getElementById("amodel").value;
    saveApiCfg({ key, model });
    const out = document.getElementById("aout");
    if (!key) { out.innerHTML = ""; return; }
    out.innerHTML = `<p class="tag cy">probando conexión…</p>`;
    try {
      await client().messages.create({ model, max_tokens: 16, messages: [{ role: "user", content: "decí ok" }] });
      out.innerHTML = `<span class="verdict acc">✅ Conectado — listo para rendir</span>`;
      toast("Claude conectado");
    } catch (e) {
      out.innerHTML = `<span class="verdict rej">❌ ${e.status === 401 ? "API key inválida" : e.message}</span>`;
    }
  };
});

/* ---------- construcción de contexto ---------- */
function docText(id, cap) {
  const d = window.CONTENT && CONTENT[id];
  return d ? d.md.slice(0, cap) : "";
}
const EXAMINERS = {
  becher: {
    name: "Becher", icon: "🧙‍♀️", star: true,
    tag: "⭐ TOMÓ EL ÚLTIMO FINAL — este es el entrenamiento que importa",
    style: `Sos Verónica Becher tomando el final de Teoría de Lenguajes (FCEyN-UBA). Tomá EXACTAMENTE
como ella (patrón y preguntas reales abajo). Sos exigente pero justa y directa; hablás sobrio, sin
adornos. Si dan un algoritmo sin complejidad, SIEMPRE repreguntás "¿y la complejidad de peor caso?".
Si algo es vago, exigís el enunciado formal (cuantificadores en orden).

${(window.BECHER && window.BECHER.patron) || ""}

BANCO DE PREGUNTAS REALES DE BECHER (elegí de acá, o adaptá un parámetro; NO inventes preguntas
de otro estilo). Arrancá el examen con su Ej 1 típico: pedile que demuestre "el teorema que más le
guste", y sobre lo que elija exigí enunciado exacto + demo. Después seguí con algoritmos+complejidad
y algún conteo:
${(window.BECHER && window.BECHER.preguntas || []).map((q, i) => `${i + 1}. ${q}`).join("\n")}` },
  jacobo: {
    name: "Jacobo", icon: "🧙‍♂️",
    tag: "oral clásico en pizarrón",
    style: `Sos Julio Jacobo tomando final oral de Teoría de Lenguajes (FCEyN-UBA). Tu estilo REAL:
demostraciones clásicas de la teórica (equivalencias AFND↔AFD, GR↔AF, pumping regular y LIC,
minimización, pila vacía↔estado final, clausura de LIC). Vas guiando con repreguntas cuando el
estudiante se traba, como en un oral de pizarrón de ~40 minutos. Pedís los enunciados EXACTOS
(cuantificadores en orden) y los pasos clave de cada demo.` },
};

function oralSystem(ex, temaId) {
  const tema = temaId && temaId !== "all" ? docText(temaId, 9000) : "";
  return [{
    type: "text",
    cache_control: { type: "ephemeral" },
    text: `${ex.style}

REGLAS DEL SIMULACRO:
1. Hacé UNA pregunta por vez, corta y concreta, del estilo documentado arriba. Arrancá directo con la primera pregunta.
2. Cuando el estudiante responde: evaluá con honestidad. Si está bien, decilo en una línea y pasá a la siguiente. Si está flojo, repreguntá UNA vez dándole la chance de arreglarlo (como en un oral real).
3. Después de 4 preguntas (o si el estudiante pide cerrar), terminá el examen: escribí exactamente "NOTA: X/10" en una línea, y un feedback directo de 3-5 líneas: qué estuvo bien, qué estuvo mal, y QUÉ REPASAR (con nombre de tema).
4. Escribí en español rioplatense. Matemática en LaTeX con $...$. Sé conciso: esto es un chat, no un apunte.
5. No regales la nota: 10 es solo para respuestas completas con justificación y complejidad. Errores conceptuales graves ⇒ ≤4.

MATERIAL DE LA CURSADA (1C 2024) para basar tus preguntas:
=== Formulario ===
${docText("FORMULARIO", 7000)}
${tema ? `=== Tema elegido por el estudiante ===\n${tema}` : "=== El estudiante eligió: TODOS los temas ==="}`,
  }];
}

function profeSystem(temaId) {
  const tema = temaId && temaId !== "all" ? docText(temaId, 12000) : docText("TRUCOS", 10000);
  return [{
    type: "text",
    cache_control: { type: "ephemeral" },
    text: `Sos un profe particular de Teoría de Lenguajes (FCEyN-UBA) preparando a un estudiante para
el FINAL (cursada 1C 2024). Objetivo: QUE APRUEBE, incluso antes que entender todo en profundidad.
Explicá corto y al pie: la receta, el truco, el error típico que hace perder puntos. Usá ejemplos
mínimos. Español rioplatense, LaTeX con $...$. Si te preguntan algo fuera de la materia, redirigí
al final. Cuando expliques un método, cerrá con "🎯 En el final:" y cómo lo suelen tomar
(Becher pide algoritmo+complejidad; Jacobo pide la demo).

MATERIAL DE REFERENCIA:
${tema}`,
  }];
}

/* ---------- vista de chat genérica ---------- */
let CH = null;

function chatShell(el, { title, sub, backRoute, system, greeting, onEnd }) {
  CH = { messages: [], system, busy: false, onEnd, ended: false };
  el.innerHTML = `
  <div class="crumb"><a href="#/${backRoute}">← volver</a></div>
  <div class="q-head"><div><b>${title}</b><div style="font-size:.8rem;color:var(--muted)">${sub}</div></div>
    <div class="spacer"></div>
    ${onEnd ? '<button class="btn sm warn" id="chend">🏁 Cerrar y pedir nota</button>' : ""}</div>
  <div id="chlog" style="display:flex;flex-direction:column;gap:10px;margin:14px 0;min-height:200px"></div>
  <div class="flex"><input type="text" id="chin" placeholder="tu respuesta…" style="flex:1" maxlength="2000">
    <button class="btn" id="chgo">Enviar</button></div>
  <p style="color:var(--muted);font-size:.78rem;margin-top:6px">${CLI_PROXY ? "vía tu sesión de Claude Code (sin API key)" : `modelo: ${MODEL()} · <a href="#/ajustes">cambiar</a>`}</p>`;
  const log = document.getElementById("chlog");
  const addBubble = (who, html) => {
    const b = document.createElement("div");
    b.style.cssText = `max-width:85%;padding:10px 15px;border-radius:14px;line-height:1.55;${
      who === "yo" ? "align-self:flex-end;background:var(--accent);color:#fff"
                   : "align-self:flex-start;background:var(--surface);border:1px solid var(--border)"}`;
    b.innerHTML = html;
    log.appendChild(b);
    b.scrollIntoView({ behavior: "smooth", block: "end" });
    return b;
  };
  CH.addBubble = addBubble;
  const send = (text) => {
    if (CH.busy || CH.ended) return;
    if (text) { addBubble("yo", text.replace(/</g, "&lt;")); CH.messages.push({ role: "user", content: text }); }
    chatTurn(addBubble);
  };
  document.getElementById("chgo").onclick = () => {
    const i = document.getElementById("chin");
    if (i.value.trim()) { send(i.value.trim()); i.value = ""; }
  };
  document.getElementById("chin").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("chgo").click();
  });
  const endBtn = document.getElementById("chend");
  if (endBtn) endBtn.onclick = () => send("Cerremos acá: dame la NOTA final y el feedback.");
  if (greeting) send(greeting);
}

/* aplana system + historial en un solo prompt de texto (para el CLI) */
function flattenForCLI() {
  const sys = (CH.system && CH.system[0] && CH.system[0].text) || "";
  const lines = CH.messages.map((m) => {
    const txt = typeof m.content === "string" ? m.content
      : (m.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
    return (m.role === "user" ? "ESTUDIANTE: " : "EXAMINADOR: ") + txt;
  });
  const prompt = lines.join("\n\n") + "\n\nEXAMINADOR:";
  return { system: sys, prompt };
}

async function chatTurn(addBubble) {
  CH.busy = true;
  const bubble = addBubble("ai", `<span style="color:var(--muted)">pensando…</span>`);
  try {
    let acc;
    if (CLI_PROXY) {
      // usa tu sesión de Claude Code vía el server (sin API key)
      const { system, prompt } = flattenForCLI();
      const r = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system, prompt }),
      });
      const j = await r.json();
      if (!r.ok || j.error) throw new Error(j.error || ("HTTP " + r.status));
      acc = (j.text || "").trim();
      CH.messages.push({ role: "assistant", content: acc });
    } else {
      const cl = client();
      if (!cl) { bubble.innerHTML = `Falta la API key → <a href="#/ajustes">configurala acá</a> y volvé.`; CH.busy = false; return; }
      const stream = cl.messages.stream({ model: MODEL(), max_tokens: 1500, system: CH.system, messages: CH.messages });
      acc = "";
      stream.on("text", (t) => { acc += t; bubble.textContent = acc; });
      const final = await stream.finalMessage();
      if (final.stop_reason === "refusal") { bubble.textContent = "(me negué a responder eso — probá reformular)"; CH.busy = false; return; }
      acc = final.content.filter((b) => b.type === "text").map((b) => b.text).join("");
      CH.messages.push({ role: "assistant", content: final.content });
    }
    bubble.innerHTML = mdRender(acc);
    katexify(bubble);
    bubble.scrollIntoView({ behavior: "smooth", block: "end" });
    // ¿terminó el examen con nota?
    const m = acc.match(/NOTA:\s*(\d+)\s*\/\s*10/i);
    if (m && CH.onEnd && !CH.ended) { CH.ended = true; CH.onEnd(+m[1]); }
  } catch (e) {
    const auth = Anthropic && e instanceof Anthropic.AuthenticationError;
    const rate = Anthropic && e instanceof Anthropic.RateLimitError;
    bubble.innerHTML = `<span style="color:var(--bad-hi)">⚠️ ${
      auth ? 'API key inválida — <a href="#/ajustes">revisala</a>'
      : rate ? "rate limit: esperá un toque y reintentá"
      : (e.message || e)}</span>`;
  }
  CH.busy = false;
}

/* ---------- FINAL ORAL SIMULADO (foco: Becher) ---------- */
route("oral", (el, [exId, temaId]) => {
  if (!exId) {
    el.innerHTML = `
    <div class="crumb"><a href="#/">Inicio</a> / Final simulado</div>
    <h1>🎤 Final oral simulado</h1>
    <p style="color:var(--ink2)">Claude te toma el final CON EL ESTILO REAL de la tomadora, usando sus
    preguntas de finales reales. Repreguntas, y una NOTA honesta con qué repasar. XP = nota × 10.</p>
    <div class="card click mb" style="border-color:var(--warn);background:linear-gradient(135deg,var(--surface),rgba(217,119,6,.12))" onclick="go('oral/becher')">
      <div class="flex"><span style="font-size:2.8rem">🧙‍♀️</span>
        <div><span class="tag hot">⭐ TOMÓ EL ÚLTIMO FINAL</span>
          <h2 style="margin:.2em 0">Rendir con Becher</h2>
          <p style="color:var(--warn-hi);margin:0">Algoritmos + <b>correctitud</b> + <b>complejidad</b>, conteo de autómatas, "demostrá el teorema que quieras". Con su banco de preguntas reales.</p></div>
        <div class="spacer"></div><span class="btn warn">▶ Empezar</span></div>
    </div>
    <p style="color:var(--muted);font-size:.85rem">¿Te llega a tomar otro?
      <a href="#/oral/jacobo">Rendir con Jacobo</a> (demos de la teórica, estilo pizarrón).</p>
    ${(!CLI_PROXY && !apiCfg().key) ? `<div class="card mt" style="border-color:var(--warn)"><b>🔑 Falta conectar Claude</b> — <a href="#/ajustes">poné tu API key acá</a> (2 min).</div>` : CLI_PROXY ? `<div class="card mt" style="border-color:var(--ok)"><b>✅ Usando tu sesión de Claude Code</b> — sin API key.</div>` : ""}`;
    return;
  }
  const ex = EXAMINERS[exId];
  if (!ex) { go("oral"); return; }
  if (!temaId) {
    el.innerHTML = `
    <div class="crumb"><a href="#/oral">← elegir tomador</a></div>
    <h1>${ex.icon} Final con ${ex.name}</h1>
    <p style="color:var(--ink2)">¿Sobre qué te toma?</p>
    <div class="grid c3">
      <div class="card click" onclick="go('oral/${exId}/all')"><h3>🎲 Todo el programa</h3><span class="tag hot">modo final real</span></div>
      ${TEMAS.map((t) => `<div class="card click" onclick="go('oral/${exId}/${t.id}')">
        <h3 style="font-size:.95rem">${t.icon} ${t.name}</h3></div>`).join("")}
    </div>`;
    return;
  }
  chatShell(el, {
    title: `${ex.icon} Final simulado con ${ex.name}${ex.star ? " ⭐" : ""}`,
    sub: ex.tag, backRoute: "oral",
    system: oralSystem(ex, temaId),
    greeting: "Hola, vengo a rendir el final. Estoy listo/a.",
    onEnd: (nota) => {
      State.addXP(nota * 10, `final simulado: ${nota}/10`);
      if (nota >= 7) party();
      State.d.oralBest = Math.max(State.d.oralBest || 0, nota); State.save();
      CH.addBubble("ai", `<b>${nota >= 7 ? "🎓 ¡APROBADO en el simulacro!" : "📖 Todavía no llega al 4… a repasar y volver."}</b> (+${nota * 10} XP) — <a href="#/oral">otro intento</a> · <a href="#/camino">al camino</a>`);
    },
  });
});

/* ---------- PROFE PARTICULAR ---------- */
route("profe", (el, [temaId]) => {
  if (!temaId) {
    el.innerHTML = `
    <div class="crumb"><a href="#/">Inicio</a> / Profe</div>
    <h1>👨‍🏫 Profe particular</h1>
    <p style="color:var(--ink2)">Preguntale lo que no entiendas. Responde corto, con el truco y cómo lo toman en el final.</p>
    <div class="grid c3">
      <div class="card click" onclick="go('profe/all')"><h3>🎩 Dudas generales</h3><span class="tag">con los trucos a mano</span></div>
      ${TEMAS.map((t) => `<div class="card click" onclick="go('profe/${t.id}')">
        <h3 style="font-size:.95rem">${t.icon} ${t.name}</h3></div>`).join("")}
    </div>
    ${(!CLI_PROXY && !apiCfg().key) ? `<div class="card mt" style="border-color:var(--warn)"><b>🔑 Falta conectar Claude</b> — <a href="#/ajustes">poné tu API key acá</a>.</div>` : ""}`;
    return;
  }
  const t = TEMA_BY_ID[temaId];
  chatShell(el, {
    title: `👨‍🏫 Profe — ${t ? t.name : "dudas generales"}`,
    sub: "explica corto y orientado a aprobar", backRoute: "profe",
    system: profeSystem(temaId),
    greeting: null,
  });
  // el profe espera tu pregunta: mensaje local sin API
  CH.busy = false;
  document.getElementById("chlog").innerHTML = "";
  CH.addBubble("ai", `¿Qué querés que te explique${t ? ` de <b>${t.name}</b>` : ""}? Tirame la duda como te salga.`);
}
);

  /* si entraste directo a una ruta de este módulo, re-renderizar ahora que existe */
  if (["oral", "profe", "ajustes"].includes((location.hash.replace(/^#\/?/, "").split("/")[0] || ""))) render();
} /* fin initClaude */
