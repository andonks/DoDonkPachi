import { useEffect, useRef, useState } from 'react';
import * as Audio from './audio.js';

const W = 480;
const H = 640;

// ─── Drawing ──────────────────────────────────────────────────────────────────

function drawPlayer(ctx, x, y, frame, focused) {
  ctx.save();
  ctx.translate(x, y);

  // Engine glow
  const g = ctx.createRadialGradient(0, 10, 2, 0, 10, 24);
  g.addColorStop(0, 'rgba(0,200,255,0.85)');
  g.addColorStop(1, 'rgba(0,0,200,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 10, 22, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wings
  ctx.fillStyle = focused ? '#0099bb' : '#007aa0';
  ctx.beginPath();
  ctx.moveTo(-13, 4);  ctx.lineTo(-26, 14); ctx.lineTo(-21, -2); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo( 13, 4);  ctx.lineTo( 26, 14); ctx.lineTo( 21, -2); ctx.closePath(); ctx.fill();

  // Body
  ctx.fillStyle = focused ? '#00ffff' : '#00ddee';
  ctx.beginPath();
  ctx.moveTo(0, -17);
  ctx.lineTo(11, 2);
  ctx.lineTo(9, 15);
  ctx.lineTo(-9, 15);
  ctx.lineTo(-11, 2);
  ctx.closePath();
  ctx.fill();

  // Cockpit
  ctx.fillStyle = '#aaffff';
  ctx.beginPath();
  ctx.ellipse(0, -4, 4, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Engine flame
  const fl = 3 + Math.sin(frame * 0.4) * 2.5;
  ctx.fillStyle = '#ff7700';
  ctx.beginPath();
  ctx.moveTo(-6, 15); ctx.lineTo(6, 15); ctx.lineTo(0, 15 + fl * 2.8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffee00';
  ctx.beginPath();
  ctx.moveTo(-3, 15); ctx.lineTo(3, 15); ctx.lineTo(0, 15 + fl * 1.4); ctx.closePath(); ctx.fill();

  ctx.restore();
}

function drawEnemy(ctx, e, frame) {
  const { x, y, type, hp, maxHp } = e;
  const t = hp / maxHp;
  ctx.save();
  ctx.translate(x, y);

  if (type === 'grunt') {
    ctx.fillStyle = `hsl(${t * 18},90%,55%)`;
    ctx.beginPath();
    ctx.moveTo(0, 13); ctx.lineTo(-13, -4); ctx.lineTo(-17, 2);
    ctx.lineTo(0, 7); ctx.lineTo(17, 2); ctx.lineTo(13, -4);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff9999';
    ctx.beginPath(); ctx.ellipse(0, 5, 4, 5, 0, 0, Math.PI * 2); ctx.fill();

  } else if (type === 'fighter') {
    ctx.fillStyle = `hsl(${20 + t * 18},90%,55%)`;
    ctx.beginPath();
    ctx.moveTo(0, 19); ctx.lineTo(-20, -2); ctx.lineTo(-13, -17);
    ctx.lineTo(0, -9); ctx.lineTo(13, -17); ctx.lineTo(20, -2);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffbb66';
    ctx.beginPath(); ctx.ellipse(0, 2, 5, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#cc5500';
    ctx.fillRect(-19, -5, 5, 11); ctx.fillRect(14, -5, 5, 11);

  } else if (type === 'bomber') {
    const pulse = 1 + Math.sin(frame * 0.09) * 0.04;
    ctx.scale(pulse, pulse);
    ctx.fillStyle = `hsl(${t * 10},90%,38%)`;
    ctx.beginPath(); ctx.ellipse(0, 0, 26, 18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `hsl(${t * 10},90%,52%)`;
    ctx.beginPath();
    ctx.moveTo(0, 24); ctx.lineTo(-36, 4); ctx.lineTo(-32, -10);
    ctx.lineTo(32, -10); ctx.lineTo(36, 4);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#660000';
    [-19, 0, 19].forEach(ox => ctx.fillRect(ox - 3, 14, 6, 14));
    const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, 10);
    cg.addColorStop(0, '#ff4444'); cg.addColorStop(1, 'transparent');
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.ellipse(0, 0, 10, 8, 0, 0, Math.PI * 2); ctx.fill();

  } else if (type === 'boss') {
    const pulse = 1 + Math.sin(frame * 0.05) * 0.025;
    ctx.scale(pulse, pulse);

    // Wings
    ctx.fillStyle = '#770077';
    ctx.beginPath();
    ctx.moveTo(0, 46); ctx.lineTo(-72, 10); ctx.lineTo(-52, -28);
    ctx.lineTo(0, -20); ctx.lineTo(52, -28); ctx.lineTo(72, 10);
    ctx.closePath(); ctx.fill();

    // Body
    ctx.fillStyle = '#550055';
    ctx.beginPath(); ctx.ellipse(0, 0, 56, 38, 0, 0, Math.PI * 2); ctx.fill();

    // Core glow
    const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
    cg.addColorStop(0, '#ff00ff');
    cg.addColorStop(0.5, '#880088');
    cg.addColorStop(1, 'rgba(100,0,100,0)');
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.ellipse(0, 0, 30, 30, 0, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#ffaaff';
    ctx.beginPath(); ctx.ellipse(0, 0, 11, 11, 0, 0, Math.PI * 2); ctx.fill();

    // Weapon pods
    [-42, 42].forEach(ox => {
      ctx.fillStyle = '#550055';
      ctx.beginPath(); ctx.ellipse(ox, 14, 11, 15, 0, 0, Math.PI * 2); ctx.fill();
      const pg = ctx.createRadialGradient(ox, 20, 0, ox, 20, 7);
      pg.addColorStop(0, '#ff00ff'); pg.addColorStop(1, 'transparent');
      ctx.fillStyle = pg;
      ctx.beginPath(); ctx.arc(ox, 20, 7, 0, Math.PI * 2); ctx.fill();
    });

    // HP bar
    const hpW = 110;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(-hpW / 2, -58, hpW, 9);
    ctx.fillStyle = `hsl(${t * 120},90%,50%)`;
    ctx.fillRect(-hpW / 2, -58, hpW * t, 9);
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 1;
    ctx.strokeRect(-hpW / 2, -58, hpW, 9);
  }

  ctx.restore();
}

function drawBullet(ctx, b, frame) {
  ctx.save();
  if (b.owner === 'player') {
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 7);
    g.addColorStop(0, '#ffffcc'); g.addColorStop(0.4, '#ffff00'); g.addColorStop(1, 'rgba(255,180,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(b.x, b.y, b.pw ? 5 : 3, b.pw ? 10 : 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.ellipse(b.x, b.y, b.pw ? 2 : 1.5, b.pw ? 5 : 4, 0, 0, Math.PI * 2); ctx.fill();
  } else {
    const p = 0.8 + Math.sin(frame * 0.22 + b.id * 1.7) * 0.2;
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 8 * p);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, b.color || '#ffee00'); g.addColorStop(1, 'rgba(200,150,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(b.x, b.y, 7 * p, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffaa';
    ctx.beginPath(); ctx.arc(b.x, b.y, 3 * p, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function drawParticle(ctx, p) {
  const a = Math.max(0, p.life / p.maxLife);
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, Math.max(0.1, p.r * (0.4 + a * 0.6)), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawExplosion(ctx, ex) {
  if (ex.delay > 0) return;
  const t = ex.life / ex.maxLife;   // 1 → 0
  const r = ex.maxR * (1 - t);      // expands 0 → maxR

  ctx.save();

  // Inner fireball glow (only in first ~60% of life)
  if (t > 0.4) {
    const ft = (t - 0.4) / 0.6;
    const gr = ctx.createRadialGradient(ex.x, ex.y, 0, ex.x, ex.y, r * 0.75 + 6);
    gr.addColorStop(0,   `rgba(255,255,255,${ft * 0.9})`);
    gr.addColorStop(0.3, `rgba(255,210,80,${ft * 0.65})`);
    gr.addColorStop(1,   'rgba(255,60,0,0)');
    ctx.fillStyle = gr;
    ctx.beginPath();
    ctx.arc(ex.x, ex.y, r * 0.75 + 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Primary shockwave ring — thick at birth, thins as it expands
  ctx.globalAlpha = t * 0.9;
  ctx.strokeStyle = ex.color;
  ctx.lineWidth = Math.max(0.5, 6 * t * t);
  ctx.beginPath();
  ctx.arc(ex.x, ex.y, Math.max(1, r), 0, Math.PI * 2);
  ctx.stroke();

  // Faint secondary ring slightly ahead
  ctx.globalAlpha = t * 0.35;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(ex.x, ex.y, Math.max(1, r * 1.18), 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

// Spawn one or more explosion rings appropriate for the given type
function spawnExplosionRings(s, x, y, type) {
  const arr = s.explosions;
  const push = (dx, dy, maxR, life, color, delay = 0) =>
    arr.push({ x: x + dx, y: y + dy, maxR, life, maxLife: life, color, delay });

  if (type === 'grunt') {
    push(0, 0, 34, 22, '#ff8800');
  } else if (type === 'fighter') {
    push(0, 0, 52, 28, '#ffaa00');
    push(0, 0, 28, 18, '#ffffff', 4);
  } else if (type === 'bomber') {
    push(0, 0, 80, 38, '#ff5500');
    push(0, 0, 50, 28, '#ffcc00', 6);
    push(0, 0, 26, 18, '#ffffff', 12);
  } else if (type === 'boss') {
    const colors = ['#ff4400', '#ff8800', '#ffcc00', '#ffffff', '#ff2200'];
    for (let i = 0; i < 5; i++) {
      const dx = (Math.random() - 0.5) * 60;
      const dy = (Math.random() - 0.5) * 40;
      push(dx, dy, 65 + i * 18, 42 + i * 7, colors[i], i * 7);
    }
  } else if (type === 'player') {
    push(0, 0, 58, 32, '#00ffff');
    push(0, 0, 32, 22, '#ffffff', 5);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _bid = 0;
function mkBullet(x, y, vx, vy, owner = 'enemy', color) {
  return { x, y, vx, vy, owner, id: _bid++, color };
}

let _cid = 0;
function mkCollectable(x, y) {
  return {
    x: x + (Math.random() - 0.5) * 20,
    y: y + (Math.random() - 0.5) * 10,
    vy: 1.2,
    vx: (Math.random() - 0.5) * 0.8,
    id: _cid++,
  };
}

const DROP_COUNT = { grunt: 1, fighter: 2, bomber: 5, boss: 20 };
const COLLECT_PTS = 200;

function drawCollectable(ctx, c, frame) {
  const r = 9;
  const pulse = 1 + Math.sin(frame * 0.14 + c.id * 1.9) * 0.1;
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(frame * 0.025 + c.id * 0.8);

  // Outer glow
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 2.2);
  glow.addColorStop(0, 'rgba(0,255,120,0.35)');
  glow.addColorStop(1, 'rgba(0,200,80,0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(0, 0, r * 2.2, 0, Math.PI * 2); ctx.fill();

  // Hexagon body
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const x = Math.cos(a) * r * pulse;
    const y = Math.sin(a) * r * pulse;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = '#00bb44';
  ctx.fill();
  ctx.strokeStyle = '#88ffbb';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Inner highlight hexagon
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const x = Math.cos(a) * r * 0.48;
    const y = Math.sin(a) * r * 0.48;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(180,255,210,0.45)';
  ctx.fill();

  ctx.restore();
}

function aim(sx, sy, tx, ty, spd) {
  const d = Math.hypot(tx - sx, ty - sy) || 1;
  return { vx: (tx - sx) / d * spd, vy: (ty - sy) / d * spd };
}

function circle(x, y, n, spd, off = 0) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + off;
    return mkBullet(x, y, Math.cos(a) * spd, Math.sin(a) * spd);
  });
}

function spread(x, y, n, ca, sa, spd, color) {
  return Array.from({ length: n }, (_, i) => {
    const a = ca + sa * (i / (n - 1) - 0.5);
    return mkBullet(x, y, Math.cos(a) * spd, Math.sin(a) * spd, 'enemy', color);
  });
}

function spawnParticles(arr, x, y, n, colors, spdRange, rRange) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const spd = spdRange[0] + Math.random() * (spdRange[1] - spdRange[0]);
    const life = 20 + Math.random() * 30;
    arr.push({
      x, y,
      vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
      r: rRange[0] + Math.random() * (rRange[1] - rRange[0]),
      life, maxLife: life,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }
}

function explode(s, x, y, sz = 1) {
  s.shake = Math.max(s.shake, 7 * sz);
  const { particles: p } = s;

  // spark ring
  const n = Math.round(14 * sz);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.4;
    const spd = 2 + Math.random() * 5 * sz;
    const life = 18 + Math.random() * 22;
    p.push({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
      r: 2 + Math.random() * 2, life, maxLife: life,
      color: ['#ffff00','#ff8800','#ff4400'][Math.floor(Math.random() * 3)] });
  }
  // debris
  for (let i = 0; i < Math.round(10 * sz); i++) {
    const a = Math.random() * Math.PI * 2;
    const spd = Math.random() * 4 * sz;
    const life = 35 + Math.random() * 40;
    p.push({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
      r: 1.5 + Math.random() * 3, life, maxLife: life,
      color: ['#ffffff','#ffddaa','#ff6600'][Math.floor(Math.random() * 3)] });
  }
  // smoke
  for (let i = 0; i < Math.round(6 * sz); i++) {
    const a = Math.random() * Math.PI * 2;
    const spd = Math.random() * 1.5;
    const life = 28 + Math.random() * 30;
    p.push({ x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - 0.6,
      r: 5 + Math.random() * 7 * sz, life, maxLife: life, color: '#2a2a2a' });
  }
}

// ─── Enemy definitions ────────────────────────────────────────────────────────

const EDEFS = {
  grunt:   { w: 24, h: 20, maxHp: 3,    score: 100,   fireRate: 200, bspd: 1.75 },
  fighter: { w: 36, h: 30, maxHp: 8,    score: 400,   fireRate: 140, bspd: 2    },
  bomber:  { w: 54, h: 42, maxHp: 30,   score: 1200,  fireRate: 76,  bspd: 1.4  },
  boss:    { w: 120,h: 90, maxHp: 1000, score: 80000, fireRate: 36,  bspd: 1.75 },
};

function createEnemy(type, x, pattern, vy = 1.5) {
  const d = EDEFS[type];
  return {
    x, y: -(d.h / 2 + 10),
    type, pattern,
    w: d.w, h: d.h,
    hp: d.maxHp, maxHp: d.maxHp,
    score: d.score,
    fireRate: d.fireRate,
    bspd: d.bspd,
    vy,
    timer: 0,
    fireTimer: Math.floor(Math.random() * 50),
    dead: false,
    angle: 0,          // pattern angle accumulator
    phase: 0,
  };
}

function updateEnemy(e, px, py, bullets) {
  e.timer++;
  e.fireTimer++;

  // Movement
  switch (e.pattern) {
    case 'straight':
      e.y += e.vy;
      break;
    case 'curve_r':
      e.y += e.vy;
      e.x += Math.sin(e.timer * 0.025) * 2.2;
      break;
    case 'curve_l':
      e.y += e.vy;
      e.x -= Math.sin(e.timer * 0.025) * 2.2;
      break;
    case 'zigzag':
      e.y += e.vy;
      e.x += Math.sin(e.timer * 0.055) * 3;
      break;
    case 'hover_c':
      if (e.y < H * 0.22) e.y += e.vy;
      e.x = W / 2 + Math.sin(e.timer * 0.014) * (W * 0.28);
      break;
    case 'hover_l':
      if (e.y < H * 0.22) e.y += e.vy;
      e.x = W * 0.27 + Math.sin(e.timer * 0.018) * (W * 0.14);
      break;
    case 'hover_r':
      if (e.y < H * 0.22) e.y += e.vy;
      e.x = W * 0.73 + Math.sin(e.timer * 0.018) * (W * 0.14);
      break;
    case 'boss': {
      if (e.y < H * 0.2) {
        e.y += e.vy;
      } else {
        const targetX = W / 2 + Math.sin(e.timer * 0.009) * 160;
        e.x += (targetX - e.x) * 0.03;
        if (e.hp < e.maxHp * 0.5 && e.phase === 0) {
          e.phase = 1;
        }
        if (e.phase === 1) {
          e.y = H * 0.2 + Math.sin(e.timer * 0.013) * 55;
        }
      }
      break;
    }
  }

  // Shooting
  if (e.fireTimer < e.fireRate) return;
  e.fireTimer = 0;

  switch (e.type) {
    case 'grunt': {
      const v = aim(e.x, e.y, px, py, e.bspd);
      bullets.push(mkBullet(e.x, e.y, v.vx, v.vy));
      break;
    }
    case 'fighter': {
      const ca = Math.atan2(py - e.y, px - e.x);
      spread(e.x, e.y, 3, ca, 0.38, e.bspd, '#ffee00').forEach(b => bullets.push(b));
      break;
    }
    case 'bomber': {
      circle(e.x, e.y, 14, e.bspd, e.angle).forEach(b => bullets.push(b));
      e.angle += 0.22;
      const v = aim(e.x, e.y, px, py, e.bspd * 1.3);
      [-18, 0, 18].forEach(ox => bullets.push(mkBullet(e.x + ox, e.y + 22, v.vx, v.vy, 'enemy', '#ffaa00')));
      break;
    }
    case 'boss': {
      const ratio = e.hp / e.maxHp;
      if (ratio > 0.66) {
        circle(e.x, e.y, 18, e.bspd, e.angle).forEach(b => bullets.push(b));
        e.angle += 0.18;
      } else if (ratio > 0.33) {
        circle(e.x, e.y, 18, e.bspd, e.angle).forEach(b => bullets.push(b));
        circle(e.x, e.y, 18, e.bspd * 0.65, -e.angle * 0.8).forEach(b => bullets.push(b));
        e.angle += 0.22;
        // aimed burst from pods
        if (e.timer % 40 === 0) {
          [-42, 42].forEach(ox => {
            const v = aim(e.x + ox, e.y + 20, px, py, e.bspd * 1.2);
            for (let i = 0; i < 4; i++) {
              bullets.push(mkBullet(e.x + ox, e.y + 20,
                v.vx + (Math.random() - 0.5) * 0.6, v.vy + (Math.random() - 0.5) * 0.6,
                'enemy', '#ffee00'));
            }
          });
        }
      } else {
        circle(e.x, e.y, 24, e.bspd, e.angle).forEach(b => bullets.push(b));
        circle(e.x, e.y, 16, e.bspd * 1.5, -e.angle * 1.3).forEach(b => bullets.push(b));
        e.angle += 0.3;
        if (e.timer % 28 === 0) {
          [-42, 42].forEach(ox => {
            const v = aim(e.x + ox, e.y + 20, px, py, e.bspd * 1.4);
            for (let i = 0; i < 5; i++) {
              bullets.push(mkBullet(e.x + ox, e.y + 20,
                v.vx + (Math.random() - 0.5) * 0.8, v.vy + (Math.random() - 0.5) * 0.8,
                'enemy', '#ffee00'));
            }
          });
        }
        const v = aim(e.x, e.y, px, py, e.bspd * 1.6);
        spread(e.x, e.y, 5, Math.atan2(py - e.y, px - e.x), 0.6, e.bspd * 1.6, '#ffaaff').forEach(b => bullets.push(b));
      }
      break;
    }
  }
}

// ─── Wave scripts ─────────────────────────────────────────────────────────────
// Each entry: { at: frameOffset, type, x, pattern, vy }

const WAVES = [
  // 0: Opener — grunts (12)
  [
    { at:  0, type:'grunt',   x: 80,  pat:'straight', vy:1.6 },
    { at:  0, type:'grunt',   x:400,  pat:'straight', vy:1.6 },
    { at: 20, type:'grunt',   x:190,  pat:'straight', vy:1.6 },
    { at: 20, type:'grunt',   x:290,  pat:'straight', vy:1.6 },
    { at: 40, type:'grunt',   x:130,  pat:'straight', vy:1.6 },
    { at: 40, type:'grunt',   x:350,  pat:'straight', vy:1.6 },
    { at: 60, type:'grunt',   x: 60,  pat:'straight', vy:1.9 },
    { at: 60, type:'grunt',   x:420,  pat:'straight', vy:1.9 },
    { at: 80, type:'grunt',   x:160,  pat:'zigzag',   vy:1.8 },
    { at: 80, type:'grunt',   x:320,  pat:'zigzag',   vy:1.8 },
    { at:100, type:'grunt',   x:240,  pat:'straight', vy:2.0 },
    { at:120, type:'grunt',   x:200,  pat:'straight', vy:2.0 },
  ],
  // 1: Fighters + grunts (10)
  [
    { at:  0, type:'fighter', x:100,  pat:'curve_r',  vy:1.2 },
    { at:  0, type:'fighter', x:380,  pat:'curve_l',  vy:1.2 },
    { at: 30, type:'fighter', x:200,  pat:'curve_r',  vy:1.2 },
    { at: 30, type:'fighter', x:280,  pat:'curve_l',  vy:1.2 },
    { at: 60, type:'grunt',   x:160,  pat:'straight', vy:2.1 },
    { at: 60, type:'grunt',   x:320,  pat:'straight', vy:2.1 },
    { at: 75, type:'grunt',   x: 80,  pat:'straight', vy:2.1 },
    { at: 75, type:'grunt',   x:400,  pat:'straight', vy:2.1 },
    { at: 90, type:'grunt',   x:240,  pat:'zigzag',   vy:1.6 },
    { at:110, type:'grunt',   x:200,  pat:'zigzag',   vy:1.6 },
  ],
  // 2: Bombers + escort (14)
  [
    { at:  0, type:'bomber',  x:160,  pat:'hover_l',  vy:0.9 },
    { at:  0, type:'bomber',  x:320,  pat:'hover_r',  vy:0.9 },
    { at: 40, type:'grunt',   x:100,  pat:'straight', vy:2.2 },
    { at: 40, type:'grunt',   x:380,  pat:'straight', vy:2.2 },
    { at: 55, type:'grunt',   x: 60,  pat:'straight', vy:2.2 },
    { at: 55, type:'grunt',   x:420,  pat:'straight', vy:2.2 },
    { at: 90, type:'grunt',   x: 80,  pat:'curve_r',  vy:1.7 },
    { at: 90, type:'grunt',   x:400,  pat:'curve_l',  vy:1.7 },
    { at:110, type:'grunt',   x:150,  pat:'curve_r',  vy:1.7 },
    { at:110, type:'grunt',   x:330,  pat:'curve_l',  vy:1.7 },
    { at:130, type:'grunt',   x:200,  pat:'zigzag',   vy:2   },
    { at:130, type:'grunt',   x:280,  pat:'zigzag',   vy:2   },
    { at:150, type:'grunt',   x:130,  pat:'zigzag',   vy:2   },
    { at:150, type:'grunt',   x:350,  pat:'zigzag',   vy:2   },
  ],
  // 3: Fighter formation (14)
  [
    { at:  0, type:'fighter', x: 80,  pat:'zigzag',   vy:1.5 },
    { at:  0, type:'fighter', x:400,  pat:'zigzag',   vy:1.5 },
    { at: 20, type:'fighter', x:140,  pat:'zigzag',   vy:1.5 },
    { at: 20, type:'fighter', x:340,  pat:'zigzag',   vy:1.5 },
    { at: 40, type:'fighter', x:180,  pat:'curve_r',  vy:1.3 },
    { at: 40, type:'fighter', x:300,  pat:'curve_l',  vy:1.3 },
    { at: 60, type:'fighter', x:240,  pat:'straight', vy:1.4 },
    { at: 60, type:'fighter', x:120,  pat:'curve_r',  vy:1.3 },
    { at: 80, type:'grunt',   x:130,  pat:'straight', vy:2.5 },
    { at: 80, type:'grunt',   x:240,  pat:'straight', vy:2.5 },
    { at: 80, type:'grunt',   x:350,  pat:'straight', vy:2.5 },
    { at:100, type:'grunt',   x: 80,  pat:'straight', vy:2.5 },
    { at:100, type:'grunt',   x:190,  pat:'straight', vy:2.5 },
    { at:100, type:'grunt',   x:300,  pat:'straight', vy:2.5 },
  ],
  // 4: Four bombers + escorts (10)
  [
    { at:  0, type:'bomber',  x:130,  pat:'hover_l',  vy:1.0 },
    { at:  0, type:'bomber',  x:350,  pat:'hover_r',  vy:1.0 },
    { at: 60, type:'bomber',  x:200,  pat:'hover_c',  vy:1.0 },
    { at: 60, type:'bomber',  x:280,  pat:'hover_c',  vy:1.0 },
    { at: 30, type:'grunt',   x:240,  pat:'straight', vy:2.6 },
    { at: 50, type:'grunt',   x:160,  pat:'zigzag',   vy:2.1 },
    { at: 50, type:'grunt',   x:320,  pat:'zigzag',   vy:2.1 },
    { at: 90, type:'grunt',   x: 80,  pat:'zigzag',   vy:2.1 },
    { at: 90, type:'grunt',   x:400,  pat:'zigzag',   vy:2.1 },
    { at:110, type:'grunt',   x:240,  pat:'straight', vy:2.6 },
  ],
  // 5: BOSS
  [
    { at:  0, type:'boss',    x:240,  pat:'boss',     vy:0.55 },
  ],
];

// ─── Collision ────────────────────────────────────────────────────────────────

function overlaps(ax, ay, aw, ah, bx, by, bw, bh) {
  return (
    ax - aw / 2 < bx + bw / 2 &&
    ax + aw / 2 > bx - bw / 2 &&
    ay - ah / 2 < by + bh / 2 &&
    ay + ah / 2 > by - bh / 2
  );
}

// ─── Scrolling background buildings ──────────────────────────────────────────

function makeBuildings() {
  const b = [];
  for (let i = 0; i < 30; i++) {
    b.push({
      x: Math.random() * W,
      y: Math.random() * H,
      w: 20 + Math.random() * 50,
      h: 30 + Math.random() * 80,
      spd: 0.4 + Math.random() * 0.6,
      hue: Math.random() < 0.5 ? 210 : (Math.random() < 0.5 ? 270 : 180),
      alpha: 0.05 + Math.random() * 0.1,
    });
  }
  return b;
}

// ─── Game init ────────────────────────────────────────────────────────────────

function initState() {
  return {
    frame: 0,
    player: {
      x: W / 2, y: H - 100,
      w: 28, h: 32,
      hp: 3,
      invTimer: 0,
      shootTimer: 0,
      bombs: 3,
    },
    playerBullets: [],
    enemies: [],
    enemyBullets: [],
    particles: [],
    stars: Array.from({ length: 180 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vy: 0.35 + Math.random() * 2.8,
      r: Math.random() * 1.6 + 0.3,
      alpha: 0.2 + Math.random() * 0.8,
      hue: Math.random() < 0.12 ? 50 : (Math.random() < 0.18 ? 200 : 0),
    })),
    buildings: makeBuildings(),
    score: 0,
    lives: 3,
    waveIdx: 0,
    waveTimer: 0,
    waveQueue: [...WAVES[0]],
    waveClear: false,
    waveDelay: 0,
    bossDefeated: false,
    explosions: [],
    collectables: [],
    chain: 0,
    chainTimer: 0,
    shake: 0,
    shakeX: 0,
    shakeY: 0,
  };
}

// ─── Leaderboard helpers ──────────────────────────────────────────────────────

const LS_KEY = 'dondokpachi_scores';

function loadScores() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
  catch { return []; }
}

function saveScore(initials, score) {
  const scores = loadScores();
  scores.push({ initials, score, isNew: true });
  scores.sort((a, b) => b.score - a.score);
  scores.splice(10);
  localStorage.setItem(LS_KEY, JSON.stringify(
    scores.map(s => ({ initials: s.initials, score: s.score }))
  ));
  return scores; // isNew flag only lives in memory for highlighting
}

// ─── Component ────────────────────────────────────────────────────────────────

const STYLES = {
  wrapper: {
    position: 'relative',
    width: W,
    height: H,
    userSelect: 'none',
  },
  canvas: {
    display: 'block',
    imageRendering: 'pixelated',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.78)',
    color: '#fff',
    fontFamily: 'monospace',
    textAlign: 'center',
    gap: 18,
  },
  title: { fontSize: 38, color: '#00ffff', textShadow: '0 0 20px #00ffff, 0 0 40px #0088ff', letterSpacing: 4 },
  sub: { fontSize: 15, color: '#aaeeff', letterSpacing: 2 },
  controls: { fontSize: 12, color: '#667788', lineHeight: 1.8 },
  score: { fontSize: 22, color: '#ffff00' },
  btn: {
    padding: '10px 32px',
    fontSize: 16,
    fontFamily: 'monospace',
    background: '#00ffff',
    color: '#000',
    border: 'none',
    cursor: 'pointer',
    letterSpacing: 2,
    fontWeight: 'bold',
  },
};

export default function Game() {
  const canvasRef     = useRef(null);
  const stateRef      = useRef(null);
  const rafRef        = useRef(null);
  const keysRef       = useRef({});
  const initialsRef   = useRef('');
  const hiScoreRef    = useRef(0);
  const [screen, setScreen]               = useState('title');
  const [finalScore, setFinalScore]       = useState(0);
  const [initialsDisplay, setInitialsDisplay] = useState('');
  const [leaderboard, setLeaderboard]     = useState(() => loadScores());
  const [isWin, setIsWin]                 = useState(false);
  const selectedTrackRef                  = useRef(0);
  const [selectedTrack, setSelectedTrack] = useState(0);

  useEffect(() => {
    if (screen !== 'playing') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    stateRef.current = initState();
    Audio.startMusic(selectedTrackRef.current);

    const onKeyDown = e => {
      keysRef.current[e.code] = true;
      // Bomb on X press
      if (e.code === 'KeyX') {
        const s = stateRef.current;
        if (!s || s.player.bombs <= 0) return;
        s.player.bombs--;
        s.enemyBullets = [];
        s.enemies.forEach(en => {
          en.hp -= 80;
          explode(s, en.x, en.y, 0.6);
        });
        Audio.sfxBomb();
        explode(s, s.player.x, s.player.y, 2.5);
        // flash particles
        for (let i = 0; i < 60; i++) {
          const a = Math.random() * Math.PI * 2;
          const spd = 1 + Math.random() * 12;
          const life = 20 + Math.random() * 30;
          s.particles.push({
            x: s.player.x, y: s.player.y,
            vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
            r: 2 + Math.random() * 4, life, maxLife: life,
            color: ['#00ffff','#ffffff','#aaffff'][Math.floor(Math.random() * 3)],
          });
        }
      }
    };
    const onKeyUp = e => { keysRef.current[e.code] = false; };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup',   onKeyUp);

    let running = true;

    function loop() {
      if (!running) return;
      const s = stateRef.current;
      const keys = keysRef.current;
      const pl = s.player;
      const focused = keys['ShiftLeft'] || keys['ShiftRight'];

      // ── Input ─────────────────────────────────────────────────────────────
      const spd = focused ? 2.6 : 5.2;
      if (keys['ArrowLeft'] || keys['KeyA']) pl.x = Math.max(pl.w / 2, pl.x - spd);
      if (keys['ArrowRight']|| keys['KeyD']) pl.x = Math.min(W - pl.w / 2, pl.x + spd);
      if (keys['ArrowUp']   || keys['KeyW']) pl.y = Math.max(pl.h / 2, pl.y - spd);
      if (keys['ArrowDown'] || keys['KeyS']) pl.y = Math.min(H - pl.h / 2, pl.y + spd);

      // ── Shoot ─────────────────────────────────────────────────────────────
      pl.shootTimer++;
      const rate = focused ? 8 : 5;
      if ((keys['KeyZ'] || keys['Space']) && pl.shootTimer >= rate) {
        pl.shootTimer = 0;
        if (focused) {
          Audio.sfxFocusShoot();
          const b = mkBullet(pl.x, pl.y - 18, 0, -19, 'player');
          b.pw = true;
          s.playerBullets.push(b);
        } else {
          Audio.sfxShoot();
          s.playerBullets.push(mkBullet(pl.x - 10, pl.y - 12, -0.5, -17, 'player'));
          s.playerBullets.push(mkBullet(pl.x,      pl.y - 18,  0,   -17, 'player'));
          s.playerBullets.push(mkBullet(pl.x + 10, pl.y - 12,  0.5, -17, 'player'));
        }
      }

      // ── Move bullets ──────────────────────────────────────────────────────
      s.playerBullets = s.playerBullets.filter(b => {
        b.x += b.vx; b.y += b.vy;
        return b.y > -30 && b.x > -20 && b.x < W + 20;
      });
      s.enemyBullets = s.enemyBullets.filter(b => {
        b.x += b.vx; b.y += b.vy;
        return b.y < H + 30 && b.y > -30 && b.x > -20 && b.x < W + 20;
      });

      // ── Wave logic ────────────────────────────────────────────────────────
      if (s.waveDelay > 0) {
        s.waveDelay--;
      } else {
        s.waveTimer++;
        while (s.waveQueue.length > 0 && s.waveQueue[0].at <= s.waveTimer) {
          const ev = s.waveQueue.shift();
          s.enemies.push(createEnemy(ev.type, ev.x, ev.pat, ev.vy));
        }
        // Wave complete when queue empty and all enemies dead
        if (s.waveQueue.length === 0 && s.enemies.length === 0 && !s.waveClear) {
          s.waveClear = true;
          const next = s.waveIdx + 1;
          if (next < WAVES.length) {
            s.waveDelay = 90; // brief pause
            s.waveIdx = next;
            s.waveTimer = 0;
            s.waveQueue = [...WAVES[next]];
            s.waveClear = false;
          }
        }
      }

      // ── Update enemies ────────────────────────────────────────────────────
      s.enemies.forEach(e => updateEnemy(e, pl.x, pl.y, s.enemyBullets));
      s.enemies = s.enemies.filter(e => {
        if (e.dead) return false;
        if (e.y > H + 120 || e.x < -200 || e.x > W + 200) return false;
        return true;
      });

      // ── Collisions: player bullets → enemies ──────────────────────────────
      s.enemies.forEach(en => {
        s.playerBullets.forEach(b => {
          if (b.hit) return;
          const hw = en.w * 0.6, hh = en.h * 0.6;
          if (overlaps(b.x, b.y, 6, 10, en.x, en.y, hw, hh)) {
            b.hit = true;
            const dmg = b.pw ? 3 : 1;
            en.hp -= dmg;
            spawnParticles(s.particles, b.x, b.y, 3, ['#ffff00','#ffffff','#ffaa00'], [1,5],[1,3]);
            if (en.hp <= 0) {
              en.dead = true;
              s.score += en.score;
              s.chain++;
              s.chainTimer = 200;
              const sz = en.type === 'boss' ? 3 : en.type === 'bomber' ? 2.2 : en.type === 'fighter' ? 1.5 : 1;
              explode(s, en.x, en.y, sz);
              spawnExplosionRings(s, en.x, en.y, en.type);
              if (en.type === 'boss' || en.type === 'bomber') {
                Audio.sfxBigExplosion();
              } else {
                Audio.sfxEnemyDie();
              }
              const drops = DROP_COUNT[en.type] ?? 1;
              for (let d = 0; d < drops; d++) s.collectables.push(mkCollectable(en.x, en.y));
              if (en.type === 'boss') s.bossDefeated = true;
            }
          }
        });
      });
      s.playerBullets = s.playerBullets.filter(b => !b.hit);

      // ── Collisions: enemy bullets → player ───────────────────────────────
      if (pl.invTimer <= 0) {
        for (const b of s.enemyBullets) {
          if (overlaps(pl.x, pl.y, pl.w * 0.38, pl.h * 0.38, b.x, b.y, 5, 5)) {
            s.lives--;
            pl.invTimer = 180;
            explode(s, pl.x, pl.y, 1.5);
            spawnExplosionRings(s, pl.x, pl.y, 'player');
            Audio.sfxPlayerHit();
            s.enemyBullets = [];
            s.chain = 0;
            s.chainTimer = 0;
            if (s.lives <= 0) {
              running = false;
              setFinalScore(s.score);
              setIsWin(false);
              setScreen('enter_initials');
              return;
            }
            break;
          }
        }
      } else {
        pl.invTimer--;
      }

      // ── Win condition ─────────────────────────────────────────────────────
      if (s.bossDefeated && s.enemies.length === 0) {
        running = false;
        Audio.stopMusic();
        Audio.sfxWaveClear();
        setFinalScore(s.score);
        setIsWin(true);
        setScreen('enter_initials');
        return;
      }

      // ── Chain timer ───────────────────────────────────────────────────────
      if (s.chainTimer > 0) { s.chainTimer--; if (!s.chainTimer) s.chain = 0; }

      // ── Explosions ────────────────────────────────────────────────────────
      s.explosions = s.explosions.filter(ex => {
        if (ex.delay > 0) { ex.delay--; return true; }
        ex.life--;
        return ex.life > 0;
      });

      // ── Particles ─────────────────────────────────────────────────────────
      s.particles = s.particles.filter(p => {
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.04; p.vx *= 0.985;
        p.life--;
        return p.life > 0;
      });

      // ── Stars ─────────────────────────────────────────────────────────────
      s.stars.forEach(st => {
        st.y += st.vy;
        if (st.y > H + 2) { st.y = -2; st.x = Math.random() * W; }
      });

      // ── Buildings ─────────────────────────────────────────────────────────
      s.buildings.forEach(b => {
        b.y += b.spd;
        if (b.y > H + b.h) b.y = -b.h;
      });

      // ── Collectables ──────────────────────────────────────────────────────
      s.collectables = s.collectables.filter(c => {
        c.x += c.vx;
        c.y += c.vy;
        c.vx *= 0.97;
        if (overlaps(pl.x, pl.y, pl.w * 0.8, pl.h * 0.8, c.x, c.y, 14, 14)) {
          s.score += COLLECT_PTS;
          s.chain++;
          s.chainTimer = Math.max(s.chainTimer, 120);
          spawnParticles(s.particles, c.x, c.y, 6,
            ['#00ff88', '#aaffcc', '#ffffff'], [1, 4], [1, 3]);
          return false;
        }
        return c.y < H + 20;
      });

      // ── Screen shake ──────────────────────────────────────────────────────
      s.shake *= 0.84;
      if (s.shake < 0.5) s.shake = 0;
      s.shakeX = s.shake ? (Math.random() - 0.5) * s.shake : 0;
      s.shakeY = s.shake ? (Math.random() - 0.5) * s.shake : 0;

      s.frame++;

      // ════════════════════════════════════════════════════════════════════
      // RENDER
      // ════════════════════════════════════════════════════════════════════
      ctx.save();
      if (s.shake) ctx.translate(s.shakeX, s.shakeY);

      // Background
      ctx.fillStyle = '#00000e';
      ctx.fillRect(-10, -10, W + 20, H + 20);

      // City silhouette (scrolling buildings)
      s.buildings.forEach(b => {
        ctx.fillStyle = `hsla(${b.hue},60%,20%,${b.alpha})`;
        ctx.fillRect(b.x - b.w / 2, b.y - b.h, b.w, b.h);
        // windows
        ctx.fillStyle = `hsla(${b.hue},80%,70%,${b.alpha * 2.5})`;
        for (let wy = b.y - b.h + 6; wy < b.y - 4; wy += 10) {
          for (let wx = b.x - b.w / 2 + 4; wx < b.x + b.w / 2 - 4; wx += 8) {
            if (Math.random() < 0.4) ctx.fillRect(wx, wy, 4, 5);
          }
        }
      });

      // Grid scanlines
      ctx.strokeStyle = 'rgba(0,60,120,0.25)';
      ctx.lineWidth = 1;
      const gs = 44;
      const off = s.frame % gs;
      for (let y = -gs + off; y < H; y += gs) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      // Perspective diagonals
      ctx.strokeStyle = 'rgba(0,40,80,0.15)';
      const doff = (s.frame * 0.3) % 80;
      for (let x = -W + doff; x < W * 2; x += 80) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 110, H); ctx.stroke();
      }

      // Stars
      s.stars.forEach(st => {
        const col = st.hue === 0 ? `rgba(255,255,255,${st.alpha})`
          : st.hue === 50 ? `rgba(255,220,100,${st.alpha})`
          : `rgba(100,190,255,${st.alpha})`;
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2); ctx.fill();
      });

      // Collectables (drawn under enemies so they emerge from the wreckage)
      s.collectables.forEach(c => drawCollectable(ctx, c, s.frame));

      // Enemies
      s.enemies.forEach(e => drawEnemy(ctx, e, s.frame));

      // Explosion rings (above enemies, under bullets)
      s.explosions.forEach(ex => drawExplosion(ctx, ex));

      // Enemy bullets
      s.enemyBullets.forEach(b => drawBullet(ctx, b, s.frame));

      // Player (flash when invincible)
      if (pl.invTimer <= 0 || Math.floor(pl.invTimer / 5) % 2 === 0) {
        drawPlayer(ctx, pl.x, pl.y, s.frame, focused);
        if (focused) {
          ctx.strokeStyle = 'rgba(0,255,255,0.55)';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(pl.x, pl.y, 5, 0, Math.PI * 2); ctx.stroke();
        }
      }

      // Player bullets
      s.playerBullets.forEach(b => drawBullet(ctx, b, s.frame));

      // Particles (top layer)
      s.particles.forEach(p => drawParticle(ctx, p));

      ctx.restore();

      // ─ HUD ──────────────────────────────────────────────────────────────
      // Top bar
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, W, 34);
      ctx.strokeStyle = 'rgba(0,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, 34); ctx.lineTo(W, 34); ctx.stroke();

      ctx.font = 'bold 13px monospace';
      ctx.fillStyle = '#00ffff';
      ctx.textAlign = 'left';
      ctx.fillText(`SCORE  ${String(s.score).padStart(10,'0')}`, 8, 22);

      // Hi-score (top center)
      const hi = hiScoreRef.current;
      ctx.textAlign = 'center';
      ctx.fillStyle = s.score >= hi && hi > 0 ? '#ffff00' : 'rgba(0,220,220,0.65)';
      ctx.fillText(`HI  ${String(Math.max(hi, s.score)).padStart(10,'0')}`, W / 2, 22);

      ctx.textAlign = 'right';
      // Life icons
      for (let i = 0; i < s.lives; i++) {
        const lx = W - 10 - i * 18;
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.moveTo(lx, 12); ctx.lineTo(lx + 7, 24); ctx.lineTo(lx - 7, 24);
        ctx.closePath(); ctx.fill();
      }

      // Bomb count
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffff44';
      ctx.font = '12px monospace';
      for (let i = 0; i < s.player.bombs; i++) {
        ctx.beginPath();
        ctx.arc(10 + i * 16, H - 10, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Chain
      if (s.chain > 1) {
        const ca = Math.min(1, s.chainTimer / 80);
        ctx.globalAlpha = ca;
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${s.chain} CHAIN!`, W / 2, H - 18);
        ctx.globalAlpha = 1;
      }

      // Wave label
      ctx.fillStyle = 'rgba(0,255,255,0.38)';
      ctx.font = '11px monospace';
      ctx.textAlign = 'right';
      const wl = s.waveIdx === WAVES.length - 1 ? '!! BOSS !!' : `WAVE ${s.waveIdx + 1} / ${WAVES.length - 1}`;
      ctx.fillText(wl, W - 8, H - 8);

      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      Audio.stopMusic();
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [screen]);

  // Keep canvas hi-score ref in sync with leaderboard state
  useEffect(() => {
    hiScoreRef.current = leaderboard[0]?.score ?? 0;
  }, [leaderboard]);

  // Initials entry screen
  useEffect(() => {
    if (screen !== 'enter_initials') return;
    initialsRef.current = '';
    setInitialsDisplay('');

    const onKey = (e) => {
      const cur = initialsRef.current;
      if (e.key === 'Backspace') {
        const next = cur.slice(0, -1);
        initialsRef.current = next;
        setInitialsDisplay(next);
      } else if (/^[a-zA-Z]$/.test(e.key) && cur.length < 3) {
        const next = cur + e.key.toUpperCase();
        initialsRef.current = next;
        setInitialsDisplay(next);
      } else if (e.key === 'Enter' && cur.length === 3) {
        const scores = saveScore(cur, finalScore);
        setLeaderboard(scores);
        setScreen('leaderboard');
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen, finalScore]);

  useEffect(() => {
    if (screen !== 'title') return;
    const handler = e => {
      const count = Audio.TRACK_NAMES.length;
      if (e.code === 'ArrowLeft') {
        const t = ((selectedTrackRef.current - 1) + count) % count;
        selectedTrackRef.current = t;
        setSelectedTrack(t);
      } else if (e.code === 'ArrowRight') {
        const t = (selectedTrackRef.current + 1) % count;
        selectedTrackRef.current = t;
        setSelectedTrack(t);
      } else {
        const n = parseInt(e.key);
        if (n >= 1 && n <= count) {
          selectedTrackRef.current = n - 1;
          setSelectedTrack(n - 1);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [screen]);

  const startGame = () => {
    keysRef.current = {};
    Audio.initAudio();
    setScreen('playing');
  };

  return (
    <div style={STYLES.wrapper}>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={STYLES.canvas}
      />

      {screen === 'title' && (
        <div style={STYLES.overlay}>
          <div style={STYLES.title}>DONDOKPACHI</div>
          <div style={STYLES.sub}>BULLET STORM</div>
          <div style={{ ...STYLES.controls, marginTop: 8 }}>
            <div>ARROWS / WASD — MOVE</div>
            <div>Z / SPACE — SHOOT</div>
            <div>X — BOMB (clears bullets)</div>
            <div>SHIFT — FOCUS (slow + precise)</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#445566', letterSpacing: 2, marginBottom: 8 }}>
              ◄► SELECT TRACK  •  KEYS 1–{Audio.TRACK_NAMES.length}
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
              {Audio.TRACK_NAMES.map((name, i) => (
                <div
                  key={i}
                  onClick={() => { selectedTrackRef.current = i; setSelectedTrack(i); }}
                  style={{
                    padding: '5px 10px',
                    border: `1px solid ${i === selectedTrack ? '#00ffff' : '#223344'}`,
                    color: i === selectedTrack ? '#00ffff' : '#445566',
                    fontSize: 11, fontFamily: 'monospace', letterSpacing: 1,
                    cursor: 'pointer',
                    background: i === selectedTrack ? 'rgba(0,255,255,0.08)' : 'transparent',
                    textShadow: i === selectedTrack ? '0 0 8px #00ffff' : 'none',
                  }}
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
          <button style={STYLES.btn} onClick={startGame}>
            INSERT COIN
          </button>
        </div>
      )}

      {screen === 'enter_initials' && (
        <div style={STYLES.overlay}>
          <div style={{
            ...STYLES.title,
            color: isWin ? '#ffff00' : '#ff4444',
            textShadow: isWin ? '0 0 20px #ffaa00' : '0 0 20px #ff0000',
          }}>
            {isWin ? 'ALL CLEAR!' : 'GAME OVER'}
          </div>
          <div style={STYLES.score}>{String(finalScore).padStart(10, '0')}</div>
          <div style={{ ...STYLES.sub, marginTop: -6 }}>ENTER YOUR INITIALS</div>

          <div style={{ display: 'flex', gap: 10 }}>
            {[0, 1, 2].map(i => {
              const active = i === initialsDisplay.length;
              return (
                <div key={i} style={{
                  width: 48, height: 60,
                  border: `2px solid ${active ? '#00ffff' : '#2a4455'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 34, fontFamily: 'monospace', color: '#fff', fontWeight: 'bold',
                  background: active ? 'rgba(0,255,255,0.08)' : 'rgba(0,0,0,0.3)',
                  boxShadow: active ? '0 0 12px rgba(0,255,255,0.4)' : 'none',
                }}>
                  {initialsDisplay[i] ?? (active ? '▮' : '')}
                </div>
              );
            })}
          </div>

          <div style={STYLES.controls}>
            TYPE LETTERS  •  BACKSPACE TO DELETE  •  ENTER TO CONFIRM
          </div>
        </div>
      )}

      {screen === 'leaderboard' && (() => {
        const hiEntry = leaderboard[0];
        return (
          <div style={{ ...STYLES.overlay, gap: 10 }}>
            <div style={{
              ...STYLES.title, fontSize: 28,
              color: isWin ? '#ffff00' : '#ff4444',
              textShadow: isWin ? '0 0 16px #ffaa00' : '0 0 16px #ff0000',
            }}>
              {isWin ? '★ ALL CLEAR! ★' : 'GAME OVER'}
            </div>

            <div style={{ fontFamily: 'monospace', width: 320 }}>
              <div style={{
                color: '#00ffff', fontSize: 13, letterSpacing: 3,
                textAlign: 'center', marginBottom: 6, opacity: 0.8,
              }}>
                ── TOP PILOTS ──
              </div>
              {leaderboard.length === 0 && (
                <div style={{ color: '#445566', textAlign: 'center', fontSize: 12 }}>
                  NO RECORDS YET
                </div>
              )}
              {leaderboard.map((entry, i) => {
                const isPlayer = !!entry.isNew;
                return (
                  <div key={i} style={{
                    display: 'grid',
                    gridTemplateColumns: '28px 52px 1fr',
                    padding: '4px 10px',
                    background: isPlayer ? 'rgba(0,255,180,0.12)' : 'transparent',
                    borderLeft: isPlayer ? '2px solid #00ffcc' : '2px solid transparent',
                    color: isPlayer ? '#00ffcc' : i === 0 ? '#ffee44' : '#7799aa',
                    fontSize: 14,
                  }}>
                    <span style={{ opacity: 0.6 }}>{i + 1}.</span>
                    <span style={{ fontWeight: 'bold', letterSpacing: 2 }}>{entry.initials}</span>
                    <span style={{ textAlign: 'right' }}>{String(entry.score).padStart(10, '0')}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button style={STYLES.btn} onClick={startGame}>PLAY AGAIN</button>
              <button style={{ ...STYLES.btn, background: '#223', color: '#88aacc', border: '1px solid #334' }}
                onClick={() => setScreen('title')}>
                TITLE
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
