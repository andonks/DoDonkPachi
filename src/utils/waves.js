// ─── Wave scripts ─────────────────────────────────────────────────────────────
// Each entry: { at: frameOffset, type, x, pattern, vy }
// Lanes at x = 120, 180, 240, 300, 360
// full screen W = 480 (-15 => 495), H = 640 (-15 => 655)

export const WAVES = [


  [
    { at: 0, type:'moth', x: 90, sy: -15, pat: 'straight', vy:1.6 },
    { at: 30, type:'moth', x: 190, sy: -15, pat: 'straight', vy:1.6 },
    { at: 60, type:'moth', x: 290, sy: -15, pat: 'straight', vy:1.6 },
    { at: 90, type:'moth', x: 390, sy: -15, pat: 'straight', vy:1.6 },

    //{ at: 230, type:'heli', x: 140, sy: -15, pat:'hover_high', vy:2 },
    { at: 180, type:'beetle', x: 240, sy: -15, pat: 'straight', vy:1 },
    //{ at: 280, type:'heli', x: 340, sy: -15, pat:'hover_high', vy:2 },

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
    { at: 630, type:'heli', x: 270, sy: -15, pat:'hover_mid', vy:3 },
    { at: 650, type:'heli', x: 240, sy: -15, pat:'hover_mid', vy:3 },
    { at: 670, type:'heli', x: 210, sy: -15, pat:'hover_high', vy:3 },
    { at: 690, type:'heli', x: 180, sy: -15, pat:'hover_mid', vy:3 },
    { at: 710, type:'heli', x: 150, sy: -15, pat:'hover_high', vy:3 },
    { at: 730, type:'heli', x: 120, sy: -15, pat:'hover_mid', vy:3 },


    { at: 750, type:'xwing', x: 360, sy: -15, pat:'straight', vy: 0.75 },
  ],

  [
    { at:  300, type:'jet', x: 95,  sy: -15, pat:'drift_r', vy:2 },
    { at:  310, type:'jet', x: 45,  sy: -15, pat:'drift_r', vy:2 },
    { at:  320, type:'jet', x: -5,  sy: -15, pat:'drift_r', vy:2 },
    { at:  320, type:'jet', x: 195, sy: -15, pat:'drift_r', vy:2 },
    { at:  330, type:'jet', x: 145, sy: -15, pat:'drift_r', vy:2 },
    { at:  340, type:'jet', x:  95, sy: -15, pat:'drift_r', vy:2 },
    { at:  340, type:'jet', x: 295, sy: -15, pat:'drift_r', vy:2 },
    { at:  350, type:'jet', x: 245, sy: -15, pat:'drift_r', vy:2 },
    { at:  360, type:'jet', x: 195, sy: -15, pat:'drift_r', vy:2 },



  ],

  // 5: BOSS
  [
    { at:  0, type:'boss', x:240, pat:'boss', vy:0.55 },
  ],
];
