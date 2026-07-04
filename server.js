/* ============================================================
   Tleng Quest — server estático para Railway (Node, sin dependencias)
   ============================================================
   - Escucha en $PORT (Railway lo inyecta; local usa 8742).
   - Sirve los archivos de esta carpeta.
   - config.js se genera al vuelo: si existe la env var TLENG_CLAUDE
     ("1"/"true"/"on" = activado; cualquier otra cosa = desactivado),
     pisa el valor por defecto del archivo. Si no está seteada, usa el
     archivo tal cual (claude: false).
*/
const http = require("http");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

const PORT = process.env.PORT || 8742;
const ROOT = __dirname;
const HAS_ENV = process.env.TLENG_CLAUDE !== undefined;
const CLAUDE_ON = /^(1|true|on|yes)$/i.test(process.env.TLENG_CLAUDE || "");
// Proxy por CLI local: usa tu sesión de Claude Code (sin API key). Se activa con
// TLENG_CLI=1 y sólo si el binario `claude` está disponible en la máquina.
const CLI_ON = /^(1|true|on|yes)$/i.test(process.env.TLENG_CLI || "");
const CLI_BIN = process.env.CLAUDE_CLI || "claude";

function claudeCLI(systemPrompt, userText, cb) {
  const args = ["-p", userText, "--output-format", "json"];
  if (systemPrompt) { args.push("--system-prompt", systemPrompt); }
  execFile(CLI_BIN, args, { maxBuffer: 8 * 1024 * 1024, timeout: 120000 }, (err, stdout, stderr) => {
    if (err && !stdout) return cb(err.message || String(err));
    try {
      const j = JSON.parse(stdout);
      if (j.is_error) return cb(j.result || "el CLI devolvió un error");
      cb(null, j.result || "");
    } catch (e) { cb("no pude parsear la respuesta del CLI: " + (stderr || e.message)); }
  });
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".map": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";

  // config.js dinámico: env vars pisan los defaults del archivo
  if (urlPath === "/config.js") {
    let cfg = fs.readFileSync(path.join(ROOT, "config.js"), "utf8");
    // si el proxy CLI está activo, Claude queda ON aunque no haya API key
    if (HAS_ENV || CLI_ON) cfg = cfg.replace(/claude:\s*(true|false)/, "claude: " + (CLAUDE_ON || CLI_ON));
    if (CLI_ON) cfg = cfg.replace(/\};\s*$/m, "  cliProxy: true,\n};");
    res.writeHead(200, { "Content-Type": MIME[".js"], "Cache-Control": "no-store" });
    return res.end(cfg);
  }

  // ¿está disponible el proxy por CLI? (lo consulta el front)
  if (urlPath === "/api/mode") {
    res.writeHead(200, { "Content-Type": MIME[".json"], "Cache-Control": "no-store" });
    return res.end(JSON.stringify({ cliProxy: CLI_ON }));
  }

  // proxy de chat: reenvía a `claude -p` usando tu sesión local (sin API key)
  if (urlPath === "/api/chat" && req.method === "POST") {
    if (!CLI_ON) { res.writeHead(403, { "Content-Type": MIME[".json"] });
      return res.end(JSON.stringify({ error: "proxy CLI desactivado (TLENG_CLI=1 para activarlo)" })); }
    let body = "";
    req.on("data", (c) => { body += c; if (body.length > 2e6) req.destroy(); });
    req.on("end", () => {
      let p;
      try { p = JSON.parse(body); } catch (e) { res.writeHead(400, { "Content-Type": MIME[".json"] }); return res.end(JSON.stringify({ error: "json inválido" })); }
      claudeCLI(p.system || "", p.prompt || "", (err, text) => {
        if (err) { res.writeHead(502, { "Content-Type": MIME[".json"] }); return res.end(JSON.stringify({ error: err })); }
        res.writeHead(200, { "Content-Type": MIME[".json"] });
        res.end(JSON.stringify({ text }));
      });
    });
    return;
  }

  // resolución segura (sin path traversal)
  const filePath = path.join(ROOT, path.normalize(urlPath));
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end("forbidden"); }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback: rutas desconocidas → index.html (la app usa hash routing igual)
      if (!path.extname(urlPath)) {
        return fs.readFile(path.join(ROOT, "index.html"), (e2, html) => {
          if (e2) { res.writeHead(404); return res.end("not found"); }
          res.writeHead(200, { "Content-Type": MIME[".html"] });
          res.end(html);
        });
      }
      res.writeHead(404); return res.end("not found");
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(PORT, () => {
  const claudeState = CLI_ON ? "ON vía tu sesión de Claude Code (sin API key 🎉)"
    : HAS_ENV ? (CLAUDE_ON ? "ON (env, requiere API key del usuario)" : "OFF (env)")
    : "según config.js";
  console.log(`🎮 Tleng Quest en http://0.0.0.0:${PORT}  ·  Claude: ${claudeState}`);
});
