const ship1 = '#003A8A';
const ship2 = '#9FA7B7';
const ship3 = '#D383D3';

const maxTurn = 0.01;
var theta;

export function drawPlayer(ctx, x, y, frame, focused) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1.5, 1.5);

  // Engine glow
  const g = ctx.createRadialGradient(0, 20, 2, 0, 10, 24);
  g.addColorStop(0, 'rgba(0,200,255,0.85)');
  g.addColorStop(1, 'rgba(0,0,200,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 20, 22, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Engine flames
  const fl = 3 + Math.sin(frame * 0.4) * 2.5;
  ctx.fillStyle = ship3;
  ctx.beginPath();
  ctx.moveTo(-9, 15); ctx.lineTo(3, 15); ctx.lineTo(-3, 15 + fl * 2.8); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-3, 15); ctx.lineTo(9, 15); ctx.lineTo(3, 15 + fl * 2.8); ctx.closePath(); ctx.fill();

  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(-7, 15); ctx.lineTo(1, 15); ctx.lineTo(-3, 30 + fl * 2.8); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-1, 15); ctx.lineTo(7, 15); ctx.lineTo(3, 30 + fl * 2.8); ctx.closePath(); ctx.fill();

  // Tail Wings
  ctx.strokeStyle = ship1;
  ctx.fillStyle = ship2;
  ctx.beginPath();
  ctx.moveTo(-5, 10);
  ctx.lineTo(-15, 6);
  ctx.lineTo(-18, 9);
  ctx.lineTo(-8, 21);
  ctx.lineTo(-6, 18);
  ctx.lineTo(-8, 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(5, 10);
  ctx.lineTo(15, 6);
  ctx.lineTo(18, 9);
  ctx.lineTo(8, 21);
  ctx.lineTo(6, 18);
  ctx.lineTo(8, 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Nose Guns
  ctx.strokeStyle = ship1;
  ctx.fillStyle = ship2;
  ctx.beginPath();
  ctx.rect(-4, -18, 2, 9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.rect(2, -18, 2, 9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Body
  ctx.fillStyle = ship1;
  ctx.beginPath();
  ctx.moveTo(-3, -12);

  ctx.lineTo(3, -12);
  ctx.lineTo(14, 15);
  ctx.lineTo(-14, 15);
  ctx.lineTo(-3, -12);
  ctx.closePath();
  ctx.fill();

  // Engines
  ctx.fillStyle = ship2;
  ctx.beginPath();
  ctx.moveTo(-5, 11);
  ctx.lineTo(-4, 18);
  ctx.lineTo(-1, 18);
  ctx.lineTo(0, 12);
  ctx.lineTo(1, 18);
  ctx.lineTo(4, 18);
  ctx.lineTo(5, 11);
  ctx.lineTo(-5, 11);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cannons
  ctx.strokeStyle = ship1;
  ctx.beginPath();
  ctx.rect(-10, -12, 2, 20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.rect(-10, 8, 2, 4);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.rect(8, -12, 2, 20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.rect(8, 8, 2, 4);
  ctx.closePath();
  ctx.fill();

  // Cockpit
  ctx.fillStyle = ship3;
  ctx.beginPath();
  ctx.moveTo(2, -15);
  ctx.lineTo(2, -8);
  ctx.lineTo(-2, -8);
  ctx.lineTo(-2, -15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Crystal Gem
  //ctx.fillStyle = 'black';
  //ctx.arc(0, 2, 4, 0, Math.PI * 2);
  //ctx.fill();

  // Panel Lining
  ctx.strokeStyle = ship3;
  ctx.beginPath();
  ctx.moveTo(2, -5);
  ctx.lineTo(2, 5);
  ctx.lineTo(4, 10);
  ctx.moveTo(-2, -5);
  ctx.lineTo(-2, 5);
  ctx.lineTo(-4, 10);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(2, -7);
  ctx.lineTo(-2, -7);
  ctx.closePath();
  ctx.stroke();

  ctx.restore();
}


// calculate new angle for turrets
export function getTheta(a, b) {
  let diff = (b - a) % (2 * Math.PI);
  if (diff > Math.PI) {
      diff -= 2 * Math.PI;
  } else if (diff < -Math.PI) {
      diff += 2 * Math.PI;
  }
  if (Math.abs(diff) > maxTurn) {
    if (diff > 0) {
    theta = a + maxTurn;
    }
    else if (diff < 0) {
    theta = a - maxTurn;
    }
  }
  else {
    theta = b;
  }
  if (theta > Math.PI) {
    theta -= 2 * Math.PI
  }
  if (theta < -Math.PI) {
    theta += 2 * Math.PI
  }
  return theta;
  }


export function drawEnemy(ctx, e, frame, playerX, playerY) {
  const { x, y, type, hp, maxHp } = e;
  const t = hp / maxHp;
  ctx.save();
  ctx.translate(x, y);

  if (type === 'grunt') {
    ctx.scale(2, 2);
    ctx.fillStyle = '#ff9999';
    ctx.beginPath(); ctx.ellipse(0, 5, 5, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `hsl(${t * 18},90%,55%)`;
    ctx.beginPath();
    ctx.moveTo(-9, 14); ctx.lineTo(-2, 2); ctx.lineTo(-6, -4); ctx.lineTo(-11, 0);
    ctx.closePath(); ctx.fill();
    ctx.moveTo(9, 14); ctx.lineTo(2, 2); ctx.lineTo(6, -4); ctx.lineTo(11, 0);
    ctx.closePath(); ctx.fill();

  } else if (type === 'fighter') {
    ctx.scale(2, 2);
    ctx.fillStyle = '#cc5500';
    ctx.fillRect(-15, -5, 5, 20); ctx.fillRect(10, -5, 5, 20);
    ctx.fillStyle = `hsl(${20 + t * 18},90%,55%)`;
    ctx.beginPath();
    ctx.moveTo(0, 19); ctx.lineTo(-20, -2); ctx.lineTo(-13, -17);
    ctx.lineTo(0, -9); ctx.lineTo(13, -17); ctx.lineTo(20, -2);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffbb66';
    ctx.beginPath(); ctx.ellipse(0, 2, 5, 7, 0, 0, Math.PI * 2); ctx.fill();

  } else if (type === 'bomber') {
    const pulse = 1 + Math.sin(frame * 0.09) * 0.04;
    ctx.scale(2 * pulse, 2 * pulse);
    ctx.fillStyle = `hsl(${t * 10},90%,38%)`;
    ctx.beginPath(); ctx.ellipse(0, 0, 26, 18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = `hsl(${t * 10},90%,52%)`;
    ctx.beginPath();
    ctx.moveTo(0, 24); ctx.lineTo(-36, 4); ctx.lineTo(-32, -10);
    ctx.lineTo(32, -10); ctx.lineTo(36, 4);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#660000';
    [-9, 0, 9].forEach(ox => ctx.fillRect(ox - 3, 14, 6, 14));
    const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, 10);
    cg.addColorStop(0, '#ff4444'); cg.addColorStop(1, 'transparent');
    ctx.fillStyle = cg;
    ctx.beginPath(); ctx.ellipse(0, 0, 10, 8, 0, 0, Math.PI * 2); ctx.fill();

  } else if (type === 'vette') { // ugly
    ctx.fillStyle = 'hotpink';
    ctx.beginPath();
    ctx.moveTo(-75, -200);
    ctx.lineTo(-75, 15);
    ctx.lineTo(-25, 40);
    ctx.lineTo(-25, 0);
    ctx.lineTo(25, 0)
    ctx.lineTo(25, 40);
    ctx.lineTo(75, 15);
    ctx.lineTo(75, -200);
    ctx.lineTo(0, -250);
    ctx.closePath(); ctx.fill();

  } else if (type === 'tank') {
    ctx.scale(.8, .8);
    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.ellipse(0, 0, 48, 9, Math.PI / 6, 0, Math.PI * 2);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.ellipse(0, 0, 48, 9, Math.PI / -6, 0, Math.PI * 2);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'hotpink';
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'brown';
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.closePath(); ctx.fill();

  } else if (type === 'turret') {
    ctx.scale(.8, .8);
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.closePath(); ctx.fill();

    // calculate target angle (between turret & player)
    const dy = playerY - e.y;
    const dx = playerX - e.x;
    const turret2 = Math.atan2(dy, dx);

    // calculate new angle (limited by turning radius)
    getTheta(e.turret1,turret2);
    e.turret1 = theta;

    ctx.lineWidth = 8;
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(0,0);

    // calculate new x,y position for turret muzzle and draw line
    const turretX = (60 * Math.cos(e.turret1));
    const turretY = (60 * Math.sin(e.turret1));
    ctx.lineTo(turretX, turretY);
    ctx.closePath();
    ctx.stroke();
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo((27 * Math.cos(e.turret1)),(27 * Math.sin(e.turret1)));
    ctx.closePath();
    ctx.stroke();

    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.closePath(); ctx.fill();

  } else if (type === 'daitank') {
    ctx.scale(4,4);

    //wings
    ctx.fillStyle = '#00634A';
    ctx.beginPath();
    ctx.moveTo(-6, -9);
    ctx.lineTo(-14, -12);
    ctx.lineTo(-15, -15);
    ctx.lineTo(-15, -11);
    ctx.lineTo(-7, -5)
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(6, -9);
    ctx.lineTo(14, -12);
    ctx.lineTo(15, -15);
    ctx.lineTo(15, -11);
    ctx.lineTo(7, -5)
    ctx.closePath(); ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-13, -7);
    ctx.lineTo(-8, -3);
    ctx.lineTo(-11, -3);
    ctx.lineTo(-13, -5);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(13, -7);
    ctx.lineTo(8, -3);
    ctx.lineTo(11, -3);
    ctx.lineTo(13, -5);
    ctx.closePath(); ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-12, -1);
    ctx.lineTo(-13, 0);
    ctx.lineTo(-13, 5);
    ctx.lineTo(-11, 7);
    ctx.lineTo(-9, 7);
    ctx.lineTo(-9, 4);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(12, -1);
    ctx.lineTo(13, 0);
    ctx.lineTo(13, 5);
    ctx.lineTo(11, 7);
    ctx.lineTo(9, 7);
    ctx.lineTo(9, 4);
    ctx.closePath(); ctx.fill();

    //metal
    ctx.strokeStyle = 'grey';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-2, -10);
    ctx.lineTo(-5, -7);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(2, -10);
    ctx.lineTo(5, -7);
    ctx.closePath(); ctx.stroke();

    ctx.fillStyle = 'grey';
    ctx.beginPath();
    ctx.moveTo(-9, 5);
    ctx.lineTo(-12, 2);
    ctx.lineTo(-12, -3);
    ctx.lineTo(-9, -5);
    ctx.lineTo(-3, -5);
    ctx.lineTo(-3, -12);
    ctx.lineTo(-1, -12);
    ctx.lineTo(-1, -7);
    ctx.lineTo(1, -7);
    ctx.lineTo(1, -12);
    ctx.lineTo(3, -12);
    ctx.lineTo(3, -5);
    ctx.lineTo(9,-5);
    ctx.lineTo(12, -3);
    ctx.lineTo(12, 2);
    ctx.lineTo(9, 5);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(-12, 2);
    ctx.lineTo(-9, 5);
    ctx.lineTo(-9, 3);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(12, 2);
    ctx.lineTo(9, 5);
    ctx.lineTo(9, 3);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = 'grey';
    ctx.beginPath();
    ctx.arc(-2, -12, 1, 0, Math.PI * 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'grey';
    ctx.beginPath();
    ctx.arc(2, -12, 1, 0, Math.PI * 2); ctx.closePath(); ctx.fill();

    ctx.beginPath();
    ctx.ellipse(-10, 8, 0.5, 2, 0, 0, 2 * Math.PI);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.ellipse(10, 8, 0.5, 2, 0, 0, 2 * Math.PI);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = '#73C6AD';
    ctx.beginPath();
    ctx.moveTo(0, -11);
    ctx.lineTo(1, -7);
    ctx.lineTo(-1, -7);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = 'orange';
    ctx.beginPath();
    ctx.arc(0, -7, 1, 0, Math.PI * 2); ctx.closePath(); ctx.fill();

    //body
    ctx.fillStyle = '#003118';
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(-2, -7);
    ctx.lineTo(-9, -2);
    ctx.lineTo(-9, 9);
    ctx.lineTo(-6, 12);
    ctx.lineTo(-3, 12);
    ctx.lineTo(3, 12);
    ctx.lineTo(6, 12);
    ctx.lineTo(9, 9);
    ctx.lineTo(9, -2);
    ctx.lineTo(2, -7);
    ctx.moveTo(0, -5);
    ctx.closePath();
    ctx.fill();

    //balls
    ctx.fillStyle = '#73C6AD';
    ctx.beginPath();
    ctx.arc(-7, -6, 3, 0, Math.PI * 2); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.arc(7, -6, 3, 0, Math.PI * 2); ctx.closePath(); ctx.fill();

    //center
    ctx.fillStyle = '#00634A';
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.lineTo(-6, 8);
    ctx.lineTo(-1, 13);
    ctx.lineTo(1, 13);
    ctx.lineTo(0, 14);
    ctx.lineTo(6, 8);
    ctx.lineTo(6, 0);
    ctx.lineTo(0, -4);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = '#003118';
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(-5, 5);
    ctx.lineTo(-2, 8);
    ctx.lineTo(2, 8);
    ctx.lineTo(5, 5);
    ctx.lineTo(5, 0);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = '#00634A';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.closePath(); ctx.fill();

    ctx.fillStyle = '#73C6AD';
    ctx.beginPath();
    ctx.arc(0, -1, 4, 0, Math.PI * 2); ctx.closePath(); ctx.fill();

    ctx.fillStyle = 'grey';
    ctx.beginPath();
    ctx.arc(0, 10, 2, 0, Math.PI * 2); ctx.closePath(); ctx.fill();

  } else if (type === 'boss') {
    // ── Scaled body (2× base size) ─────────────────────────────────────────
    ctx.save();
    const pulse = 1 + Math.sin(frame * 0.05) * 0.025;
    ctx.scale(2 * pulse, 2 * pulse);

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
    ctx.restore();
  }

  ctx.restore();
}

export function drawCollectable(ctx, c, frame) {
  const r = 9;
  const pulse = 1;
//  removed pulsing effect
//  const pulse = 1 + Math.sin(frame * 0.14 + c.id * 1.9) * 0.1;
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.scale(2, 2);
//  ctx.rotate(frame * 0.025 + c.id * 0.8);

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
