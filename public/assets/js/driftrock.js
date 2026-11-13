/* Driftrock: a neon asteroid shooter. Thrust, turn and blast rocks that split
   into smaller pieces. Keyboard, or mouse and touch (aim at the pointer). */
(function () {
  'use strict';

  var A = window.Arcade, U = A.util, sfx = A.sfx;

  var W = 720, H = 540;
  var BEST_KEY = 'best:driftrock';
  var TAU = Math.PI * 2;

  var C = { night: '#07051C', cloud: '#F4F2FF', butter: '#FFD23F', pink: '#FF6FC4', mint: '#52F0B8', cyan: '#35D5FF', coral: '#FF9F55', lilac: '#8F86FF' };
  var SIZE = [15, 30, 52];      // radius by size 0 small, 1 medium, 2 large
  var PTS = [100, 50, 20];

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
  var setWave = A.text('hud-wave');
  var setLives = A.pips('hud-lives');

  var best = A.store.get(BEST_KEY, 0);
  var bestAtStart = best;

  var state = 'title'; // title | playing | paused | over
  var clock = 0, score = 0, lives = 3, wave = 0, nextLife = 5000, shake = 0, respawnT = 0, waveDelay = 0, fireT = 0, banner = 0, bannerText = '';
  var ship, rocks, bullets, sparks, pops, stars;
  var pointer = { on: false, x: 0, y: 0 };

  stars = [];
  for (var s0 = 0; s0 < 70; s0++) stars.push({ x: U.rand(0, W), y: U.rand(0, H), z: U.rand(0.2, 1) });

  function newShip() {
    return { x: W / 2, y: H / 2, vx: 0, vy: 0, a: -Math.PI / 2, inv: 2.5, thrust: 0 };
  }

  function makeRock(size, x, y, vx, vy) {
    var r = SIZE[size], n = 10, pts = [];
    for (var i = 0; i < n; i++) pts.push(r * U.rand(0.72, 1.12));
    var sp = U.rand(28, 62) * (1 + wave * 0.05) * (size === 0 ? 1.8 : size === 1 ? 1.3 : 1);
    var ang = U.rand(0, TAU);
    return { size: size, x: x, y: y, vx: vx !== undefined ? vx : Math.cos(ang) * sp, vy: vy !== undefined ? vy : Math.sin(ang) * sp, a: U.rand(0, TAU), va: U.rand(-1, 1), pts: pts, r: r };
  }

  function spawnWave() {
    wave++;
    var count = Math.min(11, 3 + wave);
    for (var i = 0; i < count; i++) {
      var x, y, tries = 0;
      do { x = U.rand(0, W); y = U.rand(0, H); tries++; } while (Math.hypot(x - ship.x, y - ship.y) < 170 && tries < 30);
      rocks.push(makeRock(2, x, y));
    }
    bannerText = 'Wave ' + wave; banner = 2;
    syncHud();
  }

  function syncHud() {
    setScore(U.fmt(score));
    setBest(U.fmt(Math.max(best, score)));
    setWave(String(wave));
    setLives(lives);
  }

  function reset() {
    score = 0; lives = 3; wave = 0; nextLife = 5000; shake = 0; respawnT = 0; waveDelay = 0; fireT = 0; banner = 0;
    ship = newShip(); rocks = []; bullets = []; sparks = []; pops = [];
    spawnWave();
    syncHud();
  }

  function burst(x, y, color, n, sp) {
    for (var i = 0; i < n; i++) {
      var a = U.rand(0, TAU), v = U.rand(sp * 0.3, sp);
      sparks.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: U.rand(0.35, 0.8), max: 0.8, color: color, size: U.rand(1.5, 3.2) });
    }
  }

  function addScore(n, x, y) {
    score += n;
    pops.push({ x: x, y: y, text: '+' + n, life: 0.7 });
    if (score >= nextLife) { nextLife += 5000; lives = Math.min(5, lives + 1); sfx.power(); pops.push({ x: W / 2, y: H * 0.3, text: 'Extra life', life: 1.2 }); }
    if (score > best) { best = score; A.store.set(BEST_KEY, best); }
    syncHud();
  }

  function splitRock(rk, idx) {
    rocks.splice(idx, 1);
    addScore(PTS[rk.size], rk.x, rk.y);
    sfx.boom();
    burst(rk.x, rk.y, rk.size === 0 ? C.butter : C.coral, 6 + rk.size * 6, 150 + rk.size * 50);
    fx.ring(rk.x, rk.y, C.lilac, 30 + rk.size * 28, 0.4);
    shake = Math.max(shake, 2 + rk.size * 1.5);
    if (rk.size > 0) {
      for (var i = 0; i < 2; i++) {
        var a = U.rand(0, TAU), sp = U.rand(50, 100);
        rocks.push(makeRock(rk.size - 1, rk.x, rk.y, rk.vx * 0.5 + Math.cos(a) * sp, rk.vy * 0.5 + Math.sin(a) * sp));
      }
    }
  }

  function killShip() {
    if (ship.inv > 0 || state !== 'playing' || respawnT > 0) return;
    lives--;
    burst(ship.x, ship.y, C.cloud, 26, 280);
    burst(ship.x, ship.y, C.pink, 16, 220);
    fx.ring(ship.x, ship.y, C.pink, 160, 0.7);
    fx.flash(C.pink, 0.4);
    sfx.hurt();
    shake = 12;
    ship.x = -999;
    syncHud();
    if (lives <= 0) gameOver();
    else respawnT = 1.4;
  }

  function fire() {
    if (respawnT > 0 || fireT > 0) return;
    fireT = 0.17;
    bullets.push({ x: ship.x + Math.cos(ship.a) * 16, y: ship.y + Math.sin(ship.a) * 16, vx: ship.vx + Math.cos(ship.a) * 520, vy: ship.vy + Math.sin(ship.a) * 520, life: 0.85 });
    sfx.shoot();
  }

  function startGame() {
    if (state === 'playing' || state === 'paused') return;
    sfx.unlock();
    bestAtStart = best;
    reset();
    state = 'playing';
    overlay.hide();
    sfx.start();
    music.play('driftrock');
    updatePauseButton();
  }

  function gameOver() {
    state = 'over';
    music.stop();
    sfx.over();
    if (score > best) { best = score; A.store.set(BEST_KEY, best); }
    var isBest = score > 0 && score > bestAtStart;
    window.setTimeout(function () {
      if (state !== 'over') return;
      overlay.show('Game over', 'You scored ' + U.fmt(score) + ' and reached wave ' + wave + (isBest ? '. That is a new best!' : '. Your best is ' + U.fmt(best) + '.'), 'Play again', startGame, true);
    }, 700);
    updatePauseButton();
  }

  function togglePause() {
    if (state === 'playing') {
      state = 'paused'; music.pause();
      overlay.show('Paused', 'Take a breath. Space is still out there.', 'Resume', togglePause, true);
    } else if (state === 'paused') {
      state = 'playing'; music.resume(); overlay.hide();
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

  var kb = A.keyboard(function (code) {
    if (code === 'Space' || code === 'Enter') {
      if (state === 'title' || state === 'over') startGame();
      else if (state === 'paused') togglePause();
    } else if (code === 'KeyP' || code === 'Escape') togglePause();
    else if (code === 'KeyM') { sfx.setMuted(!sfx.isMuted()); soundBtn.refresh(); }
  });

  function setPointer(e) {
    var p = view.toLogical(e.clientX, e.clientY);
    pointer.x = p.x; pointer.y = p.y;
  }
  stage.addEventListener('pointerdown', function (e) {
    if (e.target !== canvas) return;
    sfx.unlock(); pointer.on = true; setPointer(e);
  });
  stage.addEventListener('pointermove', function (e) { if (pointer.on) setPointer(e); });
  function endPointer() { pointer.on = false; }
  window.addEventListener('pointerup', endPointer);
  window.addEventListener('pointercancel', endPointer);
  document.addEventListener('visibilitychange', function () { if (document.hidden && state === 'playing') togglePause(); });

  function wrap(o, pad) {
    if (o.x < -pad) o.x += W + pad * 2; else if (o.x > W + pad) o.x -= W + pad * 2;
    if (o.y < -pad) o.y += H + pad * 2; else if (o.y > H + pad) o.y -= H + pad * 2;
  }

  function angleDiff(a, b) { var d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; }

  function update(dt) {
    if (state === 'paused') return;
    clock += dt;
    var i, j;

    for (i = 0; i < stars.length; i++) { stars[i].x -= 6 * stars[i].z * dt; if (stars[i].x < 0) stars[i].x = W; }
    for (i = sparks.length - 1; i >= 0; i--) {
      var sp = sparks[i];
      sp.life -= dt; sp.x += sp.vx * dt; sp.y += sp.vy * dt; sp.vx *= 0.98; sp.vy *= 0.98;
      if (sp.life <= 0) sparks.splice(i, 1);
    }
    for (i = pops.length - 1; i >= 0; i--) { pops[i].life -= dt; pops[i].y -= 28 * dt; if (pops[i].life <= 0) pops.splice(i, 1); }
    shake = Math.max(0, shake - dt * 18);
    banner = Math.max(0, banner - dt);
    fx.update(dt);
    if (state !== 'playing' && state !== 'over') return;

    for (i = 0; i < rocks.length; i++) { var rk = rocks[i]; rk.x += rk.vx * dt; rk.y += rk.vy * dt; rk.a += rk.va * dt; wrap(rk, rk.r); }

    if (state !== 'playing') return;

    fireT = Math.max(0, fireT - dt);
    if (respawnT > 0) {
      respawnT -= dt;
      if (respawnT <= 0) ship = newShip();
    } else {
      var turn = (kb.has('ArrowRight', 'KeyD') ? 1 : 0) - (kb.has('ArrowLeft', 'KeyA') ? 1 : 0);
      var thrusting = kb.has('ArrowUp', 'KeyW');
      var shooting = kb.has('Space');
      if (pointer.on) {
        var dx = pointer.x - ship.x, dy = pointer.y - ship.y;
        var d = angleDiff(ship.a, Math.atan2(dy, dx));
        ship.a += U.clamp(d, -5 * dt, 5 * dt);
        if (Math.hypot(dx, dy) > 130) thrusting = true;
        shooting = true;
      }
      ship.a += turn * 4.4 * dt;
      ship.thrust = thrusting ? 1 : Math.max(0, ship.thrust - dt * 6);
      if (thrusting) {
        ship.vx += Math.cos(ship.a) * 330 * dt;
        ship.vy += Math.sin(ship.a) * 330 * dt;
        if (Math.random() < 0.7) sparks.push({ x: ship.x - Math.cos(ship.a) * 12, y: ship.y - Math.sin(ship.a) * 12, vx: -Math.cos(ship.a) * 90 + U.rand(-30, 30), vy: -Math.sin(ship.a) * 90 + U.rand(-30, 30), life: 0.3, max: 0.3, color: C.coral, size: 2 });
      }
      var drag = Math.pow(0.55, dt);
      ship.vx *= drag; ship.vy *= drag;
      var spd = Math.hypot(ship.vx, ship.vy);
      if (spd > 340) { ship.vx *= 340 / spd; ship.vy *= 340 / spd; }
      ship.x += ship.vx * dt; ship.y += ship.vy * dt;
      wrap(ship, 12);
      ship.inv = Math.max(0, ship.inv - dt);
      if (shooting) fire();
    }

    for (i = bullets.length - 1; i >= 0; i--) {
      var b = bullets[i];
      b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; wrap(b, 4);
      var hitRock = false;
      for (j = rocks.length - 1; j >= 0; j--) {
        if (U.hit(b.x, b.y, 3, rocks[j].x, rocks[j].y, rocks[j].r * 0.9)) { splitRock(rocks[j], j); hitRock = true; break; }
      }
      if (hitRock || b.life <= 0) bullets.splice(i, 1);
    }

    if (respawnT <= 0) {
      for (j = 0; j < rocks.length; j++) {
        if (U.hit(ship.x, ship.y, 10, rocks[j].x, rocks[j].y, rocks[j].r * 0.85)) { killShip(); break; }
      }
    }

    if (rocks.length === 0 && state === 'playing') {
      waveDelay += dt;
      if (waveDelay > 1.4) {
        waveDelay = 0;
        addScore(100 * wave, W / 2, H * 0.4);
        sfx.levelup();
        fx.ring(W / 2, H / 2, C.butter, 300, 0.8);
        spawnWave();
      }
    }
  }

  function strokeGlow(color, width) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = A.rgba(color, 0.22);
    ctx.lineWidth = width + 5;
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();
  }

  function drawRock(rk) {
    ctx.save();
    ctx.translate(rk.x, rk.y);
    ctx.rotate(rk.a);
    ctx.beginPath();
    for (var i = 0; i < rk.pts.length; i++) {
      var a = i / rk.pts.length * TAU;
      var x = Math.cos(a) * rk.pts[i], y = Math.sin(a) * rk.pts[i];
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(143,134,255,0.08)';
    ctx.fill();
    ctx.lineJoin = 'round';
    strokeGlow(rk.size === 2 ? C.lilac : rk.size === 1 ? C.cyan : C.mint, 2);
    ctx.restore();
  }

  function drawShip() {
    if (respawnT > 0) return;
    if (ship.inv > 0 && Math.floor(clock * 14) % 2 === 0) return;
    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.a);
    A.glow(ctx, 0, 0, 40, C.butter, 0.18);
    ctx.beginPath();
    ctx.moveTo(16, 0); ctx.lineTo(-11, -10); ctx.lineTo(-6, 0); ctx.lineTo(-11, 10); ctx.closePath();
    ctx.lineJoin = 'round';
    strokeGlow(C.butter, 2.4);
    if (ship.thrust > 0.1) {
      ctx.beginPath();
      ctx.moveTo(-8, -4); ctx.lineTo(-8 - 12 * ship.thrust - U.rand(0, 5), 0); ctx.lineTo(-8, 4);
      ctx.strokeStyle = C.coral; ctx.lineWidth = 2; ctx.stroke();
    }
    ctx.restore();
  }

  function render() {
    var k = view.k;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.fillStyle = C.night;
    ctx.fillRect(0, 0, W, H);
    A.glow(ctx, W * (0.3 + 0.1 * Math.sin(clock * 0.2)), H * 0.35, 320, '#2B2DDB', 0.25);
    A.glow(ctx, W * (0.78 + 0.08 * Math.cos(clock * 0.17)), H * 0.7, 280, C.pink, 0.1);

    ctx.fillStyle = C.cloud;
    for (var i = 0; i < stars.length; i++) { ctx.globalAlpha = 0.2 + stars[i].z * 0.5; ctx.fillRect(stars[i].x, stars[i].y, 1.6, 1.6); }
    ctx.globalAlpha = 1;

    var sx = 0, sy = 0;
    if (shake > 0) { sx = U.rand(-shake, shake) * 0.4; sy = U.rand(-shake, shake) * 0.4; }
    ctx.save();
    ctx.translate(sx, sy);
    for (i = 0; i < rocks.length; i++) drawRock(rocks[i]);

    ctx.fillStyle = C.mint;
    for (i = 0; i < bullets.length; i++) {
      A.glow(ctx, bullets[i].x, bullets[i].y, 16, C.mint, 0.5);
      ctx.beginPath(); ctx.arc(bullets[i].x, bullets[i].y, 2.4, 0, TAU); ctx.fill();
    }
    drawShip();
    for (i = 0; i < sparks.length; i++) {
      var sp = sparks[i];
      ctx.globalAlpha = Math.max(0, sp.life / sp.max);
      ctx.fillStyle = sp.color;
      ctx.fillRect(sp.x - sp.size / 2, sp.y - sp.size / 2, sp.size, sp.size);
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    fx.draw(ctx, W, H);

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '800 15px "Bricolage Grotesque", system-ui, sans-serif';
    for (i = 0; i < pops.length; i++) {
      ctx.globalAlpha = Math.min(1, pops[i].life * 2);
      ctx.fillStyle = C.butter;
      ctx.fillText(pops[i].text, pops[i].x, pops[i].y);
    }
    ctx.globalAlpha = 1;
    if (banner > 0 && state === 'playing') {
      ctx.globalAlpha = Math.min(1, banner, (2 - banner) * 4 + 0.2);
      ctx.fillStyle = C.cloud;
      ctx.font = '800 38px "Bricolage Grotesque", system-ui, sans-serif';
      ctx.fillText(bannerText, W / 2, H * 0.3);
      ctx.globalAlpha = 1;
    }
  }

  reset();
  overlay.show('Driftrock', 'Turn with A and D, thrust with W and shoot with Space. Break every rock before it breaks you.', 'Start game', startGame, false);
  updatePauseButton();
  A.createLoop(update, render).start();
})();
