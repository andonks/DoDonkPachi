// ─── Wave scripts ─────────────────────────────────────────────────────────────
// Each entry: { at: frameOffset, type, x, pattern, vy }
// Lanes at x = 120, 180, 240, 300, 360
// full screen W = 480 (-15 => 495), H = 640 (-15 => 655)

export const WAVES = [
  // ---------------- SPRITE SHEET v2-----------------
  [


    { at: 410, type:'jet', x: -15, sy:  15, pat:'side_l', vy:3.2 },
    { at: 410, type:'jet', x: -15, sy:  75, pat:'side_l', vy:3.2 },
    { at: 435, type:'jet', x: -15, sy:  75, pat:'side_l', vy:3.2 },
    { at: 435, type:'jet', x: -15, sy: 135, pat:'side_l', vy:3.2 },
  ],
  // 5: BOSS
  [
    { at:  0, type:'boss', x:240, pat:'boss', vy:0.55 },
  ],
];
