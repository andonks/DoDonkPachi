const W = 480;
const H = 640;

// ─── Enemy definitions ────────────────────────────────────────────────────────

// Default stats
// (hitbox w/h, HP, base kill score, firing frequency, bullet speed)
const EDEFS = {
  grunt:   { w: 48, h: 40, maxHp: 5, score: 500, fireRate: 20, bspd: 1.75 },
  fighter: { w: 72, h: 60, maxHp: 25, score: 2000, fireRate: 140, bspd: 2 },
  bomber:  { w: 108, h: 84, maxHp: 80, score: 6000, fireRate: 76,  bspd: 1.4 },
  vette:   { w: 40, h: 80, maxHp: 120, score: 12000, fireRate: 76, bspd: 2.5 },
  tank:    { w: 60, h: 50, maxHp: 15, score: 3000, fireRate: 76, bspd: 1.4 },
  turret:  { w: 40, h: 40, maxHp: 5, score: 3000, fireRate: 76, bspd: 1.4 , turret1: 0 },
  beetle:  { w: 120, h: 90, maxHp: 160, score: 12000, fireRate: 76,  bspd: 0.2 },
  daitank: { w: 120, h: 120, maxHp: 80, score: 12000, fireRate: 76,  bspd: 0.2 },
  jet:     { w: 72, h: 60, maxHp: 25, score: 2000, fireRate: 140, bspd: 2 },
  moth:    { w: 72, h: 60, maxHp: 25, score: 2000, fireRate: 140, bspd: 2 },
  xwing:   { w: 170,  h: 150, maxHp: 100000, score: 1, fireRate: 1, bspd: 1 },
  boss:    { w: 240, h: 180, maxHp: 2000, score: 200000, fireRate: 36, bspd: 1.75 },
  dummy1:  { w: 140, h: 80, maxHp: 1, score: 200000, fireRate: 36, bspd: 1.75 },
  dummy2:  { w: 140, h: 80, maxHp: 1, score: 200000, fireRate: 36, bspd: 1.75 },
  dummy3:  { w: 140, h: 80, maxHp: 1, score: 200000, fireRate: 36, bspd: 1.75 },
};

export function createEnemy(type, x, pattern, vy = 1.5, startY = undefined) {
  const d = EDEFS[type];
  return {
    x, y: startY !== undefined ? startY : -(d.h / 2 + 10),
    type, pattern,
    w: d.w, h: d.h,
    hp: d.maxHp, maxHp: d.maxHp,
    score: d.score,
    fireRate: d.fireRate,
    bspd: d.bspd,
    turret1: d.turret1,
    vy,
    timer: 0,
    fireTimer: Math.floor(Math.random() * 50),
    dead: false,
    angle: 0,          // pattern angle accumulator
    phase: 0,
    transitionTimer: 0, // > 0 while boss is doing phase-transition charge
    chargeX: 0, chargeY: 0,  // player pos saved at transition start
    returnX: 0, returnY: 0,  // boss pos saved at transition start
  };
}

export function updateEnemy(ctx, e, px, py, bullets) {
  e.timer++;
  e.fireTimer++;

  // Movement
  switch (e.pattern) {
    case 'straight':
      e.y += e.vy;
      break;
    case 'curve_r':
      e.y += e.vy;
      e.x += Math.sin(e.timer * 0.025) * 1.2;
      break;
    case 'curve_l':
      e.y += e.vy;
      e.x -= Math.sin(e.timer * 0.025) * 1.2;
      break;
    case 'wobble_l':
      if (e.timer <= 200) {
      e.y += Math.sin(e.timer * 0.02 ) * 1;
      e.x -= e.vy;
      console.log(e.timer);
      } else {
      e.y += 1;
      }
      break;
    case 'diag_r': // enter top, move diagonally left-downward
      // DDP wave 1 tank platoons
      e.y += e.vy;
      e.x -= e.vy / 3;
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
    case 'side_l':   // enter from left edge, fly diagonally right-downward
      e.x += 2.6;
      e.y += e.vy;
      break;
    case 'side_r':   // enter from right edge, fly diagonally left-downward
      const FLATTEN_START_X = W * 0.6;       // x position where easing begins
      const FLATTEN_END_X   = W * 0.15;      // x position where vy reaches 0

      e.x -= 2.6;

      if (e.x > FLATTEN_START_X) {
        // still in entry arc — use full vy
        e.y += e.vy;
      } else if (e.x > FLATTEN_END_X) {
        // easing zone — linearly interpolate vy down to 0
        const t = (e.x - FLATTEN_END_X) / (FLATTEN_START_X - FLATTEN_END_X); // 1→0
        e.y += e.vy * t;
      }
      // if e.x <= FLATTEN_END_X: add nothing to y → perfectly flat
      break;
    case 'hover_mid':  // descend to mid-screen, hover & fire, then retreat up
      if (e.phase === 0) {
        e.y += e.vy;
        if (e.y >= H * 0.43) { e.phase = 1; e.timer = 0; }
      } else if (e.phase === 1) {
        e.x += Math.sin(e.timer * 0.05) * 1.6;
        e.x = Math.max(30, Math.min(W - 30, e.x));
        if (e.timer > 160) e.phase = 2;
      } else {
        e.y -= e.vy * 1.5;
      }
      break;
    case 'boss': {
      if (e.transitionTimer > 0) {
        if (e.transitionTimer > 80) {
          // Stage 1: hold position — explosions spawned by main loop
        } else if (e.transitionTimer > 30) {
          // Stage 2: charge toward player position saved at transition start (half speed)
          e.x += (e.chargeX - e.x) * 0.05;
          e.y += (e.chargeY - e.y) * 0.05;
        } else {
          // Stage 3: pull back to origin
          e.x += (e.returnX - e.x) * 0.15;
          e.y += (e.returnY - e.y) * 0.15;
        }
        e.transitionTimer--;
        if (e.transitionTimer === 0) e.phase++;
        break;
      }
      // Normal movement
      if (e.y < H * 0.22) {
        e.y += e.vy;
      } else {
        const targetX = W / 2 + Math.sin(e.timer * 0.009) * 160;
        e.x += (targetX - e.x) * 0.03;
        if (e.phase >= 1) {
          e.y = H * 0.22 + Math.sin(e.timer * 0.013) * 55;
        }
      }
      break;
    }
  }

  // *--- SHOOTING —--*
  // only fire while in the top 95% of the screen & visible
  if (e.y > H * 0.95) return;
  if (e.x > 470) return;
  if (e.x < 10) return;

  // Special firing patterns

  // Boss timed burst: last 60 frames of every 120-frame cycle.
  // Fire only during the first 20 of those 60 frames (cycle 60–79).
  // Skip firing (but still suppress normal fire) on the first burst
  // window of each HP phase.
  if (e.type === 'boss' && e.transitionTimer === 0 && e.y < H * 0.95) {
    const ratio = e.hp / e.maxHp;
    const hpPhase = ratio > 0.66 ? 1 : ratio > 0.33 ? 2 : 3;
    if (e.lastHpPhase === undefined) { e.lastHpPhase = hpPhase; e.burstPhaseArmed = false; }
    if (hpPhase !== e.lastHpPhase)   { e.lastHpPhase = hpPhase; e.burstPhaseArmed = false; }

    const cycle = e.timer % 120;
    // Arm once the first window's fire-zone has safely passed
    if (!e.burstPhaseArmed && cycle >= 80) e.burstPhaseArmed = true;

    if (cycle >= 60 && cycle < 80 && e.burstPhaseArmed && e.timer % 3 === 0) {
      [-84, 84].forEach(ox => {
        const b = mkBullet(e.x + ox, e.y + 40, 0, e.bspd * 3.5, 'enemy', '#8800ff');
        b.burst = true;
        bullets.push(b);
      });
    }
  }

  // "Seeking" burst fire (adjusts to player movement)
  if (e.type === 'bomber' && e.y < H * 0.95) {

    const cycle = e.timer % 120;
    const ca = Math.atan2(py - e.y, px - e.x);

    if (cycle >= 25 && cycle < 45 && e.timer % 3 === 0) {
      spread(e.x, e.y, 5, ca, 0.38, e.bspd *3.5, '#ffee00').forEach(b => bullets.push(b));
    }
  }

  // Stationary burst fire (aim once, fire continuously at the same point)
  if (e.type === 'control' && e.y < H * 0.95) {

    const cycle = e.timer % 120;
    if (cycle === 25) {
          const xTarget = structuredClone(px);
          const yTarget = structuredClone(py);
        }

    if (cycle >= 25 && cycle < 90 && e.timer % 10 === 0) {
    const ca = Math.atan2(yTarget - e.y, xTarget - e.x);

    spread(e.x, e.y, 3, ca, 0.38, e.bspd * 3.5, '#ffee00').forEach(b => bullets.push(b));
    }
  }

  // Turret fire - big single projectiles
  if (e.type === 'turret1' && e.y < H * 0.95) {
    const cycle = e.timer % 120;

    if (cycle >= 25 && cycle < 90 && e.timer % 20 === 0) {
    const ca = e.turret1;

    const turretX = e.x + (60 * Math.cos(e.turret1));
    const turretY = e.y + (60 * Math.sin(e.turret1));
    const b = mkBullet(turretX, turretY, Math.cos(ca) * e.bspd * 3.5, Math.sin(ca) * e.bspd * 3.5, 'enemy', 'black');
    b.chonk = true;
    bullets.push(b);
    }
  }

  // Delayed turret fire - wait 300 frames, then fire only once
  if (e.type === 'turret' && e.y < H * 0.95 && e.timer === 300) {
    const ca = e.turret1;
    const turretX = e.x + (60 * Math.cos(e.turret1));
    const turretY = e.y + (60 * Math.sin(e.turret1));
    const b = mkBullet(turretX, turretY, Math.cos(ca) * e.bspd * 3.5, Math.sin(ca) * e.bspd * 3.5, 'enemy', 'black');
    b.chonk = true;
    bullets.push(b);
  }

    // Shotgun cluster - accelerating bullets aimed at a single point
    if (e.type === 'daitank-disabled' && e.y < H * 0.95) {
      const cycle = e.timer % 120;
      if (cycle === 11) {
        e.bspd = 6;
        const xTarget = structuredClone(px);
        const yTarget = structuredClone(py);
    //    const v = aim(e.x, e.y, xTarget, yTarget, e.bspd);
      }

      if (cycle >= 112 && cycle <= 116 && cycle % 4 === 0) {
      const ca = Math.atan2(py - e.y, px - e.x);

      [-45, 40].forEach(dx => {
          spread(e.x + dx, e.y + 30, 3, ca, 0.1, e.bspd, '#ffee00').forEach(b => bullets.push(b));
          spread(e.x + dx + 11, e.y + 30, 3, ca, 0.1, e.bspd, '#ffee00').forEach(b => bullets.push(b));
          spread(e.x + dx + 6, e.y + 30 + 9,  3, ca, 0.1, e.bspd, '#ffee00').forEach(b => bullets.push(b));
        });
      e.bspd += 0.5;
      }

      if (cycle === 114) {
      const ca = Math.atan2(py - e.y, px - e.x);

      [-45, 40].forEach(dx => {
          spread(e.x + dx, e.y + 30, 4, ca, 0.2, e.bspd, '#ffee00').forEach(b => bullets.push(b));
          spread(e.x + dx + 11, e.y + 30, 4, ca, 0.2, e.bspd, '#ffee00').forEach(b => bullets.push(b));
          spread(e.x + dx + 6, e.y + 30 + 9,  4, ca, 0.2, e.bspd, '#ffee00').forEach(b => bullets.push(b));
        });
      e.bspd += 0.5;
      }

      //break; ???
    }

  // --- default periodic firing patterns ---
  if (e.fireTimer < e.fireRate) return;

  e.fireTimer = 0;
  if (e.type === 'boss' && e.transitionTimer > 0) return; // no fire during transition

  switch (e.type) {
    case 'grunt': {
      const v = aim(e.x, e.y, px, py, e.bspd);
      bullets.push(mkBullet(e.x, e.y, v.vx, v.vy));
      break;
    }
    case 'fighter': {
      const ca = Math.atan2(py - e.y, px - e.x);
      spread(e.x, e.y, 5, ca, 0.38, e.bspd * 3, '#ffee00').forEach(b => bullets.push(b));
      break;
    }
    case 'bomber': {
      // 3×3 cluster, all fired straight down
      [-16, 0, 16].forEach(dx => {
        [0, 10, 20].forEach(dy => {
          bullets.push(mkBullet(e.x + dx, e.y + 22 + dy, 0, e.bspd * 2.2, 'enemy', '#ffaa00'));
        });
      });
      break;
    }
    case 'boss': {
      if (e.timer % 120 >= 60) break;  // burst window active — suppress normal fire
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
          [-84, 84].forEach(ox => {
            const v = aim(e.x + ox, e.y + 40, px, py, e.bspd * 1.2);
            for (let i = 0; i < 4; i++) {
              bullets.push(mkBullet(e.x + ox, e.y + 40,
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
          [-84, 84].forEach(ox => {
            const v = aim(e.x + ox, e.y + 40, px, py, e.bspd * 1.4);
            for (let i = 0; i < 5; i++) {
              bullets.push(mkBullet(e.x + ox, e.y + 40,
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

let _bid = 0;
export function mkBullet(x, y, vx, vy, owner = 'enemy', color) {
  return { x, y, vx, vy, owner, id: _bid++, color };
}
