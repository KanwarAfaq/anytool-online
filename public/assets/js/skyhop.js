/* Skyhop: a one-button flyer through a world that moves from dawn to day,
   dusk and night. Fly through the gaps, grab stars for bonus points, and
   watch the pillars start to sway in the later zones. */
(function () {
  'use strict';

  var A = window.Arcade, U = A.util, sfx = A.sfx;

  var W = 420, H = 640, G = 566;           // canvas size, ground line
  var PW = 68, BR = 13, PX = 120;          // pillar width, bird radius, bird x
  var SPACING = 232;
  var BEST_KEY = 'best:skyhop';

  var C = {
    ink: '#0E0B2E', cloud: '#F4F2FF', butter: '#FFD23F', pink: '#FF6FC4',
    mint: '#52F0B8', coral: '#FF9F55', cobalt: '#2B2DDB'
  };

  // dawn, day, dusk, night
  var PAL = [
    { top: '#7C5CFF', bot: '#FFB38A', star: 0.35, name: 'Dawn' },
    { top: '#3FA9FF', bot: '#CDF3FF', star: 0,    name: 'Day' },
    { top: '#4B2BA6', bot: '#FF6FA0', star: 0.5,  name: 'Dusk' },
    { top: '#0A0723', bot: '#2B2DDB', star: 1,    name: 'Night' }
  ];

  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');
  var stage = canvas.parentElement;
  var view = A.fitCanvas(canvas, W, H);
  var overlay = A.overlay();
  var fx = A.createFx();
  var music = A.music;
  A.tools();

  var setScore = A.text('hud-score');
  var setBest = A.text('hud-best');
  var setStars = A.text('hud-stars');
  var setZone = A.text('hud-zone');

  var best = A.store.get(BEST_KEY, 0);
  var bestAtStart = best;

  // ---------- state ----------
  var state = 'title'; // title | playing | paused | dying | over
  var waiting = true;  // ready, but the first flap has not happened yet
  var clock = 0, score = 0, passed = 0, starsGot = 0, scroll = 0, skyPos = 0, shake = 0, deathT = 0;
  var py = H * 0.42, vy = 0, flapT = 0, tilt = 0, speed = 0;
  var pillars, trail, sparks, pops;

  var bgStars = [], motes = [], clouds = [];
  var i0;
  for (i0 = 0; i0 < 70; i0++) bgStars.push({ x: U.rand(0, W), y: U.rand(0, G * 0.75), s: U.rand(1, 2.6), ph: U.rand(0, 6.28) });
  for (i0 = 0; i0 < 22; i0++) motes.push({ x: U.rand(0, W), y: U.rand(G * 0.35, G), ph: U.rand(0, 6.28), v: U.rand(4, 14) });
  for (i0 = 0; i0 < 6; i0++) clouds.push({ x: U.rand(0, W), y: U.rand(60, 300), s: U.rand(0.7, 1.4), v: U.rand(8, 20) });

  function zoneIndex() { return Math.floor(skyPos) % 4; }

  function syncHud() {
    setScore(U.fmt(score));
    setBest(U.fmt(Math.max(best, score)));
    setStars(String(starsGot));
    setZone(PAL[Math.floor(passed / 8) % 4].name);
  }

  // ---------- colours ----------
  function rgb(hex) { var n = parseInt(hex.slice(1), 16); return [n >> 16, n >> 8 & 255, n & 255]; }
  function mixA(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function css(c, a) {
    return 'rgba(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ',' + (a === undefined ? 1 : a) + ')';
  }

  // ---------- pillars ----------
  var lastCenter = G / 2 - 40;

  function addPillar(x) {
    var gap = Math.max(130, 178 - passed * 1.5);
    var amp = passed >= 10 ? Math.min(42, (passed - 9) * 3) : 0;
    var lo = 62 + gap / 2 + amp, hi = G - 62 - gap / 2 - amp;
    var c = U.clamp(lastCenter + U.rand(-140, 140), lo, hi);
    lastCenter = c;
    pillars.push({
      x: x, base: c, gap: gap, amp: amp, ph: U.rand(0, 6.28), gy: c,
      scored: false, starOff: U.rand(-gap / 2 + 26, gap / 2 - 26), starTaken: false
    });
  }

  function reset() {
    py = H * 0.42; vy = 0; flapT = 0; tilt = 0;
    waiting = true; score = 0; passed = 0; starsGot = 0; skyPos = 0; shake = 0; speed = 0;
    pillars = []; trail = []; sparks = []; pops = [];
    lastCenter = G / 2 - 40;
    addPillar(W + 130);
    fx.clear();
    bestAtStart = best;
    syncHud();
  }

  // ---------- effects ----------
  function burst(x, y, color, n, spd, size, grav) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, v = U.rand(spd * 0.3, spd);
      sparks.push({
        x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        life: U.rand(0.35, 0.8), max: 0.8, size: U.rand(size * 0.6, size * 1.4), color: color, g: grav || 0
      });
    }
  }

  // ---------- actions ----------
  function flap() {
    if (state !== 'playing') return;
    if (waiting) { waiting = false; }
    vy = -440;
    flapT = 1;
    sfx.shoot();
    burst(PX - 10, py + 8, C.cloud, 5, 90, 3, 200);
  }

  function crash() {
    state = 'dying';
    deathT = 0.95;
    vy = -260;
    music.stop();
    sfx.hurt();
    fx.flash(C.cloud, 0.55);
    fx.ring(PX, py, C.coral, 130, 0.6);
    if (!U.reduceMotion) shake = 14;
    burst(PX, py, C.butter, 22, 260, 4, 380);
    burst(PX, py, C.pink, 12, 200, 3, 380);
  }

  function pass(p) {
    p.scored = true;
    passed++;
    var perfect = Math.abs(py - p.gy) < 16;
    var pts = 10 + (perfect ? 5 : 0);
    score += pts;
    if (score > best) { best = score; A.store.set(BEST_KEY, best); }
    pops.push({ x: PX + 30, y: py - 26, text: perfect ? 'Perfect +' + pts : '+' + pts, life: 0.9 });
    sfx.brick(passed);
    if (passed % 8 === 0) {
      pops.push({ x: W / 2, y: H * 0.3, text: PAL[Math.floor(passed / 8) % 4].name, life: 1.6, big: true });
      sfx.levelup();
      fx.ring(W / 2, H * 0.4, C.butter, 280, 0.9);
    }
    syncHud();
  }

  function takeStar(p) {
    p.starTaken = true;
    starsGot++;
    score += 25;
    if (score > best) { best = score; A.store.set(BEST_KEY, best); }
    var x = p.x + PW / 2, y = p.gy + p.starOff;
    pops.push({ x: x, y: y - 14, text: '+25', life: 0.9 });
    burst(x, y, C.butter, 16, 220, 3.6);
    fx.ring(x, y, C.butter, 80, 0.5);
    sfx.power();
    syncHud();
  }

  function hitsPillar(p) {
    if (PX + BR < p.x || PX - BR > p.x + PW) return false;
    var top = p.gy - p.gap / 2, bot = p.gy + p.gap / 2;
    return py - BR < top || py + BR > bot;
  }

  // ---------- flow ----------
  function startGame() {
    if (state === 'playing' || state === 'paused' || state === 'dying') return;
    sfx.unlock();
    reset();
    state = 'playing';
    overlay.hide();
    sfx.start();
    music.play('skyhop');
    updatePauseButton();
  }

  function medal() {
    if (passed >= 100) return 'Platinum medal.';
    if (passed >= 50) return 'Gold medal.';
    if (passed >= 25) return 'Silver medal.';
    if (passed >= 10) return 'Bronze medal.';
    return '';
  }

  function gameOver() {
    state = 'over';
    sfx.over();
    if (score > best) { best = score; A.store.set(BEST_KEY, best); }
    var isBest = score > 0 && score > bestAtStart;
    var text = 'You cleared ' + passed + (passed === 1 ? ' pillar' : ' pillars') + ' and scored ' + U.fmt(score) + '. ' +
      (isBest ? 'That is a new best!' : 'Your best is ' + U.fmt(best) + '.') + ' ' + medal();
    overlay.show('Game over', text.trim(), 'Play again', startGame, true);
    updatePauseButton();
  }

  function togglePause() {
    if (state === 'playing') {
      state = 'paused';
      music.pause();
      overlay.show('Paused', 'Take a breath. Your game is waiting.', 'Resume', togglePause, true);
    } else if (state === 'paused') {
      state = 'playing';
      music.resume();
      overlay.hide();
    }
    updatePauseButton();
  }

  var pauseBtn = document.getElementById('btn-pause');
  function updatePauseButton() {
    if (!pauseBtn) return;
    pauseBtn.textContent = state === 'paused' ? 'Resume' : 'Pause';
    pauseBtn.disabled = state !== 'playing' && state !== 'paused';
  }
  if (pauseBtn) pauseBtn.addEventListener('click', function () { togglePause(); pauseBtn.blur(); });

  var soundBtn = A.bindToggleButton('btn-sound',
    function () { return sfx.isMuted() ? 'Sound off' : 'Sound on'; },
    function () { return !sfx.isMuted(); },
    function () { sfx.setMuted(!sfx.isMuted()); sfx.unlock(); });

  // ---------- input ----------
  A.keyboard(function (code) {
    if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') {
      if (state === 'playing') flap();
      else if (code === 'Space' && (state === 'title' || state === 'over')) startGame();
      else if (code === 'Space' && state === 'paused') togglePause();
    } else if (code === 'Enter') {
      if (state === 'title' || state === 'over') startGame();
      else if (state === 'paused') togglePause();
    } else if (code === 'KeyP' || code === 'Escape') togglePause();
    else if (code === 'KeyM') { sfx.setMuted(!sfx.isMuted()); soundBtn.refresh(); }
  });

  stage.addEventListener('pointerdown', function (e) {
    if (e.target !== canvas) return;
    sfx.unlock();
    flap();
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && state === 'playing') togglePause();
  });

  // ---------- update ----------
  function update(dt) {
    if (state === 'paused') return;
    clock += dt;
    fx.update(dt);
    shake = Math.max(0, shake - 26 * dt);
    flapT = Math.max(0, flapT - dt * 4.5);

    for (var i = sparks.length - 1; i >= 0; i--) {
      var p = sparks[i];
      p.life -= dt;
      if (p.life <= 0) { sparks.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += p.g * dt;
      p.vx *= 0.97;
    }
    for (var j = pops.length - 1; j >= 0; j--) {
      pops[j].life -= dt;
      pops[j].y -= 24 * dt;
      if (pops[j].life <= 0) pops.splice(j, 1);
    }

    // the sky eases toward the zone that matches your progress
    var target = passed / 8;
    skyPos += (target - skyPos) * Math.min(1, dt * 0.9);

    var idle = state !== 'playing' || waiting;
    speed = idle ? 40 : 150 + Math.min(100, passed * 3.2);
    if (state !== 'dying') scroll += speed * dt;
    for (var c = 0; c < clouds.length; c++) {
      clouds[c].x -= clouds[c].v * dt;
      if (clouds[c].x < -120) { clouds[c].x = W + 120; clouds[c].y = U.rand(60, 300); }
    }
    for (var m = 0; m < motes.length; m++) {
      motes[m].ph += dt;
      motes[m].x -= motes[m].v * dt * 0.5;
      if (motes[m].x < -10) motes[m].x = W + 10;
    }

    if (state === 'title' || state === 'over' || (state === 'playing' && waiting)) {
      py = H * 0.42 + Math.sin(clock * 3) * 8;
      tilt = Math.sin(clock * 3) * 0.08;
      if (state === 'playing') updatePillarsIdle(dt);
      return;
    }

    if (state === 'dying') {
      vy = Math.min(720, vy + 1500 * dt);
      py += vy * dt;
      tilt = Math.min(1.4, tilt + dt * 5);
      if (py > G - BR) { py = G - BR; vy = 0; }
      deathT -= dt;
      if (deathT <= 0) gameOver();
      return;
    }

    // ---- playing ----
    vy = Math.min(720, vy + 1500 * dt);
    py += vy * dt;
    tilt += (U.clamp(vy / 650, -0.45, 1.0) - tilt) * Math.min(1, dt * 12);
    if (py < BR) { py = BR; if (vy < 0) vy = 0; }

    trail.push({ x: PX - 8, y: py, t: 0.5 });
    for (var t = trail.length - 1; t >= 0; t--) {
      trail[t].x -= speed * dt;
      trail[t].t -= dt;
      if (trail[t].t <= 0) trail.splice(t, 1);
    }

    for (var k = pillars.length - 1; k >= 0; k--) {
      var pl = pillars[k];
      pl.x -= speed * dt;
      pl.gy = pl.amp ? pl.base + Math.sin(clock * 1.6 + pl.ph) * pl.amp : pl.base;
      if (pl.x < -PW - 20) { pillars.splice(k, 1); continue; }

      if (!pl.scored && pl.x + PW < PX - BR) pass(pl);
      if (!pl.starTaken) {
        var sx = pl.x + PW / 2, sy = pl.gy + pl.starOff;
        if (U.hit(PX, py, BR, sx, sy, 14)) takeStar(pl);
      }
      if (hitsPillar(pl)) { crash(); return; }
    }
    if (py + BR >= G) { py = G - BR; crash(); return; }

    var last = pillars[pillars.length - 1];
    if (!last || last.x < W) addPillar((last ? last.x : W) + SPACING);
  }

  function updatePillarsIdle(dt) {
    // pillars wait off screen until the first flap
    for (var k = 0; k < pillars.length; k++) pillars[k].gy = pillars[k].base;
  }

  // ---------- drawing ----------
  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function skyColors() {
    var i = zoneIndex(), j = (i + 1) % 4;
    var f = skyPos - Math.floor(skyPos);
    var e = f * f * (3 - 2 * f);
    return {
      top: mixA(rgb(PAL[i].top), rgb(PAL[j].top), e),
      bot: mixA(rgb(PAL[i].bot), rgb(PAL[j].bot), e),
      star: PAL[i].star + (PAL[j].star - PAL[i].star) * e
    };
  }

  function ridge(offset, amp, base, color, f1) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, G);
    for (var x = 0; x <= W; x += 6) {
      var u = (x + offset) * f1;
      var y = base - amp * (0.55 + 0.3 * Math.sin(u) + 0.2 * Math.sin(u * 2.3 + 1.3) + 0.1 * Math.sin(u * 5.1));
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, G);
    ctx.closePath();
    ctx.fill();
  }

  function drawCloud(c, light) {
    var a = 0.28 + 0.5 * light;
    ctx.fillStyle = css([255, 255, 255], a);
    var s = c.s;
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, 46 * s, 14 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(c.x - 24 * s, c.y + 4 * s, 28 * s, 11 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(c.x + 26 * s, c.y + 3 * s, 30 * s, 12 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(c.x + 4 * s, c.y - 9 * s, 24 * s, 13 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawBody() {
    // sun by day, moon by night, riding one arc per full day
    var u = (skyPos / 4) % 1;
    var isSun = u < 0.75;
    var t = isSun ? u / 0.75 : (u - 0.75) / 0.25;
    var x = W * (0.08 + 0.84 * t);
    var y = 300 - Math.sin(Math.PI * t) * 210;
    if (isSun) {
      A.glow(ctx, x, y, 150, C.butter, 0.55);
      ctx.fillStyle = C.butter;
      ctx.beginPath(); ctx.arc(x, y, 26, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.beginPath(); ctx.arc(x - 8, y - 8, 9, 0, Math.PI * 2); ctx.fill();
    } else {
      A.glow(ctx, x, y, 130, '#BFD2FF', 0.45);
      ctx.fillStyle = C.cloud;
      ctx.beginPath(); ctx.arc(x, y, 22, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(143,134,255,0.45)';
      ctx.beginPath(); ctx.arc(x + 7, y - 4, 6, 0, Math.PI * 2); ctx.arc(x - 6, y + 8, 4, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawPillar(p) {
    var top = p.gy - p.gap / 2, bot = p.gy + p.gap / 2;
    var x = p.x;
    function column(y0, y1, capY) {
      ctx.fillStyle = C.ink;
      ctx.fillRect(x + 4 - 3, y0 - (y0 === 0 ? 4 : 0), PW - 8 + 6, y1 - y0 + (y0 === 0 ? 4 : 0));
      ctx.fillStyle = C.pink;
      ctx.fillRect(x + 4, y0, PW - 8, y1 - y0);
      ctx.fillStyle = 'rgba(14,11,46,0.22)';
      ctx.fillRect(x + PW - 20, y0, 16, y1 - y0);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillRect(x + 10, y0, 6, y1 - y0);
      // cap
      ctx.fillStyle = C.ink;
      rr(x - 3, capY - 3, PW + 6, 30, 9); ctx.fill();
      ctx.fillStyle = C.butter;
      rr(x, capY, PW, 24, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillRect(x + 8, capY + 4, PW - 16, 3);
    }
    column(0, top - 20, top - 24);
    column(bot + 20, G, bot - 0);
  }

  function drawStar(p) {
    var x = p.x + PW / 2, y = p.gy + p.starOff;
    A.glow(ctx, x, y, 48, C.butter, 0.6 + 0.2 * Math.sin(clock * 6));
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(clock * 1.6);
    var pts = [[15, C.ink], [12, C.butter]];
    for (var s = 0; s < 2; s++) {
      ctx.fillStyle = pts[s][1];
      ctx.beginPath();
      for (var i = 0; i < 10; i++) {
        var a = i * Math.PI / 5, r = i % 2 ? pts[s][0] * 0.45 : pts[s][0];
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function drawBird() {
    ctx.save();
    ctx.translate(PX, py);
    ctx.rotate(tilt);
    // tail
    ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.moveTo(-12, -3); ctx.lineTo(-28, -9); ctx.lineTo(-26, 3); ctx.lineTo(-12, 5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.pink;
    ctx.beginPath(); ctx.moveTo(-12, -2); ctx.lineTo(-25, -7); ctx.lineTo(-24, 2); ctx.lineTo(-12, 4); ctx.closePath(); ctx.fill();
    // body
    ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.ellipse(0, 0, 19.5, 15.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.butter;
    ctx.beginPath(); ctx.ellipse(0, 0, 17, 13, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFF0A8';
    ctx.beginPath(); ctx.ellipse(2, 5, 11, 6, 0, 0, Math.PI * 2); ctx.fill();
    // beak
    ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.moveTo(14, -3); ctx.lineTo(27, 1); ctx.lineTo(14, 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.coral;
    ctx.beginPath(); ctx.moveTo(15, -1); ctx.lineTo(24, 1.5); ctx.lineTo(15, 4); ctx.closePath(); ctx.fill();
    // eye
    ctx.fillStyle = C.cloud;
    ctx.beginPath(); ctx.arc(7, -5, 5.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.arc(8.6, -4.6, 2.5, 0, Math.PI * 2); ctx.fill();
    // wing
    ctx.save();
    ctx.translate(-3, 1);
    ctx.rotate(0.35 - flapT * 1.25);
    ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.ellipse(-4, 0, 14, 7.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.pink;
    ctx.beginPath(); ctx.ellipse(-4, 0, 12, 5.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.restore();
  }

  function render() {
    var k = view.k;
    ctx.setTransform(k, 0, 0, k, 0, 0);

    var sky = skyColors();
    var night = sky.star;
    var light = U.clamp(1 - night * 1.1, 0, 1);

    var g = ctx.createLinearGradient(0, 0, 0, G);
    g.addColorStop(0, css(sky.top));
    g.addColorStop(1, css(sky.bot));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // stars
    if (night > 0.02) {
      ctx.fillStyle = C.cloud;
      for (var s = 0; s < bgStars.length; s++) {
        var st = bgStars[s];
        ctx.globalAlpha = night * (0.45 + 0.45 * Math.sin(clock * 2 + st.ph));
        ctx.fillRect(st.x, st.y, st.s, st.s);
      }
      ctx.globalAlpha = 1;
    }

    drawBody();

    var far = mixA(sky.bot, rgb(C.ink), 0.38);
    var mid = mixA(sky.bot, rgb(C.ink), 0.58);
    ridge(scroll * 0.1, 150, G - 20, css(far), 0.011);
    for (var c = 0; c < clouds.length; c++) drawCloud(clouds[c], light);
    ridge(scroll * 0.28 + 140, 100, G - 4, css(mid), 0.017);

    // fireflies at dusk and night
    if (night > 0.05) {
      for (var m = 0; m < motes.length; m++) {
        var mo = motes[m];
        A.glow(ctx, mo.x, mo.y + Math.sin(mo.ph) * 10, 22, C.butter, night * (0.25 + 0.25 * Math.sin(mo.ph * 2)));
      }
    }

    var sx = 0, sy = 0;
    if (shake > 0) { sx = U.rand(-shake, shake); sy = U.rand(-shake, shake); }
    ctx.save();
    ctx.translate(sx, sy);

    for (var p = 0; p < pillars.length; p++) {
      drawPillar(pillars[p]);
      if (!pillars[p].starTaken) drawStar(pillars[p]);
    }

    // ground
    ctx.fillStyle = C.ink;
    ctx.fillRect(0, G - 4, W, H - G + 4);
    ctx.fillStyle = C.mint;
    ctx.fillRect(0, G, W, 10);
    ctx.fillStyle = '#2B2DDB';
    ctx.fillRect(0, G + 10, W, H - G - 10);
    ctx.save();
    ctx.beginPath(); ctx.rect(0, G + 10, W, H - G - 10); ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    var off = scroll % 48;
    for (var x = -48; x < W + 48; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x - off, H); ctx.lineTo(x - off + 22, H); ctx.lineTo(x - off + 22 + 30, G + 10); ctx.lineTo(x - off + 30, G + 10);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(0, G, W, 2);

    // light trail
    for (var t = 0; t < trail.length; t++) {
      var tr = trail[t];
      A.glow(ctx, tr.x, tr.y, 20 * (tr.t / 0.5) + 6, C.butter, tr.t * 0.55);
    }

    A.glow(ctx, PX, py, 54, C.butter, 0.33);
    if (state !== 'over' || true) drawBird();

    for (var q = 0; q < sparks.length; q++) {
      var sp = sparks[q];
      ctx.globalAlpha = Math.max(0, sp.life / sp.max);
      ctx.fillStyle = sp.color;
      ctx.fillRect(sp.x - sp.size / 2, sp.y - sp.size / 2, sp.size, sp.size);
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    fx.draw(ctx, W, H);

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (var r = 0; r < pops.length; r++) {
      var pp = pops[r];
      ctx.globalAlpha = Math.min(1, pp.life * 2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(14,11,46,0.65)';
      ctx.fillStyle = pp.big ? C.cloud : C.butter;
      ctx.font = (pp.big ? '800 40px' : '800 16px') + ' "Bricolage Grotesque", system-ui, sans-serif';
      ctx.strokeText(pp.text, pp.x, pp.y);
      ctx.fillText(pp.text, pp.x, pp.y);
    }
    ctx.globalAlpha = 1;

    if (state === 'playing' && waiting) {
      ctx.font = '700 18px "Instrument Sans", system-ui, sans-serif';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(14,11,46,0.7)';
      ctx.fillStyle = C.cloud;
      ctx.strokeText('Tap or press Space to flap', W / 2, H * 0.62);
      ctx.fillText('Tap or press Space to flap', W / 2, H * 0.62);
    }
  }

  // ---------- boot ----------
  reset();
  overlay.show(
    'Skyhop',
    'Tap, click or press Space to flap. Fly through the gaps, grab stars and see how far the day goes.',
    'Start game',
    startGame,
    false
  );
  updatePauseButton();
  A.createLoop(update, render).start();
})();
