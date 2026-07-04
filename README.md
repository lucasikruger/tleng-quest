# 🎮 Tleng Quest — web app para aprobar el final

App interactiva tipo juego para preparar el final de Teoría de Lenguajes (programa **1C 2024**).
La misión es **aprobar**: conquistás islas hasta la Mesa Final.

## Cómo correrla
```bash
./serve.sh          # → http://localhost:8742
```
(o `python3 -m http.server 8742` acá). Internet la primera vez (KaTeX, marked, confetti y el SDK de
Anthropic se cargan de CDN). El progreso se guarda en localStorage.

## Qué tiene

### 🗺️ El Camino (lo primero que ves)
14 **islas** en orden — Campamento base → Lenguajes → Autómatas → … → **La Mesa Final**. Cada isla
tiene misiones (leer el tema, ganar el quiz, construir autómatas) y se conquista al 100%. La home
muestra tu próxima parada. Las islas 🔥 son las más tomadas en finales.

### 🔬 Laboratorio (el corazón)
**38 desafíos verificados exhaustivamente** (el juez compara tu construcción contra TODAS las cadenas
de Σ* hasta cierto largo):
- **Constructor de Autómatas** — editor gráfico SVG. 12 AFDs (modo estricto: determinismo + función
  total) + 6 AFNDs (con λ). Anima la traza al probar.
- **Constructor de AP** — tabla de δ(q,a,X)→(p,γ) con **pila animada** al aceptar.
- **ER Golf** — regex compilada con Thompson; menos caracteres = birdie 🐦.
- **Gramática Lab** — GLC → Forma Normal de Chomsky → verificación con **CYK**.

### 🎤 Final oral simulado (con Claude)
Claude te toma el final con el **estilo real del tomador**:
- **Becher ⭐** (tomó el último final): algoritmos + correctitud + **complejidad**, V/F, conteo.
- **Jacobo**: demostraciones clásicas, oral de pizarrón que te guía.

Te hace 4 preguntas con repreguntas y te pone **NOTA + feedback**. También hay **profe particular**.
Requiere API key de Anthropic (Ajustes) — queda solo en tu navegador, llamadas directas del browser.

### 🕹️ Arcade
Quiz (104 preguntas con explicación), flashcards (84), simulador de AFD animado, duelo de pumping,
mapa de Chomsky interactivo.

### 🏆 Boss Battles
18 ejercicios de finales reales con pistas progresivas. Los de **Becher primero**.

### 🎯 Qué toman · 📚 Temas · 🎩 Trucos · 📜 Teoremas
Ranking real de 20 finales; los 12 temas con **widgets en vivo** en la lectura (simuladores, probador
de regex, enlaces a los juegos); checklist de teoremas para demostrar.

## Motores
`js/machine.js` implementa AF, AP, ER→Thompson y GLC→CNF→CYK con verificación exhaustiva.
Unit-testeados: 21/21 verde, con solución de referencia por cada tipo de desafío y detección de
gramáticas/regex que sobre-generan.

## Regenerar datos
- Guía: `python3 build_content.py` (lee `../Guia_Final/*.md`).
- Bancos: editá `data/src/*.json` → `python3 pack_data.py`.

## Deploy

Es una app estática + un server Node mínimo (`server.js`, sin dependencias) que la sirve y,
opcionalmente, hace de puente hacia Claude.

### Railway (recomendado)
1. Conectá el repo. Railway detecta Node por el `package.json` y corre `npm start` → `node server.js`.
2. El server escucha en el `$PORT` que Railway inyecta. No hay que configurar nada más.
3. **Variables de entorno** (Settings → Variables):
   - `TLENG_CLAUDE=0` (default) → el chat con Claude queda **oculto** y no se carga el SDK. Sitio 100% estático.
   - `TLENG_CLAUDE=1` → muestra el chat; cada visitante pone **su propia** API key (se guarda en su navegador).
   - **No** uses `TLENG_CLI` en Railway (ver abajo).

### GitHub Pages / cualquier hosting estático
También funciona sin el server: subí los archivos y listo (usa el `config.js` tal cual, con
`claude: false`). El chat con Claude queda oculto salvo que edites `config.js` o abras con `?claude=1`.

## 🆓 Usar el simulador SIN API key (local, con tu sesión de Claude Code)

Si tenés **Claude Code** instalado y logueado en tu máquina, podés usar el final oral / profe
**sin ninguna API key** — el server llama al CLI `claude -p` con tu sesión:

```bash
TLENG_CLI=1 npm start        # → http://localhost:8742, Claude ON vía tu sesión
```

- No necesitás `sk-ant-…`: usa tu login de Claude Code (tu suscripción).
- ⚠️ **Sólo para uso local/personal.** Nunca actives `TLENG_CLI=1` en un server público:
  cualquier visitante estaría usando *tu* cuenta. En Railway/hosting público dejá `TLENG_CLI` sin setear.

## Config (recap)
- `config.js` → `claude: true|false` (default del deploy).
- Env vars del server: `PORT`, `TLENG_CLAUDE` (0/1), `TLENG_CLI` (0/1, sólo local).
- Override por URL: `?claude=0` / `?claude=1`.
- Al entrar, la app avisa que el material es de la **cursada 1C 2024** (antes del 2C).
