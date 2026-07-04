/* ============================================================
   Tleng Quest — CONFIGURACIÓN (editá esto antes de subir el repo)
   ============================================================
   También se puede pisar por query string (?claude=0) o desde la
   página ⚙️ Config dentro de la app (queda en localStorage).
*/
window.TLENG_CONFIG = {
  // Chat con Claude (final oral simulado + profe particular).
  //   true  → función disponible (cada usuario pone SU api key, se guarda en su navegador).
  //   false → DEPLOY PÚBLICO: se oculta la función y NO se carga el SDK de Anthropic.
  claude: false,
};

/* ---------- resolución de flags (no hace falta tocar) ---------- */
(function () {
  const def = window.TLENG_CONFIG;
  const qs = new URLSearchParams(location.search);
  let ls = {};
  try { ls = JSON.parse(localStorage.getItem("tlengquest_cfg")) || {}; } catch (e) { ls = {}; }
  // prioridad: query string  >  toggle de la UI (localStorage)  >  default del archivo
  const pick = (k, d) => (qs.has(k) ? qs.get(k) : (k in ls ? ls[k] : d));
  const truthy = (v) => v === true || v === "1" || v === "on" || v === "true" || v === "yes";

  window.TLENG = {
    claude: truthy(pick("claude", def.claude)),
    setClaude(b) { this._save("claude", !!b); location.reload(); },
    _save(k, v) {
      let o = {};
      try { o = JSON.parse(localStorage.getItem("tlengquest_cfg")) || {}; } catch (e) { o = {}; }
      o[k] = v; localStorage.setItem("tlengquest_cfg", JSON.stringify(o));
    },
  };
})();
