/* ===== Tleng Quest — motores formales: AF, AP, ER, GLC =====
   Todo verificado por enumeración exhaustiva: se comparan TODAS las cadenas
   de Σ* hasta maxLen contra el predicado del desafío. */

const LAMBDA = "λ";

/* ---------- enumeración de Σ* ---------- */
function* enumStrings(sigma, maxLen) {
  yield "";
  let level = [""];
  for (let l = 1; l <= maxLen; l++) {
    const next = [];
    for (const w of level) for (const c of sigma) { const s = w + c; next.push(s); yield s; }
    level = next;
  }
}

/* ---------- Autómatas finitos (AFD / AFND / AFND-λ) ----------
   fa = { states:[{id,x,y,final}], initial:"q0", trans:[{from,sym,to}] } */
function faClosure(fa, set) {
  const res = new Set(set), stack = [...set];
  while (stack.length) {
    const q = stack.pop();
    for (const t of fa.trans) if (t.from === q && t.sym === LAMBDA && !res.has(t.to)) { res.add(t.to); stack.push(t.to); }
  }
  return res;
}
function faStep(fa, set, a) {
  const nxt = new Set();
  for (const t of fa.trans) if (set.has(t.from) && t.sym === a) nxt.add(t.to);
  return faClosure(fa, nxt);
}
function faAccepts(fa, w) {
  if (!fa.initial) return false;
  let cur = faClosure(fa, new Set([fa.initial]));
  for (const c of w) { cur = faStep(fa, cur, c); if (!cur.size) return false; }
  const finals = new Set(fa.states.filter((s) => s.final).map((s) => s.id));
  return [...cur].some((q) => finals.has(q));
}
/* traza para animación: lista de conjuntos de estados */
function faTrace(fa, w) {
  const sets = [];
  let cur = faClosure(fa, new Set([fa.initial]));
  sets.push([...cur]);
  for (const c of w) { cur = faStep(fa, cur, c); sets.push([...cur]); if (!cur.size) break; }
  return sets;
}
/* problemas estructurales; strict=true exige AFD (total, determinista, sin λ) */
function faValidate(fa, sigma, strict) {
  const errs = [];
  if (!fa.states.length) return ["No hay estados."];
  if (!fa.initial) errs.push("Falta marcar el estado inicial (⏵).");
  if (!fa.states.some((s) => s.final)) errs.push("No hay ningún estado final — el autómata rechaza todo.");
  const ids = new Set(fa.states.map((s) => s.id));
  for (const t of fa.trans) {
    if (!ids.has(t.from) || !ids.has(t.to)) errs.push(`Transición con estado inexistente (${t.from}→${t.to}).`);
    if (t.sym !== LAMBDA && !sigma.includes(t.sym)) errs.push(`Símbolo '${t.sym}' fuera de Σ={${sigma.split("").join(",")}}.`);
  }
  if (strict) {
    for (const t of fa.trans) if (t.sym === LAMBDA) { errs.push("Un AFD no puede tener transiciones λ."); break; }
    for (const s of fa.states) for (const a of sigma) {
      const n = fa.trans.filter((t) => t.from === s.id && t.sym === a).length;
      if (n === 0) errs.push(`AFD incompleto: falta δ(${s.id}, ${a}).`);
      if (n > 1) errs.push(`No determinista: δ(${s.id}, ${a}) tiene ${n} salidas.`);
    }
  }
  return [...new Set(errs)];
}

/* ---------- Autómatas de pila ----------
   pda = { states:["q0",...], initial, finals:[], accept:"final"|"empty",
           startStack:"Z", trans:[{from,read,pop,push,to}] }
   read: símbolo o λ · pop: 1 símbolo de pila · push: string (vacío = λ), tope a la izquierda */
function pdaAccepts(pda, w, wantPath) {
  const LIMIT = 40000, maxStack = w.length + 8;
  const start = { st: pda.initial, i: 0, stack: pda.startStack, par: null, via: null };
  const key = (c) => c.st + "|" + c.i + "|" + c.stack;
  const seen = new Set([key(start)]);
  const queue = [start];
  let n = 0;
  while (queue.length && n++ < LIMIT) {
    const c = queue.shift();
    const done = c.i === w.length &&
      (pda.accept === "empty" ? c.stack === "" : pda.finals.includes(c.st));
    if (done) {
      if (!wantPath) return { ok: true };
      const path = []; let p = c;
      while (p) { path.unshift(p); p = p.par; }
      return { ok: true, path };
    }
    if (c.stack.length > maxStack) continue;
    const top = c.stack[0];
    for (const t of pda.trans) {
      if (t.from !== c.st) continue;
      if (t.pop !== top) continue;                       // siempre se mira el tope
      let ni = c.i;
      if (t.read !== LAMBDA) { if (w[c.i] !== t.read) continue; ni = c.i + 1; }
      const push = t.push === LAMBDA ? "" : t.push;
      const nc = { st: t.to, i: ni, stack: push + c.stack.slice(1), par: wantPath ? c : null, via: t };
      const k = key(nc);
      if (!seen.has(k)) { seen.add(k); queue.push(nc); }
    }
  }
  return { ok: false, exhausted: n >= LIMIT };
}

/* ---------- Expresiones regulares → AFND-λ (Thompson) ----------
   gramática: alt = cat ('|' cat)* ; cat = rep+ ; rep = atom ('*'|'+'|'?')* ;
   atom = símbolo | λ | '(' alt ')' */
function reParse(src, sigma) {
  let i = 0;
  const err = (m) => { throw new Error(m + ` (posición ${i + 1})`); };
  const peek = () => src[i];
  function alt() {
    const parts = [cat()];
    while (peek() === "|") { i++; parts.push(cat()); }
    return parts.length === 1 ? parts[0] : { op: "alt", parts };
  }
  function cat() {
    const parts = [];
    while (i < src.length && peek() !== "|" && peek() !== ")") parts.push(rep());
    if (!parts.length) return { op: "eps" };
    return parts.length === 1 ? parts[0] : { op: "cat", parts };
  }
  function rep() {
    let node = atom();
    while ("*+?".includes(peek())) { node = { op: { "*": "star", "+": "plus", "?": "opt" }[peek()], sub: node }; i++; }
    return node;
  }
  function atom() {
    const c = peek();
    if (c === "(") { i++; const n = alt(); if (peek() !== ")") err("falta ')'"); i++; return n; }
    if (c === LAMBDA || c === "&") { i++; return { op: "eps" }; }
    if (sigma.includes(c)) { i++; return { op: "sym", c }; }
    if (c === undefined) err("expresión incompleta");
    err(`símbolo '${c}' no permitido (Σ, λ, |, *, +, ?, paréntesis)`);
  }
  const tree = alt();
  if (i < src.length) err(`sobra '${src[i]}'`);
  return tree;
}
function reToNFA(tree) {
  let n = 0; const trans = [];
  const S = () => "s" + n++;
  function build(t) {
    const a = S(), b = S();
    if (t.op === "sym") trans.push({ from: a, sym: t.c, to: b });
    else if (t.op === "eps") trans.push({ from: a, sym: LAMBDA, to: b });
    else if (t.op === "alt") for (const p of t.parts) { const f = build(p);
      trans.push({ from: a, sym: LAMBDA, to: f.a }, { from: f.b, sym: LAMBDA, to: b }); }
    else if (t.op === "cat") { let prev = a;
      for (const p of t.parts) { const f = build(p); trans.push({ from: prev, sym: LAMBDA, to: f.a }); prev = f.b; }
      trans.push({ from: prev, sym: LAMBDA, to: b }); }
    else { const f = build(t.sub);
      trans.push({ from: a, sym: LAMBDA, to: f.a }, { from: f.b, sym: LAMBDA, to: b });
      if (t.op === "star" || t.op === "opt") trans.push({ from: a, sym: LAMBDA, to: b });
      if (t.op === "star" || t.op === "plus") trans.push({ from: f.b, sym: LAMBDA, to: f.a }); }
    return { a, b };
  }
  const f = build(tree);
  const ids = new Set(); trans.forEach((t) => { ids.add(t.from); ids.add(t.to); });
  return { states: [...ids].map((id) => ({ id, final: id === f.b })), initial: f.a, trans };
}
function reAccepts(nfa, w) { return faAccepts(nfa, w); }

/* ---------- GLC → CNF → CYK ----------
   texto: líneas "S -> a S b | λ". NT = mayúsculas; terminales = el resto (sin espacios). */
function cfgParse(src) {
  const rules = []; let start = null;
  for (let line of src.split("\n")) {
    line = line.trim();
    if (!line || line.startsWith("#") || line.startsWith("//")) continue;
    const m = line.split(/->|→/);
    if (m.length !== 2) throw new Error(`Línea inválida (falta "->"): "${line}"`);
    const lhs = m[0].trim();
    if (!/^[A-Z]$/.test(lhs)) throw new Error(`El lado izquierdo debe ser UN no terminal en mayúscula: "${lhs}"`);
    if (!start) start = lhs;
    for (const altStr of m[1].split("|")) {
      const body = altStr.replace(/\s+/g, "");
      if (body === "" || body === LAMBDA || body === "&") { rules.push({ lhs, rhs: [] }); continue; }
      const rhs = [...body];
      if (rhs.length > 10) throw new Error(`Producción muy larga (máx 10 símbolos): ${lhs} -> ${body}`);
      rules.push({ lhs, rhs });
    }
  }
  if (!rules.length) throw new Error("Gramática vacía.");
  if (rules.length > 60) throw new Error("Demasiadas producciones (máx 60).");
  return { start, rules };
}
function cfgToCNF(g) {
  let extra = 0;
  const fresh = () => { extra++; return "_" + extra; };   // ids internos, no chocan con NT de una letra
  const isNT = (s) => /^[A-Z]$/.test(s) || s.startsWith("_");
  // 1) nuevo start
  const S0 = fresh();
  let rules = [{ lhs: S0, rhs: [g.start] }, ...g.rules.map((r) => ({ lhs: r.lhs, rhs: [...r.rhs] }))];
  // 2) TERM: terminales en reglas largas → NT nuevos
  const termNT = {};
  rules = rules.map((r) => {
    if (r.rhs.length < 2) return r;
    return { lhs: r.lhs, rhs: r.rhs.map((s) => {
      if (isNT(s)) return s;
      if (!termNT[s]) termNT[s] = fresh();
      return termNT[s];
    }) };
  });
  for (const [t, nt] of Object.entries(termNT)) rules.push({ lhs: nt, rhs: [t] });
  // 3) BIN: encadenar RHS largas con NT frescos
  const out2 = [];
  for (const r of rules) {
    if (r.rhs.length <= 2) { out2.push(r); continue; }
    let symbols = r.rhs, lhs = r.lhs;
    while (symbols.length > 2) {
      const nt = fresh();
      out2.push({ lhs, rhs: [symbols[0], nt] });
      lhs = nt; symbols = symbols.slice(1);
    }
    out2.push({ lhs, rhs: symbols });
  }
  rules = out2;
  // 4) DEL: anulables
  const nullable = new Set();
  let changed = true;
  while (changed) {
    changed = false;
    for (const r of rules) if (!nullable.has(r.lhs) && r.rhs.every((s) => nullable.has(s)) ) { nullable.add(r.lhs); changed = true; }
    for (const r of rules) if (!nullable.has(r.lhs) && r.rhs.length === 0) { nullable.add(r.lhs); changed = true; }
  }
  const delOut = [];
  for (const r of rules) {
    if (r.rhs.length === 0) continue;
    // subconjuntos omitiendo anulables
    const idxs = r.rhs.map((s, k) => (isNT(s) && nullable.has(s) ? k : -1)).filter((k) => k >= 0);
    const subsets = 1 << idxs.length;
    for (let mask = 0; mask < subsets; mask++) {
      const omit = new Set(idxs.filter((_, j) => mask & (1 << j)));
      const rhs = r.rhs.filter((_, k) => !omit.has(k));
      if (rhs.length) delOut.push({ lhs: r.lhs, rhs });
    }
  }
  rules = delOut;
  // 5) UNIT
  const nts = new Set(rules.map((r) => r.lhs));
  const unitOf = {};
  for (const A of nts) {
    const reach = new Set([A]); const st = [A];
    while (st.length) {
      const X = st.pop();
      for (const r of rules) if (r.lhs === X && r.rhs.length === 1 && isNT(r.rhs[0]) && !reach.has(r.rhs[0])) { reach.add(r.rhs[0]); st.push(r.rhs[0]); }
    }
    unitOf[A] = reach;
  }
  const final = [];
  const seen = new Set();
  for (const A of nts) for (const B of unitOf[A]) for (const r of rules) {
    if (r.lhs !== B) continue;
    if (r.rhs.length === 1 && isNT(r.rhs[0])) continue;
    const k = A + "→" + r.rhs.join("·");
    if (!seen.has(k)) { seen.add(k); final.push({ lhs: A, rhs: r.rhs }); }
  }
  return { S0, rules: final, nullableStart: nullable.has(S0) };
}
function cykAccepts(cnf, w) {
  if (w.length === 0) return cnf.nullableStart;
  const n = w.length;
  const unary = {}, binary = [];
  for (const r of cnf.rules) {
    if (r.rhs.length === 1) { (unary[r.rhs[0]] = unary[r.rhs[0]] || []).push(r.lhs); }
    else binary.push(r);
  }
  // T[i][j] = set de NT que generan w[i..i+j]
  const T = Array.from({ length: n }, () => Array.from({ length: n + 1 }, () => new Set()));
  for (let i = 0; i < n; i++) for (const A of unary[w[i]] || []) T[i][1].add(A);
  for (let len = 2; len <= n; len++)
    for (let i = 0; i + len <= n; i++)
      for (let k = 1; k < len; k++)
        for (const r of binary)
          if (T[i][k].has(r.rhs[0]) && T[i + k][len - k].has(r.rhs[1])) T[i][len].add(r.lhs);
  return T[0][n].has(cnf.S0);
}

/* ---------- verificador universal ---------- */
/* accepts: (w)=>bool del artefacto del usuario; chal: {sigma, maxLen, inLang} */
function verify(acceptsFn, chal) {
  const fails = [];
  let total = 0, okCount = 0;
  for (const w of enumStrings(chal.sigma, chal.maxLen)) {
    total++;
    const want = chal.inLang(w);
    let got;
    try { got = acceptsFn(w); } catch (e) { return { error: e.message }; }
    if (got === want) okCount++;
    else if (fails.length < 6) fails.push({ w: w === "" ? "λ" : w, want, got });
    else fails.push(null); // solo contar
  }
  return { total, okCount, fails: fails.filter(Boolean), failCount: total - okCount, pass: total === okCount };
}
