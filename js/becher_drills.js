/* ===== Tleng Quest — Modo Becher: drills de algoritmo+complejidad+conteo =====
   Ejercicios al estilo REAL de Becher, con respuesta modelo. Se revelan y se
   marcan como "lo sé". Cada drill dominado = +15 XP; completar un set = misión de isla. */

const BECHER_DRILLS = {
  "02": { title: "⚙️ Autómatas finitos — estilo Becher", items: [
    { q: "Dar un algoritmo que decida si dos AFD reconocen el mismo lenguaje. Justificar y dar la complejidad.",
      a: "Construí el **AFD producto** para la diferencia simétrica $(L_1\\cap L_2^c)\\cup(L_1^c\\cap L_2)$ y testeá **vacuidad** (¿algún estado final alcanzable desde el inicial? BFS/DFS). $L_1=L_2 \\iff$ la diferencia simétrica es vacía.\n\n**Complejidad:** producto $O(|Q_1||Q_2||\\Sigma|)$, vacuidad lineal en el producto. (Alternativa: minimizar ambos y comparar isomorfismo, $O(n\\log n)$ con Hopcroft; o Hopcroft–Karp con union-find, casi lineal.)" },
    { q: "Dar un algoritmo que decida si el lenguaje de un AF dado es Σ*. (Dos algoritmos distintos — es un Ej de Becher.)",
      a: "**(1) Por complemento+vacuidad:** determinizá y completá el AFD, invertí finales (complemento) y testeá vacuidad. $L=\\Sigma^* \\iff L^c=\\varnothing$.\n**(2) Por minimización:** minimizá el AFD; $L=\\Sigma^*$ ⟺ el mínimo es el autómata de **un solo estado final** con bucles en todo $\\Sigma$.\n\n**Complejidad:** determinización $O(2^n)$ peor caso; si ya es AFD, todo poly." },
  ]},
  "03": { title: "🎈 Decisión sobre regulares — estilo Becher", items: [
    { q: "Dar un algoritmo que determine si un lenguaje regular (dado por un AFD de n estados) es INFINITO. Justificar y dar complejidad.",
      a: "Podá el AFD a estados **útiles** (accesibles desde $q_0$ y coaccesibles a un final). $L$ es **infinito** ⟺ el subgrafo de estados útiles tiene un **ciclo**. Equivalente: ⟺ $M$ acepta alguna cadena $w$ con $n\\le|w|<2n$ (pumping da la cota).\n\n**Complejidad:** $O(|Q|+|\\delta|)$ — poda + detección de ciclo (DFS)." },
    { q: "Dar un algoritmo que decida si L(M)=∅ para un AFD M de n estados, y su complejidad.",
      a: "$L(M)=\\varnothing \\iff$ **ningún estado final es alcanzable** desde $q_0$. BFS/DFS desde $q_0$. Equivale a: $\\nexists w,\\ |w|<n$ aceptada.\n\n**Complejidad:** $O(|Q|+|\\delta|)$ lineal." },
  ]},
  "04": { title: "✳️ Expresiones regulares — estilo Becher", items: [
    { q: "Dar un algoritmo que decida si dos EXPRESIONES REGULARES denotan el mismo lenguaje. Justificar la correctitud y dar la complejidad de peor caso. (Ej 1 del entrenamiento jun-2024.)",
      a: "Cada ER → AFND-λ por **Thompson** ($O(|r|)$), luego **determinizá** cada uno y decidí equivalencia de los AFD (diferencia simétrica + vacuidad, o minimizar y comparar).\n\n**Correctitud:** Thompson preserva el lenguaje; la equivalencia de AFD es exacta.\n**Complejidad:** la **determinización es exponencial** en el peor caso ($O(2^{|r|})$) — de hecho decidir equivalencia de ERs es **PSPACE-completo**. Con los AFD ya construidos, la comparación es polinomial." },
  ]},
  "05": { title: "🪓 Minimización — estilo Becher", items: [
    { q: "Demostrar: si un AF es determinístico, accesible, coaccesible y CO-determinístico, entonces es mínimo. Y mostrar que la recíproca NO siempre vale.",
      a: "**Idea (⇒):** codeterminístico = único final y sin dos aristas con el mismo símbolo entrando al mismo estado ⟹ el **reverso** es determinístico. Si $M$ es accesible, coaccesible y su reverso determinístico y accesible, por **Brzozowski** el resultado es mínimo; determinístico+accesible+coaccesible+codeterminístico cumple justo eso ⟹ no hay dos estados equivalentes.\n**Recíproca falsa:** el AFD mínimo de $\\{\\lambda,a\\}$ tiene **dos** estados finales ⟹ no es codeterminístico, pero es mínimo. (Otro: el mínimo de $(ab)^*ac\\mid(ab)^*bc$.)" },
    { q: "Demostrar que la determinización del REVERSO de un AFD es mínima (y dar un ejemplo).",
      a: "Es la mitad de **Brzozowski**: si $A$ es un AFD accesible, entonces $\\det(\\text{rev}(A))$ (determinización por subconjuntos del reverso, tomando solo estados accesibles) es el **AFD mínimo** de $\\text{rev}(L(A))$. Razón: los estados accesibles de esa determinización corresponden a clases de Myhill–Nerode distintas.\n**Ejemplo:** tomá un AFD chico, revertilo (invertí flechas, inicial↔finales) y determinizalo: sale el mínimo del lenguaje reverso." },
  ]},
  "07": { title: "🥞 Autómatas de pila — estilo Becher", items: [
    { q: "Dado un AFD A y un AP determinístico P, dar un algoritmo que decida si L(A)∩L(P) es FINITO. Justificar y dar complejidad.",
      a: "$L(A)\\cap L(P)$ es **LIC** (intersección de regular con LIC): construí el **AP producto** $A\\times P$ (simula ambos, la pila la lleva $P$). Pasalo a **GLC** y decidí **finitud de la GLC**: sacá símbolos inútiles y buscá un **ciclo** en el grafo de dependencias entre no terminales útiles (o usá que es finito ⟺ no hay $w$ con $n\\le|w|<2n$, cota de pumping LIC).\n\n**Complejidad:** producto $O(|Q_A||Q_P|)$; conversión a GLC y análisis de finitud, polinomial en el tamaño de la gramática." },
    { q: "Dar un algoritmo que decida si un AP DETERMINÍSTICO reconoce Σ*.",
      a: "Los LIC **determinísticos** son cerrados por **complemento** (Teo 10.1): construí el APD del complemento (cuidando estados de rechazo por pila vacía / loops-λ), y decidí **vacuidad** de ese complemento. $L=\\Sigma^* \\iff L^c=\\varnothing$. (Solución del curso: Lema 8.6, Aho–Ullman Vol 1.)" },
  ]},
  "08": { title: "🌳 GLC: decisión — estilo Becher", items: [
    { q: "Dar un algoritmo de pertenencia w∈L(G) para una GLC, y su complejidad.",
      a: "Pasá $G$ a **Forma Normal de Chomsky** y corré **CYK** (programación dinámica: $T[i][j]$ = no terminales que generan $w_{i..j}$).\n\n**Complejidad:** $O(n^3\\cdot|G|)$ con $n=|w|$. (Alternativa que Becher menciona: explorar árboles de derivación de una GLC **no recursiva a izquierda** acotando la profundidad.)" },
    { q: "¿Qué problemas sobre GLC son DECIDIBLES y cuáles INDECIDIBLES? (Becher lo pregunta como V/F.)",
      a: "**Decidibles:** vacío ($S$ genera algún terminal — símbolos productivos, punto fijo), finitud/infinitud (ciclo entre símbolos útiles), pertenencia (CYK).\n**Indecidibles:** equivalencia $L(G_1)=L(G_2)$, ambigüedad de $G$, si $L(G)=\\Sigma^*$, y si $L(G_1)\\cap L(G_2)=\\varnothing$." },
  ]},
  "09": { title: "🎈 Pumping LIC aplicado — estilo Becher", items: [
    { q: "Usando pumping para GLC, dar un algoritmo que decida si el lenguaje reconocido por un AP es VACÍO (variante suya: si es INFINITO).",
      a: "Pasá el AP a **GLC** $G$. **Vacío:** $L=\\varnothing$ ⟺ el símbolo inicial **no es productivo** (no genera ninguna cadena de terminales) — calculá productivos por punto fijo.\n**Infinito:** con la constante $n$ del **pumping LIC**, $L$ es infinito ⟺ existe $z\\in L$ con $n\\le|z|<2n$ (o, equivalente, hay un no terminal útil auto-recursivo). Chequeás las finitas cadenas de ese rango / buscás el ciclo.\n\n**Complejidad:** polinomial en $|G|$." },
  ]},
  "12": { title: "🎯 Parsing LL/LR — estilo Becher", items: [
    { q: "Dar ejemplos de: (a) una gramática LL(k) pero no LL(k−1); (b) LR pero no LL(k) para ningún k; (c) un lenguaje que NO es LR.",
      a: "**(a)** $S\\to a^k b\\mid a^k c$ necesita $k$ símbolos de lookahead para decidir entre las dos ramas ⟹ LL($k$) y no LL($k{-}1$).\n**(b)** La gramática de expresiones con recursión a izquierda ($E\\to E{+}T\\mid T$) es LR pero **ninguna** LL($k$) la parsea sin transformarla (la recursión izq lo impide); o el if-then-else con else opcional.\n**(c)** Un lenguaje **inherentemente ambiguo** o no-determinístico como $\\{a^nb^n\\}\\cup\\{a^nb^{2n}\\}$ **no es LR** (no es LIC-determinístico)." },
  ]},
  // ---- isla nueva: Algoritmos, Complejidad y Conteo ----
  "decision": { title: "🧮 Algoritmos de decisión — REGULARES", items: [
    { q: "Enumerá los algoritmos de decisión sobre lenguajes regulares con su complejidad (el machete que Becher espera).",
      a: "Dado un AFD de $n$ estados:\n- **Pertenencia** $w\\in L$: correr $M$, $O(|w|)$.\n- **Vacío** $L=\\varnothing$: ¿final alcanzable? $O(|Q|+|\\delta|)$. Equiv: $\\exists w,|w|<n$.\n- **Infinitud**: ciclo entre estados útiles, $O(|Q|+|\\delta|)$. Equiv: $\\exists w,\\ n\\le|w|<2n$.\n- **$L=\\Sigma^*$**: complemento + vacío (o minimizar), poly.\n- **Equivalencia** $L_1{=}L_2$: diferencia simétrica $=\\varnothing$, $O(n_1 n_2|\\Sigma|)$.\n\n**Todo es decidible** para regulares." },
  ]},
  "decisionlic": { title: "🧮 Decisión — LIBRES DE CONTEXTO", items: [
    { q: "Decisión sobre LIC: qué se puede y qué no, con complejidades.",
      a: "**Decidibles:**\n- **Pertenencia**: CYK en FNC, $O(n^3|G|)$.\n- **Vacío**: $S$ productivo, $O(|G|)$.\n- **Finitud/Infinitud**: ciclo entre símbolos útiles / pumping ($n\\le|z|<2n$).\n\n**INDECIDIBLES:** equivalencia $L(G_1){=}L(G_2)$, ambigüedad, $L(G){=}\\Sigma^*$, $L(G_1)\\cap L(G_2){=}\\varnothing$.\n\n*Ojo:* para **LIC-determinísticos** (APD) la equivalencia **sí** es decidible (Sénizergues), y son cerrados por complemento." },
  ]},
  "conteo": { title: "🔢 Conteo de autómatas — estilo Becher", items: [
    { q: "¿Cuántos AFD y cuántos AFND con 2 estados hay sobre Σ={0,1} (estados etiquetados)? Dar la fórmula general.",
      a: "**AFD** $=|Q|^{\\,|Q|\\cdot|\\Sigma|}\\cdot|Q|\\cdot 2^{|Q|}$ (tabla $\\delta$ × inicial × subconjunto de finales). Para $|Q|{=}2,|\\Sigma|{=}2$: $2^{4}\\cdot 2\\cdot 2^{2}=16\\cdot2\\cdot4=\\mathbf{128}$.\n**AFND** ($\\delta\\!:Q\\times\\Sigma\\to\\mathcal P(Q)$) $=\\big(2^{|Q|}\\big)^{|Q||\\Sigma|}\\cdot|Q|\\cdot 2^{|Q|}=2^{|Q|^2|\\Sigma|}\\cdot|Q|\\cdot2^{|Q|}$. Para $2,2$: $2^{8}\\cdot2\\cdot4=256\\cdot8=\\mathbf{2048}$." },
    { q: "¿Cuántos AP determinísticos hay con Q de 5 estados, alfabetos Δ y Γ fijos, si en cada transición se escriben 0, 1 o 2 símbolos de pila? (Ej 5 del entrenamiento.)",
      a: "**Receta general (contá componente por componente de la tupla):** cada transición $\\delta(q,a,Z)$ tiene como imagen un par $(p,\\gamma)$ con $p\\in Q$ (5 opciones) y $\\gamma\\in\\Gamma^{\\le 2}$ (cadenas de largo 0,1,2: $1+|\\Gamma|+|\\Gamma|^2$ opciones). Para un **APD**: a lo sumo un $(p,\\gamma)$ por $(q,a,Z)$ **o** indefinido ⟹ $\\big(5\\cdot(1{+}|\\Gamma|{+}|\\Gamma|^2)+1\\big)$ opciones por celda, elevado al número de celdas $|Q|\\cdot|\\Delta|\\cdot|\\Gamma|$, × elección de finales $2^{|Q|}$.\n\nLo que Becher evalúa es que **plantees la tupla y multipliques bien**; el número exacto sale de reemplazar." },
  ]},
};

/* progreso */
function becherItemDone(key, i) { State.d.becher = State.d.becher || {}; return !!State.d.becher[key + "#" + i]; }
function becherKeyDone(key) {
  const set = BECHER_DRILLS[key]; if (!set) return false;
  return set.items.every((_, i) => becherItemDone(key, i));
}
function becherMarkItem(key, i) {
  State.d.becher = State.d.becher || {};
  if (!State.d.becher[key + "#" + i]) { State.d.becher[key + "#" + i] = 1; State.save(); State.addXP(15, "drill de Becher"); }
}

/* ---------- ruta: los drills de un set ---------- */
route("becher", (el, [key]) => {
  const set = BECHER_DRILLS[key];
  if (!set) { el.innerHTML = "<p>No hay drills para eso.</p>"; return; }
  const done = becherKeyDone(key);
  el.innerHTML = `
  <div class="crumb"><a href="#/camino">🗺️ Camino</a> / Modo Becher</div>
  <div class="q-head"><span style="font-size:1.6rem">🧙‍♀️</span>
    <h1 style="margin:0">${set.title}</h1><div class="spacer"></div>
    ${done ? '<span class="tag ok">✓ dominado</span>' : ""}</div>
  <p style="color:var(--ink2)">Como en su final: leé la consigna, pensala en papel, y recién ahí revelá
  la respuesta modelo. Marcá <b>"lo sé"</b> cuando puedas reproducirla sola. (+15 XP c/u)</p>
  <div id="drills"></div>`;
  const box = document.getElementById("drills");
  set.items.forEach((it, i) => {
    const card = document.createElement("div");
    card.className = "card mb";
    card.innerHTML = `
      <div class="flex"><span class="tag ${becherItemDone(key, i) ? "ok" : "hot"}">consigna ${i + 1}</span>
        <div class="spacer"></div>${becherItemDone(key, i) ? '<span class="tag ok">✓ lo sé</span>' : ""}</div>
      <p style="font-weight:600;margin:.5em 0">${it.q}</p>
      <button class="btn sm ghost" data-r="${i}">👁 Revelar respuesta modelo</button>
      <div class="drill-a" id="da-${i}" style="display:none"></div>`;
    box.appendChild(card);
    card.querySelector(`[data-r="${i}"]`).onclick = () => {
      const a = card.querySelector(`#da-${i}`);
      a.style.display = "block";
      a.innerHTML = `<div class="boss-ans" style="margin-top:12px">${mdRender(it.a)}</div>
        ${becherItemDone(key, i) ? "" : `<div class="center mt"><button class="btn ok sm" data-k="${i}">✅ Lo sé demostrar/hacer (+15 XP)</button></div>`}`;
      katexify(a);
      const kb = a.querySelector(`[data-k="${i}"]`);
      if (kb) kb.onclick = () => { becherMarkItem(key, i); render(); };
    };
  });
  katexify(box);
});
