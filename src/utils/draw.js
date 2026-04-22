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

const maxTurn = 0.01;
var theta;

// --------- PLAYER SHIP ------------

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
  ctx.fillStyle = pink1;
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
  ctx.fillStyle = blue0;
  ctx.beginPath();
  ctx.moveTo(-5, 10);
  ctx.lineTo(-15, 6);
  ctx.lineTo(-18, 9);
  ctx.lineTo(-8, 21);
  ctx.lineTo(-6, 18);
  ctx.lineTo(-8, 12);
  ctx.closePath();
  ctx.fill();
  //ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(5, 10);
  ctx.lineTo(15, 6);
  ctx.lineTo(18, 9);
  ctx.lineTo(8, 21);
  ctx.lineTo(6, 18);
  ctx.lineTo(8, 12);
  ctx.closePath();
  ctx.fill();
  //ctx.stroke();

  // Nose Guns
  ctx.fillStyle = blue0;
  ctx.beginPath();
  ctx.rect(-3.5, -18, 1, 9);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.rect(2.5, -18, 1, 9);
  ctx.closePath();
  ctx.fill();

  // Body
  ctx.fillStyle = blue2;
  ctx.beginPath();
  ctx.moveTo(-3, -12);
  ctx.lineTo(3, -12);
  ctx.lineTo(14, 15);
  ctx.lineTo(-14, 15);
  ctx.closePath();
  ctx.fill();
  //ctx.stroke();

  // Engines
  ctx.fillStyle = blue0;
  ctx.strokeStyle = blue2; ctx.lineWidth = 0.75;
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
  ctx.strokeStyle = blue2;
  ctx.beginPath();
  ctx.rect(-9.5, -12, 1, 20);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.rect(-10, 8, 2, 4);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.rect(8.5, -12, 1, 20);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.rect(8, 8, 2, 4);
  ctx.closePath();
  ctx.fill();

  // Cockpit
  ctx.fillStyle = pink1;
  ctx.beginPath();
  ctx.moveTo(2, -15);
  ctx.lineTo(2, -8);
  ctx.lineTo(-2, -8);
  ctx.lineTo(-2, -15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Panel Lining
  ctx.strokeStyle = pink1; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(2, -5);
  ctx.lineTo(2, 5);
  ctx.lineTo(4, 10);
  ctx.moveTo(-2, -5);
  ctx.lineTo(-2, 5);
  ctx.lineTo(-4, 10);
  //ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(2, -7);
  ctx.lineTo(-2, -7);
  ctx.closePath();
  ctx.stroke();

  // Crystal Gem circle
  ctx.strokeStyle = blue0; ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.closePath(); ctx.stroke();

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

// ---- DRAW ENEMIES -----

export function drawEnemy(ctx, e, frame, playerX, playerY) {
  const { x, y, type, hp, maxHp } = e;
  const t = hp / maxHp;
  ctx.save();
  ctx.translate(x, y);

  if (type === 'daitank' || type === 'daitankSprite') { // THE BIG OL' TANK
    ctx.scale(4,4);

    //wings
    ctx.fillStyle = blue1;
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
    ctx.strokeStyle = blue0;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-2, -10);
    ctx.lineTo(-5, -7);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(2, -10);
    ctx.lineTo(5, -7);
    ctx.closePath(); ctx.stroke();

    ctx.fillStyle = blue0;
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

    ctx.fillStyle = pink1;
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

    ctx.fillStyle = blue0;
    ctx.beginPath();
    ctx.arc(-2, -12, 1, 0, Math.PI * 2); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.arc(2, -12, 1, 0, Math.PI * 2); ctx.closePath(); ctx.fill();

    ctx.beginPath();
    ctx.ellipse(-10, 8, 0.5, 2, 0, 0, 2 * Math.PI);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.ellipse(10, 8, 0.5, 2, 0, 0, 2 * Math.PI);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = pink1;
    ctx.beginPath();
    ctx.moveTo(0, -11);
    ctx.lineTo(1, -7);
    ctx.lineTo(-1, -7);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = pink1;
    ctx.beginPath();
    ctx.arc(0, -7, 1, 0, Math.PI * 2); ctx.closePath(); ctx.fill();

    //body
    ctx.fillStyle = blue2;
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
    ctx.fillStyle = pink0;
    ctx.beginPath();
    ctx.arc(-7, -6, 3, 0, Math.PI * 2); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.arc(7, -6, 3, 0, Math.PI * 2); ctx.closePath(); ctx.fill();

    //center
    ctx.fillStyle = blue1;
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

    ctx.fillStyle = blue2;
    ctx.beginPath();
    ctx.moveTo(-5, 0);
    ctx.lineTo(-5, 5);
    ctx.lineTo(-2, 8);
    ctx.lineTo(2, 8);
    ctx.lineTo(5, 5);
    ctx.lineTo(5, 0);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = blue1;
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.closePath(); ctx.fill();

    ctx.fillStyle = pink0;
    ctx.beginPath();
    ctx.arc(0, -1, 4, 0, Math.PI * 2); ctx.closePath(); ctx.fill();

    ctx.fillStyle = blue0;
    ctx.beginPath();
    ctx.arc(0, 10, 2, 0, Math.PI * 2); ctx.closePath(); ctx.fill();

  } else if (type === 'xwing' || type === 'xwingSprite') { // X-WING BUT NOT REALLY
    ctx.scale(4,4);

    // missiles
    ctx.fillStyle = blue0;
    ctx.beginPath();
    ctx.ellipse(16, -6, 1, 6, 0, 0, Math.PI * 2); ctx.closePath(); ctx.fill();
    ctx.ellipse(18, -8, 1, 6, 0, 0, Math.PI * 2); ctx.closePath(); ctx.fill();
    ctx.ellipse(6.5, 4.25, 1.5, 4, 0, 0, Math.PI * 2); ctx.closePath(); ctx.fill();
    ctx.ellipse(-16, -6, 1, 6, 0, 0, Math.PI * 2); ctx.closePath(); ctx.fill();
    ctx.ellipse(-18, -8, 1, 6, 0, 0, Math.PI * 2); ctx.closePath(); ctx.fill();
    ctx.ellipse(-6.5, 4.25, 1.5, 4, 0, 0, Math.PI * 2); ctx.closePath(); ctx.fill();

    // engine area
    ctx.fillStyle = blue2;
    ctx.beginPath();
    ctx.moveTo(-3, -14);
    ctx.lineTo(-3, -9);
    ctx.lineTo(3, -9);
    ctx.lineTo(3, -14);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = blue0;
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.lineTo(-1, -15);
    ctx.lineTo(-2, -16);
    ctx.lineTo(-4, -14);
    ctx.lineTo(-3, -13);
    ctx.lineTo(-2, -14);
    ctx.lineTo(-1, -13);
    ctx.lineTo(0, -14);
    ctx.lineTo(1, -13);
    ctx.lineTo(2, -14);
    ctx.lineTo(3, -13);
    ctx.lineTo(4, -14);
    ctx.lineTo(2, -16);
    ctx.lineTo(1, -15);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = pink1;
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(-2, -12);
    ctx.lineTo(-2, -11);
    ctx.lineTo(0, -12);
    ctx.lineTo(2, -11);
    ctx.lineTo(2, -12);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 0.2;
    //ctx.stroke();

    // body
    ctx.fillStyle = blue2;
    ctx.beginPath();
    ctx.moveTo(-5, -3);
    ctx.lineTo(-7, -1);
    ctx.lineTo(-7, 3.5);
    ctx.lineTo(-5, 3.5);
    ctx.lineTo(-5, -1);
    ctx.lineTo(-5, 7);
    ctx.lineTo(5, 7);
    ctx.lineTo(5, -1);
    ctx.lineTo(5, 3.5);
    ctx.lineTo(7, 3.5);
    ctx.lineTo(7, -1);
    ctx.lineTo(5, -3);
    ctx.lineTo(3, -9);
    ctx.closePath(); ctx.fill();
    ctx.stroke();
    ctx.fillStyle = blue1;
    ctx.beginPath();
    ctx.moveTo(-5, -15);
    ctx.lineTo(-5, -5);
    ctx.lineTo(5, -5);
    ctx.lineTo(5, -15);
    ctx.lineTo(3, -13);
    ctx.lineTo(3, -5);
    ctx.lineTo(-3, -5);
    ctx.lineTo(-3, -13);
    ctx.closePath(); ctx.fill();

    ctx.beginPath();
    ctx.ellipse(0, 6, 5, 2, 0, 0, Math.PI * 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = blue2;
    ctx.beginPath();
    ctx.ellipse(0, 7, 5, 2, 0, 0, Math.PI * 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = blue0;
    ctx.beginPath();
    ctx.ellipse(0, 7, 3, 1, 0, 0, Math.PI * 2); ctx.closePath(); ctx.fill();

    // turret
    ctx.fillStyle = blue1;
    ctx.beginPath();
    ctx.arc(0, -5, 5, 0, Math.PI * 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = blue0;
    ctx.beginPath();
    ctx.arc(0, -6, 4.5, 0, Math.PI * 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = blue1;
    ctx.beginPath();
    ctx.arc(0, -6, 3, 0, Math.PI * 2); ctx.closePath(); ctx.fill();

    // cockpit
    ctx.fillStyle = blue1;
    ctx.beginPath();
    ctx.moveTo(-2, -1);
    ctx.lineTo(-2, 5);
    ctx.lineTo(2, 5);
    ctx.lineTo(2, -1);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = pink1;
    ctx.beginPath();
    ctx.ellipse(0, 2, 1, 2, 0, 0, Math.PI * 2); ctx.closePath(); ctx.fill();

    // side bits
    ctx.fillStyle = pink1;
    ctx.beginPath();
    ctx.moveTo(5, -5);
    ctx.lineTo(5, -3);
    ctx.lineTo(7, -1);
    ctx.lineTo(7, -3);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-5, -5);
    ctx.lineTo(-5, -3);
    ctx.lineTo(-7, -1);
    ctx.lineTo(-7, -3);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = blue1;
    ctx.beginPath();
    ctx.moveTo(5, -7);
    ctx.lineTo(5, -5);
    ctx.lineTo(7, -3);
    ctx.lineTo(7, -5);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-5, -7);
    ctx.lineTo(-5, -5);
    ctx.lineTo(-7, -3);
    ctx.lineTo(-7, -5);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = blue2;
    ctx.beginPath();
    ctx.moveTo(7, -1);
    ctx.lineTo(7, 5);
    ctx.lineTo(9, 7);
    ctx.lineTo(9, -3);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-7, -1);
    ctx.lineTo(-7, 5);
    ctx.lineTo(-9, 7);
    ctx.lineTo(-9, -3);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = blue0;
    ctx.beginPath();
    ctx.moveTo(3, -3);
    ctx.lineTo(9, 3);
    ctx.lineTo(9, 1);
    ctx.lineTo(3, -5);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-3, -3);
    ctx.lineTo(-9, 3);
    ctx.lineTo(-9, 1);
    ctx.lineTo(-3, -5);
    ctx.closePath(); ctx.fill();

    // wings
    ctx.fillStyle = blue1;
    ctx.beginPath();
    ctx.moveTo(9, -7);
    ctx.lineTo(9, 11);
    ctx.lineTo(11, 9);
    ctx.lineTo(11, 3);
    ctx.lineTo(16, -2);
    ctx.lineTo(16, -4);
    ctx.lineTo(19, -7);
    ctx.lineTo(19, -13);
    ctx.lineTo(11, -5);
    ctx.lineTo(11, -7);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-9, -7);
    ctx.lineTo(-9, 11);
    ctx.lineTo(-11, 9);
    ctx.lineTo(-11, 3);
    ctx.lineTo(-16, -2);
    ctx.lineTo(-16, -4);
    ctx.lineTo(-19, -7);
    ctx.lineTo(-19, -13);
    ctx.lineTo(-11, -5);
    ctx.lineTo(-11, -7);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = blue2;
    ctx.beginPath();
    ctx.moveTo(9, 11);
    ctx.lineTo(9, 15);
    ctx.lineTo(12, 17);
    ctx.lineTo(15, 15);
    ctx.lineTo(19, 17);
    ctx.lineTo(19, 11);
    ctx.lineTo(13, 5);
    ctx.lineTo(13, 9);
    ctx.lineTo(11, 7);
    ctx.lineTo(11, 9);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-9, 11);
    ctx.lineTo(-9, 15);
    ctx.lineTo(-12, 17);
    ctx.lineTo(-15, 15);
    ctx.lineTo(-19, 17);
    ctx.lineTo(-19, 11);
    ctx.lineTo(-13, 5);
    ctx.lineTo(-13, 9);
    ctx.lineTo(-11, 7);
    ctx.lineTo(-11, 9);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = pink1;
    ctx.beginPath();
    ctx.moveTo(11, 3);
    ctx.lineTo(11, 7);
    ctx.lineTo(13, 9);
    ctx.lineTo(13, 5);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-11, 3);
    ctx.lineTo(-11, 7);
    ctx.lineTo(-13, 9);
    ctx.lineTo(-13, 5);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = pink0;
    ctx.beginPath();
    ctx.moveTo(19, -13);
    ctx.lineTo(19, -7);
    ctx.lineTo(21, -9);
    ctx.lineTo(21, -15);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(9, -7);
    ctx.lineTo(9, -6);
    ctx.lineTo(11, -6);
    ctx.lineTo(11, -7);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-19, -13);
    ctx.lineTo(-19, -7);
    ctx.lineTo(-21, -9);
    ctx.lineTo(-21, -15);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-9, -7);
    ctx.lineTo(-9, -6);
    ctx.lineTo(-11, -6);
    ctx.lineTo(-11, -7);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(9.5, 15);
    ctx.lineTo(12, 16.5);
    ctx.lineTo(14.5, 15);
    ctx.lineTo(12, 13.5);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-9.5, 15);
    ctx.lineTo(-12, 16.5);
    ctx.lineTo(-14.5, 15);
    ctx.lineTo(-12, 13.5);
    ctx.closePath(); ctx.fill();

  } else if (type === 'moth' || type === 'mothSprite' ) {
    // don't u wanna be a MOTH? 32x31 X: -16 to 16 Y: -16 to 15
    ctx.scale(3,3);

    // bottom wing
    ctx.fillStyle = blue1;
    ctx.beginPath();
    ctx.moveTo(7, 8);
    ctx.lineTo(13, 14);
    ctx.lineTo(15, 14);
    ctx.lineTo(15, 13);
    ctx.lineTo(14, 12);
    ctx.lineTo(14, 11);
    ctx.lineTo(9, 6);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = pink1;
    ctx.beginPath();
    ctx.moveTo(7, 9);
    ctx.lineTo(13, 15);
    ctx.lineTo(15, 15);
    ctx.lineTo(15, 14);
    ctx.lineTo(13, 14);
    ctx.lineTo(7, 8);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = pink0; //maybe white
    ctx.beginPath();
    ctx.moveTo(12, 9);
    ctx.lineTo(14, 11);
    ctx.lineTo(14, 10);
    ctx.lineTo(13, 9);
    ctx.closePath(); ctx.fill();


    ctx.fillStyle = blue1;
    ctx.beginPath();
    ctx.moveTo(-7, 8);
    ctx.lineTo(-13, 14);
    ctx.lineTo(-15, 14);
    ctx.lineTo(-15, 13);
    ctx.lineTo(-14, 12);
    ctx.lineTo(-14, 11);
    ctx.lineTo(-9, 6);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = pink1;
    ctx.beginPath();
    ctx.moveTo(-7, 9);
    ctx.lineTo(-13, 15);
    ctx.lineTo(-15, 15);
    ctx.lineTo(-15, 14);
    ctx.lineTo(-13, 14);
    ctx.lineTo(-7, 8);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = pink0; //maybe white
    ctx.beginPath();
    ctx.moveTo(-12, 9);
    ctx.lineTo(-14, 11);
    ctx.lineTo(-14, 10);
    ctx.lineTo(-13, 9);
    ctx.closePath(); ctx.fill();

    // top wing
    ctx.fillStyle = blue1;
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.lineTo(8, -2);
    ctx.lineTo(8, -6);
    ctx.lineTo(14, -12);
    ctx.lineTo(14, -16);
    ctx.lineTo(16, -8);
    ctx.lineTo(14, -6);
    ctx.lineTo(14, 0);
    ctx.lineTo(9, 4);
    ctx.lineTo(7, 4);
    ctx.lineTo(5, 6);
    ctx.lineTo(0, 6);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = blue2;
    ctx.beginPath();
    ctx.moveTo(2, 0);
    ctx.lineTo(2, 4);
    ctx.lineTo(8, -2);
    ctx.lineTo(8, -3);
    ctx.lineTo(5, 0);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(9, -5);
    ctx.lineTo(9, -3);
    ctx.lineTo(13, -7);
    ctx.lineTo(13, -9);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(2, 6);
    ctx.lineTo(5, 6);
    ctx.lineTo(7, 4);
    ctx.lineTo(10, 4);
    ctx.lineTo(10, 6);
    ctx.lineTo(7, 9);
    ctx.lineTo(1, 9);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = pink1;
    ctx.beginPath();
    ctx.moveTo(14, -6);
    ctx.lineTo(14, 0);
    ctx.lineTo(9, 4);
    ctx.lineTo(10, 4);
    ctx.lineTo(16, -1);
    ctx.lineTo(16, -8);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = pink1; ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(5, 6);
    ctx.lineTo(7, 4);
    ctx.lineTo(10, 4);
    ctx.stroke();
    ctx.fillStyle = pink0;
    ctx.beginPath();
    ctx.moveTo(8, -7);
    ctx.lineTo(8, -6);
    ctx.lineTo(14, -12);
    ctx.lineTo(14, -13);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(7, -4);
    ctx.lineTo(7, -2);
    ctx.lineTo(8, -3);
    ctx.lineTo(8, -5);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = blue1;
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.lineTo(-8, -2);
    ctx.lineTo(-8, -6);
    ctx.lineTo(-14, -12);
    ctx.lineTo(-14, -16);
    ctx.lineTo(-16, -8);
    ctx.lineTo(-14, -6);
    ctx.lineTo(-14, 0);
    ctx.lineTo(-9, 4);
    ctx.lineTo(-7, 4);
    ctx.lineTo(-5, 6);
    ctx.lineTo(0, 6);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = blue2;
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(-2, 4);
    ctx.lineTo(-8, -2);
    ctx.lineTo(-8, -3);
    ctx.lineTo(-5, 0);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-9, -5);
    ctx.lineTo(-9, -3);
    ctx.lineTo(-13, -7);
    ctx.lineTo(-13, -9);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-2, 6);
    ctx.lineTo(-5, 6);
    ctx.lineTo(-7, 4);
    ctx.lineTo(-10, 4);
    ctx.lineTo(-10, 6);
    ctx.lineTo(-7, 9);
    ctx.lineTo(-1, 9);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = pink1;
    ctx.beginPath();
    ctx.moveTo(-14, -6);
    ctx.lineTo(-14, 0);
    ctx.lineTo(-9, 4);
    ctx.lineTo(-10, 4);
    ctx.lineTo(-16, -1);
    ctx.lineTo(-16, -8);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = pink1; ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-5, 6);
    ctx.lineTo(-7, 4);
    ctx.lineTo(-10, 4);
    ctx.stroke();
    ctx.fillStyle = pink0;
    ctx.beginPath();
    ctx.moveTo(-8, -7);
    ctx.lineTo(-8, -6);
    ctx.lineTo(-14, -12);
    ctx.lineTo(-14, -13);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-7, -4);
    ctx.lineTo(-7, -2);
    ctx.lineTo(-8, -3);
    ctx.lineTo(-8, -5);
    ctx.closePath(); ctx.fill();

    // body
    ctx.fillStyle = blue1;
    ctx.strokeStyle = blue2; ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.ellipse(0, 3, 3, 7, 0, 0, Math.PI * 2); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = pink0; ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-3, 0);
    ctx.lineTo(0, 4);
    ctx.lineTo(3, 0);
    ctx.stroke();
    ctx.fillStyle = pink1;
    ctx.beginPath();
    ctx.ellipse(0, 4.5, 1.5, 2.5, 0, 0, Math.PI * 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = pink0; //maybe white
    ctx.beginPath();
    ctx.ellipse(3.5, -1, 1, 2, 0, 0, Math.PI * 2); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-3.5, -1, 1, 2, 0, 0, Math.PI * 2); ctx.closePath(); ctx.fill();

    // mouth guns
    ctx.fillStyle = blue0;
    ctx.beginPath();
    ctx.ellipse(4, 9, 1, 2, 0, 0, Math.PI * 2); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-4, 9, 1, 2, 0, 0, Math.PI * 2); ctx.closePath(); ctx.fill();

  } else if (type === 'jet' || type === 'dummy1' || type === 'dummy2' || type === 'dummy3'  || type === 'jetSprite') { // JET FIGHTER
    ctx.scale(4, 4);

    // STYLE
    ctx.strokeStyle = pink1;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-6.7, 4.5);
    ctx.lineTo(-6.7, 3.2);
    ctx.lineTo(6.7, 3.2);
    ctx.lineTo(6.7, 4.5);
    ctx.stroke();

    // triangle
    ctx.fillStyle = blue1;
    ctx.beginPath();
    ctx.moveTo(-7, 3);
    ctx.lineTo(7, 3);
    ctx.lineTo(0, -3);
    ctx.closePath(); ctx.fill();

    ctx.beginPath();
    ctx.ellipse(4, 2.5, 1.2, 3, 0, 0, Math.PI * 2); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-4, 2.5, 1.2, 3, 0, 0, Math.PI * 2); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.ellipse(0, -2, 1.2, 2, 0, 0, Math.PI * 2); ctx.closePath(); ctx.fill();

    //rear engines
    ctx.fillStyle = pink0;
    ctx.beginPath();
    ctx.ellipse(1.5, -1.75, 0.5, 1, 0, 0, Math.PI * 2); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-1.5, -1.75, 0.5, 1, 0, 0, Math.PI * 2); ctx.closePath(); ctx.fill();

    //front engines
    ctx.fillStyle = blue0;
    ctx.beginPath();
    ctx.ellipse(4, 4.5, 1, 1, 0, 0, Math.PI * 2); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-4, 4.5, 1, 1, 0, 0, Math.PI * 2); ctx.closePath(); ctx.fill();

    //outlines
    ctx.strokeStyle = blue2;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(5, 1);
    ctx.lineTo(5, 4.9);
    ctx.lineTo(4, 5.9);
    ctx.lineTo(3, 4.9);
    ctx.lineTo(3, 1);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-5, 1);
    ctx.lineTo(-5, 4.9);
    ctx.lineTo(-4, 5.9);
    ctx.lineTo(-3, 4.9);
    ctx.lineTo(-3, 1);
    ctx.stroke();

    ctx.fillStyle = blue2;
    ctx.beginPath();
    ctx.moveTo(-3, 2.5);
    ctx.lineTo(-3, 4);
    ctx.lineTo(3, 4);
    ctx.lineTo(3, 2.5);
    ctx.lineTo(1.5, 2.5);
    ctx.lineTo(1.5, 0);
    ctx.lineTo(0.5, -1);
    ctx.lineTo(0.5, -6);
    ctx.lineTo(2, -6);
    ctx.lineTo(2, -7);
    ctx.lineTo(-2, -7);
    ctx.lineTo(-2, -6);
    ctx.lineTo(-0.5, -6);
    ctx.lineTo(-0.5, -1);
    ctx.lineTo(-1.5, 0);
    ctx.lineTo(-1.5, 2.5);
    ctx.lineTo(-3, 2.5);
    ctx.lineTo(-3, 4);
    ctx.closePath(); ctx.fill();

    // spoiler
    ctx.beginPath();
    ctx.moveTo(-2, -7.5); ctx.lineTo(-2, -5.5); ctx.stroke();
    ctx.moveTo(2, -7.5); ctx.lineTo(2, -5.5); ctx.stroke();

    //cockpit
    ctx.fillStyle = pink1;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.ellipse(0, 3, 1, 2, 0, 0, Math.PI * 2); ctx.closePath(); ctx.fill(); ctx.stroke();

  } else if (type === 'beetle' || type === 'beetleSprite') { // ----- BEETLE BUM -----
    ctx.scale(3, 3);

    //center
    ctx.fillStyle = pink1;
    ctx.beginPath();
    ctx.moveTo(-2, 3);
    ctx.lineTo(-5, 6);
    ctx.lineTo(-5, 9);
    ctx.lineTo(5, 9);
    ctx.lineTo(5, 6);
    ctx.lineTo(2, 3);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = blue0;
    ctx.beginPath(); ctx.arc(0, 9, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = pink0; ctx.strokeStyle = blue2; ctx.lineWidth = 0.75;
    ctx.beginPath(); ctx.arc(0, 9.5, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    ctx.fillStyle = blue0;
    ctx.beginPath();
    ctx.moveTo(-1, -6);
    ctx.lineTo(-2, -5);
    ctx.lineTo(-2, -1);
    ctx.lineTo(-3, 0);
    ctx.lineTo(0, 3);
    ctx.lineTo(3, 0);
    ctx.lineTo(2, -1);
    ctx.lineTo(2, -5);
    ctx.lineTo(1, -6);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = pink0;
    ctx.beginPath(); ctx.arc(0, -1.5, 1.2, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = pink1;
    ctx.beginPath();
    ctx.moveTo(-1, -5);
    ctx.lineTo(-2, -4);
    ctx.lineTo(-2, -3);
    ctx.lineTo(-1, -4);
    ctx.lineTo(1, -4);
    ctx.lineTo(2, -3);
    ctx.lineTo(2, -4);
    ctx.lineTo(1, -5);
    ctx.closePath(); ctx.fill();

    // wings (on bottom)
    ctx.fillStyle = blue1;
    ctx.beginPath();
    ctx.moveTo(9, 10);
    ctx.lineTo(14, 15);
    ctx.lineTo(16, 15);
    ctx.lineTo(16, 11);
    ctx.lineTo(12, 7);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-9, 10);
    ctx.lineTo(-14, 15);
    ctx.lineTo(-16, 15);
    ctx.lineTo(-16, 11);
    ctx.lineTo(-12, 7);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = blue2;
    ctx.beginPath();
    ctx.moveTo(9, 10);
    ctx.lineTo(10.25, 11.25);
    ctx.lineTo(14, 9);
    ctx.lineTo(12, 7);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-9, 10);
    ctx.lineTo(-10.25, 11.25);
    ctx.lineTo(-14, 9);
    ctx.lineTo(-12, 7);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = pink1;
    ctx.beginPath();
    ctx.moveTo(16, 12);
    ctx.lineTo(16, 15);
    ctx.lineTo(17, 16);
    ctx.lineTo(17, 13);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-16, 12);
    ctx.lineTo(-16, 15);
    ctx.lineTo(-17, 16);
    ctx.lineTo(-17, 13);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = blue0;
    ctx.beginPath();
    ctx.moveTo(17, 13);
    ctx.lineTo(17, 16);
    ctx.lineTo(18, 17);
    ctx.lineTo(18, 14);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-17, 13);
    ctx.lineTo(-17, 16);
    ctx.lineTo(-18, 17);
    ctx.lineTo(-18, 14);
    ctx.closePath(); ctx.fill();

    // center sides
    ctx.fillStyle = blue1; ctx.strokeStyle = blue2; ctx.lineWidth = 0.75;
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.lineTo(2, 3);
    ctx.lineTo(5, 6);
    ctx.lineTo(5, 9);
    ctx.lineTo(6, 9);
    ctx.lineTo(6, 3);
    ctx.lineTo(3, 0);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, 3);
    ctx.lineTo(-2, 3);
    ctx.lineTo(-5, 6);
    ctx.lineTo(-5, 9);
    ctx.lineTo(-6, 9);
    ctx.lineTo(-6, 3);
    ctx.lineTo(-3, 0);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = blue2;
    ctx.beginPath();
    ctx.moveTo(3, -4);
    ctx.lineTo(2, -3);
    ctx.lineTo(2, -1);
    ctx.lineTo(6, 3);
    ctx.lineTo(6, 7);
    ctx.lineTo(10, 3);
    ctx.lineTo(12, 3);
    ctx.lineTo(14, 5);
    ctx.lineTo(14, 3);
    ctx.lineTo(12, 1);
    ctx.lineTo(10, 1);
    ctx.lineTo(5, -4);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-3, -4);
    ctx.lineTo(-2, -3);
    ctx.lineTo(-2, -1);
    ctx.lineTo(-6, 3);
    ctx.lineTo(-6, 7);
    ctx.lineTo(-10, 3);
    ctx.lineTo(-12, 3);
    ctx.lineTo(-14, 5);
    ctx.lineTo(-14, 3);
    ctx.lineTo(-12, 1);
    ctx.lineTo(-10, 1);
    ctx.lineTo(-5, -4);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = pink1; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(3, -1);
    ctx.lineTo(5, -1);
    ctx.lineTo(8, 2);
    ctx.lineTo(8, 3);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-3, -1);
    ctx.lineTo(-5, -1);
    ctx.lineTo(-8, 2);
    ctx.lineTo(-8, 3);
    ctx.stroke();

    // top chunk + fin
    ctx.fillStyle = blue2;
    ctx.beginPath();
    ctx.moveTo(10, -11);
    ctx.lineTo(10, -9);
    ctx.lineTo(8, -9);
    ctx.lineTo(6, -7);
    ctx.lineTo(6, -5);
    ctx.lineTo(10, -9);
    ctx.lineTo(11, -9);
    ctx.lineTo(16, -14);
    ctx.lineTo(16, -17);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-10, -11);
    ctx.lineTo(-10, -9);
    ctx.lineTo(-8, -9);
    ctx.lineTo(-6, -7);
    ctx.lineTo(-6, -5);
    ctx.lineTo(-10, -9);
    ctx.lineTo(-11, -9);
    ctx.lineTo(-16, -14);
    ctx.lineTo(-16, -17);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = pink1;
    ctx.beginPath();
    ctx.moveTo(10, -9);
    ctx.lineTo(6, -5);
    ctx.lineTo(6, -4);
    ctx.lineTo(10, -8);
    ctx.lineTo(12, -8);
    ctx.lineTo(12, -9);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-10, -9);
    ctx.lineTo(-6, -5);
    ctx.lineTo(-6, -4);
    ctx.lineTo(-10, -8);
    ctx.lineTo(-12, -8);
    ctx.lineTo(-12, -9);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = blue1;
    ctx.beginPath();
    ctx.moveTo(10, -8);
    ctx.lineTo(6, -4);
    ctx.lineTo(6, -3);
    ctx.lineTo(8, -1);
    ctx.lineTo(8, -3);
    ctx.lineTo(10, -5);
    ctx.lineTo(12, -5);
    ctx.lineTo(12, -8);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-10, -8);
    ctx.lineTo(-6, -4);
    ctx.lineTo(-6, -3);
    ctx.lineTo(-8, -1);
    ctx.lineTo(-8, -3);
    ctx.lineTo(-10, -5);
    ctx.lineTo(-12, -5);
    ctx.lineTo(-12, -8);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = blue0; ctx.strokeStyle = blue2; ctx.lineWidth = 0.5;    ctx.beginPath();
    ctx.beginPath();
    ctx.moveTo(8, -3);
    ctx.lineTo(8, -1);
    ctx.lineTo(10, -1);
    ctx.lineTo(12, -3);
    ctx.lineTo(12, -5);
    ctx.lineTo(10, -5);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-8, -3);
    ctx.lineTo(-8, -1);
    ctx.lineTo(-10, -1);
    ctx.lineTo(-12, -3);
    ctx.lineTo(-12, -5);
    ctx.lineTo(-10, -5);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // middle chunk
    ctx.fillStyle = blue0;
    ctx.beginPath();
    ctx.moveTo(14, -1);
    ctx.lineTo(12, 0);
    ctx.lineTo(12, 1);
    ctx.lineTo(14, 1);
    ctx.lineTo(16, 3);
    ctx.lineTo(16, 0);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-14, -1);
    ctx.lineTo(-12, 0);
    ctx.lineTo(-12, 1);
    ctx.lineTo(-14, 1);
    ctx.lineTo(-16, 3);
    ctx.lineTo(-16, 0);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = blue1;
    ctx.beginPath();
    ctx.moveTo(12, 1);
    ctx.lineTo(14, 3);
    ctx.lineTo(14, 5);
    ctx.lineTo(16, 3);
    ctx.lineTo(14, 1);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-12, 1);
    ctx.lineTo(-14, 3);
    ctx.lineTo(-14, 5);
    ctx.lineTo(-16, 3);
    ctx.lineTo(-14, 1);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // bottom chunk
    ctx.fillStyle = blue1;
    ctx.beginPath();
    ctx.moveTo(10, 3);
    ctx.lineTo(6, 7);
    ctx.lineTo(6, 9);
    ctx.lineTo(8, 11);
    ctx.lineTo(8, 9);
    ctx.lineTo(12, 5);
    ctx.lineTo(14, 5);
    ctx.lineTo(12, 3);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-10, 3);
    ctx.lineTo(-6, 7);
    ctx.lineTo(-6, 9);
    ctx.lineTo(-8, 11);
    ctx.lineTo(-8, 9);
    ctx.lineTo(-12, 5);
    ctx.lineTo(-14, 5);
    ctx.lineTo(-12, 3);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = pink2; ctx.strokeStyle = pink1; ctx.lineWidth = 0.75;
    ctx.beginPath();
    ctx.moveTo(8, 9);
    ctx.lineTo(8, 10.5);
    ctx.lineTo(9.5, 10.5);
    ctx.lineTo(13.5, 6.5);
    ctx.lineTo(13.5, 5);
    ctx.lineTo(12, 5);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-8, 9);
    ctx.lineTo(-8, 10.5);
    ctx.lineTo(-9.5, 10.5);
    ctx.lineTo(-13.5, 6.5);
    ctx.lineTo(-13.5, 5);
    ctx.lineTo(-12, 5);
    ctx.closePath(); ctx.fill(); ctx.stroke();

  } else if (type === 'heli' || type === 'heliSprite') { // ----- Helicopter -----
    ctx.scale(1.75, 1.75);

    // Wings
    ctx.fillStyle = blue2;
    ctx.beginPath();
    ctx.moveTo(-3, -9);
    ctx.lineTo(-5, -7);
    ctx.lineTo(-5, 3);
    ctx.lineTo(-7, 2);
    ctx.lineTo(-7, 5);
    ctx.lineTo(-3, 7);
    ctx.lineTo(3, 7);
    ctx.lineTo(7, 5);
    ctx.lineTo(7, 2);
    ctx.lineTo(5, 3);
    ctx.lineTo(5, -7);
    ctx.lineTo(3, -9);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = pink0;
    ctx.beginPath();
    ctx.moveTo(-7, -3);
    ctx.lineTo(-7, 2);
    ctx.lineTo(-5, 3);
    ctx.lineTo(-5, -2);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(7, -3);
    ctx.lineTo(7, 2);
    ctx.lineTo(5, 3);
    ctx.lineTo(5, -2);
    ctx.closePath(); ctx.fill();

    // Engines
    ctx.fillStyle = blue2;
    ctx.beginPath(); ctx.arc(-11, -5, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(11, -5, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = blue1;
    ctx.beginPath();
    ctx.moveTo(-15, -3);
    ctx.lineTo(-15, 5);
    ctx.lineTo(-7, 5);
    ctx.lineTo(-7, -3);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(15, -3);
    ctx.lineTo(15, 5);
    ctx.lineTo(7, 5);
    ctx.lineTo(7, -3);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = blue1;
    ctx.beginPath(); ctx.arc(-11, -3, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(11, -3, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = blue2;
    ctx.beginPath(); ctx.arc(-11, 6, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(11, 6, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = blue0;
    ctx.beginPath(); ctx.arc(-11, 6.5, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(11, 6.5, 2, 0, Math.PI * 2); ctx.fill();

    // tail
    ctx.fillStyle = blue2;
    ctx.beginPath();
    ctx.moveTo(-5, -16);
    ctx.lineTo(-5, -9);
    ctx.lineTo(5, -9);
    ctx.lineTo(5, -16);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = blue1;
    ctx.beginPath();
    ctx.moveTo(-1, -13);
    ctx.lineTo(-3, -11);
    ctx.lineTo(-3, -7);
    ctx.lineTo(3, -7);
    ctx.lineTo(3, -11);
    ctx.lineTo(1, -13);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = blue0;
    ctx.beginPath();
    ctx.moveTo(-1, -17);
    ctx.lineTo(-3, -15);
    ctx.lineTo(-3, -12);
    ctx.lineTo(-1, -14);
    ctx.lineTo(1, -14);
    ctx.lineTo(3, -12);
    ctx.lineTo(3, -15);
    ctx.lineTo(1, -17);
    ctx.closePath(); ctx.fill();

    // body
    ctx.fillStyle = blue1; ctx.strokeStyle = blue2; ctx.lineWidth = 0.75;
    ctx.beginPath();
    ctx.moveTo(-1, -11);
    ctx.lineTo(-1, -9);
    ctx.lineTo(-3, -7);
    ctx.lineTo(-3, 1);
    ctx.lineTo(-1, 3);
    ctx.lineTo(-3, 5);
    ctx.lineTo(-3, 13);
    ctx.lineTo(3, 13);
    ctx.lineTo(3, 5);
    ctx.lineTo(1, 3);
    ctx.lineTo(3, 1);
    ctx.lineTo(3, -7);
    ctx.lineTo(1, -9);
    ctx.lineTo(1, -11);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 13, 3, 0, Math.PI * 2); ctx.fill();

    // Cockpit
    ctx.fillStyle = pink1;
    ctx.beginPath(); ctx.ellipse(0, 10.5, 1.5, 3, 0, 0, Math.PI * 2); ctx.fill();



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
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.6);
  glow.addColorStop(0, blue1);
  glow.addColorStop(1, 'rgba(93, 203, 237, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2); ctx.fill();

  // Hexagon body
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const x = Math.cos(a) * r * pulse;
    const y = Math.sin(a) * r * pulse;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = blue0;
  ctx.fill();
  ctx.strokeStyle = blue1;
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
  ctx.fillStyle = blue0;
  ctx.fill();

  ctx.restore();
}
