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

## Compartir / deploy

Es una web **estática** — se sube tal cual a GitHub Pages, Netlify, Vercel o cualquier hosting.

### Antes de subir, editá `config.js`
```js
window.TLENG_CONFIG = {
  claude: false,   // false = deploy público: NO carga el SDK ni ofrece el chat
};
```
- Con `claude: false` la app **no descarga nada de Anthropic** y oculta el final oral / profe.
  (Verificado: con esa opción el SDK no aparece en las requests de red.)
- Cada visitante puede igual activar Claude en su propio navegador (⚙️ Config → Activar) y poner
  **su** API key — nunca se usa la tuya ni queda en el repo.
- Al entrar se muestra un aviso de que el material es de la **cursada 1C 2024** (antes del 2C).

### Override por URL (sin tocar `config.js`)
- `?claude=0` — oculta Claude · `?claude=1` — lo activa.
- Ej: `https://tu-usuario.github.io/tleng-quest/?claude=0`

### GitHub Pages en 30 segundos
1. Subí la carpeta `webapp/` al repo (o su contenido a la raíz).
2. Settings → Pages → Source: la rama y carpeta donde está `index.html`.
3. Listo: `https://<usuario>.github.io/<repo>/`.

> El progreso (XP, islas, quiz) vive en el localStorage de cada visitante — no se comparte ni se sube.
