/* ===== Banco REAL de la Dra. Verónica Becher =====
   Extraído de su entrenamiento de finales (jun-2024) y de finales suyos
   documentados (2016–2024). Se inyecta en el system prompt del examinador
   para que tome EXACTAMENTE como ella. */
window.BECHER = {
  patron: `PATRÓN DE UN FINAL DE BECHER (escrito, a veces a libro abierto, ~4 ejercicios):
- Ej 1 casi SIEMPRE: "Demostrá el teorema que más te guste / a elección". Dejá que el
  estudiante elija, y después exigí el enunciado exacto (cuantificadores en orden) y la demo.
- El resto: DAR UN ALGORITMO que decida algo, SIEMPRE con (a) justificación de correctitud
  y (b) complejidad computacional de peor caso. Si dan el algoritmo sin complejidad,
  repreguntás "¿y la complejidad?". Si es vago, exigís precisión formal.
- Suele meter UN ejercicio de CONTEO de autómatas (cuántos AFD/AFND/AP con k estados).
- Le gustan las VARIANTES creativas: co-determinístico, transductores de Mealy, cotas
  ajustadas (no la cota teórica de clase, la ajustada), minimalidad por
  accesible+coaccesible+codeterminista.`,

  // preguntas reales — usalas tal cual o adaptá el parámetro (k estados, alfabeto, etc.)
  preguntas: [
    // --- algoritmos de decisión + complejidad (su especialidad) ---
    "Dar un algoritmo que decida si dos expresiones regulares denotan el mismo lenguaje. Justificar la correctitud y analizar la complejidad de peor caso.",
    "Dar DOS algoritmos distintos para determinar si el lenguaje aceptado por un AF es Σ* (todas las cadenas). Justificar cada uno y dar su complejidad.",
    "Dar un algoritmo que determine si un lenguaje regular dado es infinito. Justificar y dar la complejidad de peor caso.",
    "Dar un algoritmo que decida si un autómata de pila determinístico reconoce Σ*. (Pista: Lema 8.6 Aho-Ullman Vol 1.)",
    "Dado un AFD A y un AP determinístico P, dar un algoritmo que determine si L(A) ∩ L(P) es finito. Justificar la correctitud e indicar la complejidad.",
    "Sea L un lenguaje regular (dado por un AF o ER). Dar un algoritmo para decidir si L(L) = Σ*. (Pista: pensá en el lema de pumping y en el autómata que reconoce el mismo lenguaje.)",
    "Usando pumping para gramáticas libres de contexto, dar un algoritmo para decidir si el lenguaje reconocido por un AP es vacío (o, variante: si es infinito).",
    "Dada una GLC G no recursiva a izquierda y una palabra w, dar un algoritmo que explore los árboles de derivación de G para decidir si w ∈ L(G). Justificar correctitud y complejidad.",
    // --- conteo de autómatas ---
    "¿Cuántos AFD con 2 estados se pueden construir sobre Σ={0,1}? ¿Cuántos AFND? ¿Cuántos AP con 2 estados, alfabeto de entrada A, alfabeto de pila Z y a lo sumo M símbolos por transición?",
    "Fijados los alfabetos Δ y Γ, ¿cuántos AP determinísticos (Q,Σ,Δ,Γ,q0,F) distintos hay si Q tiene 5 estados y en cada transición se escriben 0, 1 o 2 símbolos en la pila? ¿Y cuántos no determinísticos?",
    // --- variantes creativas ---
    "Un autómata es co-determinístico si no hay q1,q2,q3,a con q1∈δ(q2,a) y q1∈δ(q3,a). Dar un algoritmo que dado M construya un co-determinístico N con L(M)=L(N), y dar su complejidad.",
    "Dar un algoritmo que codeterminice un autómata finito.",
    "Demostrar: si un AF es determinístico, accesible, coaccesible y codeterminístico, entonces es mínimo. Y demostrar que la recíproca NO siempre vale (dar contraejemplo — pista: el mínimo de {λ,a} tiene dos finales).",
    "Demostrar que la determinización del reverso de un AFD es mínima. Dar un ejemplo.",
    "Adaptar el algoritmo de minimización de AF a una minimización de máquinas de Mealy (transductor finito). Ayuda: definir la equivalencia usando δ extendida y γ extendida.",
    "Dar un algoritmo que, dado un AF que reconoce un lenguaje infinito, lo transforme en otro que reconoce el mismo lenguaje y tiene al menos el doble de estados que el mínimo. Demostrar que es correcto.",
    "Demostrar que dada una GLC sin símbolos inútiles y no recursiva a derecha, existe una constante c tal que si A ⇒ⁱ αBw (derivación a derecha) entonces i ≤ c·|w| + 2.",
    "Dada G una GLC sin producciones λ y no recursiva a izquierda, dar una cota AJUSTADA c tal que si A ⇒*_L Bα entonces A ⇒ⁱ_L Bα con i ≤ c. Ojo: la cota tiene que ser ajustada, no alcanza la cota teórica de clase.",
    // --- parsing / gramáticas (a veces cierra con esto o con teoría a elección) ---
    "Dar ejemplos de: (a) una gramática LL(k) pero no LL(k−1); (b) LR pero no LL(k) para ningún k; (c) un lenguaje que no es LR.",
    "Dar un AP equivalente a un lenguaje regular dado.",
    "Elegí y explicá uno: (a) gramáticas de atributos, (b) algoritmo CYK, (c) algoritmo de Earley, (d) First/Follow.",
  ],
};
