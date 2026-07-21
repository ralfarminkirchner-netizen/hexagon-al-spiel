# HEXAGON-AL · gemalte Landschaft legen

Ausschneidbare **Landschafts-Hexes**: Biotope + Pfade, Abzweige, Brücken, Sturzbrücken, Höhlen, Wasserfälle, Ruinen, Ereignisse. Drehen · anlegen · Landschaft wächst.

## Live
**https://ralfarminkirchner-netizen.github.io/hexagon-al-spiel/**

| | |
|--|--|
| Spielen | [SPIEL.html](SPIEL.html) |
| Drucken | [DRUCK.html](DRUCK.html) |
| Vorschau aller Kacheln | [assets/contact-sheet.png](assets/contact-sheet.png) |

## Inhalt
- 64 gebackene Landschaftskacheln (`assets/tiles/`, 512px)
- Features: `pfad`, `abzweig`, `bruecke`, `sturzbruecke`, `hoehle`, `wasserfall`, `ruine`, `ereignis`
- Dual-Biotope für fließende Übergänge
- Druck: A4/A3/Letter, Hex 30–60 mm flat-to-flat, dichte Packung, Ersatz-Füllung

## Neu backen (lokal)
```bash
cd ~/Projects/hexagon-al-spiel
python3 bake_tiles.py
```

## Hinweis Bild-APIs
Nano Banana / Gemini Image-Quota war beim Build **erschöpft** (429). Aktuelle Optik = Offline-Landschaftsbäcker (Pillow/Numpy). Bei Key/Quota: Textur-Pass möglich.

proposed · nicht Kanon
