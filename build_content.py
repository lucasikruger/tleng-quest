#!/usr/bin/env python3
"""Empaqueta Guia_Final/*.md en data/content.js (JSON = JS valido)."""
import json, os, glob, re

BASE = os.path.dirname(os.path.abspath(__file__))
GUIA = os.path.normpath(os.path.join(BASE, "..", "Guia_Final"))
out = {}
for md in sorted(glob.glob(os.path.join(GUIA, "*.md"))):
    name = os.path.splitext(os.path.basename(md))[0]
    if name in ("_PLANTILLA", "index"):
        continue
    txt = open(md, encoding="utf-8").read()
    m = re.match(r"^#\s+(.+)$", txt.split("\n")[0])
    title = m.group(1).strip() if m else name
    out[name] = {"title": title, "md": txt}

dest = os.path.join(BASE, "data", "content.js")
with open(dest, "w", encoding="utf-8") as f:
    f.write("window.CONTENT = ")
    json.dump(out, f, ensure_ascii=False)
    f.write(";\n")
print(f"content.js: {len(out)} docs, {os.path.getsize(dest)//1024} KB")
for k in out: print("  -", k)
