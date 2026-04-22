// ─── Wave scripts ─────────────────────────────────────────────────────────────
// Each entry: { at: frameOffset, type, x, pattern, vy }
// Lanes at x = 120, 180, 240, 300, 360
// full screen W = 480 (-15 => 495), H = 640 (-15 => 655)

export const WAVES = [
  [
    { at: 0, type:'dummy1', x: 180, sy: 150, pat:'straight', vy: 0 },
    { at: 0, type:'dummy1', x: 300, sy: 150, pat:'straight', vy: 0 },    
  ],



  // 5: BOSS
  [
    { at:  0, type:'boss', x:240, pat:'boss', vy:0.55 },
  ],
];
