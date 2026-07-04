#!/usr/bin/env python3
"""Valida data/src/*.json y arma data/bank.js (QUIZ, CARDS, FINALES)."""
import json, os

BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(BASE, "data", "src")

def load(name, required_keys):
    p = os.path.join(SRC, name)
    if not os.path.exists(p):
        print(f"  ⚠ {name}: no existe todavía → []")
        return []
    data = json.load(open(p, encoding="utf-8"))
    assert isinstance(data, list), f"{name}: no es lista"
    ids = set()
    for i, item in enumerate(data):
        for k in required_keys:
            assert k in item, f"{name}[{i}]: falta '{k}'"
        assert item["id"] not in ids, f"{name}: id duplicado {item['id']}"
        ids.add(item["id"])
    print(f"  ✓ {name}: {len(data)} items")
    return data

quiz = load("quiz1.json", ["id","topic","level","q","options","correct","explain"]) + \
       load("quiz2.json", ["id","topic","level","q","options","correct","explain"])
for q in quiz:
    assert len(q["options"]) == 4 and 0 <= q["correct"] < 4, f"quiz {q['id']}: opciones/correct mal"
cards = load("flashcards.json", ["id","topic","type","front","back"])
finales = load("finales.json", ["id","fecha","toma","formato","dificultad","temas","enunciado","pistas","respuesta"])
for f in finales:
    assert len(f["pistas"]) == 3, f"finales {f['id']}: no tiene 3 pistas"

dest = os.path.join(BASE, "data", "bank.js")
with open(dest, "w", encoding="utf-8") as fh:
    fh.write("window.QUIZ = "); json.dump(quiz, fh, ensure_ascii=False); fh.write(";\n")
    fh.write("window.CARDS = "); json.dump(cards, fh, ensure_ascii=False); fh.write(";\n")
    fh.write("window.FINALES = "); json.dump(finales, fh, ensure_ascii=False); fh.write(";\n")
print(f"bank.js: quiz={len(quiz)} cards={len(cards)} finales={len(finales)} ({os.path.getsize(dest)//1024} KB)")
