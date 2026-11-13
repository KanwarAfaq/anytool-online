/* Brick Rally: a breakout game.
   Five hand-built levels (then they repeat, tougher), power-ups, streak multiplier. */
(function () {
  'use strict';

  var A = window.Arcade, U = A.util, sfx = A.sfx;

  var W = 640, H = 720;
  var BEST_KEY = 'best:brick-rally';

  var C = {
    bg: '#1B1C9E', grid: 'rgba(244,242,255,0.07)', ink: '#0E0B2E', cloud: '#F4F2FF',
    butter: '#FFD23F', pink: '#FF6FC4', mint: '#52F0B8', metal: '#9A95D6'
  };

  // Level patterns: digits are brick strength, x is a metal brick that never breaks.
  var LEVELS = [
    ['1111111111',
     '1111111111',
     '2222222222',
     '1111111111'],
    ['....11....',
     '...2222...',
     '..222222..',
     '.33333333.',
     '..222222..',
     '...1111...'],
    ['2121212121',
     '1212121212',
     'x.x.x.x.x.',
     '2121212121',
     '1212121212'],
    ['3333333333',
     '2.2.2.2.2.',
     '.1.1.1.1.1',
     '2.2.2.2.2.',
     '3333333333'],
    ['3333333333',
     '3........3',
     '3.222222.3',
     '3.2.11.2.3',
     '3.222222.3',
     '3........3',
     'x33333333x']
  ];

  var COLS = 10, BW = 56, BH = 22, GAP = 4;
  var OX = (W - (COLS * BW + (COLS - 1) * GAP)) / 2;
  var OY = 76;

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
  var setLevel = A.text('hud-level');
  var setMult = A.text('hud-mult');
  var setLives = A.pips('hud-lives', 'pip--ball');

  var best = A.store.get(BEST_KEY, 0);
  var bestAtStart = best;

  // ---------- state ----------
  var state = 'title'; // title | playing | paused | clear | over
  var clock = 0;
  var score = 0, lives = 3, level = 1, streak = 0, remaining = 0;
  var paddle, balls, bricks, drops, sparks, pops;
  var wideTime = 0, slowTime = 0, shake = 0, clearTimer = 0, bannerTime = 0, bannerText = '';
  var targetX = W / 2;

  function multiplier() { return Math.min(4, 1 + Math.floor(streak / 4)); }
  function baseSpeed() { return Math.min(620, 380 + (level - 1) * 24); }

  function syncHud() {
    setScore(U.fmt(score));
    setBest(U.fmt(Math.max(best, score)));
    setLevel(String(level));
    setMult('x' + multiplier());
    setLives(Math.max(0, lives));
  }

  function newBall() {
    return { x: paddle.x, y: paddle.y - 20, dx: 0, dy: -1, r: 8, speed: baseSpeed(), stuck: true, trail: [] };
  }

  function loadLevel(n) {
    var pattern = LEVELS[(n - 1) % LEVELS.length];
    var extra = Math.floor((n - 1) / LEVELS.length);
    bricks = [];
    remaining = 0;
    for (var r = 0; r < pattern.length; r++) {
      for (var c = 0; c < COLS; c++) {
        var ch = pattern[r].charAt(c);
        if (ch === '.' || ch === '') continue;
        var metal = ch === 'x';
        var hp = metal ? 99 : Math.min(3, parseInt(ch, 10) + (parseInt(ch, 10) < 3 ? extra : 0));
        bricks.push({
          x: OX + c * (BW + GAP), y: OY + r * (BH + GAP), w: BW, h: BH,
          hp: hp, max: hp, metal: metal, dead: false, flash: 0
        });
        if (!metal) remaining++;
      }
    }
  }

  function reset() {
    score = 0; lives = 3; level = 1; streak = 0;
    paddle = { x: W / 2, y: H - 52, w: 110, h: 16, squash: 0 };
    targetX = W / 2;
    drops = []; sparks = []; pops = [];
    wideTime = 0; slowTime = 0; shake = 0; clearTimer = 0;
    bestAtStart = best;
    loadLevel(level);
    balls = [newBall()];
    bannerText = 'Level 1';
    bannerTime = 1.8;
    syncHud();
  }
  reset();

  // ---------- effects ----------
  function burst(x, y, color, n, speed, size) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2;
      var v = U.rand(speed * 0.3, speed);
      sparks.push({
        x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40,
        life: U.rand(0.35, 0.8), max: 0.8, size: U.rand(size * 0.6, size * 1.4), color: color
      });
    }
  }

  function addShake(a) { if (!U.reduceMotion) shake = Math.max(shake, a); }

  function brickColor(b) {
    if (b.metal) return C.metal;
    return b.hp >= 3 ? C.pink : b.hp === 2 ? C.butter : C.mint;
  }

  // ---------- gameplay ----------
  function addScore(points) {
    score += points;
    if (score > best) {
      best = score;
      A.store.set(BEST_KEY, best);
    }
  }

  function maybeDrop(b) {
    if (Math.random() > 0.17) return;
    var roll = Math.random();
    var type = roll < 0.34 ? 'wide' : roll < 0.68 ? 'multi' : roll < 0.94 ? 'slow' : 'life';
    if (type === 'life' && lives >= 5) type = 'wide';
    drops.push({ x: b.x + b.w / 2, y: b.y + b.h / 2, type: type });
  }

  function collect(d) {
    sfx.power();
    var label = '';
    if (d.type === 'wide') { wideTime = 12; label = 'Wide paddle'; }
    else if (d.type === 'slow') { slowTime = 8; label = 'Slow ball'; }
    else if (d.type === 'life') { lives = Math.min(5, lives + 1); label = 'Extra life'; }
    else {
      label = 'Multi-ball';
      var src = null;
      for (var i = 0; i < balls.length; i++) if (!balls[i].stuck) { src = balls[i]; break; }
      if (src && balls.length < 6) {
        for (var s = -1; s <= 1; s += 2) {
          var ang = Math.atan2(src.dx, -src.dy) + s * 0.4;
          balls.push({
            x: src.x, y: src.y, dx: Math.sin(ang), dy: -Math.cos(ang),
            r: 8, speed: src.speed, stuck: false, trail: []
          });
        }
      } else {
        addScore(100);
      }
    }
    pops.push({ x: d.x, y: d.y - 12, text: label, life: 1.1 });
    syncHud();
  }

  function launch() {
    for (var i = 0; i < balls.length; i++) {
      var b = balls[i];
      if (b.stuck) {
        var a = U.rand(-0.35, 0.35);
        b.dx = Math.sin(a); b.dy = -Math.cos(a);
        b.stuck = false;
        sfx.paddle();
      }
    }
  }

  function keepAngle(b) {
    if (Math.abs(b.dy) < 0.22) {
      b.dy = (b.dy < 0 ? -1 : 1) * 0.22;
      var rest = Math.sqrt(1 - b.dy * b.dy);
      b.dx = (b.dx < 0 ? -1 : 1) * rest;
    }
  }

  function hitBrick(b, br) {
    if (br.metal) {
      sfx.metal();
      burst(b.x, b.y, C.cloud, 3, 120, 2);
      return;
    }
    br.hp--;
    br.flash = 0.12;
    if (br.hp <= 0) {
      br.dead = true;
      remaining--;
      streak++;
      var pts = 10 * br.max * multiplier();
      addScore(pts);
      pops.push({ x: br.x + br.w / 2, y: br.y, text: '+' + pts, life: 0.7 });
      burst(br.x + br.w / 2, br.y + br.h / 2, brickColor({ hp: br.max, metal: false }), 10, 220, 3.4);
      sfx.brick(streak);
      fx.ring(br.x + br.w / 2, br.y + br.h / 2, brickColor({ hp: br.max, metal: false }), 46, 0.35);
      maybeDrop(br);
      if (remaining <= 0) levelClear();
    } else {
      addScore(5);
      sfx.hit();
      burst(b.x, b.y, C.cloud, 3, 120, 2);
    }
    syncHud();
  }

  function collideBricks(b) {
    var hitB = null, bestD = Infinity, nx = 0, ny = 0;
    for (var i = 0; i < bricks.length; i++) {
      var br = bricks[i];
      if (br.dead) continue;
      var cx = U.clamp(b.x, br.x, br.x + br.w);
      var cy = U.clamp(b.y, br.y, br.y + br.h);
      var dx = b.x - cx, dy = b.y - cy;
      var d2 = dx * dx + dy * dy;
      if (d2 <= b.r * b.r && d2 < bestD) { bestD = d2; hitB = br; nx = dx; ny = dy; }
    }
    if (!hitB) return;

    var dist = Math.sqrt(bestD);
    if (dist > 0.0001) {
      var push = b.r - dist + 0.05;
      b.x += nx / dist * push;
      b.y += ny / dist * push;
      if (Math.abs(nx) > Math.abs(ny)) b.dx = Math.abs(b.dx) * (nx > 0 ? 1 : -1);
      else b.dy = Math.abs(b.dy) * (ny > 0 ? 1 : -1);
    } else {
      var ox = b.x - (hitB.x + hitB.w / 2), oy = b.y - (hitB.y + hitB.h / 2);
      if (Math.abs(ox) / hitB.w > Math.abs(oy) / hitB.h) { b.dx = Math.abs(b.dx) * (ox > 0 ? 1 : -1); b.x += (ox > 0 ? 3 : -3); }
      else { b.dy = Math.abs(b.dy) * (oy > 0 ? 1 : -1); b.y += (oy > 0 ? 3 : -3); }
    }
    keepAngle(b);
    hitBrick(b, hitB);
  }

  function stepBall(b, dt) {
    if (b.stuck) {
      b.x = paddle.x;
      b.y = paddle.y - paddle.h / 2 - b.r - 1;
      return;
    }
    var speed = b.speed * (slowTime > 0 ? 0.72 : 1);
    var dist = speed * dt;
    var n = Math.max(1, Math.ceil(dist / 4));
    var step = dist / n;

    for (var i = 0; i < n; i++) {
      b.x += b.dx * step;
      b.y += b.dy * step;

      if (b.x < b.r) { b.x = b.r; b.dx = Math.abs(b.dx); sfx.wall(); }
      else if (b.x > W - b.r) { b.x = W - b.r; b.dx = -Math.abs(b.dx); sfx.wall(); }
      if (b.y < b.r) { b.y = b.r; b.dy = Math.abs(b.dy); sfx.wall(); }

      var top = paddle.y - paddle.h / 2;
      if (b.dy > 0 && b.y + b.r >= top && b.y - b.r <= paddle.y + paddle.h / 2 &&
          b.x >= paddle.x - paddle.w / 2 - b.r * 0.6 && b.x <= paddle.x + paddle.w / 2 + b.r * 0.6) {
        var off = U.clamp((b.x - paddle.x) / (paddle.w / 2), -1, 1);
        var ang = off * 1.05;
        b.dx = Math.sin(ang);
        b.dy = -Math.cos(ang);
        b.y = top - b.r;
        b.speed = Math.min(660, b.speed * 1.012);
        streak = 0;
        paddle.squash = 1;
        sfx.paddle();
        burst(b.x, top, C.butter, 4, 140, 2.4);
        syncHud();
      }

      collideBricks(b);
      if (state !== 'playing') return;

      if (b.y - b.r > H) { b.dead = true; return; }
    }
  }

  function loseLife() {
    lives--;
    streak = 0;
    addShake(10);
    sfx.hurt();
    fx.flash(C.pink, 0.4);
    drops = [];
    wideTime = 0; slowTime = 0;
    if (lives <= 0) {
      syncHud();
      gameOver();
    } else {
      balls = [newBall()];
      bannerText = lives === 1 ? 'Last ball' : lives + ' balls left';
      bannerTime = 1.4;
      syncHud();
    }
  }

  function levelClear() {
    state = 'clear';
    clearTimer = 2.1;
    addScore(250);
    bannerText = 'Level ' + level + ' cleared';
    bannerTime = 2.1;
    sfx.levelup();
    fx.ring(W / 2, H / 2, C.butter, 360, 0.9);
    fx.flash(C.butter, 0.25);
    drops = [];
    balls = [];
    syncHud();
  }

  function nextLevel() {
    level++;
    loadLevel(level);
    wideTime = 0; slowTime = 0;
    balls = [newBall()];
    bannerText = 'Level ' + level;
    bannerTime = 1.6;
    state = 'playing';
    syncHud();
  }

  function startGame() {
    if (state === 'playing' || state === 'paused' || state === 'clear') return;
    sfx.unlock();
    reset();
    state = 'playing';
    overlay.hide();
    sfx.start();
    music.play('brick-rally');
    updatePauseButton();
  }

  function gameOver() {
    state = 'over';
    music.stop();
    fx.flash(C.pink, 0.4);
    sfx.over();
    if (score > best) {
      best = score;
      A.store.set(BEST_KEY, best);
    }
    var isBest = score > 0 && score > bestAtStart;
    overlay.show(
      'Game over',
      'You scored ' + U.fmt(score) + (isBest ? '. That is a new best!' : '. Your best is ' + U.fmt(best) + '.'),
      'Play again',
      startGame,
      true
    );
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
  if (pauseBtn) {
    pauseBtn.addEventListener('click', function () { togglePause(); pauseBtn.blur(); });
  }

  var soundBtn = A.bindToggleButton('btn-sound',
    function () { return sfx.isMuted() ? 'Sound off' : 'Sound on'; },
    function () { return !sfx.isMuted(); },
    function () { sfx.setMuted(!sfx.isMuted()); sfx.unlock(); });

  // ---------- input ----------
  var kb = A.keyboard(function (code) {
    if (code === 'Space' || code === 'Enter') {
      if (state === 'title' || state === 'over') startGame();
      else if (state === 'paused') togglePause();
      else if (state === 'playing') launch();
    } else if (code === 'KeyP' || code === 'Escape') {
      togglePause();
    } else if (code === 'KeyM') {
      sfx.setMuted(!sfx.isMuted()); soundBtn.refresh();
    }
  });

  function movePointer(e) {
    targetX = view.toLogical(e.clientX, e.clientY).x;
  }
  stage.addEventListener('pointermove', movePointer);
  stage.addEventListener('pointerdown', function (e) {
    movePointer(e);
    if (e.target === canvas) {
      sfx.unlock();
      if (state === 'playing') launch();
    }
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && state === 'playing') togglePause();
  });

  // ---------- update ----------
  function update(dt) {
    if (state === 'paused') return;
    clock += dt;
    fx.update(dt);

    for (var i = sparks.length - 1; i >= 0; i--) {
      var p = sparks[i];
      p.life -= dt;
      if (p.life <= 0) { sparks.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vy += 380 * dt;
      p.vx *= 0.985;
    }
    for (var j = pops.length - 1; j >= 0; j--) {
      pops[j].life -= dt;
      pops[j].y -= 26 * dt;
      if (pops[j].life <= 0) pops.splice(j, 1);
    }
    if (bannerTime > 0) bannerTime -= dt;
    shake = Math.max(0, shake - 28 * dt);
    paddle.squash = Math.max(0, paddle.squash - dt * 6);
    for (var f = 0; f < bricks.length; f++) if (bricks[f].flash > 0) bricks[f].flash -= dt;

    if (state === 'clear') {
      clearTimer -= dt;
      if (clearTimer <= 0) nextLevel();
      return;
    }
    if (state !== 'playing') {
      // attract: keep the ball resting on the paddle in the title / over screens
      return;
    }

    // paddle
    var dir = (kb.has('ArrowRight', 'KeyD') ? 1 : 0) - (kb.has('ArrowLeft', 'KeyA') ? 1 : 0);
    if (dir) {
      targetX = paddle.x + dir * 620 * dt;
    }
    var goalW = wideTime > 0 ? 170 : 110;
    paddle.w += (goalW - paddle.w) * Math.min(1, dt * 10);
    paddle.x = U.clamp(targetX, paddle.w / 2, W - paddle.w / 2);
    if (dir) targetX = paddle.x;

    if (wideTime > 0) wideTime -= dt;
    if (slowTime > 0) slowTime -= dt;

    // balls
    for (var k = 0; k < balls.length; k++) {
      var b = balls[k];
      stepBall(b, dt);
      if (state !== 'playing') return;
      b.trail.push({ x: b.x, y: b.y });
      if (b.trail.length > 9) b.trail.shift();
    }
    balls = balls.filter(function (x) { return !x.dead; });
    if (state === 'playing' && balls.length === 0) loseLife();

    // drops
    for (var d = drops.length - 1; d >= 0; d--) {
      var dr = drops[d];
      dr.y += 150 * dt;
      if (dr.y > paddle.y - paddle.h / 2 - 6 && dr.y < paddle.y + paddle.h &&
          Math.abs(dr.x - paddle.x) < paddle.w / 2 + 14) {
        collect(dr);
        drops.splice(d, 1);
      } else if (dr.y > H + 20) {
        drops.splice(d, 1);
      }
    }
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

  function drawBrick(b) {
    ctx.fillStyle = b.flash > 0 ? '#FFFFFF' : brickColor(b);
    rr(b.x, b.y, b.w, b.h, 5); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(b.x + 4, b.y + 3, b.w - 8, 3);
    ctx.fillStyle = 'rgba(14,11,46,0.28)';
    ctx.fillRect(b.x + 3, b.y + b.h - 5, b.w - 6, 3);
    if (b.metal) {
      ctx.fillStyle = C.ink;
      ctx.beginPath(); ctx.arc(b.x + 9, b.y + b.h / 2, 2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(b.x + b.w - 9, b.y + b.h / 2, 2, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawDrop(d) {
    var colors = { wide: C.mint, multi: C.pink, slow: C.butter, life: C.cloud };
    var letters = { wide: 'W', multi: 'M', slow: 'S', life: '+' };
    ctx.fillStyle = C.ink;
    rr(d.x - 19, d.y - 12, 38, 24, 12); ctx.fill();
    ctx.fillStyle = colors[d.type];
    rr(d.x - 16, d.y - 9, 32, 18, 9); ctx.fill();
    ctx.fillStyle = C.ink;
    ctx.font = '800 14px "Bricolage Grotesque", system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(letters[d.type], d.x, d.y + 1);
  }

  function render() {
    var k = view.k;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);
    A.glow(ctx, W * (0.25 + 0.1 * Math.sin(clock * 0.25)), H * 0.35, 320, C.pink, 0.1);
    A.glow(ctx, W * (0.78 + 0.08 * Math.cos(clock * 0.2)), H * 0.65, 300, C.mint, 0.08);

    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var gx = 40; gx < W; gx += 40) { ctx.moveTo(gx, 0); ctx.lineTo(gx, H); }
    for (var gy = 40; gy < H; gy += 40) { ctx.moveTo(0, gy); ctx.lineTo(W, gy); }
    ctx.stroke();

    var sx = 0, sy = 0;
    if (shake > 0) { sx = U.rand(-shake, shake); sy = U.rand(-shake, shake); }
    ctx.save();
    ctx.translate(sx, sy);

    for (var i = 0; i < bricks.length; i++) if (!bricks[i].dead) drawBrick(bricks[i]);
    for (var d = 0; d < drops.length; d++) drawDrop(drops[d]);

    // paddle
    var ph = paddle.h * (1 + 0.3 * paddle.squash);
    var py = paddle.y - ph / 2;
    ctx.fillStyle = C.ink;
    rr(paddle.x - paddle.w / 2 - 3, py - 3, paddle.w + 6, ph + 6, 11); ctx.fill();
    ctx.fillStyle = C.butter;
    rr(paddle.x - paddle.w / 2, py, paddle.w, ph, 8); ctx.fill();
    ctx.fillStyle = C.mint;
    rr(paddle.x - paddle.w / 2, py, 14, ph, 7); ctx.fill();
    rr(paddle.x + paddle.w / 2 - 14, py, 14, ph, 7); ctx.fill();

    // balls and trails
    for (var b = 0; b < balls.length; b++) {
      var ball = balls[b];
      for (var t = 0; t < ball.trail.length; t++) {
        var tp = ball.trail[t];
        var f = (t + 1) / ball.trail.length;
        ctx.globalAlpha = f * 0.35;
        ctx.fillStyle = C.cloud;
        ctx.beginPath(); ctx.arc(tp.x, tp.y, ball.r * f, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = C.ink;
      ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r + 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.cloud;
      ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();
      A.glow(ctx, ball.x, ball.y, 40, C.cloud, 0.45);
    }

    for (var p = 0; p < sparks.length; p++) {
      var sp = sparks[p];
      ctx.globalAlpha = Math.max(0, sp.life / sp.max);
      ctx.fillStyle = sp.color;
      ctx.fillRect(sp.x - sp.size / 2, sp.y - sp.size / 2, sp.size, sp.size);
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    fx.draw(ctx, W, H);

    // floating text
    ctx.font = '800 15px "Bricolage Grotesque", system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (var q = 0; q < pops.length; q++) {
      ctx.globalAlpha = Math.min(1, pops[q].life * 2);
      ctx.fillStyle = C.butter;
      ctx.fillText(pops[q].text, pops[q].x, pops[q].y);
    }
    ctx.globalAlpha = 1;

    // timers
    if (state === 'playing') {
      ctx.textAlign = 'left';
      ctx.font = '600 13px "Instrument Sans", system-ui, sans-serif';
      if (wideTime > 0) { ctx.fillStyle = C.mint; ctx.fillText('Wide ' + Math.ceil(wideTime) + 's', 12, H - 16); }
      if (slowTime > 0) { ctx.fillStyle = C.butter; ctx.fillText('Slow ' + Math.ceil(slowTime) + 's', 92, H - 16); }
    }

    // launch hint
    var waiting = false;
    for (var w = 0; w < balls.length; w++) if (balls[w].stuck) waiting = true;
    if (state === 'playing' && waiting) {
      ctx.textAlign = 'center';
      ctx.font = '600 16px "Instrument Sans", system-ui, sans-serif';
      ctx.fillStyle = C.cloud;
      ctx.fillText('Press Space or tap to launch', W / 2, H - 100);
    }

    // banner
    if (bannerTime > 0 && state !== 'paused') {
      ctx.globalAlpha = Math.min(1, bannerTime * 1.5);
      ctx.fillStyle = C.cloud;
      ctx.textAlign = 'center';
      ctx.font = '800 36px "Bricolage Grotesque", system-ui, sans-serif';
      ctx.fillText(bannerText, W / 2, H * 0.55);
      ctx.globalAlpha = 1;
    }
  }

  // ---------- boot ----------
  overlay.show(
    'Brick Rally',
    'Move the paddle with the mouse, your finger or the arrow keys. Launch the ball with Space or a tap.',
    'Start game',
    startGame,
    false
  );
  updatePauseButton();
  A.createLoop(update, render).start();
})();
