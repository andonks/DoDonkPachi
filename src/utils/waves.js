// ─── Wave scripts ─────────────────────────────────────────────────────────────
// Each entry: { at: frameOffset, type, x, pattern, vy }
// Lanes at x = 120, 180, 240, 300, 360
// full screen W = 480 (-15 => 495), H = 640 (-15 => 655)

export const WAVES = [
  // ---------------- SPRITE SHEET v2-----------------
  [
  { at: 0, type:'heliSprite', x: 40, sy: 280, pat:'straight', vy: 0 },
  { at: 0, type:'jetSprite', x: 40, sy: 360, pat:'straight', vy: 0 },
  { at: 0, type:'mothSprite', x: 120, sy: 320, pat:'straight', vy: 0 },
  { at: 0, type:'beetleSprite', x: 230, sy: 320, pat:'straight', vy: 0 },
  { at: 0, type:'xwingSprite', x: 380, sy: 320, pat:'straight', vy: 0 },
  ],

  // 5: BOSS
  [
    { at:  0, type:'boss', x:240, pat:'boss', vy:0.55 },
  ],
];
