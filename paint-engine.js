/* HEXAGON-AL · shared painterly hex engine
   Deterministic seeds · multi-world palettes · print + digital
   No external image APIs required.
*/
(function (global) {
  'use strict';

  const HLIST = ['berg', 'wald', 'wiese', 'moor', 'fluss'];

  const WORLDS = {
    alpen: {
      id: 'alpen', name: 'Alpenfrühling',
      paper: '#f3eee4', ink: '#2a2430',
      H: {
        berg:  { name: 'Berg',  c: ['#6d6478', '#a89fb2', '#3f3848', '#efe9f4', '#d7d0df'] },
        wald:  { name: 'Wald',  c: ['#1a4a2c', '#2f7a45', '#0d2818', '#7dce86', '#245c34'] },
        wiese: { name: 'Wiese', c: ['#b8974a', '#e2c97a', '#7a6228', '#f6e7b0', '#c9ae5c'] },
        moor:  { name: 'Moor',  c: ['#3a6a6a', '#6aa8a2', '#1f3f3f', '#b7e0da', '#4d8580'] },
        fluss: { name: 'Fluss', c: ['#2f6f98', '#6eb6d9', '#163e58', '#d2eef9', '#3f88b5'] },
      },
    },
    nordmoor: {
      id: 'nordmoor', name: 'Nordmoor',
      paper: '#e8eef0', ink: '#1a2428',
      H: {
        berg:  { name: 'Berg',  c: ['#5a6570', '#8b97a3', '#2e363e', '#dce3e8', '#6d7884'] },
        wald:  { name: 'Wald',  c: ['#143528', '#1f4f38', '#0a1c14', '#5f9e78', '#1a4030'] },
        wiese: { name: 'Wiese', c: ['#6f7d4a', '#9aaa62', '#3f4828', '#d5dfb0', '#879456'] },
        moor:  { name: 'Moor',  c: ['#2f5558', '#4f7f82', '#163033', '#9fc8c6', '#3a6568'] },
        fluss: { name: 'Fluss', c: ['#2a5a72', '#5a9ab4', '#123040', '#c5e2ee', '#3a7088'] },
      },
    },
    herbst: {
      id: 'herbst', name: 'Herbstgold',
      paper: '#f6efe4', ink: '#2c2018',
      H: {
        berg:  { name: 'Berg',  c: ['#7a6558', '#b09888', '#3e322c', '#f0e4da', '#947c6c'] },
        wald:  { name: 'Wald',  c: ['#5a2e14', '#a04a1c', '#2a1408', '#e8a050', '#6e3818'] },
        wiese: { name: 'Wiese', c: ['#c48a28', '#e8b848', '#7a5410', '#f8e090', '#d49c30'] },
        moor:  { name: 'Moor',  c: ['#4a5040', '#7a8060', '#282c20', '#c8c8a0', '#5c6450'] },
        fluss: { name: 'Fluss', c: ['#3a6880', '#78b0c8', '#1c3848', '#d8eef4', '#4a88a0'] },
      },
    },
    flusstal: {
      id: 'flusstal', name: 'Flusstal',
      paper: '#eef4f2', ink: '#1c2830',
      H: {
        berg:  { name: 'Berg',  c: ['#687888', '#a0b0c0', '#384858', '#e8f0f6', '#788898'] },
        wald:  { name: 'Wald',  c: ['#184830', '#2c7048', '#0c2418', '#78c890', '#206038'] },
        wiese: { name: 'Wiese', c: ['#88a048', '#b8d068', '#506028', '#e8f4b8', '#98b050'] },
        moor:  { name: 'Moor',  c: ['#387070', '#68a8a0', '#1c4040', '#b8e8e0', '#489088'] },
        fluss: { name: 'Fluss', c: ['#186898', '#48b0e0', '#0c3858', '#c8f0ff', '#2890c0'] },
      },
    },
    hochsommer: {
      id: 'hochsommer', name: 'Hochsommer',
      paper: '#f7f3e8', ink: '#243018',
      H: {
        berg:  { name: 'Berg',  c: ['#8a8078', '#c0b8b0', '#4a4440', '#f4eeea', '#a09890'] },
        wald:  { name: 'Wald',  c: ['#206030', '#3c9848', '#103818', '#90e098', '#2c7840'] },
        wiese: { name: 'Wiese', c: ['#d0b040', '#f0d868', '#887020', '#fff4b0', '#e0c048'] },
        moor:  { name: 'Moor',  c: ['#408878', '#70c0a8', '#204840', '#c0f0e0', '#50a090'] },
        fluss: { name: 'Fluss', c: ['#2088b8', '#60c8f0', '#104868', '#d0f4ff', '#30a0d0'] },
      },
    },
    daemmerung: {
      id: 'daemmerung', name: 'Dämmerung',
      paper: '#ebe6f0', ink: '#221828',
      H: {
        berg:  { name: 'Berg',  c: ['#584868', '#887898', '#302438', '#e8e0f0', '#685878'] },
        wald:  { name: 'Wald',  c: ['#183828', '#2c5840', '#0c1c14', '#68a080', '#244830'] },
        wiese: { name: 'Wiese', c: ['#887048', '#b89868', '#483828', '#e8d8b0', '#988058'] },
        moor:  { name: 'Moor',  c: ['#304858', '#587888', '#182830', '#b0c8d0', '#405868'] },
        fluss: { name: 'Fluss', c: ['#284868', '#5888a8', '#142438', '#c0dce8', '#386888'] },
      },
    },
  };

  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashStr(s) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function hexCorners(cx, cy, s) {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 3;
      pts.push([cx + s * Math.cos(a), cy + s * Math.sin(a)]);
    }
    return pts;
  }
  function pathHex(ctx, cx, cy, s) {
    const pts = hexCorners(cx, cy, s);
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.closePath();
  }

  function makeMono(h) {
    return { kind: 'mono', a: h, b: null, rot: 0, seed: hashStr('m:' + h), edges() { return Array(6).fill(h); } };
  }
  function makeDual(a, b) {
    return {
      kind: 'dual', a, b, rot: 0, seed: hashStr('d:' + a + '|' + b),
      edges() {
        const e = Array(6);
        for (let i = 0; i < 6; i++) {
          const idx = (i - this.rot + 600) % 6;
          e[i] = idx < 3 ? this.a : this.b;
        }
        return e;
      },
    };
  }
  function cloneTile(t) {
    if (t.kind === 'mono') {
      const n = makeMono(t.a); n.rot = t.rot || 0; n.seed = t.seed; n.uid = t.uid; return n;
    }
    const n = makeDual(t.a, t.b); n.rot = t.rot || 0; n.seed = t.seed; n.uid = t.uid; return n;
  }
  function rotateTile(t, dir = 1) { t.rot = (t.rot + dir + 600) % 6; return t; }

  function buildBag(worldId) {
    const bag = [];
    let uid = 1;
    HLIST.forEach(h => {
      for (let i = 0; i < 5; i++) {
        const t = makeMono(h); t.uid = uid++; t.seed = hashStr(worldId + ':m:' + h + ':' + i); bag.push(t);
      }
    });
    for (let i = 0; i < HLIST.length; i++) {
      for (let j = i + 1; j < HLIST.length; j++) {
        for (let k = 0; k < 3; k++) {
          const t1 = makeDual(HLIST[i], HLIST[j]); t1.uid = uid++; t1.seed = hashStr(worldId + ':d:' + HLIST[i] + HLIST[j] + k); bag.push(t1);
          const t2 = makeDual(HLIST[j], HLIST[i]); t2.uid = uid++; t2.seed = hashStr(worldId + ':d:' + HLIST[j] + HLIST[i] + k); bag.push(t2);
        }
      }
    }
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    return bag;
  }

  function catalogTiles(worldId) {
    // deterministic full set for print (no shuffle)
    const list = [];
    let uid = 1;
    HLIST.forEach(h => {
      for (let i = 0; i < 4; i++) {
        const t = makeMono(h);
        t.uid = uid++;
        t.seed = hashStr(worldId + ':pm:' + h + ':' + i);
        list.push(t);
      }
    });
    for (let i = 0; i < HLIST.length; i++) {
      for (let j = i + 1; j < HLIST.length; j++) {
        for (let k = 0; k < 2; k++) {
          const t1 = makeDual(HLIST[i], HLIST[j]);
          t1.uid = uid++;
          t1.seed = hashStr(worldId + ':pd:' + HLIST[i] + HLIST[j] + k);
          list.push(t1);
          const t2 = makeDual(HLIST[j], HLIST[i]);
          t2.uid = uid++;
          t2.seed = hashStr(worldId + ':pd:' + HLIST[j] + HLIST[i] + k);
          list.push(t2);
        }
      }
    }
    return list;
  }

  function wash(ctx, rng, cx, cy, s, c0, c1, c2) {
    // solid base first (readable at small sizes)
    ctx.fillStyle = c1;
    pathHex(ctx, cx, cy, s + 1);
    ctx.fill();
    const g = ctx.createRadialGradient(cx - s * 0.18, cy - s * 0.22, s * 0.04, cx, cy, s * 1.02);
    g.addColorStop(0, c0);
    g.addColorStop(0.4, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    pathHex(ctx, cx, cy, s + 1);
    ctx.fill();
    // painterly dabs
    for (let i = 0; i < 36; i++) {
      const a = rng() * Math.PI * 2;
      const r = rng() * s * 0.78;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      const rad = s * (0.05 + rng() * 0.14);
      const gg = ctx.createRadialGradient(x, y, 0, x, y, rad);
      const pick = rng() < 0.45 ? c0 : (rng() < 0.5 ? c1 : c2);
      gg.addColorStop(0, pick);
      gg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = 0.16 + rng() * 0.22;
      ctx.fillStyle = gg;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function paperGrain(ctx, rng, cx, cy, s, amount) {
    ctx.save();
    pathHex(ctx, cx, cy, s);
    ctx.clip();
    ctx.globalAlpha = amount;
    for (let i = 0; i < Math.floor(s * 2.2); i++) {
      ctx.fillStyle = rng() < 0.5 ? '#fff' : '#000';
      ctx.fillRect(cx + (rng() * 2 - 1) * s, cy + (rng() * 2 - 1) * s, 1 + rng() * 1.5, 1 + rng() * 1.5);
    }
    // fiber lines
    ctx.globalAlpha = amount * 0.7;
    ctx.strokeStyle = 'rgba(255,255,255,.35)';
    ctx.lineWidth = 0.6;
    for (let i = 0; i < 10; i++) {
      const y = cy - s + rng() * s * 2;
      ctx.beginPath();
      ctx.moveTo(cx - s, y);
      ctx.bezierCurveTo(cx - s * 0.3, y + (rng() - 0.5) * 6, cx + s * 0.3, y + (rng() - 0.5) * 6, cx + s, y);
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function treeFir(ctx, x, y, s, dark, mid, light, rng) {
    ctx.fillStyle = '#3a2418';
    ctx.fillRect(x - s * 0.05, y + s * 0.05, s * 0.1, s * 0.28);
    for (let tier = 0; tier < 3; tier++) {
      const ty = y - s * (0.05 + tier * 0.22);
      const w = s * (0.42 - tier * 0.1);
      const h = s * 0.28;
      ctx.beginPath();
      ctx.moveTo(x, ty - h);
      ctx.lineTo(x + w, ty + h * 0.35);
      ctx.lineTo(x - w, ty + h * 0.35);
      ctx.closePath();
      ctx.fillStyle = tier === 2 ? light : (tier === 1 ? mid : dark);
      ctx.fill();
      // highlight edge
      ctx.strokeStyle = light;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, ty - h);
      ctx.lineTo(x - w * 0.55, ty + h * 0.1);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    // tiny needles scatter
    ctx.fillStyle = light;
    ctx.globalAlpha = 0.25;
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(x + (rng() - 0.5) * s * 0.4, y - rng() * s * 0.55, 1.2, 1.2);
    }
    ctx.globalAlpha = 1;
  }

  function treeRound(ctx, x, y, s, dark, mid, light) {
    ctx.fillStyle = '#4a3020';
    ctx.fillRect(x - s * 0.05, y, s * 0.1, s * 0.3);
    const g = ctx.createRadialGradient(x - s * 0.1, y - s * 0.25, s * 0.05, x, y - s * 0.1, s * 0.42);
    g.addColorStop(0, light);
    g.addColorStop(0.55, mid);
    g.addColorStop(1, dark);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y - s * 0.12, s * 0.34, s * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function mountain(ctx, x, y, s, cols, rng) {
    // foothills base
    ctx.fillStyle = cols[4] || cols[0];
    ctx.beginPath();
    ctx.moveTo(x - s * 0.7, y + s * 0.35);
    ctx.quadraticCurveTo(x, y + s * 0.05, x + s * 0.7, y + s * 0.35);
    ctx.lineTo(x + s * 0.7, y + s * 0.55);
    ctx.lineTo(x - s * 0.7, y + s * 0.55);
    ctx.closePath();
    ctx.fill();
    const peaks = [
      { dx: -0.28, sc: 0.62 + rng() * 0.08 },
      { dx: 0.24, sc: 0.5 + rng() * 0.1 },
      { dx: 0.0, sc: 0.82 + rng() * 0.06 },
    ];
    peaks.sort((a, b) => a.sc - b.sc);
    peaks.forEach((pk, i) => {
      const sc = pk.sc;
      const dx = x + pk.dx * s;
      ctx.beginPath();
      ctx.moveTo(dx - sc * s * 0.42, y + s * 0.32);
      ctx.lineTo(dx, y - sc * s * 0.58);
      ctx.lineTo(dx + sc * s * 0.42, y + s * 0.32);
      ctx.closePath();
      const g = ctx.createLinearGradient(dx - sc * s * 0.35, y, dx + sc * s * 0.35, y);
      g.addColorStop(0, cols[2]);
      g.addColorStop(0.4, cols[i % 2 ? 0 : 1]);
      g.addColorStop(1, cols[4] || cols[0]);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(dx, y - sc * s * 0.58);
      ctx.lineTo(dx + sc * s * 0.42, y + s * 0.32);
      ctx.lineTo(dx + sc * s * 0.06, y + s * 0.32);
      ctx.closePath();
      ctx.fillStyle = 'rgba(20,16,28,.28)';
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(dx - sc * s * 0.14, y - sc * s * 0.22);
      ctx.lineTo(dx, y - sc * s * 0.58);
      ctx.lineTo(dx + sc * s * 0.14, y - sc * s * 0.22);
      ctx.quadraticCurveTo(dx, y - sc * s * 0.12, dx - sc * s * 0.14, y - sc * s * 0.22);
      ctx.fillStyle = 'rgba(255,255,255,.92)';
      ctx.fill();
    });
  }

  function grass(ctx, x, y, s, cols, rng) {
    // ground mottling already in wash
    for (let i = 0; i < 40; i++) {
      const px = x + (rng() - 0.5) * s * 1.2;
      const py = y + (rng() - 0.35) * s * 0.9;
      const h = s * (0.08 + rng() * 0.16);
      ctx.strokeStyle = rng() < 0.5 ? cols[2] : cols[0];
      ctx.globalAlpha = 0.35 + rng() * 0.4;
      ctx.lineWidth = 1 + rng();
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.quadraticCurveTo(px + (rng() - 0.5) * 4, py - h * 0.55, px + (rng() - 0.5) * 3, py - h);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // wildflowers
    const petals = ['#f2a0b4', '#fff1a0', '#dce9ff', '#f7d0a8', '#e8b0ff'];
    for (let i = 0; i < 10; i++) {
      const px = x + (rng() - 0.5) * s * 0.9;
      const py = y + (rng() - 0.4) * s * 0.75;
      const r = s * (0.025 + rng() * 0.03);
      ctx.fillStyle = petals[Math.floor(rng() * petals.length)];
      for (let p = 0; p < 5; p++) {
        const a = (p / 5) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(px + Math.cos(a) * r * 0.7, py + Math.sin(a) * r * 0.7, r * 0.55, r * 0.35, a, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#f6e27a';
      ctx.beginPath();
      ctx.arc(px, py, r * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function moor(ctx, x, y, s, cols, rng) {
    // pools
    for (let i = 0; i < 5; i++) {
      const px = x + (rng() - 0.5) * s * 0.7;
      const py = y + (rng() - 0.4) * s * 0.55;
      const rx = s * (0.14 + rng() * 0.18);
      const ry = s * (0.06 + rng() * 0.08);
      const g = ctx.createRadialGradient(px, py - ry * 0.3, 0, px, py, rx);
      g.addColorStop(0, cols[3]);
      g.addColorStop(0.5, cols[1]);
      g.addColorStop(1, cols[2]);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(px, py, rx, ry, rng() * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(px, py - ry * 0.25, rx * 0.55, ry * 0.25, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    // reeds
    for (let i = 0; i < 16; i++) {
      const px = x + (rng() - 0.5) * s * 0.95;
      const py = y + s * (0.05 + rng() * 0.25);
      const h = s * (0.18 + rng() * 0.28);
      ctx.strokeStyle = rng() < 0.5 ? cols[2] : '#2c4a38';
      ctx.lineWidth = 1.2 + rng();
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.quadraticCurveTo(px + (rng() - 0.5) * 6, py - h * 0.5, px + (rng() - 0.5) * 4, py - h);
      ctx.stroke();
      if (rng() < 0.45) {
        ctx.fillStyle = '#6a5030';
        ctx.beginPath();
        ctx.ellipse(px + (rng() - 0.5) * 2, py - h, 2, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function river(ctx, x, y, s, cols, rng, rotHint) {
    const ang = ((rotHint || 0) % 6) * Math.PI / 3 + (rng() - 0.5) * 0.25;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang * 0.15);
    // main body
    const g = ctx.createLinearGradient(-s, 0, s, 0);
    g.addColorStop(0, cols[2]);
    g.addColorStop(0.35, cols[0]);
    g.addColorStop(0.5, cols[1]);
    g.addColorStop(0.65, cols[0]);
    g.addColorStop(1, cols[2]);
    ctx.strokeStyle = g;
    ctx.lineWidth = s * (0.28 + rng() * 0.06);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-s * 0.85, s * 0.08);
    ctx.bezierCurveTo(-s * 0.3, -s * 0.35, s * 0.15, s * 0.4, s * 0.85, -s * 0.06);
    ctx.stroke();
    // foam highlight
    ctx.strokeStyle = 'rgba(255,255,255,.45)';
    ctx.lineWidth = s * 0.07;
    ctx.beginPath();
    ctx.moveTo(-s * 0.7, s * 0.02);
    ctx.bezierCurveTo(-s * 0.25, -s * 0.28, s * 0.2, s * 0.3, s * 0.7, -s * 0.02);
    ctx.stroke();
    // sparkles
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    for (let i = 0; i < 12; i++) {
      const t = rng();
      const px = lerp(-s * 0.7, s * 0.7, t);
      const py = Math.sin(t * Math.PI * 2) * s * 0.12 + (rng() - 0.5) * s * 0.08;
      ctx.globalAlpha = 0.3 + rng() * 0.5;
      ctx.beginPath();
      ctx.arc(px, py, 1 + rng() * 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // bank pebbles
    ctx.fillStyle = cols[4] || cols[1];
    for (let i = 0; i < 8; i++) {
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.ellipse((rng() - 0.5) * s, (rng() - 0.5) * s * 0.5 + s * 0.2, 3 + rng() * 4, 2 + rng() * 2, rng(), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function paintHabitatRegion(ctx, world, hid, cx, cy, s, rng, rotHint) {
    const cols = world.H[hid].c;
    wash(ctx, rng, cx, cy, s, cols[3], cols[1], cols[2]);
    // secondary soft overlay
    ctx.globalAlpha = 0.18;
    wash(ctx, rng, cx + s * 0.1, cy + s * 0.05, s * 0.9, cols[1], cols[0], cols[2]);
    ctx.globalAlpha = 1;

    if (hid === 'berg') mountain(ctx, cx, cy, s, cols, rng);
    else if (hid === 'wald') {
      const n = 6 + Math.floor(rng() * 5);
      const trees = [];
      for (let i = 0; i < n; i++) {
        trees.push({
          x: cx + (rng() - 0.5) * s * 0.9,
          y: cy + (rng() - 0.3) * s * 0.8,
          sc: s * (0.34 + rng() * 0.42),
          fir: rng() < 0.75,
        });
      }
      trees.sort((a, b) => a.y - b.y);
      trees.forEach(t => {
        if (t.fir) treeFir(ctx, t.x, t.y, t.sc, cols[2], cols[0], cols[3], rng);
        else treeRound(ctx, t.x, t.y, t.sc, cols[2], cols[0], cols[3]);
      });
      ctx.fillStyle = cols[4] || cols[0];
      ctx.globalAlpha = 0.3;
      for (let i = 0; i < 22; i++) {
        ctx.beginPath();
        ctx.arc(cx + (rng() - 0.5) * s, cy + s * 0.18 + (rng() - 0.5) * s * 0.35, 2 + rng() * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    } else if (hid === 'wiese') grass(ctx, cx, cy, s, cols, rng);
    else if (hid === 'moor') moor(ctx, cx, cy, s, cols, rng);
    else if (hid === 'fluss') river(ctx, cx, cy, s, cols, rng, rotHint);

    paperGrain(ctx, rng, cx, cy, s, 0.05);
  }

  function paintTile(ctx, tile, cx, cy, s, opts = {}) {
    const world = WORLDS[opts.world || 'alpen'] || WORLDS.alpen;
    const seed = (tile.seed || 1) ^ (tile.rot || 0) * 9973 ^ hashStr(world.id) ^ (opts.extraSeed || 0);
    const rng = mulberry32(seed >>> 0);
    const edges = tile.edges();

    ctx.save();
    pathHex(ctx, cx, cy, s);
    ctx.clip();

    // paper base
    ctx.fillStyle = world.paper;
    pathHex(ctx, cx, cy, s + 1);
    ctx.fill();

    if (tile.kind === 'mono') {
      paintHabitatRegion(ctx, world, tile.a, cx, cy, s, rng, tile.rot || 0);
    } else {
      const base = -Math.PI / 2 + (tile.rot || 0) * Math.PI / 3;
      // side A
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, s + 2, base, base + Math.PI);
      ctx.closePath();
      ctx.clip();
      paintHabitatRegion(ctx, world, tile.a, cx + Math.cos(base + Math.PI / 2) * s * 0.12, cy + Math.sin(base + Math.PI / 2) * s * 0.12, s, rng, tile.rot || 0);
      ctx.restore();
      // side B
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, s + 2, base + Math.PI, base + Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      const rng2 = mulberry32((seed ^ 0xa5a5a5a5) >>> 0);
      paintHabitatRegion(ctx, world, tile.b, cx + Math.cos(base + Math.PI * 1.5) * s * 0.12, cy + Math.sin(base + Math.PI * 1.5) * s * 0.12, s, rng2, (tile.rot || 0) + 3);
      ctx.restore();
      // organic seam
      const sa = base + Math.PI / 2;
      ctx.strokeStyle = 'rgba(255,255,255,.2)';
      ctx.lineWidth = Math.max(1.5, s * 0.03);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(sa) * (-s), cy + Math.sin(sa) * (-s));
      // wavy seam
      const steps = 10;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const along = -s + t * 2 * s;
        const wob = Math.sin(t * Math.PI * 3 + seed) * s * 0.04;
        const px = cx + Math.cos(sa) * along + Math.cos(sa + Math.PI / 2) * wob;
        const py = cy + Math.sin(sa) * along + Math.sin(sa + Math.PI / 2) * wob;
        ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.strokeStyle = 'rgba(20,16,24,.12)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // edge habitat tint rings (thin — don't fog the painting)
    if (opts.edgeRings !== false) {
      for (let i = 0; i < 6; i++) {
        const h = world.H[edges[i]];
        const a0 = -Math.PI / 2 + i * Math.PI / 3;
        const a1 = a0 + Math.PI / 3;
        const r0 = s * 0.90, r1 = s * 0.995;
        ctx.beginPath();
        ctx.arc(cx, cy, r1, a0, a1);
        ctx.arc(cx, cy, r0, a1, a0, true);
        ctx.closePath();
        ctx.fillStyle = h.c[1];
        ctx.globalAlpha = 0.28;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // light vignette only
    const vg = ctx.createRadialGradient(cx, cy, s * 0.45, cx, cy, s);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(20,16,28,.12)');
    ctx.fillStyle = vg;
    pathHex(ctx, cx, cy, s);
    ctx.fill();

    ctx.restore();

    // outer rim (outside clip)
    pathHex(ctx, cx, cy, s);
    ctx.strokeStyle = opts.selected ? '#f0a35e' : (opts.print ? 'rgba(30,24,20,.75)' : 'rgba(20,24,32,.55)');
    ctx.lineWidth = opts.selected ? Math.max(3, s * 0.06) : Math.max(1.5, s * 0.035);
    ctx.stroke();
    if (opts.print) {
      // cut guide slightly outside
      pathHex(ctx, cx, cy, s + Math.max(1, s * 0.02));
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = 'rgba(80,70,60,.35)';
      ctx.lineWidth = 0.6;
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // —— Print packing (pointy-top hexes) ——
  // flatToFlatMm = distance between parallel flats (common boardgame measure)
  function hexMetrics(flatToFlatMm) {
    const size = flatToFlatMm / Math.sqrt(3); // center → vertex in mm
    const width = flatToFlatMm; // flat to flat = width for pointy
    const height = 2 * size; // point to point
    const col = width;
    const row = 1.5 * size;
    const oddOffset = width / 2;
    return { size, width, height, col, row, oddOffset, flatToFlatMm };
  }

  const PAPER = {
    A4: { w: 210, h: 297, label: 'A4' },
    A3: { w: 297, h: 420, label: 'A3' },
    Letter: { w: 215.9, h: 279.4, label: 'US Letter' },
    A5: { w: 148, h: 210, label: 'A5' },
  };

  function packHexes(paperKey, flatToFlatMm, opts = {}) {
    const paper = PAPER[paperKey] || PAPER.A4;
    const margin = opts.marginMm ?? 6;
    const gap = opts.gapMm ?? 1.2; // scissors kerf / small gutter
    const m = hexMetrics(flatToFlatMm);
    // effective cell including gap
    const cellW = m.width + gap;
    const cellH = m.row + gap * 0.75;
    const usableW = paper.w - margin * 2;
    const usableH = paper.h - margin * 2 - (opts.headerMm || 14);

    // how many columns in even rows
    let colsEven = Math.floor((usableW - m.width) / cellW) + 1;
    let colsOdd = Math.floor((usableW - m.width - m.oddOffset) / cellW) + 1;
    colsEven = Math.max(1, colsEven);
    colsOdd = Math.max(0, colsOdd);

    const positions = [];
    let row = 0;
    while (true) {
      const odd = row % 2 === 1;
      const cols = odd ? colsOdd : colsEven;
      if (cols <= 0) break;
      const y = margin + (opts.headerMm || 14) + m.height / 2 + row * cellH;
      if (y + m.height / 2 > paper.h - margin) break;
      for (let c = 0; c < cols; c++) {
        const x = margin + (odd ? m.oddOffset : 0) + m.width / 2 + c * cellW;
        if (x + m.width / 2 > paper.w - margin) continue;
        positions.push({ x, y, row, col: c });
      }
      row++;
      if (row > 80) break;
    }
    // waste estimate
    const hexArea = (3 * Math.sqrt(3) / 2) * m.size * m.size;
    const pageArea = paper.w * paper.h;
    const used = positions.length * hexArea;
    const wastePct = Math.max(0, 100 * (1 - used / pageArea));
    return {
      paper, metrics: m, positions,
      countPerPage: positions.length,
      hexAreaMm2: hexArea,
      wastePct,
      margin, gap,
    };
  }

  function tileCaption(tile, world) {
    if (tile.kind === 'mono') return world.H[tile.a].name;
    return world.H[tile.a].name + ' / ' + world.H[tile.b].name;
  }

  global.HexPaint = {
    HLIST, WORLDS, PAPER,
    mulberry32, hashStr, hexCorners, pathHex,
    makeMono, makeDual, cloneTile, rotateTile, buildBag, catalogTiles,
    paintTile, hexMetrics, packHexes, tileCaption,
  };
})(typeof window !== 'undefined' ? window : globalThis);
