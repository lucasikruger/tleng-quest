/* ===== Tleng Quest — simulador AFD, duelo de pumping, mapa de Chomsky ===== */

/* ---------- SIMULADOR DE AFD ---------- */
/* presets: states [{id,x,y,final}], initial, delta {state:{sym:state}}, edges para dibujar */
const MACHINES = [
  {
    id: "par0", name: "Cantidad PAR de ceros", sigma: "01",
    desc: "El clásico de paridad: el estado recuerda si viste una cantidad par o impar de 0s. Acepta cadenas con #0 par (incluida λ).",
    states: [{ id: "q0", x: 180, y: 110, final: true }, { id: "q1", x: 420, y: 110 }],
    initial: "q0",
    delta: { q0: { 0: "q1", 1: "q0" }, q1: { 0: "q0", 1: "q1" } },
    edges: [
      { f: "q0", t: "q1", lbl: "0", curve: -34 }, { f: "q1", t: "q0", lbl: "0", curve: -34 },
      { f: "q0", t: "q0", lbl: "1", loop: true }, { f: "q1", t: "q1", lbl: "1", loop: true }],
    try: ["0110", "010", "1111", "00"],
  },
  {
    id: "mod3", name: "Múltiplo de 3 (binario)", sigma: "01",
    desc: "Regla de Horner: el estado es el resto mod 3; con cada bit b el resto pasa a (2·r+b) mod 3. Acepta si el número es ≡ 0 (mod 3).",
    states: [{ id: "r0", x: 130, y: 110, final: true }, { id: "r1", x: 300, y: 110 }, { id: "r2", x: 470, y: 110 }],
    initial: "r0",
    delta: { r0: { 0: "r0", 1: "r1" }, r1: { 0: "r2", 1: "r0" }, r2: { 0: "r1", 1: "r2" } },
    edges: [
      { f: "r0", t: "r0", lbl: "0", loop: true }, { f: "r0", t: "r1", lbl: "1", curve: -30 },
      { f: "r1", t: "r0", lbl: "1", curve: -30 }, { f: "r1", t: "r2", lbl: "0", curve: -30 },
      { f: "r2", t: "r1", lbl: "0", curve: -30 }, { f: "r2", t: "r2", lbl: "1", loop: true }],
    try: ["110", "1001", "111", "1010"],
  },
  {
    id: "c000", name: "Contiene la subcadena 000", sigma: "01",
    desc: "El estado cuenta cuántos 0s seguidos llevás (0, 1, 2) y q3 es el pozo de aceptación: una vez que viste 000, quedás ahí.",
    states: [{ id: "q0", x: 100, y: 110 }, { id: "q1", x: 250, y: 110 }, { id: "q2", x: 400, y: 110 }, { id: "q3", x: 545, y: 110, final: true }],
    initial: "q0",
    delta: { q0: { 0: "q1", 1: "q0" }, q1: { 0: "q2", 1: "q0" }, q2: { 0: "q3", 1: "q0" }, q3: { 0: "q3", 1: "q3" } },
    edges: [
      { f: "q0", t: "q1", lbl: "0" }, { f: "q1", t: "q2", lbl: "0" }, { f: "q2", t: "q3", lbl: "0" },
      { f: "q0", t: "q0", lbl: "1", loop: true }, { f: "q1", t: "q0", lbl: "1", curve: 45 },
      { f: "q2", t: "q0", lbl: "1", curve: 62 }, { f: "q3", t: "q3", lbl: "0,1", loop: true }],
    try: ["10001", "0101", "11000", "010010"],
  },
  {
    id: "fin01", name: "Termina en 01", sigma: "01",
    desc: "El estado recuerda el sufijo útil: ¿lo último fue un 0 suelto? ¿o ya cerraste un 01? Ejemplo típico de 'recordar lo justo'.",
    states: [{ id: "q0", x: 130, y: 110 }, { id: "q1", x: 300, y: 110 }, { id: "q2", x: 470, y: 110, final: true }],
    initial: "q0",
    delta: { q0: { 0: "q1", 1: "q0" }, q1: { 0: "q1", 1: "q2" }, q2: { 0: "q1", 1: "q0" } },
    edges: [
      { f: "q0", t: "q1", lbl: "0", curve: -26 }, { f: "q1", t: "q2", lbl: "1", curve: -26 },
      { f: "q0", t: "q0", lbl: "1", loop: true }, { f: "q1", t: "q1", lbl: "0", loop: true },
      { f: "q2", t: "q1", lbl: "0", curve: -26 }, { f: "q2", t: "q0", lbl: "1", curve: 60 }],
    try: ["1101", "0101", "0110", "01"],
  },
];

let SIM = null;

route("sim", (el, [mid]) => {
  const m = MACHINES.find((x) => x.id === mid) || MACHINES[0];
  SIM = { m, w: "", pos: -1, cur: m.initial, playing: null };
  el.innerHTML = `
  <div class="crumb"><a href="#/">Inicio</a> / <a href="#/arcade">Arcade</a> / Simulador</div>
  <h1>⚙️ Simulador de AFD</h1>
  <div class="chips">${MACHINES.map((x) =>
    `<span class="chip ${x.id === m.id ? "on" : ""}" onclick="go('sim/${x.id}')">${x.name}</span>`).join("")}</div>
  <div class="card"><p style="color:var(--ink2);margin-top:0">${m.desc}</p>
    <svg class="simsvg" viewBox="0 0 640 230" id="simsvg"></svg>
    <div class="flex mt">
      <input type="text" id="simw" placeholder="Cadena sobre {${m.sigma.split("").join(",")}}" maxlength="24">
      <button class="btn sm" id="simgo">▶ Correr</button>
      <button class="btn sm ghost" id="simstep">Paso a paso ⏭</button>
      <div class="spacer"></div>
      ${m.try.map((w) => `<span class="chip" data-w="${w}">${w}</span>`).join("")}
    </div>
    <div class="tape" id="simtape"></div>
    <div id="simver"></div>
  </div>
  <div class="card mt"><b>Cómo leerlo:</b> <span style="color:var(--ink2)">→ marca el estado inicial, el
  doble círculo los finales. El estado prendido es donde está parado el autómata. La cadena se acepta
  ⟺ al terminar de leerla estás parado en un final.</span></div>`;
  drawMachine();
  el.querySelectorAll(".chip[data-w]").forEach((c) =>
    c.addEventListener("click", () => { document.getElementById("simw").value = c.dataset.w; runSim(true); }));
  document.getElementById("simgo").onclick = () => runSim(true);
  document.getElementById("simstep").onclick = () => runSim(false);
  document.getElementById("simw").addEventListener("keydown", (e) => { if (e.key === "Enter") runSim(true); });
});

function drawMachine() {
  const { m, cur } = SIM;
  const svg = document.getElementById("simsvg");
  if (!svg) return;
  const R = 26;
  let g = `<defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
    <path d="M0,0 L9,4.5 L0,9 z" fill="#6b7089"/></marker></defs>`;
  m.edges.forEach((e) => {
    const a = m.states.find((s) => s.id === e.f), b = m.states.find((s) => s.id === e.t);
    if (e.loop) {
      g += `<path class="tr" d="M ${a.x - 12} ${a.y - R + 4} C ${a.x - 30} ${a.y - R - 42}, ${a.x + 30} ${a.y - R - 42}, ${a.x + 12} ${a.y - R + 4}"/>
            <text class="edge" x="${a.x}" y="${a.y - R - 34}" text-anchor="middle">${e.lbl}</text>`;
    } else {
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
      const ux = dx / d, uy = dy / d;
      const x1 = a.x + ux * R, y1 = a.y + uy * R, x2 = b.x - ux * (R + 4), y2 = b.y - uy * (R + 4);
      const c = e.curve || 0;
      const mx = (x1 + x2) / 2 - uy * c, my = (y1 + y2) / 2 + ux * c;
      g += `<path class="tr" d="M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}"/>
            <text class="edge" x="${mx}" y="${my + (c >= 0 ? 16 : -7)}" text-anchor="middle">${e.lbl}</text>`;
    }
  });
  m.states.forEach((s) => {
    const isCur = s.id === cur;
    if (s.id === m.initial)
      g += `<line class="tr" x1="${s.x - 74}" y1="${s.y}" x2="${s.x - R - 6}" y2="${s.y}"/>`;
    g += `<circle class="st ${isCur ? "cur" : ""}" cx="${s.x}" cy="${s.y}" r="${R}"/>`;
    if (s.final) g += `<circle cx="${s.x}" cy="${s.y}" r="${R - 5}" fill="none" stroke="${isCur ? "#22d3ee" : "#6b7089"}" stroke-width="1.6"/>`;
    g += `<text x="${s.x}" y="${s.y + 5}" text-anchor="middle">${s.id}</text>`;
  });
  svg.innerHTML = g;
}

function runSim(auto) {
  const { m } = SIM;
  const w = document.getElementById("simw").value.trim();
  const bad = [...w].find((c) => !m.sigma.includes(c));
  const ver = document.getElementById("simver");
  if (bad !== undefined) { ver.innerHTML = `<span class="verdict rej">símbolo '${bad}' fuera de Σ</span>`; return; }
  if (SIM.playing) clearInterval(SIM.playing);
  // si es paso a paso y la cadena es la misma, avanza uno; si no, reinicia
  if (!auto && SIM.w === w && SIM.pos < w.length - 1) { SIM.pos++; SIM.cur = m.delta[SIM.cur][w[SIM.pos]]; paint(); return; }
  SIM.w = w; SIM.pos = -1; SIM.cur = m.initial; paint();
  if (auto) {
    SIM.playing = setInterval(() => {
      if (SIM.pos >= w.length - 1) { clearInterval(SIM.playing); SIM.playing = null; return; }
      SIM.pos++; SIM.cur = m.delta[SIM.cur][w[SIM.pos]]; paint();
    }, 550);
  }
  function paint() {
    drawMachine();
    document.getElementById("simtape").innerHTML = [...SIM.w].map((c, i) =>
      `<span class="${i < SIM.pos ? "done" : i === SIM.pos ? "cur" : ""}">${c}</span>`).join("") ||
      `<span class="cur">λ</span>`;
    const fin = SIM.pos >= SIM.w.length - 1;
    if (fin) {
      const acc = m.states.find((s) => s.id === SIM.cur).final;
      ver.innerHTML = `<span class="verdict ${acc ? "acc" : "rej"}">${acc ? "✅ ACEPTA" : "❌ RECHAZA"} — terminó en ${SIM.cur}</span>`;
    } else ver.innerHTML = "";
  }
  const ver2 = ver; // keep ref
}

/* ---------- DUELO DE PUMPING ---------- */
/* rondas guiadas con datos concretos */
const PUMP = [
  {
    lang: "L = \\{a^nb^n : n \\ge 0\\}", intro: "El clásico. El adversario fija $p=4$.",
    p: 4,
    zs: [
      { z: "a^4b^4", ok: true, why: "Perfecta: está en L, mide ≥ p, y el prefijo $a^4$ fuerza que $v$ sean solo aes." },
      { z: "a^2b^2", ok: false, why: "Mide 4 = p, pero el prefijo de aes es corto: no forzás dónde cae $v$… y peor, con cadenas chicas el adversario tiene más chances." },
      { z: "abab", ok: false, why: "¡Ni siquiera está en L! La testigo SIEMPRE tiene que pertenecer al lenguaje." },
    ],
    decomp: "El adversario responde: $u=a$, $v=aa$, $w=ab^4$ (respetando $|uv|\\le 4$, $|v|\\ge 1$).",
    is: [
      { i: 2, ok: true, why: "$uv^2w = a^{6}b^4$: 6 aes vs 4 bes → fuera de L. 💥" },
      { i: 1, ok: false, why: "$uv^1w = z \\in L$. Bombear con $i=1$ NUNCA sirve: te devuelve la cadena original." },
      { i: 0, ok: true, why: "$uv^0w = a^{2}b^4$: 2 aes vs 4 bes → fuera de L. También gana. 💥" },
    ],
    moral: "Con prefijo $a^p$, $v$ es solo aes ⇒ cualquier $i \\ne 1$ desbalancea. L NO es regular.",
  },
  {
    lang: "L = \\{w \\in \\{a,b\\}^* : |w|_a = |w|_b\\}", intro: "Igual cantidad de aes y bes. $p=3$.",
    p: 3,
    zs: [
      { z: "a^3b^3", ok: true, why: "En L, larga, y el prefijo $a^3$ fuerza $v=a^t$. Lista para romper." },
      { z: "ababab", ok: false, why: "Está en L pero el prefijo mezcla aes y bes: el adversario puede elegir $v=ab$ ¡y bombearte dentro de L para siempre!" },
      { z: "aabb", ok: false, why: "Está en L pero mide 4 y el prefijo de aes mide 2 < p: el adversario puede colar una b en $v$." },
    ],
    decomp: "Adversario: $u=\\lambda$, $v=a$, $w=a^2b^3$.",
    is: [
      { i: 0, ok: true, why: "$uv^0w = a^2b^3$: 2 ≠ 3 → fuera de L. 💥" },
      { i: 1, ok: false, why: "Es la cadena original, sigue en L." },
      { i: 3, ok: true, why: "$uv^3w = a^5b^3$: 5 ≠ 3 → fuera. También sirve." },
    ],
    moral: "Mismo esqueleto que $a^nb^n$: el truco del prefijo es EL truco.",
  },
  {
    lang: "L = \\{w : ||w|_a - |w|_b| \\le 1\\}", intro: "⚠️ Lenguaje con TOLERANCIA: se banca diferencia 1. $p=3$.",
    p: 3,
    zs: [
      { z: "a^3b^3", ok: true, why: "En L (diferencia 0), larga, prefijo de aes. Bien." },
      { z: "a^4b^3", ok: true, why: "También vale (diferencia 1 ∈ L) y el prefijo fuerza $v=a^t$. Doble filo: arrancás ya al borde." },
      { z: "ab", ok: false, why: "Mide 2 < p. No es bombeable con garantías." },
    ],
    decomp: "Adversario (para $z=a^3b^3$): $u=\\lambda$, $v=a$, $w=a^2b^3$ — o sea $t=1$, el peor caso para vos.",
    is: [
      { i: 2, ok: false, why: "$uv^2w = a^4b^3$: diferencia 1… ¡SIGUE EN L! La tolerancia te comió el golpe. Este es EL error clásico." },
      { i: 4, ok: true, why: "$uv^4w = a^6b^3$: diferencia 3 > 1 → fuera. Con margen, hay que pegar más fuerte. 💥" },
      { i: 0, ok: false, why: "$uv^0w = a^2b^3$: diferencia 1 → sigue en L. Tampoco alcanza." },
    ],
    moral: "Si el lenguaje tolera diferencia $d$, elegí $i$ tal que la diferencia generada supere $d$ PARA TODO $t\\ge1$ posible.",
  },
  {
    lang: "L = \\{a^{2^n} : n \\ge 0\\}", intro: "Potencias de 2. $p=4$.",
    p: 4,
    zs: [
      { z: "a^{16}", ok: true, why: "$16 = 2^4 = 2^p$: está en L y es enorme comparada con lo que $v$ puede agregar. Justo lo que querés." },
      { z: "a^4", ok: false, why: "$4=2^2$ está en L y mide p… pero es chica: $16$ deja al adversario sin escapatoria, $4$ no siempre." },
      { z: "a^{15}", ok: false, why: "15 no es potencia de 2: no está en L." },
    ],
    decomp: "Adversario: $u=a$, $v=a^2$, $w=a^{13}$ (o sea $t=2\\le p$).",
    is: [
      { i: 2, ok: true, why: "$|uv^2w| = 16+2 = 18$. Pero $2^4=16 < 18 < 32=2^5$: entre dos potencias consecutivas no hay nada → fuera de L. 💥 (Vale para todo $t\\le p$: $16 < 16+t \\le 20 < 32$.)" },
      { i: 1, ok: false, why: "Cadena original. En L." },
      { i: 0, ok: false, why: "$16-t$ con $1\\le t\\le 4$ da 12..15 — ninguno es potencia de 2, ¡así que también ganarías! …pero ojo: para $t$ chico hay que justificarlo igual. En este duelo la jugada limpia es $i=2$ con el argumento del hueco entre potencias." },
    ],
    moral: "Para crecimientos no lineales: bombeá al hueco entre dos valores consecutivos del lenguaje.",
  },
];

let PD = null;

route("pumping", (el, [ri]) => {
  const r = +(ri || 0);
  if (r >= PUMP.length) {
    if (!State.d.pumpWin) { State.d.pumpWin = 1; State.save(); State.addXP(40, "duelo de pumping ganado"); }
    el.innerHTML = `<div class="center" style="padding-top:50px"><h1>🏅 Duelo completado</h1>
    <p>Ya sabés elegir $z$ e $i$ como campeón. Ahora andá por el <a href="#/doc/03_pumping_regular">guion completo</a>.</p>
    <a class="btn" href="#/pumping/0">🔁 Jugar de nuevo</a> <a class="btn ghost" href="#/camino">🗺️ al camino</a></div>`;
    katexify(el); party(); return;
  }
  const P = PUMP[r];
  PD = { r, phase: 0 };
  el.innerHTML = `
  <div class="crumb"><a href="#/arcade">Arcade</a> / Duelo de Pumping</div>
  <div class="q-head"><span class="tag">ronda ${r + 1} / ${PUMP.length}</span>
    <span class="tag hot">🎈 pumping</span></div>
  <div class="card">
    <h3>$${P.lang}$</h3><p style="color:var(--ink2)">${P.intro} Regla: $|z|\\ge p$, $|uv|\\le p$, $|v|\\ge 1$, y vos elegís $z$ y después $i$.</p>
    <div id="pd"></div>
  </div>`;
  katexify(el);
  pdPhase(P);
});

function pdPhase(P) {
  const box = document.getElementById("pd");
  if (PD.phase === 0) {
    box.innerHTML = `<h3>1️⃣ Elegí tu cadena testigo $z$:</h3>
      ${shuffle(P.zs).map((z, i) => `<button class="q-opt" data-i="${P.zs.indexOf(z)}">$z = ${z.z}$</button>`).join("")}
      <div id="pdfoot"></div>`;
    katexify(box);
    box.querySelectorAll(".q-opt").forEach((b) => b.onclick = () => {
      const z = P.zs[+b.dataset.i];
      box.querySelectorAll(".q-opt").forEach((x) => (x.disabled = true));
      b.classList.add(z.ok ? "sel-ok" : "sel-bad");
      if (!z.ok) P.zs.filter((x) => x.ok).forEach(() => {});
      document.getElementById("pdfoot").innerHTML = `
        <div class="q-explain">${z.ok ? "✅" : "❌"} ${z.why}</div>
        <div class="center mt"><button class="btn" id="pdnext">${z.ok ? "El adversario descompone… →" : "Reintentar"}</button></div>`;
      katexify(document.getElementById("pdfoot"));
      document.getElementById("pdnext").onclick = () => {
        if (z.ok) { State.addXP(10, "z correcta"); PD.phase = 1; }
        pdPhase(P);
      };
    });
  } else if (PD.phase === 1) {
    box.innerHTML = `<div class="q-explain" style="border-color:var(--violet)">😈 ${P.decomp}</div>
      <h3 class="mt">2️⃣ Elegí el $i$ que lo rompe:</h3>
      ${shuffle(P.is).map((x) => `<button class="q-opt" data-i="${P.is.indexOf(x)}">$i = ${x.i}$</button>`).join("")}
      <div id="pdfoot"></div>`;
    katexify(box);
    box.querySelectorAll(".q-opt").forEach((b) => b.onclick = () => {
      const x = P.is[+b.dataset.i];
      box.querySelectorAll(".q-opt").forEach((o) => (o.disabled = true));
      b.classList.add(x.ok ? "sel-ok" : "sel-bad");
      document.getElementById("pdfoot").innerHTML = `
        <div class="q-explain">${x.ok ? "💥" : "🛡️"} ${x.why}</div>
        ${x.ok ? `<div class="q-explain" style="border-color:var(--ok)"><b>Moraleja:</b> ${P.moral}</div>` : ""}
        <div class="center mt"><button class="btn" id="pdnext">${x.ok ? "Siguiente ronda →" : "Reintentar"}</button></div>`;
      katexify(document.getElementById("pdfoot"));
      document.getElementById("pdnext").onclick = () => {
        if (x.ok) { State.addXP(15, "lenguaje roto 🎈"); go("pumping/" + (PD.r + 1)); }
        else pdPhase(P);
      };
    });
  }
}

/* ---------- MAPA DE CHOMSKY ---------- */
const CHOMSKY = [
  { id: "re", name: "Recursivamente enumerable (Tipo 0)", color: "#2e3140",
    rec: "Máquina de Turing", gram: "Sin restricciones", pump: "—",
    ej: "$\\{\\langle M,w\\rangle : M \\text{ acepta } w\\}$",
    notas: "Acá vive todo lo computable. La pertenencia puede no terminar (semidecidible)." },
  { id: "sc", name: "Sensible al contexto (Tipo 1)", color: "#3a2f55",
    rec: "Autómata linealmente acotado", gram: "$\\alpha A \\beta \\to \\alpha\\gamma\\beta$ (no acorta)",
    pump: "—", ej: "$\\{a^nb^nc^n\\}$, $\\{ww\\}$",
    notas: "Todo LSC es recursivo (la pertenencia SIEMPRE termina). Pregunta clásica de Jacobo." },
  { id: "cf", name: "Libre de contexto (Tipo 2)", color: "#432c6b",
    rec: "Autómata de pila (no determinístico)", gram: "GLC: $A \\to \\alpha$",
    pump: "$z=uvwxy$ — bombeás $v$ y $x$ a la vez", ej: "palíndromos, $\\{ww^r\\}$, Dyck",
    notas: "Cerrado por ∪, ·, *, reverso, ∩ con regular. NO cerrado por ∩ ni complemento. Pertenencia: CYK $O(n^3)$." },
  { id: "det", name: "LIC determinístico (LR)", color: "#1c4a63",
    rec: "AP determinístico", gram: "Gramáticas LR(k)",
    pump: "(el de LIC)", ej: "$\\{a^nb^n\\}$, $\\{w\\#w^r\\}$, lenguajes de programación",
    notas: "Acá parsea un compilador. Complemento SÍ cerrado. Palíndromos sin # quedan AFUERA: hay que adivinar el centro." },
  { id: "reg", name: "Regular (Tipo 3)", color: "#0e5666",
    rec: "AFD = AFND = AFND-λ", gram: "GR: $A \\to aB \\mid \\lambda$ (o ER)",
    pump: "$z=uvw$ — bombeás $v$", ej: "$(ab)^*$, paridad, 'contiene 000', mod k",
    notas: "El paraíso: TODO es decidible (vacío, infinitud, equivalencia) y cierra por todo (∪, ∩, complemento, reverso…)." },
];

route("chomsky", (el) => {
  el.innerHTML = `
  <div class="crumb"><a href="#/">Inicio</a> / <a href="#/arcade">Arcade</a> / Mapa</div>
  <h1>🗺️ Mapa de Chomsky</h1>
  <p style="color:var(--ink2)">Tocá cada nivel. Cada anillo CONTIENE estrictamente al de adentro
  (Regular ⊊ LIC-det ⊊ LIC ⊊ Sensible ⊊ RE).</p>
  <div class="grid c2">
    <svg class="simsvg" viewBox="0 0 460 420" id="chsvg" style="max-width:460px">
      ${CHOMSKY.map((c, i) => {
        const pad = i * 38;
        return `<rect data-id="${c.id}" x="${14 + pad}" y="${14 + pad}" rx="${26 - i * 3}"
          width="${432 - 2 * pad}" height="${392 - 2 * pad}"
          fill="${c.color}" stroke="#4a4e63" stroke-width="1.4" style="cursor:pointer"/>`;
      }).join("")}
      ${CHOMSKY.map((c, i) => {
        const pad = i * 38;
        return `<text data-id="${c.id}" x="230" y="${38 + pad}" text-anchor="middle"
          style="cursor:pointer;font-size:13px;font-weight:700;fill:#e8eaf2">${c.name.split(" (")[0]}</text>`;
      }).join("")}
    </svg>
    <div class="card" id="chinfo"><p style="color:var(--ink2)">👈 Elegí un nivel del mapa.</p></div>
  </div>`;
  const info = document.getElementById("chinfo");
  document.querySelectorAll("#chsvg [data-id]").forEach((n) =>
    n.addEventListener("click", () => {
      if (!State.d.sawChomsky) { State.d.sawChomsky = 1; State.save(); }
      const c = CHOMSKY.find((x) => x.id === n.dataset.id);
      document.querySelectorAll("#chsvg rect").forEach((r) =>
        r.setAttribute("stroke", r.dataset.id === c.id ? "#22d3ee" : "#4a4e63"));
      document.querySelectorAll("#chsvg rect").forEach((r) =>
        r.setAttribute("stroke-width", r.dataset.id === c.id ? "3" : "1.4"));
      info.innerHTML = `<h3>${c.name}</h3>
        <p><b>Lo reconoce:</b> ${c.rec}</p>
        <p><b>Lo genera:</b> ${c.gram}</p>
        <p><b>Pumping:</b> ${c.pump}</p>
        <p><b>Ejemplos:</b> ${c.ej}</p>
        <blockquote>${c.notas}</blockquote>`;
      katexify(info);
    }));
});
