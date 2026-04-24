import { useEffect, useRef, useState } from 'react';
import { drawPlayer, drawEnemy, getTheta, drawCollectable } from './utils/draw.js';
import { createEnemy, updateEnemy, mkBullet } from './utils/enemy.js';
import { drawExplosion, spawnExplosionRings, explode } from './utils/explode.js';
import { WAVES } from './utils/waves.js';
import * as Audio from './utils/audio.js';
import './index.css';

const W = 480;
const H = 640;

const blue0 = '#BCEEFD';
const blue1 = '#5DCBED';
const blue2 = '#0A99C5';

const pink0 = '#FFB3FA';
const pink1 = '#EE5BE5';
const pink2 = '#BC09B0';

// ─── Fancy Title Animation ───────────────────────────────────────────────────

export function FancyText({ text }) {
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setFlash(true);
    }, 1200);

    const t2 = setTimeout(() => {
      setFlash(false);
    }, 1900);

    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, []);

  return (
    <h1 className={`fancy ${flash ? "flash" : ""}`}>
      {text.split("").map((letter, i) => (
        <span
          key={i}
          style={{ animationDelay: `${i * 0.07}s` }}
        >
          {letter === " " ? "\u00A0" : letter}
        </span>
      ))}
    </h1>
  );
}

// ─── Drawing ──────────────────────────────────────────────────────────────────

function drawBullet(ctx, b, frame) {
  ctx.save();
  if (b.owner === 'player') {
    // Rotate ellipse to align with bullet velocity direction
    const angle = Math.atan2(b.vy, b.vx) + Math.PI / 2;
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 14);
    g.addColorStop(0, '#ffffcc'); g.addColorStop(0.4, pink1); g.addColorStop(1, 'rgba(255,180,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(b.x, b.y, b.pw ? 5 : 3, b.pw ? 24 : 20, angle, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'white';
    ctx.beginPath(); ctx.ellipse(b.x, b.y, b.pw ? 2 : 1.5, b.pw ? 14 : 12, angle, 0, Math.PI * 2); ctx.fill();
  } else if (b.burst) {
    // Elongated neon purple/blue — boss pod stream bullets
    //console.log(b.vx, b.vy);
    const angle = Math.atan2(b.vy, b.vx) + Math.PI / 2;
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 14);
    g.addColorStop(0, 'white'); g.addColorStop(0.3, '#8800ff'); g.addColorStop(1, 'rgba(80,0,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(b.x, b.y, 4, 20, angle, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#cc88ff';
    ctx.beginPath(); ctx.ellipse(b.x, b.y, 2, 12, angle, 0, Math.PI * 2); ctx.fill();
  } else if (b.chonk) {
    // Turret projectiles - big and chonky!
    const g = ctx.createRadialGradient(b.x, b.y, 6, b.x, b.y, 36);
      g.addColorStop(0, 'white'); g.addColorStop(0.25, pink1); g.addColorStop(1, 'rgba(255,0,180,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(b.x, b.y, 36, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#lightblue';
    ctx.beginPath(); ctx.arc(b.x, b.y, 18, 0, Math.PI * 2); ctx.fill();
  } else {
    // default enemy bullets -- inner pulse, consistent outer diameter
    const p = 0.8 + Math.sin(frame * 0.22 + b.id * 1.7) * 0.2;
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 7);
    g.addColorStop(0, 'white'); g.addColorStop(.5, pink1); g.addColorStop(1, pink2);
    const gIn = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 6);
    gIn.addColorStop(0, 'white'); gIn.addColorStop(1, pink1);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(b.x, b.y, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = gIn;
    ctx.beginPath(); ctx.arc(b.x, b.y, 6 * p, 0, Math.PI * 2); ctx.fill();
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _cid = 0;
function mkCollectable(x, y) {
  return {
    x: x + (Math.random()) * 20,
    y: y + (Math.random()) * 10,
    vy: 1.4,
    vx: (Math.random() - 0.5) * 0.8,
    age: 0,
    id: _cid++,
  };
}

const DROP_COUNT = { jet: 1, heli: 1, moth: 2, beetle: 5, xwing: 10 };
const COLLECT_PTS = 300;

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
      deathTimer: 0,
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
    bossWarning: 0,
    bossBarAnim: 0,
    bossDefeated: false,
    bossDeathTimer: 0,
    bossDeathX: 0,
    bossDeathY: 0,
    explosions: [],
    collectables: [],
    chain: 0,
    chainTimer: 0,
    chainTextScale: 1.0,
    chainBossHitCooldown: 0,   // frames until boss hit can increment chain again (120 = 2 s)
    chainBossDecayTimer: 60,   // ticks down; each expiry drops chain by 1 if boss not hit
    chainBossHitThisSecond: false, // did a bullet land on the boss in the current decay window?
    gpsAccum: 0,               // GPS running sum: cumulative base scores of all kills in chain
    medalCount: 0,             // total pickups collected (for score calc screen)
    deathCount: 0,             // number of times player was hit (for No Deaths bonus)
    flashTimer: 0,
    shake: 0,
    shakeX: 0,
    shakeY: 0,
  };
}

// ─── Leaderboard helpers ──────────────────────────────────────────────────────

const LS_KEY = 'dondokpachi_scores';
const LS_LAST_INITIALS_KEY = 'dondokpachi_last_initials';

function loadLastInitials() {
  return localStorage.getItem(LS_LAST_INITIALS_KEY) || null;
}

function saveLastInitials(initials) {
  localStorage.setItem(LS_LAST_INITIALS_KEY, initials);
}

function loadScores() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
  catch { return []; }
}

function qualifiesForLeaderboard(score) {
  const scores = loadScores();
  return scores.length < 10 || score > scores[scores.length - 1].score;
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

// ─── API helpers ──────────────────────────────────────────────────────────────

const API_BASE = 'https://dodonkpachi.onrender.com';

async function fetchGlobalScores() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${API_BASE}/api/scores`, { signal: controller.signal });
    if (!res.ok) throw new Error('Failed to fetch global scores');
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function postScore(initials, score) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    await fetch(`${API_BASE}/api/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player: initials, score }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

function qualifiesForGlobal(score, globalScores) {
  if (!globalScores || globalScores.length < 10) return true;
  return score > globalScores[globalScores.length - 1].score;
}

function qualifiesForAnyBoard(score, globalScores) {
  return qualifiesForLeaderboard(score) || qualifiesForGlobal(score, globalScores);
}

// ─── Component ────────────────────────────────────────────────────────────────
// Fonts and text style sheet

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
    fontFamily: 'PixelifySans',
    textAlign: 'center',
    gap: 18,
  },
  title: { fontSize: 50, color: pink1, textShadow: '0 0 20px pink0, 0 0 40px blue2', letterSpacing: 4 },
  sub: { fontSize: 24, color: blue1, letterSpacing: 2 },
  controls: { fontFamily: 'monospace', fontSize: 16, color: blue0, lineHeight: 1.8 },
  score: { fontFamily: 'Sixtyfour', fontSize: 54, color: 'pink1' },
  btn: {
    padding: '8px 20px',
    fontSize: 20,
    fontFamily: 'PixelifySans',
    background: pink1,
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
  const [calcBonuses, setCalcBonuses]     = useState([]);
  const [calcDisplayScore, setCalcDisplayScore] = useState(0);
  const [calcLines, setCalcLines]         = useState([]);
  // each entry: { labelVis, detailVis, detailNum, ptsVis, ptsNum }
  const [globalScores, setGlobalScores]   = useState([]);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [globalError, setGlobalError]     = useState(false);
  const [leaderboardTab, setLeaderboardTab] = useState('global');
  const [newInitials, setNewInitials]     = useState('');
  const globalScoresRef                   = useRef([]);
  const selectedTrackRef                  = useRef(2);
  const [selectedTrack, setSelectedTrack] = useState(2);

  useEffect(() => {
    if (screen !== 'playing') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    stateRef.current = initState();

    const onKeyDown = e => {
      // Pause toggle — handled before anything else; Space consumed here only
      if (e.code === 'Escape' || e.code === 'Space') {
        paused = !paused;
        if (paused == true) {
          Audio.sfxPause();
        }
        // if (paused) Audio.stopMusic();
        // else {
          // const isBoss = stateRef.current?.waveIdx === WAVES.length - 1;
          // Audio.startMusic(isBoss ? Audio.BOSS_TRACK_IDX : selectedTrackRef.current);
        // }
        // return;
      }
      //if (e.code === 'KeyQ') { debugMode = !debugMode; return; }
      keysRef.current[e.code] = true;
      // Bomb on Shift press
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        const s = stateRef.current;
        if (!s || s.player.bombs <= 0) return;
        s.player.bombs--;
        s.enemyBullets = [];
        s.enemies.forEach(en => {
          if (en.type === 'boss') {
            // Boss just takes heavy damage
            en.hp -= 160;
          } else {
            // All other ships instantly destroyed
            en.dead = true;
            s.score += en.score;
            const sz = en.type === 'beetle' ? 2.2 : en.type === 'moth' ? 1.5 : 1;
            explode(s, en.x, en.y, sz);
            spawnExplosionRings(s, en.x, en.y, en.type);
            const drops = DROP_COUNT[en.type] ?? 1;
            for (let d = 0; d < drops; d++) s.collectables.push(mkCollectable(en.x, en.y));
          }
        });
        Audio.sfxBomb();
        // origin point of explosion animation
        explode(s, W/2, H/2, 2.5);
        // flash particles
        for (let i = 0; i < 60; i++) {
          const a = Math.random() * Math.PI * 2;
          const spd = 1 + Math.random() * 12;
          const life = 20 + Math.random() * 30;
          s.particles.push({
            x: W/2, y: H/2,
            vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
            r: 2 + Math.random() * 4, life, maxLife: life,
            color: [pink1,'white',blue0][Math.floor(Math.random() * 3)],
          });
        }
      }
    };
    const onKeyUp = e => { keysRef.current[e.code] = false; };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup',   onKeyUp);

    let running   = true;
    let paused    = false;
    let debugMode = false;

    const TICK_MS = 1000 / 60;   // ~16.667 ms per game tick
    let lastTick  = 0;

    function loop(now) {
      if (!running) return;
      if (paused) {
        // Draw pause overlay over last frame and wait
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, W, H);
        ctx.textAlign = 'center';
        ctx.fillStyle = pink1;
        ctx.font = 'bold 30px Sixtyfour';
        ctx.fillText('PAUSED', W / 2, H / 2 - 10);
        ctx.fillStyle = pink0;
        ctx.font = '24px PixelifySans';
        ctx.fillText('SPACE  or  ESC  to  resume', W / 2, H / 2 + 22);
        ctx.restore();
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      // ── 60 fps cap — skip tick if not enough time has elapsed ─────────────
      if (now - lastTick < TICK_MS - 1) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      lastTick = now;

      const s = stateRef.current;
      const keys = keysRef.current;
      const pl = s.player;
      const focused = keys['KeyX'];

      // ── Input (frozen while death animation plays) ────────────────────────
      if (pl.deathTimer <= 0) {
        const spd = focused ? 2.6 : 5.2;
        if (keys['ArrowLeft'] || keys['KeyA']) pl.x = Math.max(pl.w / 2, pl.x - spd);
        if (keys['ArrowRight']|| keys['KeyD']) pl.x = Math.min(W - pl.w / 2, pl.x + spd);
        if (keys['ArrowUp']   || keys['KeyW']) pl.y = Math.max(pl.h / 2, pl.y - spd);
        if (keys['ArrowDown'] || keys['KeyS']) pl.y = Math.min(H - pl.h / 2, pl.y + spd);
      }

      // ── Shooting: player firing logic ──────────────────────────────────────
      pl.shootTimer++;
      if (pl.deathTimer > 0) { /* no shooting during death window */ }
      else if (focused) {
        // FOCUS (X held): auto-fire 2 tight streams, high damage, slower movement
        if (pl.shootTimer >= 5) {
          pl.shootTimer = 0;
          Audio.sfxFocusShoot();
          [
            { dx: -7, vx: -0.18 },
            { dx:  7, vx:  0.18 },
          ].forEach(({ dx, vx }) => {
            const b = mkBullet(pl.x + dx, pl.y - 18, vx, -20, 'player');
            b.pw = true;
            s.playerBullets.push(b);
          });
        }
      } else if (keys['KeyZ']) {
        // SHOOT (Z): 7-bullet spread fan, 45° total (±22.5°), speed 20px/frame
        if (pl.shootTimer >= 10) {
          pl.shootTimer = 0;
          Audio.sfxShoot();
          s.playerBullets.push(mkBullet(pl.x - 15, pl.y - 10, -4.65, -18.9, 'player'));
          s.playerBullets.push(mkBullet(pl.x - 10, pl.y - 14, -2.18, -19.8, 'player'));
          s.playerBullets.push(mkBullet(pl.x -  5, pl.y - 17, -0.61, -19.9, 'player'));
          s.playerBullets.push(mkBullet(pl.x,      pl.y - 18,  0,    -20,   'player'));
          s.playerBullets.push(mkBullet(pl.x +  5, pl.y - 17,  0.61, -19.8, 'player'));
          s.playerBullets.push(mkBullet(pl.x + 10, pl.y - 14,  2.18, -19.3, 'player'));
          s.playerBullets.push(mkBullet(pl.x + 15, pl.y - 10,  4.65, -18.5, 'player'));
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
      if (s.bossWarning > 0) {
        // Hold here — boss warning countdown; start boss wave when it expires
        s.bossWarning--;
        if (s.bossWarning === 0) {
          s.waveIdx = WAVES.length - 1;
          s.waveTimer = 0;
          s.waveQueue = [...WAVES[WAVES.length - 1]];
          s.waveClear = false;
          s.bossBarAnim = 1;
          Audio.switchMusic(Audio.BOSS_TRACK_IDX);
        }
      } else if (s.waveDelay > 0) {
        s.waveDelay--;
      } else {
        s.waveTimer++;
        while (s.waveQueue.length > 0 && s.waveQueue[0].at <= s.waveTimer) {
          const ev = s.waveQueue.shift();
          s.enemies.push(createEnemy(ev.type, ev.x, ev.pat, ev.vy, ev.sy));
        }
        // Wave complete when queue empty and all enemies cleared
        if (s.waveQueue.length === 0 && s.enemies.length === 0 && !s.waveClear) {
          s.waveClear = true;
          const next = s.waveIdx + 1;
          if (next < WAVES.length) {
            if (next === WAVES.length - 1) {
              // Final wave done — boss warning before the boss appears
              s.bossWarning = 140;
              Audio.sfxAssWarning();
            } else {
              // Normal transition — near-instant gap
              s.waveDelay = 10;
              s.waveIdx = next;
              s.waveTimer = 0;
              s.waveQueue = [...WAVES[next]];
              s.waveClear = false;
            }
          }
        }
      }

      // ── Update enemies ────────────────────────────────────────────────────
      s.enemies.forEach(e => updateEnemy(ctx, e, pl.x, pl.y, s.enemyBullets));

      // Boss transition — ongoing explosions during freeze stage, shake during charge
      s.enemies.forEach(en => {
        if (en.type !== 'boss' || en.transitionTimer <= 0) return;
        if (en.transitionTimer > 80 && s.frame % 9 === 0) {
          const ox = (Math.random() - 0.5) * en.w * 0.55;
          const oy = (Math.random() - 0.5) * en.h * 0.4;
          spawnExplosionRings(s, en.x + ox, en.y + oy, 'beetle');
          explode(s, en.x + ox, en.y + oy, 1.6);
          Audio.sfxHeavyExplosion();
        }
        if (en.transitionTimer <= 80 && en.transitionTimer > 30) {
          s.shake = Math.max(s.shake, 7); // rumble during charge
        }
      });

      // Enemy death logic
      s.enemies = s.enemies.filter(e => {
        if (e.dead) return false;
        if (e.y > H + 120 || e.y < -300 || e.x < -200 || e.x > W + 200) return false;
        return true;
      });

      // ── Collisions: player bullets → enemies ──────────────────────────────
      s.enemies.forEach(en => {
        s.playerBullets.forEach(b => {
          if (b.hit) return;
          const hw = en.w, hh = en.h;
          if (overlaps(b.x, b.y, 6, 10, en.x, en.y, hw, hh)) {
            if (en.y > 15) { // deadzone
              b.hit = true;
              const dmg = b.pw ? 3 : 1;
              en.hp -= dmg;
              spawnParticles(s.particles, b.x, b.y, 3, ['pink1','white','#ffaa00'], [1,5],[1,3]);
              // Boss chain — refresh display on any hit; increment once per 2 s
              if (en.type === 'boss' && en.hp > 0) {
                s.chainBossHitThisSecond = true;
                s.chainTimer = 200; // keep counter visible while hitting the boss
                if (s.chainBossHitCooldown === 0) {
                  s.chain++;
                  s.chainTextScale += 0.01;
                  s.chainBossHitCooldown = 120;
                }
              }
            }
            // Boss phase transition trigger
            if (en.type === 'boss' && en.transitionTimer === 0 && en.hp > 0) {
              const ratio = en.hp / en.maxHp;

              if ((en.phase === 0 && ratio <= 0.66) || (en.phase === 1 && ratio <= 0.33)) {
                en.transitionTimer = 120;
                // boss 'charge' after transition change -- disabled
                //en.chargeX = pl.x;
                //en.chargeY = pl.y;
                en.chargeX = en.x;
                en.chargeY = en.y;
                en.returnX = en.x;
                en.returnY = en.y;
                //s.enemyBullets = [];
                for (let i = 0; i < 6; i++) {
                  const ox = (Math.random() - 0.5) * en.w * 0.55;
                  const oy = (Math.random() - 0.5) * en.h * 0.4;
                  spawnExplosionRings(s, en.x + ox, en.y + oy, 'beetle');
                  explode(s, en.x + ox, en.y + oy, 1.8);
                }
                Audio.sfxHeavyExplosion();
              }
            }
            if (en.hp <= 0) {
              en.dead = true;
              // GPS: score += gpsAccum + base, then bank base for future multiplier
              s.score += s.gpsAccum + en.score;
              s.gpsAccum += en.score;
              s.chain++;
              s.chainTextScale += 0.01;
              s.chainTimer = 200;
              const sz = en.type === 'boss' ? 3 : en.type === 'beetle' ? 2.2 : en.type === 'moth' ? 1.5 : 1;
              explode(s, en.x, en.y, sz);
              spawnExplosionRings(s, en.x, en.y, en.type);
              //if (en.type === 'boss' || en.type === 'beetle') {
              //  Audio.sfxBigExplosion();
              //} else {
                Audio.sfxHeavyExplosion();
              //}
              const drops = DROP_COUNT[en.type] ?? 1;
              for (let d = 0; d < drops; d++) s.collectables.push(mkCollectable(en.x, en.y));
              if (en.type === 'boss') {
                s.bossDefeated = true;
                s.bossDeathX = en.x;
                s.bossDeathY = en.y;
                s.bossDeathTimer = 180;
                s.flashTimer = 20;
                // Bullet cancel - Convert every enemy bullet on screen into a collectable pickup
                s.enemyBullets.forEach(b => s.collectables.push(mkCollectable(b.x, b.y)));
                s.enemyBullets = [];
                // Initial burst: several big explosions scattered around the boss
                for (let i = 0; i < 8; i++) {
                  const ox = (Math.random() - 0.5) * 130;
                  const oy = (Math.random() - 0.5) * 80;
                  spawnExplosionRings(s, en.x + ox, en.y + oy, 'boss');
                  explode(s, en.x + ox, en.y + oy, 2.2);
                }
              }
            }
          }
        });
      });
      s.playerBullets = s.playerBullets.filter(b => !b.hit);

      // ── Collisions: enemy bullets + enemy bodies → player ────────────────
      if (pl.invTimer <= 0 && !debugMode) {
        let playerHit = false;

        // Enemy bullets (player hitbox)
        for (const b of s.enemyBullets) {
          if (b.chonk) {
            if (overlaps(pl.x, pl.y, pl.w * 0.2, pl.h * 0.2, b.x, b.y, 12, 12)) {
              playerHit = true;
              break;
            }
          }
          else if (overlaps(pl.x, pl.y, pl.w * 0.2, pl.h * 0.2, b.x, b.y, 5, 5)) {
            playerHit = true;
            break;
          }
        }

        // Enemy bodies — jets/moths also destroyed on impact
        if (!playerHit) {
          for (const e of s.enemies) {
            if (e.dead) continue;
            if (overlaps(pl.x, pl.y, pl.w * 0.2, pl.h * 0.2, e.x, e.y, e.w * 0.6, e.h * 0.6)) {
              playerHit = true;
              // small ships get rammed apart; beetles/boss shrug it off
              if (e.type === 'jet' || e.type === 'heli' || e.type === 'moth') {
                e.dead = true;
                //s.score += EDEFS[e.type].score;
                spawnExplosionRings(s, e.x, e.y, e.type);
                explode(s, e.x, e.y, e.type === 'moth' ? 1.2 : 0.9);
                Audio.sfxHeavyExplosion();
                const drops = DROP_COUNT[e.type] ?? 1;
                for (let d = 0; d < drops; d++) s.collectables.push(mkCollectable(e.x, e.y));
              }
              break;
            }
          }
        }

        if (playerHit) {
          s.lives--;
          s.deathCount++;
          s.medalCount = 0;     // medal streak resets on death
          pl.deathTimer = 60;   // 1 second frozen / invisible
          pl.invTimer   = 240;  // total invincibility (includes death time)

          // Big white & blue player explosion
          spawnExplosionRings(s, pl.x, pl.y, 'player');
          s.shake = Math.max(s.shake, 18);
          const { particles: pp } = s;
          for (let i = 0; i < 28; i++) {
            const a = (i / 28) * Math.PI * 2 + Math.random() * 0.3;
            const spd = 2.5 + Math.random() * 6;
            const life = 22 + Math.random() * 30;
            pp.push({ x: pl.x, y: pl.y,
              vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
              r: 2 + Math.random() * 2.5, life, maxLife: life,
              color: ['white','#aaddff','#0099ff','#cceeff'][Math.floor(Math.random() * 4)] });
          }
          for (let i = 0; i < 14; i++) {
            const a = Math.random() * Math.PI * 2;
            const spd = Math.random() * 3.5;
            const life = 35 + Math.random() * 40;
            pp.push({ x: pl.x, y: pl.y,
              vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
              r: 1.5 + Math.random() * 3, life, maxLife: life,
              color: ['white','#ddeeff'][Math.floor(Math.random() * 2)] });
          }

          Audio.sfxHeavyExplosion();
          s.flashTimer = 14;
          s.enemyBullets = [];
          s.chain = 0;
          s.chainTimer = 0;
          s.chainTextScale = 1.0;
          s.gpsAccum = 0;
          // game over triggers when deathTimer expires (1-second delay)
        }
      }
      // Boss bar draw-in animation
      if (s.bossBarAnim > 0 && s.bossBarAnim < 40) s.bossBarAnim++;

      // Tick timers (deathTimer first; respawn position when it expires)
      if (pl.deathTimer > 0) {
        pl.deathTimer--;
        if (pl.deathTimer === 0) {
          if (s.lives <= 0) {
            running = false;
            setFinalScore(s.score);
            setIsWin(false);
            if (qualifiesForAnyBoard(s.score, globalScoresRef.current)) {
              setScreen('enter_initials');
            } else {
              const last = loadLastInitials() || '???';
              postScore(last, s.score).catch(console.error);
              setGlobalLoading(true);
              setGlobalError(false);
              fetchGlobalScores()
                .then(fresh => { setGlobalScores(fresh); globalScoresRef.current = fresh; })
                .catch(err => { console.error(err); setGlobalError(true); })
                .finally(() => setGlobalLoading(false));
              setLeaderboardTab('global');
              setScreen('leaderboard');
            }
            return;
          }
          pl.x = W / 2;
          pl.y = H - 100;
        }
      }
      if (pl.invTimer > 0) pl.invTimer--;

      // ── Boss death explosion show ─────────────────────────────────────────
      if (s.bossDeathTimer > 0) {
        s.bossDeathTimer--;
        if (s.frame % 7 === 0) {
          const ox = (Math.random() - 0.5) * 140;
          const oy = (Math.random() - 0.5) * 90;
          spawnExplosionRings(s, s.bossDeathX + ox, s.bossDeathY + oy, 'beetle');
          explode(s, s.bossDeathX + ox, s.bossDeathY + oy, 1.8);
        }
        if (s.frame % 20 === 0) Audio.sfxHeavyExplosion();
      }

      // ── Win condition ─────────────────────────────────────────────────────
      if (s.bossDefeated && s.enemies.length === 0
          && s.bossDeathTimer <= 0 && s.collectables.length === 0) {
        running = false;
        Audio.stopMusic();
        Audio.sfxWaveClear();
        setFinalScore(s.score);
        setIsWin(true);
        // Level Clear bonus calculations
        setCalcBonuses([
          { label: 'MEDALS COLLECTED', detailCount: s.medalCount, detailSuffix: '× 1,000',  pts: s.medalCount * 1000 },
          { label: 'BOMBS REMAINING', detailCount: s.player.bombs, detailSuffix: '× 250,000', pts: s.player.bombs * 250000 },
          { label: 'LIVES REMAINING', detailCount: s.lives,      detailSuffix: '× 1,000,000', pts: s.lives * 1000000 },
          { label: 'NO DEATHS',       detailText: s.deathCount === 0 ? 'PERFECT!' : '--',   pts: s.deathCount === 0 ? 250000 : 0 },
        ]);
        setScreen('score_calc');
        return;
      }

      // ── Chain timer / boss decay ──────────────────────────────────────────
      const bossAlive = s.enemies.some(e => e.type === 'boss' && !e.dead);
      if (bossAlive) {
        // Boss phase: cooldown for hit-based increment
        if (s.chainBossHitCooldown > 0) s.chainBossHitCooldown--;
        // Every 60 frames (1 s), drop chain by 1 if boss wasn't hit this window
        if (--s.chainBossDecayTimer <= 0) {
          s.chainBossDecayTimer = 60;
          if (!s.chainBossHitThisSecond && s.chain > 0) {
            s.chain--;
            s.chainTextScale = Math.max(1.0, s.chainTextScale - 0.01);
            if (s.chain === 0) s.gpsAccum = 0;
          }
          s.chainBossHitThisSecond = false;
        }
      } else if (!s.bossWarning) {
        // Normal phase (not in WARNING): timer-based chain expiry
        if (s.chainTimer > 0) { s.chainTimer--; if (!s.chainTimer) { s.chain = 0; s.chainTextScale = 1.0; s.gpsAccum = 0; } }
      }
      // bossWarning > 0: chain timer is paused — do nothing
      if (s.flashTimer > 0) s.flashTimer--;

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
//  acceleration
//        c.age++;
//        if (c.age > 40) c.vy = Math.min(c.vy + 0.01, 5);
        c.x += c.vx;
        c.y += c.vy;
        c.vx *= 0.97;
        if (overlaps(pl.x, pl.y, pl.w * 1.2, pl.h * 1.2, c.x, c.y, 30, 30)) {
          s.score += COLLECT_PTS;
          s.medalCount++;
          spawnParticles(s.particles, c.x, c.y, 6,
            [pink1, pink0, 'white'], [1, 4], [1, 3]);
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
      s.enemies.forEach(e => drawEnemy(ctx, e, s.frame, pl.x, pl.y));

      // Explosion rings (above enemies, under bullets)
      s.explosions.forEach(ex => drawExplosion(ctx, ex));

      // Player (hidden during death window; flash when invincible)
      if (pl.deathTimer <= 0 && (pl.invTimer <= 0 || Math.floor(pl.invTimer / 5) % 2 === 0)) {
        drawPlayer(ctx, pl.x, pl.y, s.frame, focused);

        // crystal gem glow: bright light when holding down focus fire
        if (focused) {
          const gradient = ctx.createRadialGradient(pl.x, pl.y, 4, pl.x, pl.y, 10);
          gradient.addColorStop(0, pink1);
          gradient.addColorStop(1, "transparent");
          ctx.fillStyle = gradient;
          ctx.beginPath(); ctx.arc(pl.x, pl.y, 12, 0, Math.PI * 2); ctx.fill();
        }
        else {
          ctx.fillStyle = "black";
          ctx.beginPath(); ctx.arc(pl.x, pl.y, 5, 0, Math.PI * 2); ctx.fill();
          const gradient = ctx.createRadialGradient(pl.x, pl.y, 2, pl.x, pl.y, 6);
          gradient.addColorStop(0, pink1);
          gradient.addColorStop(1, "transparent");
          ctx.fillStyle = gradient;
          ctx.beginPath(); ctx.arc(pl.x, pl.y, 6, 0, Math.PI * 2); ctx.fill();

        }
      }

      // Enemy bullets
      s.enemyBullets.forEach(b => drawBullet(ctx, b, s.frame));

      // Player bullets
      s.playerBullets.forEach(b => drawBullet(ctx, b, s.frame));

      // Particles (top layer)
      s.particles.forEach(p => drawParticle(ctx, p));

      ctx.restore();

      // White full screen flash (player/boss death)
      if (s.flashTimer > 0) {
        ctx.save();
        ctx.globalAlpha = (s.flashTimer / 8) * 0.85;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      // ─ HUD ──────────────────────────────────────────────────────────────
      // Top bar
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, W, 34);
      ctx.strokeStyle = 'rgba(0,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, 34); ctx.lineTo(W, 34); ctx.stroke();

      // Player current score (top left)
      ctx.font = '18px "Sixtyfour", monospace';
      ctx.fillStyle = pink1;
      ctx.textAlign = 'left';
      ctx.fillText(`${String(s.score).padStart(1,'0')}`, 8, 22);

      // Hi-score (top center)
      const hi = hiScoreRef.current;
      ctx.textAlign = 'center';
      ctx.fillStyle = s.score >= hi && hi > 0 ? pink1 : 'rgba(238,91,229,100)';
      ctx.fillText(`${String(Math.max(hi, s.score)).padStart(1,'0')}`, W / 2, 22);

      ctx.textAlign = 'right';
      // Ship count
      for (let i = 0; i < s.lives; i++) {
        const lx = W - 16 - i * 26;
        ctx.fillStyle = pink1;
        ctx.strokeStyle = pink1;
        ctx.beginPath();
        ctx.moveTo(lx, 4);
        ctx.lineTo(lx-5, 18);
        ctx.lineTo(lx-5, 7);
        ctx.lineTo(lx-5, 18);
        ctx.lineTo(lx-6, 20);
        ctx.lineTo(lx-10, 20);
        ctx.lineTo(lx-5, 25);
        ctx.lineTo(lx-5, 21);
        ctx.lineTo(lx-1, 21);
        ctx.lineTo(lx-1, 23);
        ctx.lineTo(lx+1, 23);
        ctx.lineTo(lx+1, 21);
        ctx.lineTo(lx+5, 21);
        ctx.lineTo(lx+5, 25);
        ctx.lineTo(lx+10, 20);
        ctx.lineTo(lx+6, 20);
        ctx.lineTo(lx+5, 18);
        ctx.lineTo(lx+5, 7);
        ctx.lineTo(lx+5, 18);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Bomb count
      ctx.textAlign = 'left';
      ctx.fillStyle = pink1;
      ctx.font = '12px monospace';
      for (let i = 0; i < s.player.bombs; i++) {
        const b2b = i*20;
        ctx.beginPath();
        // body
        ctx.arc(15+b2b, H - 20, 5, 0, Math.PI * 2);
        ctx.moveTo(20+b2b,H-20);
        ctx.lineTo(20+b2b,H-12);
        ctx.lineTo(10+b2b,H-12);
        ctx.lineTo(10+b2b,H-20);
        // fins
        ctx.moveTo(15+b2b,H-13);
        ctx.lineTo(20+b2b,H-8);
        ctx.lineTo(20+b2b,H-3);
        ctx.lineTo(15+b2b,H-8);
        ctx.lineTo(10+b2b,H-3);
        ctx.lineTo(10+b2b,H-8);
        ctx.lineTo(15+b2b,H-13);
        ctx.fill();
      }

      // Chain counter
      if (s.chain > 0) {
        const ca = Math.min(1, s.chainTimer / 80);
        ctx.globalAlpha = ca;
        ctx.fillStyle = pink0;
        const chainPx = Math.round(10 * s.chainTextScale);
        ctx.font = `${chainPx}px Sixtyfour`;
        ctx.textAlign = 'center';
        ctx.fillText(`${s.chain} CHAIN!`, W / 2, H - 18);
        ctx.globalAlpha = 1;
      }

      // Fixed boss HP bar (top of screen, sweeps in from centre after warning)
      if (s.bossBarAnim > 0) {
        const boss = s.enemies.find(e => e.type === 'boss' && !e.dead);
        if (boss) {
          const t    = Math.max(0, boss.hp / boss.maxHp);
          const barW = W * 0.95;
          const barH = 16;
          const cx   = W / 2;
          const by   = 44;
          const prog  = Math.min(1, s.bossBarAnim / 40);
          const animW = barW * prog;
          const animX = cx - animW / 2;
          const alpha = Math.min(1, prog * 2.5);

          // Track + clipped HP fill
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = 'rgba(40,0,40,0.85)';
          ctx.fillRect(animX, by, animW, barH);
          ctx.beginPath();
          ctx.rect(animX, by, animW, barH);
          ctx.clip();
          ctx.fillStyle = `hsl(${t * 120},90%,50%)`;
          ctx.fillRect(cx - barW / 2, by, barW * t, barH);
          ctx.restore();

          // Border
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = '#cc00cc';
          ctx.lineWidth = 1;
          ctx.strokeRect(animX, by, animW, barH);
          ctx.restore();
        }
      }

      // Boss warning overlay
      if (s.bossWarning > 0) {
        const blink   = Math.floor(s.frame / 20) % 2 === 0;
        const t = (s.frame % 50) / 50;
        const pulse =
          1 +
          Math.max(0, 1 - Math.abs(t - 0.15) * 10) * 0.10 +
          Math.max(0, 1 - Math.abs(t - 0.35) * 10) * 0.06;
        const fadeIn  = Math.min(1, (210 - s.bossWarning) / 18);  // quick fade in
        ctx.save();
        ctx.textAlign = 'center';

        // Pink glow behind text
        ctx.globalAlpha = fadeIn * (blink ? 0.95 : 0.22);
        ctx.shadowColor = pink2;
        ctx.shadowBlur = 20 + pulse * 30;
        ctx.font = `bold ${Math.round(46 * pulse)}px monospace`;
        ctx.fillStyle = pink2;
        ctx.fillText('///WARNING///', W / 2, H / 2 - 14);

        // Secondary glow pass for extra intensity
        ctx.shadowBlur = 18;
        ctx.globalAlpha = fadeIn * (blink ? 0.5 : 0.1);
        ctx.fillText('///WARNING///', W / 2, H / 2 - 14);

        ctx.shadowBlur  = 0;
        //ctx.globalAlpha = fadeIn * (blink ? 0.88 : 0.18);
        ctx.font = '15px monospace';
        ctx.fillStyle = blue1;
        ctx.fillText('BOSS APPROACHING', W / 2, H / 2 + 22);

        ctx.restore();
      }

      // Wave label (hidden — uncomment to debug)
      // ctx.fillStyle = 'rgba(0,255,255,0.38)';
      // ctx.font = '11px monospace';
      // ctx.textAlign = 'right';
      // const wl = s.waveIdx === WAVES.length - 1 ? '!! BOSS !!' : `WAVE ${s.waveIdx + 1} / ${WAVES.length - 1}`;
      // ctx.fillText(wl, W - 8, H - 8);

      // Debug mode indicator
      if (debugMode) {
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'right';
        ctx.fillStyle = '#ff4444';
        ctx.fillText('DEBUG MODE', W - 8, H - 8);
      }

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

  // Score calculation screen — sequenced per-element reveal with count-up animation
  useEffect(() => {
    if (screen !== 'score_calc') return;

    let cancelled = false;
    const timers = [];
    const rafIds = [];

    // Initialise all lines hidden
    setCalcLines(calcBonuses.map(() => ({
      labelVis: false, detailVis: false, detailNum: 0, ptsVis: false, ptsNum: 0,
    })));
    setCalcDisplayScore(finalScore);

    // Resolves after ms; always resolves so `await` unblocks (check cancelled after)
    const wait = ms => new Promise(resolve => {
      const id = setTimeout(resolve, ms);
      timers.push(id);
    });

    // Animates 0 → target over duration ms, calling onTick(value) each frame
    const countUp = (target, duration, onTick) => new Promise(resolve => {
      if (target === 0) { onTick(0); resolve(); return; }
      const t0 = performance.now();
      const tick = now => {
        if (cancelled) { resolve(); return; }
        const p  = Math.min(1, (now - t0) / duration);
        const ep = 1 - Math.pow(1 - p, 3);          // ease-out cubic
        onTick(Math.round(ep * target));
        if (p < 1) { rafIds.push(requestAnimationFrame(tick)); }
        else       { onTick(target); resolve(); }
      };
      rafIds.push(requestAnimationFrame(tick));
    });

    const setLine = (i, patch) =>
      setCalcLines(prev => prev.map((l, j) => j === i ? { ...l, ...patch } : l));

    const run = async () => {
      let runningScore = finalScore;
      await wait(600);         // initial pause before first line

      for (let i = 0; i < calcBonuses.length; i++) {
        if (cancelled) return;
        const b = calcBonuses[i];

        // ① Label
        setLine(i, { labelVis: true });
        await wait(1000);
        if (cancelled) return;

        // ② Detail (count up the numeric part if present)
        setLine(i, { detailVis: true });
        if (b.detailCount != null && b.detailCount > 0) {
          await countUp(b.detailCount, 600, val => setLine(i, { detailNum: val }));
        }
        await wait(1000);
        if (cancelled) return;

        // ③ Points (count up pts AND overall score simultaneously)
        setLine(i, { ptsVis: true });
        if (b.pts > 0) {
          const base = runningScore;
          await countUp(b.pts, 800, val => {
            Audio.sfxScoreTally();
            setLine(i, { ptsNum: val });
            setCalcDisplayScore(base + val);
          });
          runningScore += b.pts;
        }
        await wait(1000);
        if (cancelled) return;
      }

      // All done — commit final score and transition
      setFinalScore(runningScore);
      if (qualifiesForAnyBoard(runningScore, globalScoresRef.current)) {
        setScreen('enter_initials');
      } else {
        const last = loadLastInitials() || '???';
        postScore(last, runningScore).catch(console.error);
        setGlobalLoading(true);
        setGlobalError(false);
        fetchGlobalScores()
          .then(fresh => { setGlobalScores(fresh); globalScoresRef.current = fresh; })
          .catch(err => { console.error(err); setGlobalError(true); })
          .finally(() => setGlobalLoading(false));
        setLeaderboardTab('global');
        setScreen('leaderboard');
      }
    };

    run();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      rafIds.forEach(cancelAnimationFrame);
    };
  }, [screen]);

  // Title screen canvas background animation
  useEffect(() => {
    if (screen !== 'title') return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vy: 0.35 + Math.random() * 2.8, r: Math.random() * 1.6 + 0.3,
      alpha: 0.2 + Math.random() * 0.8,
      hue: Math.random() < 0.12 ? 50 : (Math.random() < 0.18 ? 200 : 0),
    }));
    const buildings = makeBuildings();
    let frame = 0;
    let running = true;

    function drawTitle() {
      if (!running) return;

      ctx.fillStyle = blue2;
      ctx.fillRect(0, 0, W, H);

      buildings.forEach(b => {
        b.y += b.spd;
        if (b.y > H + b.h) b.y = -b.h;
        ctx.fillStyle = `hsla(${b.hue},60%,20%,${b.alpha})`;
        ctx.fillRect(b.x - b.w / 2, b.y - b.h, b.w, b.h);
      });

      ctx.strokeStyle = 'rgba(0,60,120,0.25)';
      ctx.lineWidth = 1;
      const gs = 44;
      const off = frame % gs;
      for (let y = -gs + off; y < H; y += gs) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(0,40,80,0.15)';
      const doff = (frame * 0.3) % 80;
      for (let x = -W + doff; x < W * 2; x += 80) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 110, H); ctx.stroke();
      }

      stars.forEach(st => {
        st.y += st.vy;
        if (st.y > H + 2) { st.y = -2; st.x = Math.random() * W; }
        const col = st.hue === 0 ? `rgba(255,255,255,${st.alpha})`
          : st.hue === 50  ? `rgba(255,220,100,${st.alpha})`
          : `rgba(100,190,255,${st.alpha})`;
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2); ctx.fill();
      });

      frame++;
      rafRef.current = requestAnimationFrame(drawTitle);
    }

    rafRef.current = requestAnimationFrame(drawTitle);
    return () => { running = false; cancelAnimationFrame(rafRef.current); };
  }, [screen]);

  // Keep canvas hi-score ref in sync with leaderboard state
  useEffect(() => {
    hiScoreRef.current = leaderboard[0]?.score ?? 0;
  }, [leaderboard]);

  // Fetch global scores once on mount so they're ready before the first game ends
  useEffect(() => {
    setGlobalLoading(true);
    setGlobalError(false);
    fetchGlobalScores()
      .then(scores => { setGlobalScores(scores); globalScoresRef.current = scores; })
      .catch(err => { console.error(err); setGlobalError(true); })
      .finally(() => setGlobalLoading(false));
  }, []);

  // Keep globalScoresRef in sync whenever state updates
  useEffect(() => {
    globalScoresRef.current = globalScores;
  }, [globalScores]);

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
        Audio.sfxHeavyExplosion();
        initialsRef.current = next;
        setInitialsDisplay(next);
      } else if (e.key === 'Enter' && cur.length === 3) {
        saveLastInitials(cur);
        setNewInitials(cur);
        const isLocalQualifier = qualifiesForLeaderboard(finalScore);
        if (isLocalQualifier) {
          const scores = saveScore(cur, finalScore);
          setLeaderboard(scores);
        }
        Audio.sfxWaveClear();
        // Always POST for full game history. Tab choice is purely a display decision:
        // new global best → GLOBAL, otherwise LOCAL if score qualifies there, else GLOBAL.
        const existingGlobal = globalScoresRef.current.find(e => e.player === cur);
        const isNewGlobalBest = !existingGlobal || finalScore > existingGlobal.score;
        postScore(cur, finalScore)
          .then(() => fetchGlobalScores())
          .then(fresh => {
            setGlobalScores(fresh);
            globalScoresRef.current = fresh;
            if (isNewGlobalBest) {
              setLeaderboardTab('global');
            } else {
              setLeaderboardTab(isLocalQualifier ? 'local' : 'global');
            }
            setScreen('leaderboard');
          })
          .catch(() => {
            setLeaderboardTab(isLocalQualifier ? 'local' : 'global');
            setScreen('leaderboard');
          });
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [screen, finalScore]);


  const startGame = () => {
    keysRef.current = {};
    setNewInitials('');
    Audio.initAudio();
    Audio.startMusic(selectedTrackRef.current);
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
          <div><FancyText text="DoDonkPACHI" /></div>
          <div style={{ ...STYLES.sub, fontSize: 30, marginTop: -14, marginBottom: 18 }}>DATA STORM</div>
          <div style={{ fontSize: 24, color: blue1, letterSpacing: 3, opacity: 0.7, textDecoration: 'underline' }}>
            CONTROLS
          </div>
          <div style={{ ...STYLES.controls, marginTop: -8, marginBottom: 18 }}>
            <div>ARROWS / WASD — MOVE</div>
            <div>Z — SPREAD SHOT</div>
            <div>X — FOCUS SHOT</div>
            <div>SHIFT — BOMB (clears bullets)</div>
            <div>ESC / SPACE — PAUSE</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <button style={STYLES.btn} onClick={startGame}>
              PLAY
            </button>
            <button
              style={{ ...STYLES.btn, background: 'black', color: pink1, border: '1px solid pink1' }}
              onClick={() => {
                setIsWin(null);
                setLeaderboardTab('global');
                setGlobalLoading(true);
                setGlobalError(false);
                fetchGlobalScores()
                  .then(s => { setGlobalScores(s); globalScoresRef.current = s; })
                  .catch(err => { console.error(err); setGlobalError(true); })
                  .finally(() => setGlobalLoading(false));
                setScreen('leaderboard');
              }}>
              LEADERBOARD
            </button>
          </div>
          <div style={{ ...STYLES.controls, fontSize: 14, marginTop: 18, marginBottom: 18 }}>
            <div>&copy; Andy Krueger 2026</div>
            <div>Music by DavidKBD, licenced under CC By 4.0 (https://creativecommons.org/licenses/by/4.0/)</div>
          </div>
          <div style={{ ...STYLES.controls, fontSize: 10, marginTop: 9, marginBottom: 0 }}>version 0.1.1</div>
        </div>
      )}

      {screen === 'score_calc' && (
        <div style={STYLES.overlay}>
          <div style={{ ...STYLES.title, color: pink1, textShadow: '0 0 20px pink0, 0 0 50px pink0' }}>
            ALL CLEAR!
          </div>
          <div style={STYLES.score}>{String(calcDisplayScore).padStart(1, '0')}</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 360 }}>
            {calcBonuses.map((bonus, i) => {
              const line = calcLines[i] ?? {};
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontFamily: 'PixelifySans',
                    fontSize: 16,
                    letterSpacing: 1,
                    opacity: line.labelVis ? 1 : 0,
                    transition: 'opacity 0.2s ease',
                    minHeight: 22,
                  }}
                >
                  {/* Label */}
                  <span style={{ color: blue1, minWidth: 160 }}>{bonus.label}</span>

                  {/* Detail */}
                  <span style={{
                    color: 'blue2', margin: '0 12px', minWidth: 110, textAlign: 'right',
                    opacity: line.detailVis ? 1 : 0, transition: 'opacity 0.15s ease',
                  }}>
                    {bonus.detailCount != null
                      ? `${line.detailNum} ${bonus.detailSuffix}`
                      : bonus.detailText}
                  </span>

                  {/* Points */}
                  <span style={{
                    color: bonus.pts > 0 ? 'pink1' : 'blue2',
                    minWidth: 100, textAlign: 'right',
                    opacity: line.ptsVis ? 1 : 0, transition: 'opacity 0.15s ease',
                  }}>
                    {bonus.pts > 0 ? `+${(line.ptsNum ?? 0).toLocaleString()}` : '---'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {screen === 'enter_initials' && (
        <div style={STYLES.overlay}>
          <div style={{
            ...STYLES.title,
            color: isWin ? 'pink1' : 'pink2',
            textShadow: isWin ? '0 0 20px pink1' : '0 0 20px pink1',
          }}>
            {isWin ? 'ALL CLEAR!' : 'GAME OVER'}
          </div>
          <div style={STYLES.score}>{String(finalScore).padStart(1, '0')}</div>
          <div style={{ ...STYLES.sub, marginTop: -6 }}>ENTER YOUR INITIALS</div>

          <div style={{ display: 'flex', gap: 10 }}>
            {[0, 1, 2].map(i => {
              const active = i === initialsDisplay.length;
              return (
                <div key={i} style={{
                  width: 48, height: 60,
                  border: `2px solid ${active ? pink1 : blue2}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 34, fontFamily: 'Sixtyfour', color: '#fff', fontWeight: 'bold',
                  background: active ? 'rgba(0,255,255,0.08)' : 'rgba(0,0,0,0.3)',
                  boxShadow: active ? '0 0 12px rgba(0,255,255,0.4)' : 'none',
                }}>
                  {initialsDisplay[i] ?? (active ? '▮' : '')}
                </div>
              );
            })}
          </div>

          <div style={STYLES.controls}>
            BACKSPACE TO DELETE • ENTER TO CONFIRM
          </div>
        </div>
      )}

      {screen === 'leaderboard' && (
        <div style={{ ...STYLES.overlay, gap: 10, justifyContent: 'flex-start', paddingTop: 24 }}>
          {/* Header */}
          <div style={{
            ...STYLES.title, fontSize: 28,
            color: isWin === null ? pink1 : isWin ? 'pink1' : '#ff4444',
            textShadow: isWin === null ? '0 0 16px #00ffff' : isWin ? '0 0 16px #ffaa00' : '0 0 16px #ff0000',
          }}>
            {isWin === null ? '— LEADERBOARD —' : isWin ? '★ ALL CLEAR! ★' : 'GAME OVER'}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex' }}>
            {['global', 'local'].map(tab => (
              <button
                key={tab}
                style={{
                  ...STYLES.btn,
                  fontFamily: 'monospace',
                  fontSize: 15,
                  padding: '5px 20px',
                  letterSpacing: 3,
                  background: leaderboardTab === tab ? 'white' : 'transparent',
                  color: leaderboardTab === tab ? '#000' : 'white',
                  border: '1px solid white',
                  borderRadius: tab === 'global' ? '4px 0 0 4px' : '0 4px 4px 0',
                }}
                onClick={() => setLeaderboardTab(tab)}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Score list */}
          <div style={{ fontFamily: 'PixelifySans', width: 400 }}>
            <div style={{
              color: pink0, fontSize: 13, letterSpacing: 3,
              textAlign: 'center', marginBottom: 6, opacity: 0.8,
            }}>
              ── TOP PILOTS ──
            </div>

            {leaderboardTab === 'global' ? (
              globalLoading ? (
                <div style={{ color: 'blue2', textAlign: 'center', fontSize: 14, padding: '12px 0' }}>
                  LOADING...
                </div>
              ) : globalError ? (
                <div style={{ color: '#ff4444', textAlign: 'center', fontSize: 13, padding: '12px 0', lineHeight: 1.8 }}>
                  SERVER UNAVAILABLE<br/>
                  <span style={{ fontSize: 11, opacity: 0.7 }}>Render may be waking up.</span><br/>
                  <button
                    onClick={() => {
                      setGlobalLoading(true);
                      setGlobalError(false);
                      fetchGlobalScores()
                        .then(scores => { setGlobalScores(scores); globalScoresRef.current = scores; })
                        .catch(err => { console.error(err); setGlobalError(true); })
                        .finally(() => setGlobalLoading(false));
                    }}
                    style={{
                      marginTop: 8, padding: '4px 14px', fontSize: 12,
                      fontFamily: 'PixelifySans', letterSpacing: 2,
                      background: 'transparent', color: '#ff4444',
                      border: '1px solid #ff444488', cursor: 'pointer',
                    }}
                  >
                    RETRY
                  </button>
                </div>
              ) : globalScores.length === 0 ? (
                <div style={{ color: 'blue2', textAlign: 'center', fontSize: 14 }}>
                  NO RECORDS YET
                </div>
              ) : (
                // Deduplicate: one entry per player (highest score), sorted desc, top 10
                (() => {
                  const seen = new Set();
                  const deduped = globalScores
                    .slice()
                    .sort((a, b) => b.score - a.score)
                    .filter(e => !seen.has(e.player) && seen.add(e.player))
                    .slice(0, 10);
                  return deduped.map((entry, i) => {
                  const isPlayer = !!newInitials && entry.player === newInitials;
                  return (
                    <div key={i} style={{
                      display: 'grid',
                      gridTemplateColumns: '80px auto auto',
                      padding: '7px 0px',
                      background: isPlayer ? 'rgba(0,255,180,0.12)' : 'transparent',
                      borderLeft: isPlayer ? '2px solid pink0' : '2px solid transparent',
                      color: isPlayer ? 'pink0' : i === 0 ? 'pink2' : 'blue1',
                      fontSize: 24,
                      fontFamily: 'Sixtyfour',
                    }}>
                      <span style={{ opacity: 0.6, textAlign: 'left' }}>{i + 1}.</span>
                      <span style={{ fontWeight: 'bold', letterSpacing: 2 }}>{entry.player}</span>
                      <span style={{ textAlign: 'right' }}>{String(entry.score).padStart(8, '0')}</span>
                    </div>
                  );
                  })
                })()
              )
            ) : (
              <>
                {leaderboard.length === 0 && (
                  <div style={{ color: 'blue2', textAlign: 'center', fontSize: 14 }}>
                    NO RECORDS YET
                  </div>
                )}
                {leaderboard.map((entry, i) => {
                  const isPlayer = !!entry.isNew;
                  return (
                    <div key={i} style={{
                      display: 'grid',
                      gridTemplateColumns: '80px auto auto',
                      padding: '7px 0px',
                      background: isPlayer ? 'rgba(0,255,180,0.12)' : 'transparent',
                      borderLeft: isPlayer ? '2px solid pink0' : '2px solid transparent',
                      color: isPlayer ? 'pink0' : i === 0 ? 'pink2' : 'blue1',
                      fontSize: 24,
                      fontFamily: 'Sixtyfour',
                    }}>
                      <span style={{ opacity: 0.6, textAlign: 'left' }}>{i + 1}.</span>
                      <span style={{ fontWeight: 'bold', letterSpacing: 2 }}>{entry.initials}</span>
                      <span style={{ textAlign: 'right' }}>{String(entry.score).padStart(8, '0')}</span>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'auto', paddingBottom: 24, gap: 10 }}>
            <button style={STYLES.btn} onClick={startGame}>
              PLAY
            </button>
            <button
              style={{ ...STYLES.btn, background: 'black', color: pink1, border: '1px solid blue0' }}
              onClick={() => setScreen('title')}>
              TITLE SCREEN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
