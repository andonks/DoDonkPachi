// colours
const blue0 = '#BCEEFD';
const blue1 = '#5DCBED';
const blue2 = '#0A99C5';

const pink0 = '#FFB3FA';
const pink1 = '#EE5BE5';
const pink2 = '#BC09B0';

const purp0 = '#C074FA';
const purp1 = '#A239F3';
const purp2 = '#7008C0';

export function drawExplosion(ctx, ex) {
  if (ex.delay > 0) return;
  const t = ex.life / ex.maxLife;   // 1 → 0
  const r = ex.maxR * (1 - t);      // expands 0 → maxR

  ctx.save();

  // Inner fireball glow (only in first ~60% of life)
  if (t > 0.4) {
    const ft = (t - 0.4) / 0.6;
    const gr = ctx.createRadialGradient(ex.x, ex.y, 0, ex.x, ex.y, r * 75 + 6);
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
// push variables: x, y, max radius, life, color, delay
export function spawnExplosionRings(s, x, y, type) {
  const arr = s.explosions;
  const push = (dx, dy, maxR, life, color, delay = 0) =>
    arr.push({ x: x + dx, y: y + dy, maxR, life, maxLife: life, color, delay });

  if (type === 'moth') {
    const colors = [pink2, pink1, pink0, 'white', pink2];
    for (let i = 0; i < 8; i++) {
      const dx = (Math.random() - 0.5) * 120;
      const dy = (Math.random() - 0.5) * 80;
      push(dx, dy, 160 - i * 8, 60, colors[i], 0);
    }
  } else if (type === 'jet') {
    const colors = [pink2, pink1, pink0, 'white', pink2];
    for (let i = 0; i < 5; i++) {
      const dx = (Math.random() - 0.5) * 60;
      const dy = (Math.random() - 0.5) * 40;
      push(dx, dy, 120 - i * 8, 60, colors[i], 0);
    }
  } else if (type === 'beetle') {
    const colors = [pink2, pink1, pink0, 'white', pink2];
    for (let i = 0; i < 12; i++) {
      const dx = (Math.random() - 0.5) * 60;
      const dy = (Math.random() - 0.5) * 40;
      push(dx, dy, 200 - i * 8, 60, colors[i], 0);
    }
  } else if (type === 'xwing') {
    const colors = [pink2, pink1, pink0, 'white', pink2];
    for (let i = 0; i < 18; i++) {
      const dx = (Math.random() - 0.5) * 60;
      const dy = (Math.random() - 0.5) * 40;
      push(dx, dy, 240 - i * 8, 60, colors[i], 0);
    }
  } else if (type === 'player') {
    const colors = [pink2, pink1, pink0, 'white', pink2];
    for (let i = 0; i < 5; i++) {
      const dx = (Math.random() - 0.5) * 60;
      const dy = (Math.random() - 0.5) * 40;
      push(dx, dy, 165 - i * 18, 60, colors[i], 0);
    }
  } else if (type === 'boss') {
    const colors = [pink2, pink1, pink0, 'white', pink2];
    for (let i = 0; i < 5; i++) {
      const dx = (Math.random() - 0.5) * 60;
      const dy = (Math.random() - 0.5) * 40;
      push(dx, dy, 65 + i * 8, 42 + i * 7, colors[i], i * 7);
    }
  }
  else { // default explosion pattern
    push(0, 0, 260, 8, 'white');
    push(0, 0, 190, 40, blue0, 7);
    push(0, 0, 120, 30, blue2, 14);
    push(0, 0,  90, 20, '#ffffff', 20);
  }
}

export function explode(s, x, y, sz = 1) {
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
      color: ['pink1','#ff8800','#ff4400'][Math.floor(Math.random() * 3)] });
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
