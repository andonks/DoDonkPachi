// ─── Wave scripts ─────────────────────────────────────────────────────────────
// Each entry: { at: frameOffset, type, x, pattern, vy }
// Lanes at x = 120, 180, 240, 300, 360
// full screen W = 480 (-15 => 495), H = 640 (-15 => 655)

export const WAVES = [
  // ---------------- Round 1: FIGHT! -----------------

  [
    //{ at:   0, type:'jet', x: 95,  sy: -15, pat:'drift_r', vy:2 },
    //{ at:  10, type:'jet', x: 45,  sy: -15, pat:'drift_r', vy:2 },
    { at:  20, type:'jet', x: -5,  sy: -15, pat:'drift_r', vy:2 },
    //{ at:  20, type:'jet', x: 195, sy: -15, pat:'drift_r', vy:2 },
    //{ at:  30, type:'jet', x: 145, sy: -15, pat:'drift_r', vy:2 },
    { at:  40, type:'jet', x:  95, sy: -15, pat:'drift_r', vy:2 },
    //{ at:  40, type:'jet', x: 295, sy: -15, pat:'drift_r', vy:2 },
    //{ at:  50, type:'jet', x: 245, sy: -15, pat:'drift_r', vy:2 },
    { at:  60, type:'jet', x: 195, sy: -15, pat:'drift_r', vy:2 },

    { at: 100, type:'jet', x: 395,  sy: -15, pat:'drift_l', vy:2 },
    //{ at: 110, type:'jet', x: 445,  sy: -15, pat:'drift_l', vy:2 },
    //{ at: 120, type:'jet', x: 495,  sy: -15, pat:'drift_l', vy:2 },
    { at: 120, type:'jet', x: 295,  sy: -15, pat:'drift_l', vy:2 },
    //{ at: 130, type:'jet', x: 345,  sy: -15, pat:'drift_l', vy:2 },
    //{ at: 140, type:'jet', x: 395,  sy: -15, pat:'drift_l', vy:2 },
    { at: 140, type:'jet', x: 195,  sy: -15, pat:'drift_l', vy:2 },
    //{ at: 150, type:'jet', x: 245,  sy: -15, pat:'drift_l', vy:2 },
    //{ at: 160, type:'jet', x: 295,  sy: -15, pat:'drift_l', vy:2 },

    { at: 210, type:'moth', x: 120, sy: -15, pat: 'straight', vy:1.2 },

    { at: 350, type:'heli', x: 300, sy: -15, pat:'hover_mid', vy:3 },
    { at: 375, type:'heli', x: 250, sy: -15, pat:'hover_high', vy:3 },
    { at: 385, type:'heli', x: 350, sy: -15, pat:'hover_high', vy:3 },

    { at: 500, type:'beetle', x: 180, sy: -15, pat:'straight', vy:0.75 },

    { at: 650, type:'jet', x: 395,  sy: -15, pat:'drift_l', vy:2 },
    { at: 670, type:'jet', x: 445,  sy: -15, pat:'drift_l', vy:2 },
    { at: 690, type:'jet', x: 495,  sy: -15, pat:'drift_l', vy:2 },

    { at: 710, type:'jet', x: 95,  sy: -15, pat:'drift_r', vy:2 },
    { at: 730, type:'jet', x: 45,  sy: -15, pat:'drift_r', vy:2 },
    { at: 750, type:'jet', x: -5,  sy: -15, pat:'drift_r', vy:2 },
  ],

  [
    { at: 0, type:'moth', x: 90, sy: -15, pat: 'straight', vy:1.6 },
    { at: 30, type:'moth', x: 190, sy: -15, pat: 'straight', vy:1.6 },
    { at: 60, type:'moth', x: 290, sy: -15, pat: 'straight', vy:1.6 },
    { at: 90, type:'moth', x: 390, sy: -15, pat: 'straight', vy:1.6 },

    { at: 180, type:'beetle', x: 240, sy: -15, pat: 'straight', vy:1 },
    { at: 230, type:'heli', x: 140, sy: -15, pat:'hover_high', vy:2 },
    { at: 280, type:'heli', x: 340, sy: -15, pat:'hover_high', vy:2 },

    //{ at: 450, type:'beetle', x: 360, sy: -15, pat: 'straight', vy:0.75 },
    //{ at: 550, type:'beetle', x: 120, sy: -15, pat: 'straight', vy:0.75 },

    { at: 500, type:'jet', x: 395,  sy: -15, pat:'drift_l', vy:3 },
    { at: 510, type:'jet', x: 445,  sy: -15, pat:'drift_l', vy:3 },
    { at: 520, type:'jet', x: 495,  sy: -15, pat:'drift_l', vy:3 },
    { at: 520, type:'jet', x: 295,  sy: -15, pat:'drift_l', vy:3 },
    { at: 530, type:'jet', x: 345,  sy: -15, pat:'drift_l', vy:3 },
    { at: 540, type:'jet', x: 395,  sy: -15, pat:'drift_l', vy:3 },
    { at: 540, type:'jet', x: 195,  sy: -15, pat:'drift_l', vy:3 },
    { at: 550, type:'jet', x: 245,  sy: -15, pat:'drift_l', vy:3 },
    { at: 560, type:'jet', x: 295,  sy: -15, pat:'drift_l', vy:3 },

    { at: 570, type:'heli', x: 360, sy: -15, pat:'hover_high', vy:3 },
    { at: 590, type:'heli', x: 330, sy: -15, pat:'hover_mid', vy:3 },
    { at: 610, type:'heli', x: 300, sy: -15, pat:'hover_high', vy:3 },
    { at: 690, type:'heli', x: 180, sy: -15, pat:'hover_mid', vy:3 },
    { at: 710, type:'heli', x: 150, sy: -15, pat:'hover_high', vy:3 },
    { at: 730, type:'heli', x: 120, sy: -15, pat:'hover_mid', vy:3 },

    { at: 750, type:'xwing', x: 360, sy: -15, pat:'straight', vy: 0.75 },
  // perhaps a few jets here
    { at: 1000, type:'heli', x: 270, sy: -15, pat:'hover_mid', vy:3 },
    { at: 1020, type:'heli', x: 240, sy: -15, pat:'hover_high', vy:3 },
    { at: 1040, type:'heli', x: 210, sy: -15, pat:'hover_mid', vy:3 },
  ],

[
    { at:  0, type:'tank',   x: 60, sy: -15, pat:'diag_r', vy:1 },
    { at:  0, type:'turret',  x: 60, sy: -15, pat:'diag_r', vy:1 },
    { at:  30, type:'tank',   x: 130, sy: -15, pat:'diag_r', vy:1 },
    { at:  30, type:'turret',  x: 130, sy: -15, pat:'diag_r', vy:1 },
    { at:  50, type:'tank',   x: 285, sy: -15, pat:'diag_r', vy:1 },
    { at:  50, type:'turret',  x: 285, sy: -15, pat:'diag_r', vy:1 },
    { at:  57, type:'tank',   x: 465, sy: -15, pat:'diag_r', vy:1 },
    { at:  57, type:'turret',  x: 465, sy: -15, pat:'diag_r', vy:1 },
    { at:  63, type:'tank',   x: 205, sy: -15, pat:'diag_r', vy:1 },
    { at:  63, type:'turret',  x: 205, sy: -15, pat:'diag_r', vy:1 },
    { at:  74, type:'tank',   x: 60, sy: -15, pat:'diag_r', vy:1 },
    { at:  74, type:'turret',  x: 60, sy: -15, pat:'diag_r', vy:1 },
    { at:  75, type:'tank',   x: 370, sy: -15, pat:'diag_r', vy:1 },
    { at:  75, type:'turret',  x: 370, sy: -15, pat:'diag_r', vy:1 },
    { at:  87, type:'tank',   x: 130, sy: -15, pat:'diag_r', vy:1 },
    { at:  87, type:'turret',  x: 130, sy: -15, pat:'diag_r', vy:1 },
    { at:  99, type:'tank',   x: 300, sy: -15, pat:'diag_r', vy:1 },
    { at:  99, type:'turret',  x: 300, sy: -15, pat:'diag_r', vy:1 },
    { at:  117, type:'tank',   x: 220, sy: -15, pat:'diag_r', vy:1 },
    { at:  117, type:'turret',  x: 220, sy: -15, pat:'diag_r', vy:1 },
    { at:  122, type:'tank',   x: 435, sy: -15, pat:'diag_r', vy:1 },
    { at:  122, type:'turret',  x: 435, sy: -15, pat:'diag_r', vy:1 },
    { at:  180, type:'tank',   x: 495, sy: 100, pat:'diag_r', vy:1 },
    { at:  180, type:'turret',  x: 495, sy: 100, pat:'diag_r', vy:1 },
    { at:  250, type:'tank',   x: 495, sy: 120, pat:'diag_r', vy:1 },
    { at:  250, type:'turret',  x: 495, sy: 120, pat:'diag_r', vy:1 },

    //{ at:  300, type:'jet', x: 95,  sy: -15, pat:'curve_r', vy:2 },
    //{ at:  310, type:'jet', x: 45,  sy: -15, pat:'curve_r', vy:2 },
    //{ at:  320, type:'jet', x: -5,  sy: -15, pat:'curve_r', vy:2 },
    //{ at:  320, type:'jet', x: 195, sy: -15, pat:'curve_r', vy:2 },
    //{ at:  330, type:'jet', x: 145, sy: -15, pat:'curve_r', vy:2 },
    //{ at:  340, type:'jet', x:  95, sy: -15, pat:'curve_r', vy:2 },
    //{ at:  340, type:'jet', x: 295, sy: -15, pat:'curve_r', vy:2 },
    //{ at:  350, type:'jet', x: 245, sy: -15, pat:'curve_r', vy:2 },
    //{ at:  360, type:'jet', x: 195, sy: -15, pat:'curve_r', vy:2 },

    //{ at: 380, type:'beetle', x: 240, sy: -15, pat: 'straight', vy:1 },
    { at: 420, type:'beetle', x: 180, sy: -15, pat: 'straight', vy:1 },
    { at: 500, type:'beetle', x: 300, sy: -15, pat: 'straight', vy:1 },

    //{ at: 600, type:'jet', x: 395,  sy: -15, pat:'curve_l', vy:2 },
    //{ at: 610, type:'jet', x: 445,  sy: -15, pat:'curve_l', vy:2 },
    //{ at: 620, type:'jet', x: 495,  sy: -15, pat:'curve_l', vy:2 },
    //{ at: 620, type:'jet', x: 295,  sy: -15, pat:'curve_l', vy:2 },
    //{ at: 630, type:'jet', x: 345,  sy: -15, pat:'curve_l', vy:2 },
    //{ at: 650, type:'jet', x: 395,  sy: -15, pat:'curve_l', vy:2 },
    //{ at: 640, type:'jet', x: 195,  sy: -15, pat:'curve_l', vy:2 },
    //{ at: 650, type:'jet', x: 245,  sy: -15, pat:'curve_l', vy:2 },
    //{ at: 660, type:'jet', x: 295,  sy: -15, pat:'curve_l', vy:2 },

    { at:  600, type:'jet', x: 95,  sy: -15, pat:'drift_r', vy:2 },
    { at:  610, type:'jet', x: 45,  sy: -15, pat:'drift_r', vy:2 },
    { at:  620, type:'jet', x: -5,  sy: -15, pat:'drift_r', vy:2 },
    { at:  620, type:'jet', x: 195, sy: -15, pat:'drift_r', vy:2 },
    { at:  630, type:'jet', x: 145, sy: -15, pat:'drift_r', vy:2 },
    { at:  640, type:'jet', x:  95, sy: -15, pat:'drift_r', vy:2 },
    { at:  640, type:'jet', x: 295, sy: -15, pat:'drift_r', vy:2 },
    { at:  650, type:'jet', x: 245, sy: -15, pat:'drift_r', vy:2 },
    { at:  660, type:'jet', x: 195, sy: -15, pat:'drift_r', vy:2 },

    { at: 775, type:'xwing', x: 240, sy: -15, pat:'straight', vy: 0.75 },

    { at: 1000, type:'moth', x: 120, sy: -15, pat: 'straight', vy:1.2 },
    { at: 1000, type:'moth', x: 360, sy: -15, pat: 'straight', vy:1.2 },
  ],

  // 5: BOSS
  [
    { at:  0, type:'boss', x:240, pat:'boss', vy:0.55 },
    //{ at:  100, type:'jet', x:360, sy: -15, pat:'straight', vy:0.55 },
    //{ at:  150, type:'jet', x:120, sy: -15, pat:'straight', vy:0.55 },
  ],
];
