#!/usr/bin/env python3
"""HEXAGON-AL · offline landscape miniature tile baker.
Produces painted-looking top-down habitat hex PNGs (no icon stickers).
"""
from __future__ import annotations

import math
import random
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageFont

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "assets" / "tiles"
OUT.mkdir(parents=True, exist_ok=True)

SIZE = 512  # bake resolution (square, hex-cropped)
HEX_R = SIZE * 0.48

BIOMES = {
    "berg": {
        "name": "Berg",
        "base": (92, 96, 108),
        "mid": (140, 138, 148),
        "hi": (210, 214, 222),
        "shadow": (48, 50, 58),
        "accent": (236, 240, 246),
    },
    "wald": {
        "name": "Wald",
        "base": (28, 68, 40),
        "mid": (46, 110, 58),
        "hi": (92, 160, 88),
        "shadow": (14, 36, 22),
        "accent": (180, 210, 120),
    },
    "wiese": {
        "name": "Wiese",
        "base": (120, 140, 58),
        "mid": (164, 184, 78),
        "hi": (214, 222, 120),
        "shadow": (70, 88, 36),
        "accent": (255, 200, 120),
    },
    "moor": {
        "name": "Moor",
        "base": (42, 78, 74),
        "mid": (68, 118, 112),
        "hi": (140, 186, 176),
        "shadow": (22, 42, 40),
        "accent": (200, 230, 220),
    },
    "fluss": {
        "name": "Fluss",
        "base": (36, 92, 128),
        "mid": (70, 150, 190),
        "hi": (170, 220, 240),
        "shadow": (16, 48, 70),
        "accent": (230, 246, 255),
    },
    "pfad": {
        "name": "Pfad",
        "base": (118, 96, 62),
        "mid": (168, 138, 88),
        "hi": (210, 184, 130),
        "shadow": (70, 54, 34),
        "accent": (236, 214, 170),
    },
    "fels": {
        "name": "Fels",
        "base": (96, 90, 86),
        "mid": (140, 132, 124),
        "hi": (190, 184, 176),
        "shadow": (50, 46, 44),
        "accent": (220, 216, 210),
    },
}

# Pointy-top hex corners relative center
def hex_corners(cx, cy, r):
    pts = []
    for i in range(6):
        a = -math.pi / 2 + i * math.pi / 3
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts


def hex_mask(size=SIZE, r=HEX_R):
    m = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(m)
    d.polygon(hex_corners(size / 2, size / 2, r), fill=255)
    return m


def fbm(h, w, octaves=5, seed=0, scale=8.0):
    rng = np.random.default_rng(seed)
    total = np.zeros((h, w), dtype=np.float64)
    amp = 1.0
    norm = 0.0
    for o in range(octaves):
        sh, sw = max(2, h // (2**o)), max(2, w // (2**o))
        grid = rng.random((sh, sw))
        # upscale bilinear via PIL
        img = Image.fromarray((grid * 255).astype(np.uint8), mode="L")
        img = img.resize((w, h), Image.Resampling.BILINEAR)
        arr = np.asarray(img, dtype=np.float64) / 255.0
        total += arr * amp
        norm += amp
        amp *= 0.5
    total /= max(norm, 1e-9)
    # mild smooth
    return total


def lerp_color(a, b, t):
    t = np.clip(t, 0, 1)
    if np.isscalar(t):
        return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))
    out = np.zeros(t.shape + (3,), dtype=np.float64)
    for i in range(3):
        out[..., i] = a[i] + (b[i] - a[i]) * t
    return out


def paint_biome_field(biome: str, seed: int, size=SIZE) -> Image.Image:
    b = BIOMES[biome]
    n1 = fbm(size, size, 6, seed, 10)
    n2 = fbm(size, size, 4, seed + 17, 20)
    n3 = fbm(size, size, 3, seed + 99, 40)
    yy, xx = np.mgrid[0:size, 0:size]
    cx = cy = size / 2
    rr = np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) / (HEX_R + 1)
    height = 0.55 * n1 + 0.3 * n2 + 0.15 * n3
    if biome == "berg":
        height = height * 0.55 + (1 - rr) * 0.55 + n2 * 0.15
    elif biome == "fluss":
        # central meander channel
        channel = np.abs((yy - cy) / size - 0.12 * np.sin((xx / size) * math.pi * 3 + seed))
        height = 0.35 + n1 * 0.25 - np.clip(0.22 - channel * 3.2, 0, 0.22)
    elif biome == "moor":
        height = 0.35 + n1 * 0.25 - n3 * 0.08
    elif biome == "wiese":
        height = 0.4 + n1 * 0.2 + n2 * 0.1
    elif biome == "wald":
        height = 0.45 + n1 * 0.25
    elif biome == "pfad":
        height = 0.42 + n1 * 0.18
    else:
        height = 0.4 + n1 * 0.3

    # shade
    gy, gx = np.gradient(height)
    shade = np.clip(0.55 + (-gx * 0.9 - gy * 0.5) * 2.2, 0.25, 1.15)

    t = np.clip(height, 0, 1)
    base = lerp_color(b["shadow"], b["mid"], t)
    hi = lerp_color(b["mid"], b["hi"], np.clip((t - 0.45) * 1.8, 0, 1))
    mix = np.clip(t, 0, 1)[..., None]
    col = base * (1 - mix * 0.65) + hi * (mix * 0.65)
    # apply shade
    col = col * shade[..., None]
    # paper grain
    grain = (fbm(size, size, 2, seed + 3) - 0.5) * 14
    col = np.clip(col + grain[..., None], 0, 255)

    # biome-specific wash tint
    if biome == "fluss":
        water = np.clip(0.25 - np.abs((yy - cy) / size - 0.1 * np.sin(xx / size * 8 + seed * 0.1)) * 4.5 + n2 * 0.05, 0, 1)
        wcol = np.array(b["mid"], dtype=np.float64)
        whi = np.array(b["hi"], dtype=np.float64)
        water_col = wcol * (1 - water[..., None] * 0.4) + whi * (water[..., None] * 0.5)
        col = col * (1 - water[..., None] * 0.85) + water_col * water[..., None]
        # foam
        foam = (water > 0.15) & (n3 > 0.72)
        col[foam] = col[foam] * 0.4 + np.array(b["accent"], dtype=np.float64) * 0.6
    if biome == "moor":
        pools = (n2 > 0.62) & (n1 < 0.5)
        col[pools] = col[pools] * 0.35 + np.array([50, 110, 120], dtype=np.float64) * 0.65

    img = Image.fromarray(col.astype(np.uint8), "RGB")
    return img


def draw_trees(draw: ImageDraw.ImageDraw, img: Image.Image, rng: random.Random, count=70, fir=True):
    w, h = img.size
    cx, cy = w / 2, h / 2
    trees = []
    for _ in range(count):
        ang = rng.random() * math.tau
        rad = (rng.random() ** 0.65) * HEX_R * 0.86
        x = cx + math.cos(ang) * rad
        y = cy + math.sin(ang) * rad
        s = 12 + rng.random() * 28
        trees.append((y, x, s))
    trees.sort()
    for y, x, s in trees:
        # multi-lobe canopy — painted clumps, not single icon
        for k in range(8):
            ox = (rng.random() - 0.5) * s * 0.85
            oy = (rng.random() - 0.5) * s * 0.55 - s * 0.2
            r = s * (0.22 + rng.random() * 0.32)
            g = 50 + int(rng.random() * 70)
            col = (18 + g // 5, 60 + g, 30 + g // 4)
            hi = (min(255, col[0] + 35), min(255, col[1] + 45), min(255, col[2] + 25))
            sh = (max(0, col[0] - 20), max(0, col[1] - 25), max(0, col[2] - 15))
            draw.ellipse((x + ox - r, y + oy - r * 0.8, x + ox + r, y + oy + r * 0.8), fill=col)
            draw.ellipse((x + ox - r * 0.45, y + oy - r * 0.7, x + ox + r * 0.15, y + oy - r * 0.1), fill=hi)
            draw.ellipse((x + ox + r * 0.05, y + oy - r * 0.1, x + ox + r * 0.7, y + oy + r * 0.55), fill=sh)
        draw.rectangle((x - s * 0.04, y + s * 0.05, x + s * 0.04, y + s * 0.3), fill=(72, 50, 30))


def draw_meadow_detail(draw, rng, img):
    w, h = img.size
    cx, cy = w / 2, h / 2
    for _ in range(280):
        ang = rng.random() * math.tau
        rad = rng.random() * HEX_R * 0.88
        x = cx + math.cos(ang) * rad
        y = cy + math.sin(ang) * rad
        if rng.random() < 0.75:
            # grass strokes
            hgt = 4 + rng.random() * 10
            col = (70 + int(rng.random() * 40), 110 + int(rng.random() * 50), 40 + int(rng.random() * 30))
            draw.line((x, y, x + (rng.random() - 0.5) * 3, y - hgt), fill=col, width=1)
        else:
            # flowers
            petals = [
                (255, 190, 200),
                (255, 235, 140),
                (220, 230, 255),
                (255, 210, 150),
            ][int(rng.random() * 4)]
            r = 1.5 + rng.random() * 2.5
            draw.ellipse((x - r, y - r, x + r, y + r), fill=petals)


def draw_mountains(draw, rng, img):
    w, h = img.size
    cx, cy = w / 2, h / 2
    # ridgelines as stacked irregular lobes (less sticker-triangle)
    for ridge in range(4):
        base_x = cx + (rng.random() - 0.5) * HEX_R * 0.9
        base_y = cy + 20 + ridge * 8 + (rng.random() - 0.5) * 20
        s = 50 + rng.random() * 80
        for k in range(14):
            ox = (rng.random() - 0.5) * s * 0.7
            oy = -abs(rng.random()) * s * 0.75 + (rng.random() - 0.5) * s * 0.1
            rw = s * (0.18 + rng.random() * 0.28)
            rh = s * (0.12 + rng.random() * 0.22)
            shade = 90 + int(rng.random() * 40) - int(abs(ox) * 0.15)
            col = (max(40, shade), max(40, shade - 2), max(48, shade + 6))
            if oy < -s * 0.35 and rng.random() < 0.55:
                col = (230, 234, 240)
            draw.ellipse((base_x + ox - rw, base_y + oy - rh, base_x + ox + rw, base_y + oy + rh), fill=col)
        draw.ellipse((base_x - s * 0.12, base_y - s * 0.7, base_x + s * 0.12, base_y - s * 0.4), fill=(245, 248, 252))
        for _ in range(20):
            sx = base_x + (rng.random() - 0.5) * s
            sy = base_y + rng.random() * s * 0.35
            draw.ellipse((sx - 2, sy - 1, sx + 3, sy + 2), fill=(120 + int(rng.random() * 30), 118, 124))


def draw_river_band(draw, img, rng, angle=0.0, width=0.18):
    """Painterly river across hex at angle (radians)."""
    w = h = SIZE
    cx, cy = w / 2, h / 2
    # sample points along angled axis
    pts_c = []
    for t in np.linspace(-1.1, 1.1, 40):
        along = t * HEX_R
        wob = math.sin(t * 4 + rng.random()) * HEX_R * 0.08
        x = cx + math.cos(angle) * along + math.cos(angle + math.pi / 2) * wob
        y = cy + math.sin(angle) * along + math.sin(angle + math.pi / 2) * wob
        pts_c.append((x, y))
    # wide water stroke via polygon ribbon
    half = HEX_R * width
    left, right = [], []
    for i, (x, y) in enumerate(pts_c):
        # tangent
        if i < len(pts_c) - 1:
            dx = pts_c[i + 1][0] - x
            dy = pts_c[i + 1][1] - y
        else:
            dx = x - pts_c[i - 1][0]
            dy = y - pts_c[i - 1][1]
        L = math.hypot(dx, dy) or 1
        nx, ny = -dy / L, dx / L
        ww = half * (0.85 + 0.2 * math.sin(i * 0.4))
        left.append((x + nx * ww, y + ny * ww))
        right.append((x - nx * ww, y - ny * ww))
    poly = left + right[::-1]
    draw.polygon(poly, fill=(48, 120, 168))
    # inner highlight
    half2 = half * 0.35
    left2, right2 = [], []
    for i, (x, y) in enumerate(pts_c):
        if i < len(pts_c) - 1:
            dx = pts_c[i + 1][0] - x
            dy = pts_c[i + 1][1] - y
        else:
            dx = x - pts_c[i - 1][0]
            dy = y - pts_c[i - 1][1]
        L = math.hypot(dx, dy) or 1
        nx, ny = -dy / L, dx / L
        left2.append((x + nx * half2, y + ny * half2 - 1))
        right2.append((x - nx * half2 * 0.2, y - ny * half2 * 0.2 - 1))
    draw.polygon(left2 + right2[::-1], fill=(150, 210, 235))
    # banks
    draw.line(left, fill=(70, 90, 50), width=3)
    draw.line(right, fill=(60, 80, 45), width=3)
    # stones
    for _ in range(18):
        t = rng.random()
        i = int(t * (len(pts_c) - 1))
        x, y = pts_c[i]
        x += (rng.random() - 0.5) * half * 1.6
        y += (rng.random() - 0.5) * half * 1.2
        draw.ellipse((x - 3, y - 2, x + 3, y + 2), fill=(120, 118, 110))


def draw_path(draw, rng, angle=0.2, fork=False):
    w = h = SIZE
    cx = cy = w / 2
    def ribbon(ang, width=0.07):
        pts = []
        for t in np.linspace(-1.05, 1.05, 36):
            along = t * HEX_R
            wob = math.sin(t * 3.5 + ang * 2) * HEX_R * 0.05
            x = cx + math.cos(ang) * along + math.cos(ang + math.pi / 2) * wob
            y = cy + math.sin(ang) * along + math.sin(ang + math.pi / 2) * wob
            pts.append((x, y))
        half = HEX_R * width
        left, right = [], []
        for i, (x, y) in enumerate(pts):
            if i < len(pts) - 1:
                dx, dy = pts[i + 1][0] - x, pts[i + 1][1] - y
            else:
                dx, dy = x - pts[i - 1][0], y - pts[i - 1][1]
            L = math.hypot(dx, dy) or 1
            nx, ny = -dy / L, dx / L
            left.append((x + nx * half, y + ny * half))
            right.append((x - nx * half, y - ny * half))
        draw.polygon(left + right[::-1], fill=(168, 136, 88))
        draw.line(left, fill=(120, 96, 60), width=2)
        draw.line(right, fill=(120, 96, 60), width=2)
        # wear center
        draw.line(pts, fill=(190, 160, 110), width=2)
    ribbon(angle)
    if fork:
        ribbon(angle + 2.1, width=0.06)
        ribbon(angle - 2.0, width=0.055)


def draw_bridge(draw, rng, angle=0.0):
    # river first assumed; wooden bridge perpendicular
    w = h = SIZE
    cx = cy = w / 2
    # deck
    perp = angle + math.pi / 2
    length = HEX_R * 0.55
    width = HEX_R * 0.14
    corners = []
    for sx, sy in [(-1, -1), (1, -1), (1, 1), (-1, 1)]:
        x = cx + math.cos(angle) * sx * width + math.cos(perp) * sy * length * 0.15
        # actually span across river (perp to river angle)
        x = cx + math.cos(perp) * sy * length + math.cos(angle) * sx * width
        y = cy + math.sin(perp) * sy * length + math.sin(angle) * sx * width
        corners.append((x, y))
    # rebuild corners properly
    corners = []
    for a in (-1, 1):
        for b in (-1, 1):
            pass
    pts = []
    for s_along in (-length, length):
        for s_w in (-width, width):
            pass
    # four corners: along perp ±length/2, along angle ±width
    for sa in (-1, 1):
        for sw in (-1, 1):
            x = cx + math.cos(perp) * sa * length + math.cos(angle) * sw * width
            y = cy + math.sin(perp) * sa * length + math.sin(angle) * sw * width
            pts.append((x, y))
    # order: fix polygon order
    ordered = [
        (
            cx + math.cos(perp) * -length + math.cos(angle) * -width,
            cy + math.sin(perp) * -length + math.sin(angle) * -width,
        ),
        (
            cx + math.cos(perp) * length + math.cos(angle) * -width,
            cy + math.sin(perp) * length + math.sin(angle) * -width,
        ),
        (
            cx + math.cos(perp) * length + math.cos(angle) * width,
            cy + math.sin(perp) * length + math.sin(angle) * width,
        ),
        (
            cx + math.cos(perp) * -length + math.cos(angle) * width,
            cy + math.sin(perp) * -length + math.sin(angle) * width,
        ),
    ]
    draw.polygon(ordered, fill=(120, 82, 48))
    # planks
    for i in range(7):
        t = -1 + i * 2 / 6
        x1 = cx + math.cos(perp) * t * length + math.cos(angle) * -width
        y1 = cy + math.sin(perp) * t * length + math.sin(angle) * -width
        x2 = cx + math.cos(perp) * t * length + math.cos(angle) * width
        y2 = cy + math.sin(perp) * t * length + math.sin(angle) * width
        draw.line((x1, y1, x2, y2), fill=(90, 60, 34), width=2)
    # rails
    for sw in (-width, width):
        x1 = cx + math.cos(perp) * -length + math.cos(angle) * sw
        y1 = cy + math.sin(perp) * -length + math.sin(angle) * sw
        x2 = cx + math.cos(perp) * length + math.cos(angle) * sw
        y2 = cy + math.sin(perp) * length + math.sin(angle) * sw
        draw.line((x1, y1, x2, y2), fill=(70, 48, 28), width=3)


def draw_cave(draw, rng):
    cx = cy = SIZE / 2
    ox = (rng.random() - 0.5) * HEX_R * 0.25
    oy = (rng.random() - 0.5) * HEX_R * 0.2
    # rock mound
    draw.ellipse((cx + ox - 70, cy + oy - 40, cx + ox + 70, cy + oy + 55), fill=(96, 92, 90))
    draw.ellipse((cx + ox - 55, cy + oy - 55, cx + ox + 50, cy + oy + 20), fill=(120, 116, 112))
    # dark mouth
    draw.ellipse((cx + ox - 28, cy + oy - 5, cx + ox + 28, cy + oy + 38), fill=(18, 16, 22))
    draw.ellipse((cx + ox - 18, cy + oy + 5, cx + ox + 18, cy + oy + 32), fill=(8, 8, 12))
    # rim highlight
    draw.arc((cx + ox - 30, cy + oy - 8, cx + ox + 30, cy + oy + 40), 200, 340, fill=(160, 156, 150), width=3)


def draw_waterfall(draw, rng, angle=0.3):
    draw_river_band(draw, None, rng, angle=angle, width=0.14)
    cx = cy = SIZE / 2
    # cliff face
    pts = [
        (cx - 55, cy - 10),
        (cx - 40, cy - 70),
        (cx + 45, cy - 65),
        (cx + 60, cy - 5),
        (cx + 40, cy + 25),
        (cx - 35, cy + 28),
    ]
    draw.polygon(pts, fill=(112, 110, 118))
    # falling water
    for i in range(8):
        x = cx - 20 + i * 6 + (rng.random() - 0.5) * 3
        draw.line((x, cy - 50, x + (rng.random() - 0.5) * 4, cy + 20), fill=(190, 220, 240), width=3)
    # mist
    draw.ellipse((cx - 40, cy + 10, cx + 40, cy + 45), fill=(210, 230, 240))


def draw_event_marker(draw, rng, kind="ereignis"):
    cx = cy = SIZE / 2
    ox = (rng.random() - 0.5) * 30
    oy = (rng.random() - 0.5) * 30
    if kind == "ruine":
        # broken walls
        draw.rectangle((cx + ox - 25, cy + oy - 15, cx + ox - 10, cy + oy + 25), fill=(140, 136, 130))
        draw.rectangle((cx + ox + 8, cy + oy - 5, cx + ox + 24, cy + oy + 28), fill=(128, 124, 118))
        draw.polygon(
            [
                (cx + ox - 28, cy + oy - 15),
                (cx + ox - 5, cy + oy - 40),
                (cx + ox + 5, cy + oy - 12),
            ],
            fill=(150, 146, 140),
        )
    else:
        # glowing camp / event stone circle
        for i in range(6):
            a = i * math.tau / 6
            x = cx + ox + math.cos(a) * 22
            y = cy + oy + math.sin(a) * 22
            draw.ellipse((x - 5, y - 4, x + 5, y + 4), fill=(120, 118, 112))
        draw.ellipse((cx + ox - 8, cy + oy - 8, cx + ox + 8, cy + oy + 8), fill=(255, 170, 80))
        draw.ellipse((cx + ox - 4, cy + oy - 4, cx + ox + 4, cy + oy + 4), fill=(255, 230, 140))


def compose_tile(spec: dict) -> Image.Image:
    """spec: biome, seed, features[], river_angle?, path_angle?, dual?"""
    seed = int(spec["seed"])
    rng = random.Random(seed)
    biome = spec["biome"]
    if spec.get("dual"):
        # two halves
        a, b = spec["dual"]
        left = paint_biome_field(a, seed, SIZE)
        right = paint_biome_field(b, seed + 7, SIZE)
        img = Image.new("RGB", (SIZE, SIZE))
        # vertical split rotated by rot
        rot = float(spec.get("split_angle", -math.pi / 2))
        yy, xx = np.mgrid[0:SIZE, 0:SIZE]
        cx = cy = SIZE / 2
        # side test via rotated x
        xr = (xx - cx) * math.cos(rot) + (yy - cy) * math.sin(rot)
        mask = xr < 0
        la = np.asarray(left)
        ra = np.asarray(right)
        out = np.where(mask[..., None], la, ra)
        # soft seam
        seam = np.exp(-((xr / 8.0) ** 2))
        out = out * (1 - seam[..., None] * 0.15) + 255 * seam[..., None] * 0.08
        img = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "RGB")
    else:
        img = paint_biome_field(biome, seed, SIZE)

    draw = ImageDraw.Draw(img, "RGBA") if False else ImageDraw.Draw(img)

    # ground details by biome
    if biome == "wald" or (spec.get("dual") and "wald" in spec.get("dual", [])):
        draw_trees(draw, img, rng, count=48 if biome == "wald" else 22, fir=True)
    if biome == "wiese" or (spec.get("dual") and "wiese" in spec.get("dual", [])):
        draw_meadow_detail(draw, rng, img)
    if biome == "berg" or (spec.get("dual") and "berg" in spec.get("dual", [])):
        draw_mountains(draw, rng, img)
    if biome == "moor":
        # reeds
        for _ in range(40):
            ang = rng.random() * math.tau
            rad = rng.random() * HEX_R * 0.8
            x = SIZE / 2 + math.cos(ang) * rad
            y = SIZE / 2 + math.sin(ang) * rad
            draw.line((x, y, x + 1, y - 12 - rng.random() * 10), fill=(40, 80, 55), width=2)

    features = spec.get("features") or []
    if "fluss" in features or biome == "fluss":
        ang = float(spec.get("river_angle", rng.random() * math.pi))
        draw_river_band(draw, img, rng, angle=ang, width=0.16 if biome == "fluss" else 0.12)
    if "pfad" in features or "abzweig" in features:
        ang = float(spec.get("path_angle", 0.4 + rng.random()))
        draw_path(draw, rng, angle=ang, fork=("abzweig" in features))
    if "bruecke" in features:
        ang = float(spec.get("river_angle", 0.2))
        if "fluss" not in features and biome != "fluss":
            draw_river_band(draw, img, rng, angle=ang, width=0.12)
        draw_bridge(draw, rng, angle=ang)
    if "hoehle" in features:
        draw_cave(draw, rng)
    if "wasserfall" in features:
        draw_waterfall(draw, rng, angle=float(spec.get("river_angle", 0.5)))
    if "ereignis" in features:
        draw_event_marker(draw, rng, "ereignis")
    if "ruine" in features:
        draw_event_marker(draw, rng, "ruine")
    if "sturzbruecke" in features:
        # broken bridge
        ang = float(spec.get("river_angle", 0.1))
        if "fluss" not in features and biome != "fluss":
            draw_river_band(draw, img, rng, angle=ang, width=0.13)
        draw_bridge(draw, rng, angle=ang)
        # gap damage
        cx = cy = SIZE / 2
        draw.ellipse((cx - 18, cy - 14, cx + 18, cy + 14), fill=(48, 120, 168))
        draw.polygon([(cx - 22, cy - 8), (cx - 5, cy - 20), (cx + 8, cy - 6)], fill=(90, 60, 34))

    # lighting vignette
    vig = Image.new("RGB", (SIZE, SIZE), (20, 18, 28))
    img = Image.blend(img, vig, 0.08)

    # paper texture
    noise = fbm(SIZE, SIZE, 2, seed + 123)
    nimg = Image.fromarray((noise * 40 + 210).astype(np.uint8), "L").convert("RGB")
    img = Image.blend(img, nimg, 0.07)

    # slight sharpen / painterly
    img = img.filter(ImageFilter.SMOOTH_MORE)
    img = ImageEnhance.Color(img).enhance(1.12)
    img = ImageEnhance.Contrast(img).enhance(1.08)

    # hex crop with transparent outside
    mask = hex_mask()
    rgba = img.convert("RGBA")
    rgba.putalpha(mask)

    # soft rim darkening inside hex
    rim = Image.new("L", (SIZE, SIZE), 0)
    rd = ImageDraw.Draw(rim)
    rd.polygon(hex_corners(SIZE / 2, SIZE / 2, HEX_R - 2), outline=255)
    # expand rim via filter
    rim = rim.filter(ImageFilter.GaussianBlur(6))
    arr = np.asarray(rgba).astype(np.float64)
    rima = np.asarray(rim).astype(np.float64) / 255.0
    # only darken near edge: invert center
    edge = rima  # weak
    # better edge: distance from mask
    # skip heavy; simple border stroke on final
    out = Image.fromarray(arr.astype(np.uint8), "RGBA")
    od = ImageDraw.Draw(out)
    od.polygon(hex_corners(SIZE / 2, SIZE / 2, HEX_R - 1), outline=(30, 26, 22, 220))
    return out


def catalog():
    """Full printable catalog of landscape tiles."""
    tiles = []
    uid = 1
    # mono habitats (variants)
    for bio in ["berg", "wald", "wiese", "moor", "fluss"]:
        for i in range(4):
            tiles.append(
                {
                    "id": f"m-{bio}-{i}",
                    "uid": uid,
                    "biome": bio,
                    "seed": 1000 + uid * 17,
                    "features": ["fluss"] if bio == "fluss" else [],
                    "river_angle": (i * math.pi / 6) if bio == "fluss" else 0,
                    "label": BIOMES[bio]["name"],
                }
            )
            uid += 1
    # dual biomes
    bios = ["berg", "wald", "wiese", "moor", "fluss"]
    for i, a in enumerate(bios):
        for b in bios[i + 1 :]:
            for k in range(2):
                tiles.append(
                    {
                        "id": f"d-{a}-{b}-{k}",
                        "uid": uid,
                        "biome": a,
                        "dual": [a, b],
                        "split_angle": -math.pi / 2 + k * math.pi / 6,
                        "seed": 2000 + uid * 13,
                        "features": [],
                        "label": f"{BIOMES[a]['name']}/{BIOMES[b]['name']}",
                    }
                )
                uid += 1
    # feature landmarks (landscape with paths/events)
    specials = [
        ("wald", ["pfad", "abzweig"], "Pfad-Abzweig"),
        ("wiese", ["pfad", "ereignis"], "Ereignis-Wiese"),
        ("berg", ["hoehle", "pfad"], "Berghöhle"),
        ("fluss", ["bruecke", "fluss"], "Flussbrücke"),
        ("fluss", ["sturzbruecke", "fluss"], "Sturzbrücke"),
        ("berg", ["wasserfall", "fluss"], "Wasserfall"),
        ("wald", ["ruine", "pfad"], "Waldruine"),
        ("moor", ["pfad", "ereignis"], "Moorpfad"),
        ("fels", ["hoehle"], "Felshöhle"),
        ("wiese", ["pfad", "fluss", "bruecke"], "Brückenwiese"),
        ("wald", ["fluss", "bruecke"], "Waldbrücke"),
        ("berg", ["pfad", "abzweig"], "Pass-Abzweig"),
    ]
    for i, (bio, feats, label) in enumerate(specials):
        for v in range(2):
            tiles.append(
                {
                    "id": f"f-{bio}-{i}-{v}",
                    "uid": uid,
                    "biome": bio if bio in BIOMES else "fels",
                    "seed": 5000 + uid * 19,
                    "features": feats,
                    "river_angle": v * math.pi / 5 + 0.2,
                    "path_angle": 0.3 + v * 0.4,
                    "label": label,
                }
            )
            uid += 1
    return tiles


def main():
    tiles = catalog()
    manifest = []
    print(f"Baking {len(tiles)} landscape tiles…")
    for i, spec in enumerate(tiles):
        im = compose_tile(spec)
        fn = f"{spec['id']}.png"
        im.save(OUT / fn, optimize=True)
        manifest.append({**spec, "file": f"assets/tiles/{fn}"})
        if (i + 1) % 10 == 0 or i == len(tiles) - 1:
            print(f"  {i+1}/{len(tiles)} {fn}")
    (ROOT / "assets" / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    # also contact sheet preview
    cols = 8
    tw = 128
    rows = math.ceil(len(tiles) / cols)
    sheet = Image.new("RGBA", (cols * tw, rows * tw), (30, 36, 48, 255))
    for i, spec in enumerate(tiles):
        im = Image.open(OUT / f"{spec['id']}.png").convert("RGBA").resize((tw - 4, tw - 4), Image.Resampling.LANCZOS)
        x = (i % cols) * tw + 2
        y = (i // cols) * tw + 2
        sheet.paste(im, (x, y), im)
    sheet.save(ROOT / "assets" / "contact-sheet.png")
    print("Done.", OUT)
    print("contact-sheet.png + manifest.json")


if __name__ == "__main__":
    main()
