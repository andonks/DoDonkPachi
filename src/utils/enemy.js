// Enemy stats, movement and firing patterns, and other functions

const W = 480;
const H = 640;

// ─── Enemy definitions ────────────────────────────────────────────────────────

// Default stats
// (hitbox width/height, HP, base kill score, firing frequency, bullet speed)
const EDEFS = {
  tank:    { w: 50, h: 50, maxHp: 15, score: 1500, fireRate: 76, bspd: 1 },
  turret:  { w: 60, h: 100, maxHp: 5, score: 500, fireRate: 76, bspd: 1.4},
  jet:     { w: 72, h: 60, maxHp: 5, score: 500, fireRate: 100, bspd: 3 },
  heli:    { w: 72, h: 60, maxHp: 20, score: 2000, fireRate: 140, bspd: 3 },
  moth:    { w: 96, h: 93, maxHp: 35, score: 4500, fireRate: 140, bspd: 4.5 },
  beetle:  { w: 120, h: 90, maxHp: 60, score: 9000, fireRate: 76,  bspd: 3 },
  xwing:   { w: 170,  h: 150, maxHp: 100, score: 16000, fireRate: 1, bspd: 4 },
  daitank: { w: 120, h: 120, maxHp: 140, score: 14000, fireRate: 76,  bspd: 1 },
  boss:    { w: 60, h: 30, maxHp: 2000, score: 200000, fireRate: 36, bspd: 2.5 },

  dummy1:  { w: 72, h: 60, maxHp: 5, score: 500, fireRate: 100, bspd: 2.5 },

  //sprites
  tankSprite:    { w: 30, h: 30, maxHp: 1, score: 1500, fireRate: 76, bspd: 1.4 },
  turretSprite:  { w: 60, h: 60, maxHp: 1, score: 500, fireRate: 76, bspd: 1.4},
  beetleSprite:  { w: 120, h: 90, maxHp: 1, score: 12000, fireRate: 76,  bspd: 0.2 },
  daitankSprite: { w: 120, h: 120, maxHp: 1, score: 12000, fireRate: 76,  bspd: 0.2 },
  heliSprite:    { w: 72, h: 60, maxHp: 1, score: 2000, fireRate: 140, bspd: 4 },
  jetSprite:     { w: 72, h: 60, maxHp: 1, score: 2000, fireRate: 140, bspd: 2 },
  mothSprite:    { w: 72, h: 60, maxHp: 1, score: 2000, fireRate: 140, bspd: 2 },
  xwingSprite:   { w: 170,  h: 150, maxHp: 1, score: 1, fireRate: 1, bspd: 1 },
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
    case 'drift_r':
      e.y += e.vy;
      e.x += e.vy / 4 + Math.sin(e.timer * 0.025) * 1.2;
      break;
    case 'drift_l':
      e.y += e.vy;
      e.x -= e.vy / 8 + Math.sin(e.timer * 0.025);
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
      } else {
      e.y += 1;
      }
      break;
    case 'diag_r': // enter top, move diagonally left-downward
      // DDP wave 1 tank platoons
      e.y += e.vy;
      e.x -= e.vy / 3;
      break;
    case 'cross_r': // fast-flying ships jet across the screen
      e.y += e.vy / 4;
      e.x -= e.vy;
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
      const FLATTEN_START_Xl = W * 0.5;       // x position where easing begins
      const FLATTEN_END_Xl   = W * 0.85;      // x position where vy reaches 0

      e.x += 2.6;

      if (e.x < FLATTEN_START_Xl) {
        // still in entry arc — use full vy
        e.y += e.vy;
      } else if (e.x < FLATTEN_END_Xl) {
        // easing zone — linearly interpolate vy down to 0
        const t = (e.x - FLATTEN_END_Xl) / (FLATTEN_START_Xl - FLATTEN_END_Xl); // 1→0
        e.y += e.vy * t;
      }
      // if e.x <= FLATTEN_END_X: add nothing to y → perfectly flat
      break;
    case 'side_r':   // enter from right edge, fly diagonally left-downward
      const FLATTEN_START_Xr = W * 0.5;       // x position where easing begins
      const FLATTEN_END_Xr   = W * 0.15;      // x position where vy reaches 0

      e.x -= 2.6;

      if (e.x > FLATTEN_START_Xr) {
        // still in entry arc — use full vy
        e.y += e.vy;
      } else if (e.x > FLATTEN_END_Xr) {
        // easing zone — linearly interpolate vy down to 0
        const t = (e.x - FLATTEN_END_Xr) / (FLATTEN_START_Xr - FLATTEN_END_Xr); // 1→0
        e.y += e.vy * t;
      }
      // if e.x <= FLATTEN_END_X: add nothing to y → perfectly flat
      break;
    case 'hover_mid':  // descend to mid-screen, hover & fire, then retreat up
      if (e.phase === 0) {
        e.y += e.vy;
        if (e.y >= H * 0.23) { e.phase = 1; e.timer = 0; }
      } else if (e.phase === 1) {
        e.x -= Math.sin(e.timer * 0.05) * 0.6;
        e.x = Math.max(30, Math.min(W - 30, e.x));
        if (e.timer > 160) e.phase = 2;
      } else {
        e.y -= e.vy * 1.5;
      }
      break;
      case 'hover_high':  // descend to upper-screen, hover & fire, then retreat up
        if (e.phase === 0) {
          e.y += e.vy;
          if (e.y >= H * 0.15) { e.phase = 1; e.timer = 0; }
        } else if (e.phase === 1) {
          e.x -= Math.sin(e.timer * 0.05) * 0.6;
          e.x = Math.max(30, Math.min(W - 30, e.x));
          if (e.timer > 160) e.phase = 2;
        } else {
          e.y -= e.vy * 1.5;
        }
        break;
    case 'boss': {
      if (e.transitionTimer > 0) {
        e.transitionTimer--;
        if (e.transitionTimer === 0) e.phase++;
        break;
      }
      if (e.y < H * 0.3) {
        e.y += e.vy * 4;
      } else {
        const targetX = W / 2 + Math.sin(e.timer * 0.009) * 160;
        e.x += (targetX - e.x) * 0.03;
        // Use to define different movement patterns for each phase
        if (e.phase >= 1) {
        // return to starting position and stay there
        e.x += (W / 2 - e.x) * 0.15;
        e.y += (H * 0.3 - e.y) * 0.15;
        }
      }
      break;
    }
  }

// *--- *--- *--- *--- SHOOTING —--* —--* —--* —--*
  // only fire while in the top 95% of the screen & visible
  if (e.y > H * 0.9) return;
  if (e.x > 470) return;
  if (e.x < 10) return;

  // ------------------------ Special firing patterns --------------------------

  // HELI - rapid aimed bursts
  if (e.type === 'heli' && e.y > H * 0.4) {
    const cycle = e.timer % 60;

    if (cycle >= 35 && cycle < 60 && e.timer % 10 === 0) {
      const v = aim(e.x, e.y, px, py, e.bspd);
      bullets.push(mkBullet(e.x, e.y, v.vx, v.vy));
    }
  }

  // MOTH: Aimed spread that starts wide and tigthens; starts 10% down from top
  if (e.type === 'moth' && e.y > H * 0.1) {
    const cycle = e.timer % 120;

    if (cycle >= 15 && cycle < 27 && e.timer % 3 === 0) {
      if (cycle === 15) {
        e.xTarget = px;
        e.yTarget = py;
      }
    const ca = Math.atan2(e.yTarget - e.y, e.xTarget - e.x);
    spread(e.x, e.y, 2, ca, 0.6, e.bspd, 'enemy')
      .forEach(b => { b.burst = true; bullets.push(b); });
    }
    if (cycle >= 30 && cycle < 42 && e.timer % 3 === 0) {
      if (cycle === 30) {
        e.xTarget = px;
        e.yTarget = py;
      }
    const ca = Math.atan2(e.yTarget - e.y, e.xTarget - e.x);
    spread(e.x, e.y, 2, ca, 0.3, e.bspd, 'enemy')
      .forEach(b => { b.burst = true; bullets.push(b); });
    }
    if (cycle >= 45 && cycle < 57 && e.timer % 3 === 0) {
      if (cycle === 45) {
        e.xTarget = px;
        e.yTarget = py;
      }
    const ca = Math.atan2(e.yTarget - e.y, e.xTarget - e.x);
    spread(e.x, e.y, 2, ca, 0.0, e.bspd, 'enemy')
      .forEach(b => { b.burst = true; bullets.push(b); });
    }
  }

  // BEETLE BLAST: Fat bullet spread followed by 2 aimed bursts
  if (e.type === 'beetle' && e.y > H * 0.1) {
    const cycle = e.timer % 120;
    const ca = Math.atan2(py - e.y, px - e.x);
    if (cycle === 10) {
      spread(e.x, e.y - 10, 6, ca, 0.9, e.bspd, 'enemy')
        .forEach(b => { b.chonk = true; bullets.push(b); });
    }
    if (cycle === 25) {
      spread(e.x, e.y - 10, 7, ca, 0.9, e.bspd, 'enemy')
        .forEach(b => bullets.push(b));
    }

    if (cycle >= 42 && cycle <= 60 && e.timer % 6 === 0) {
      if (cycle === 42) {
      e.vLeft = aim(e.x - 30, e.y - 16, px, py + 10, e.bspd);
      e.vRight = aim(e.x + 30, e.y - 16, px, py + 10, e.bspd);
      }
      let b = mkBullet(e.x - 30, e.y - 16, e.vLeft.vx, e.vLeft.vy);
      b.burst = true;
      bullets.push(b);
      b = mkBullet(e.x + 30, e.y - 16, e.vRight.vx, e.vRight.vy);
      b.burst = true;
      bullets.push(b);
    }
  }

  // DAITANK: Spinning circle -- the spiral of death
  if (e.type === 'daitank' && e.y > H * 0.1) {
    const cycle = e.timer % 120;
    if (cycle >= 20 && cycle <= 90 && e.timer % 10 === 0) {
      circle(e.x, e.y, 10, e.bspd, e.angle).forEach(b => bullets.push(b));
      e.angle += 0.1
    }
  }

  // X-WING: Fat bullet lane, single aimed burst, fast circle (spread?) WIP?
  if (e.type === 'xwing' && e.y > H * 0.1) {
    const cycle = e.timer % 120;
    if (cycle >= 10 && cycle <= 50 && e.timer % 10 === 0) {
      //if (cycle === 10) {
      e.vLeft = aim(e.x, e.y, px, py, e.bspd);
      e.vRight = aim(e.x, e.y, px, py, e.bspd);
      //}
      let b = mkBullet(e.x - 30, e.y + 22, e.vLeft.vx, e.vLeft.vy);
      b.chonk = true;
      bullets.push(b);
      b = mkBullet(e.x + 30, e.y + 22, e.vRight.vx, e.vRight.vy);
      b.chonk = true;
      bullets.push(b);
    }
    if (cycle >= 45 && cycle <= 60 && e.timer % 5 === 0) {
      if (cycle === 45) {
      e.aim = aim(e.x, e.y - 25, px, py, e.bspd * 1.4);
      }
      const b = mkBullet(e.x, e.y - 25, e.aim.vx, e.aim.vy, 'enemy');
      b.burst = true;
      bullets.push(b);
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

  // BOSS -- 3 phases
  if (e.type === 'boss' && e.transitionTimer <= 0 && e.y >= H * 0.3) {
    const cycle = e.timer % 120;
    const ratio = e.hp / e.maxHp;

    if (ratio > 0.66) {
      if (cycle === 10 || cycle === 30) {
        circle(e.x, e.y, 25, e.bspd, e.angle).forEach(b => bullets.push(b));
        e.angle += 0.18;
      }
      if (cycle === 50) {
        const ca = Math.atan2(py - e.y, px - e.x);
        spread(e.x, e.y, 5, ca, 0.28, e.bspd).forEach(b => bullets.push(b));
      }
    }
    if (ratio > 0.33 && ratio < 0.66) {
      if (cycle === 29 || cycle === 89) {
        [80].forEach(dx => {
          spread(e.x + dx, e.y, 5, 5 * Math.PI / 6, 0.15, e.bspd * 0.75).forEach(b => bullets.push(b));
          spread(e.x + dx, e.y, 5, 2 * Math.PI / 3, 0.15, e.bspd * 0.75).forEach(b => bullets.push(b));
          spread(e.x + dx, e.y, 5, Math.PI / 2, 0.15, e.bspd * 0.75).forEach(b => bullets.push(b));
          spread(e.x + dx, e.y, 5, Math.PI / 3, 0.15, e.bspd * 0.75).forEach(b => bullets.push(b));
          spread(e.x + dx, e.y, 5, Math.PI / 6, 0.15, e.bspd * 0.75).forEach(b => bullets.push(b));
        });
      }
      if (cycle === 59 || cycle === 119) {
        [-80].forEach(dx => {
          spread(e.x + dx, e.y, 5, 5 * Math.PI / 6, 0.15, e.bspd * 0.75).forEach(b => bullets.push(b));
          spread(e.x + dx, e.y, 5, 2 * Math.PI / 3, 0.15, e.bspd * 0.75).forEach(b => bullets.push(b));
          spread(e.x + dx, e.y, 5, Math.PI / 2, 0.15, e.bspd * 0.75).forEach(b => bullets.push(b));
          spread(e.x + dx, e.y, 5, Math.PI / 3, 0.15, e.bspd * 0.75).forEach(b => bullets.push(b));
          spread(e.x + dx, e.y, 5, Math.PI / 6, 0.15, e.bspd * 0.75).forEach(b => bullets.push(b));
        });
      }
      if (cycle > 1 && e.timer % 10 === 0) {
        if (
          (cycle > 20 && cycle < 60) ||
          (cycle > 80 && cycle < 120)
        ) {
          const v = aim(e.x, e.y, px, py, e.bspd * 1.4);

          const b = mkBullet(e.x, e.y, v.vx, v.vy, 'enemy');
          b.burst = true;
          bullets.push(b);
        }
      }
    }
    if (ratio < 0.33 && e.hp > 0) {
      if (cycle === 1) {
        if (e.lap == null) {
          e.lap = 0;
          e.cwAngle = -Math.PI / 2;
          e.ccwAngle = Math.PI / 2;
        }
        else {
        e.lap += 1;
        }
      }
      if (cycle > 1 && e.timer % 2 === 0 && ratio < 0.33) {
        if (
          (cycle > 1 && cycle < 11) ||
          (cycle > 21 && cycle < 31) ||
          (cycle > 41 && cycle < 51) ||
          (cycle > 61 && cycle < 71) ||
          (cycle > 81 && cycle < 91) ||
          (cycle > 101 && cycle < 111)
        ) {
          bullets.push(mkBullet(e.x, e.y, e.cwAngle, e.bspd));
          bullets.push(mkBullet(e.x, e.y, e.ccwAngle, e.bspd));
        }
        if (e.lap % 2 === 0) {
          e.cwAngle += 0.05;
          e.ccwAngle -= 0.05;
        }
        if (e.lap % 2 != 0) {
          e.cwAngle -= 0.05;
          e.ccwAngle += 0.05;
        }
      }
      if (cycle === 100) { // rings
        const count = 10; // # of bullets
        const radius = 20; // width of circle from origin
        const baseR = aim(e.x + 80, e.y, px, py, e.bspd);
        const baseL = aim(e.x - 80, e.y, px, py, e.bspd);

        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 * i) / count;
          const dx = Math.cos(angle) * radius;
          const dy = Math.sin(angle) * radius;
          const speedScale = 1 - (dy / radius) * 0.35;
          if (e.lap % 2 === 0) {
            const b = mkBullet(e.x + 80 + dx, e.y + dy, baseR.vx * speedScale, baseR.vy * speedScale, 'enemy');
            b.blue = true;
            bullets.push(b);
          }
          if (e.lap % 2 != 0) {
            const b = mkBullet(e.x - 80 + dx, e.y + dy, baseL.vx * speedScale, baseL.vy * speedScale, 'enemy');
            b.blue = true;
            bullets.push(b);
          }
        }
      }
    }
  }
  // ------------------- default periodic firing patterns --------------------
  if (e.fireTimer < e.fireRate) return;
  e.fireTimer = 0;

  switch (e.type) {
    case 'jet': {
      const v = aim(e.x, e.y, px, py, e.bspd);
      bullets.push(mkBullet(e.x, e.y, v.vx, v.vy));
      break;
    }
  }
}

function aim(sx, sy, tx, ty, spd) {
  const d = Math.hypot(tx - sx, ty - sy) || 1;
  return { vx: (tx - sx) / d * spd, vy: (ty - sy) / d * spd };
}

export function circle(x, y, n, spd, off = 0) {
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
