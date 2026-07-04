#!/bin/bash
# Lanza Tleng Quest en http://localhost:8742
cd "$(dirname "$0")"
python3 pack_data.py 2>/dev/null
echo "🎮 Tleng Quest → http://localhost:8742"
python3 -m http.server 8742
