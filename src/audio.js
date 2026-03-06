// Synthesized audio engine — Web Audio API, no external files needed

let ac = null;
let master = null;
let sfxOut = null;
let musicOut = null;
let musicRunning = false;
let schedulerTimer = null;
let nextNoteTime = 0;
let currentStep = 0;

export function initAudio() {
  if (ac) { ac.resume(); return; }
  ac = new (window.AudioContext || window.webkitAudioContext)();

  master = ac.createGain();
  master.gain.value = 0.75;
  master.connect(ac.destination);

  sfxOut = ac.createGain();
  sfxOut.gain.value = 0.55;
  sfxOut.connect(master);

  musicOut = ac.createGain();
  musicOut.gain.value = 0.38;
  musicOut.connect(master);
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function hz(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function synth(type, freq, gainVal, dur, dest, t = ac.currentTime) {
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.connect(g); g.connect(dest);
  o.type = type;
  if (typeof freq === 'function') freq(o.frequency);
  else o.frequency.value = freq;
  g.gain.setValueAtTime(gainVal, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.start(t); o.stop(t + dur + 0.02);
}

function noise(gainVal, dur, hpHz, lpHz, dest, t = ac.currentTime) {
  const len = Math.ceil(ac.sampleRate * (dur + 0.1));
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

  const src = ac.createBufferSource();
  src.buffer = buf;

  const g = ac.createGain();
  g.gain.setValueAtTime(gainVal, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  g.connect(dest);

  let tail = src;
  if (hpHz) { const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hpHz; tail.connect(f); tail = f; }
  if (lpHz) { const f = ac.createBiquadFilter(); f.type = 'lowpass';  f.frequency.value = lpHz; tail.connect(f); tail = f; }
  tail.connect(g);

  src.start(t); src.stop(t + dur + 0.1);
}

// ─── SFX ──────────────────────────────────────────────────────────────────────

export function sfxShoot() {
  if (!ac) return;
  synth('square',   880, 0.16, 0.06, sfxOut);
  synth('square',   660, 0.07, 0.05, sfxOut);
}

export function sfxFocusShoot() {
  if (!ac) return;
  synth('sawtooth', 1320, 0.12, 0.055, sfxOut);
}

export function sfxEnemyDie() {
  if (!ac) return;
  const t = ac.currentTime;
  noise(0.45, 0.18, 1200, null, sfxOut, t);
  synth('sawtooth', f => {
    f.setValueAtTime(380, t);
    f.exponentialRampToValueAtTime(80, t + 0.2);
  }, 0.22, 0.22, sfxOut, t);
}

export function sfxBigExplosion() {
  if (!ac) return;
  const t = ac.currentTime;
  noise(0.85, 0.9, 60, 5000, sfxOut, t);
  synth('sine',     80,  0.5, 0.7, sfxOut, t);
  synth('sawtooth', 110, 0.3, 0.5, sfxOut, t);
  synth('sine', f => {
    f.setValueAtTime(55, t);
    f.exponentialRampToValueAtTime(28, t + 0.9);
  }, 0.45, 1.0, sfxOut, t);
}

export function sfxPlayerHit() {
  if (!ac) return;
  const t = ac.currentTime;
  noise(0.6, 0.35, 250, 3500, sfxOut, t);
  synth('sawtooth', f => {
    f.setValueAtTime(200, t);
    f.exponentialRampToValueAtTime(70, t + 0.35);
  }, 0.5, 0.38, sfxOut, t);
}

export function sfxBomb() {
  if (!ac) return;
  const t = ac.currentTime;
  noise(1.0, 1.0, 40, 8000, sfxOut, t);
  synth('sine', 50, 0.55, 1.1, sfxOut, t);
  synth('sawtooth', f => {
    f.setValueAtTime(55, t);
    f.exponentialRampToValueAtTime(2800, t + 0.55);
  }, 0.55, 0.7, sfxOut, t);
}

export function sfxWaveClear() {
  if (!ac) return;
  const t = ac.currentTime;
  [69, 72, 76, 81].forEach((m, i) => synth('triangle', hz(m), 0.28, 0.5, sfxOut, t + i * 0.13));
}

export function sfxBossWarning() {
  if (!ac) return;
  const t = ac.currentTime;
  synth('sawtooth', 220, 0.4, 0.35, sfxOut, t);
  synth('sawtooth', 220, 0.4, 0.35, sfxOut, t + 0.45);
  synth('sawtooth', 440, 0.5, 0.6,  sfxOut, t + 0.9);
}

// ─── Music sequencer (chiptune tracker style) ─────────────────────────────────
// A minor, 168 BPM, 16th-note steps, 64-step loop (2 bars × 32 steps each)

const BPM        = 168;
const STEP_DUR   = 60 / BPM / 4;   // duration of a 16th note
const LOOK_AHEAD = 0.15;            // schedule this many seconds ahead
const TICK_MS    = 30;              // scheduler poll interval

// Bass — 32 steps, loops twice per 64-step cycle (A2=45 E2=40 D2=38 G2=43)
const BASS = [
  45,null,null,null, 45,null,null,null,
  40,null,null,null, 40,null,null,null,
  38,null,null,null, 38,null,null,null,
  43,null,null,null, 45,null,null,null,
];

// Lead melody — 64 steps, does NOT loop mid-cycle
const LEAD = [
  69,null,72,null, 76,null,72,null,   // bar 1
  69,null,67,null, 64,null,67,null,
  69,null,72,null, 76,null,79,null,
  76,null,72,null, 69,null,65,null,

  67,null,71,null, 74,null,71,null,   // bar 2
  67,null,65,null, 62,null,65,null,
  64,null,67,null, 71,null,74,null,
  72,null,69,null, 67,null,64,null,
];

// High arpeggio — 64 steps
const ARP = [
  81,null,null,null, 84,null,null,null,
  81,null,null,null, 79,null,null,null,
  76,null,null,null, 79,null,null,null,
  81,null,null,null, 76,null,null,null,

  79,null,null,null, 83,null,null,null,
  79,null,null,null, 76,null,null,null,
  74,null,null,null, 76,null,null,null,
  79,null,null,null, 74,null,null,null,
];

const KICKS  = new Set([0, 8, 16, 24]);
const SNARES = new Set([8, 24]);
const HIHATS = new Set([0, 4, 8, 12, 16, 20, 24, 28]);
const LOOP   = 64;

function scheduleStep(step, t) {
  const s32 = step % 32;
  const s64 = step % LOOP;

  // Bass (low-pass filtered square)
  const bn = BASS[s32];
  if (bn !== null) {
    const o = ac.createOscillator();
    const lp = ac.createBiquadFilter();
    const g  = ac.createGain();
    lp.type = 'lowpass'; lp.frequency.value = 700;
    o.connect(lp); lp.connect(g); g.connect(musicOut);
    o.type = 'square'; o.frequency.value = hz(bn);
    g.gain.setValueAtTime(0.38, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + STEP_DUR * 3.6);
    o.start(t); o.stop(t + STEP_DUR * 4);
  }

  // Lead (sawtooth)
  const ln = LEAD[s64];
  if (ln !== null) {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.connect(g); g.connect(musicOut);
    o.type = 'sawtooth'; o.frequency.value = hz(ln);
    g.gain.setValueAtTime(0.14, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + STEP_DUR * 1.8);
    o.start(t); o.stop(t + STEP_DUR * 2);
  }

  // Arp (triangle)
  const an = ARP[s64];
  if (an !== null) {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.connect(g); g.connect(musicOut);
    o.type = 'triangle'; o.frequency.value = hz(an);
    g.gain.setValueAtTime(0.1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + STEP_DUR * 0.85);
    o.start(t); o.stop(t + STEP_DUR * 1.1);
  }

  // Kick (pitched sine with pitch drop)
  if (KICKS.has(s32)) {
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.connect(g); g.connect(musicOut);
    o.type = 'sine';
    o.frequency.setValueAtTime(180, t);
    o.frequency.exponentialRampToValueAtTime(38, t + 0.13);
    g.gain.setValueAtTime(0.55, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    o.start(t); o.stop(t + 0.2);
  }

  // Snare (noise + tone)
  if (SNARES.has(s32)) {
    noise(0.22, 0.1, 2000, null, musicOut, t);
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.connect(g); g.connect(musicOut);
    o.type = 'sine'; o.frequency.value = 190;
    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    o.start(t); o.stop(t + 0.12);
  }

  // Hi-hat (short noise burst)
  if (HIHATS.has(s32)) {
    noise(0.07, 0.07, 9000, null, musicOut, t);
  }
}

function tick() {
  if (!ac || !musicRunning) return;
  while (nextNoteTime < ac.currentTime + LOOK_AHEAD) {
    scheduleStep(currentStep, nextNoteTime);
    nextNoteTime += STEP_DUR;
    currentStep++;
  }
}

export function startMusic() {
  if (!ac || musicRunning) return;
  musicRunning = true;
  nextNoteTime = ac.currentTime + 0.05;
  currentStep  = 0;
  schedulerTimer = setInterval(tick, TICK_MS);
}

export function stopMusic() {
  musicRunning = false;
  clearInterval(schedulerTimer);
  schedulerTimer = null;
}
