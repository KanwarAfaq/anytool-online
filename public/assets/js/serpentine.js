/* Serpentine: a smooth, glowing snake game.
   Combo multiplier, a golden bonus fruit, a freeze power-up and rocks that
   pile up as you grow. Keyboard, swipe or drag to steer. */
(function () {
  'use strict';

  var A = window.Arcade, U = A.util, sfx = A.sfx;

  var N = 21, CS = 30, W = N * CS, H = N * CS;
  var BEST_KEY = 'best:serpentine';

  var C = {
    ink: '#0E0B2E', board: '#100D38', board2: '#14104A', cloud: '#F4F2FF',
    butter: '#FFD23F', pink: '#FF6FC4', mint: '#52F0B8', cobalt: '#3B6BFF',
    frost: '#9AF4FF', rock: '#8F86FF', coral: '#FF9F55'
  };

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
  var setLength = A.text('hud-length');
  var setMult = A.text('hud-mult');

  var best = A.store.get(BEST_KEY, 0);
  var bestAtStart = best;

  // ---------- state ----------
  var state = 'title'; // title | playing | paused | dying | over
  var clock = 0;
  var score = 0, eaten = 0, combo = 0, comboTimer = 0, frostTime = 0, deathT = 0, headPulse = 0, shake = 0;
  var snake, prev, dir, queue, tickT, rocks, apple, bonus, sparks, pops;

  var motes = [];
  for (var m = 0; m < 24; m++) {
    motes.push({
      x: U.rand(0, W), y: U.rand(0, H), vx: U.rand(-8, 8), vy: U.rand(-14, -3),
      r: U.rand(16, 40), ph: U.rand(0, 6.28), c: [C.cobalt, C.pink, C.mint][m % 3]
    });
  }

  function multiplier() { return Math.min(5, 1 + Math.floor(combo / 3)); }
  function level() { return 1 + Math.floor(eaten / 8); }
  function interval() {
    var base = Math.max(0.066, 0.15 - eaten * 0.0032);
    return frostTime > 0 ? base * 1.7 : base;
  }

  function syncHud() {
    setScore(U.fmt(score));
    setBest(U.fmt(Math.max(best, score)));
    setLength(String(snake.length));
    setMult('x' + multiplier());
  }

  function reset() {
    score = 0; eaten = 0; combo = 0; comboTimer = 0; frostTime = 0; headPulse = 0; shake = 0;
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }];
    prev = snake.slice();
    dir = { x: 1, y: 0 };
    queue = [];
    tickT = -0.35;
    rocks = []; bonus = null; sparks = []; pops = [];
    fx.clear();
    bestAtStart = best;
    apple = null;
    apple = freeCell(3);
    syncHud();
  }

  // ---------- grid helpers ----------
  function occupied(x, y) {
    for (var i = 0; i < snake.length; i++) if (snake[i].x === x && snake[i].y === y) return true;
    for (var j = 0; j < rocks.length; j++) if (rocks[j].x === x && rocks[j].y === y) return true;
    if (apple && apple.x === x && apple.y === y) return true;
    if (bonus && bonus.x === x && bonus.y === y) return true;
    return false;
  }

  function freeCell(minDist) {
    var head = snake[0];
    for (var tries = 0; tries < 300; tries++) {
      var x = Math.floor(Math.random() * N), y = Math.floor(Math.random() * N);
      if (occupied(x, y)) continue;
      if (Math.abs(x - head.x) + Math.abs(y - head.y) < (minDist || 0)) continue;
      return { x: x, y: y };
    }
    for (var yy = 0; yy < N; yy++) for (var xx = 0; xx < N; xx++) if (!occupied(xx, yy)) return { x: xx, y: yy };
    return { x: 0, y: 0 };
  }

  function addRock() {
    if (rocks.length >= 14) return;
    var cell = freeCell(6);
    // keep rocks off the snake's current row and column so a rock never drops in front of the head
    var head = snake[0];
    if (cell.x === head.x || cell.y === head.y) cell = freeCell(6);
    cell.born = clock;
    rocks.push(cell);
  }

  // ---------- effects ----------
  function burst(x, y, color, n, speed, size) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2, v = U.rand(speed * 0.3, speed);
      sparks.push({
        x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        life: U.rand(0.4, 0.9), max: 0.9, size: U.rand(size * 0.6, size * 1.4), color: color
      });
    }
  }

  function cx(cell) { return (cell.x + 0.5) * CS; }
  function cy(cell) { return (cell.y + 0.5) * CS; }

  function addScore(base, x, y) {
    var pts = base * multiplier();
    score += pts;
    pops.push({ x: x, y: y, text: '+' + U.fmt(pts), life: 0.9 });
    if (score > best) { best = score; A.store.set(BEST_KEY, best); }
  }

  // ---------- movement ----------
  function setDir(dx, dy) {
    var last = queue.length ? queue[queue.length - 1] : dir;
    if ((dx === -last.x && dy === -last.y) || (dx === last.x && dy === last.y)) return;
    if (queue.length < 2) queue.push({ x: dx, y: dy });
  }

  function die() {
    state = 'dying';
    deathT = 0.85;
    music.stop();
    sfx.hurt();
    fx.flash(C.pink, 0.5);
    if (!U.reduceMotion) shake = 12;
    var h = snake[0];
    burst(cx(h), cy(h), C.pink, 30, 260, 4);
    burst(cx(h), cy(h), C.butter, 14, 200, 3);
    fx.ring(cx(h), cy(h), C.pink, 150, 0.7);
    for (var i = 2; i < snake.length; i += 2) burst(cx(snake[i]), cy(snake[i]), C.mint, 3, 120, 3);
  }

  function step() {
    if (queue.length) dir = queue.shift();
    var head = snake[0];
    var nx = head.x + dir.x, ny = head.y + dir.y;

    if (nx < 0 || ny < 0 || nx >= N || ny >= N) { die(); return; }
    for (var r = 0; r < rocks.length; r++) if (rocks[r].x === nx && rocks[r].y === ny) { die(); return; }

    var eatsApple = apple.x === nx && apple.y === ny;
    var eatsBonus = bonus && bonus.x === nx && bonus.y === ny;
    var limit = eatsApple ? snake.length : snake.length - 1; // the tail moves away unless we grow
    for (var i = 0; i < limit; i++) if (snake[i].x === nx && snake[i].y === ny) { die(); return; }

    prev = snake.slice();
    snake.unshift({ x: nx, y: ny });
    if (!eatsApple) snake.pop();

    if (eatsApple) eatApple(nx, ny);
    if (eatsBonus) eatBonus(nx, ny);
    syncHud();
  }

  function eatApple(x, y) {
    eaten++;
    combo++;
    comboTimer = 3;
    headPulse = 1;
    var px = (x + 0.5) * CS, py = (y + 0.5) * CS;
    addScore(10, px, py);
    sfx.brick(combo);
    burst(px, py, C.pink, 14, 200, 3.4);
    fx.ring(px, py, C.pink, 70, 0.45);
    apple = null;
    apple = freeCell(3);

    if (eaten % 4 === 0) addRock();
    if (eaten % 5 === 0 && !bonus) {
      bonus = freeCell(4);
      bonus.type = 'gold'; bonus.ttl = 8; bonus.max = 8;
      sfx.power();
    } else if (!bonus && Math.random() < 0.1) {
      bonus = freeCell(4);
      bonus.type = 'frost'; bonus.ttl = 9; bonus.max = 9;
    }
    if (eaten % 8 === 0) {
      pops.push({ x: W / 2, y: H * 0.4, text: 'Level ' + level(), life: 1.3, big: true });
      sfx.levelup();
      fx.ring(W / 2, H / 2, C.butter, 320, 0.8);
    }
  }

  function eatBonus(x, y) {
    var px = (x + 0.5) * CS, py = (y + 0.5) * CS;
    if (bonus.type === 'gold') {
      addScore(60, px, py);
      burst(px, py, C.butter, 24, 260, 4);
      fx.ring(px, py, C.butter, 120, 0.6);
      fx.flash(C.butter, 0.18);
      sfx.levelup();
    } else {
      frostTime = 6;
      pops.push({ x: px, y: py - 10, text: 'Freeze', life: 1.1 });
      burst(px, py, C.frost, 22, 220, 3.4);
      fx.ring(px, py, C.frost, 110, 0.6);
      fx.flash(C.frost, 0.16);
      sfx.power();
    }
    bonus = null;
  }

  // ---------- flow ----------
  function startGame() {
    if (state === 'playing' || state === 'paused' || state === 'dying') return;
    sfx.unlock();
    reset();
    state = 'playing';
    overlay.hide();
    sfx.start();
    music.play('serpentine');
    updatePauseButton();
  }

  function gameOver() {
    state = 'over';
    sfx.over();
    if (score > best) { best = score; A.store.set(BEST_KEY, best); }
    var isBest = score > 0 && score > bestAtStart;
    overlay.show(
      'Game over',
      'You scored ' + U.fmt(score) + ' and grew to ' + snake.length + (isBest ? '. That is a new best!' : '. Your best is ' + U.fmt(best) + '.'),
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
  if (pauseBtn) pauseBtn.addEventListener('click', function () { togglePause(); pauseBtn.blur(); });

  var soundBtn = A.bindToggleButton('btn-sound',
    function () { return sfx.isMuted() ? 'Sound off' : 'Sound on'; },
    function () { return !sfx.isMuted(); },
    function () { sfx.setMuted(!sfx.isMuted()); sfx.unlock(); });

  // ---------- input ----------
  A.keyboard(function (code) {
    if (code === 'ArrowUp' || code === 'KeyW') { if (state === 'playing') setDir(0, -1); }
    else if (code === 'ArrowDown' || code === 'KeyS') { if (state === 'playing') setDir(0, 1); }
    else if (code === 'ArrowLeft' || code === 'KeyA') { if (state === 'playing') setDir(-1, 0); }
    else if (code === 'ArrowRight' || code === 'KeyD') { if (state === 'playing') setDir(1, 0); }
    else if (code === 'Space' || code === 'Enter') {
      if (state === 'title' || state === 'over') startGame();
      else if (state === 'paused') togglePause();
    } else if (code === 'KeyP' || code === 'Escape') togglePause();
    else if (code === 'KeyM') { sfx.setMuted(!sfx.isMuted()); soundBtn.refresh(); }
  });

  // swipe / drag steering
  var drag = null;
  stage.addEventListener('pointerdown', function (e) {
    if (e.target !== canvas) return;
    sfx.unlock();
    drag = { x: e.clientX, y: e.clientY };
  });
  stage.addEventListener('pointermove', function (e) {
    if (!drag || state !== 'playing') return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) < 22 && Math.abs(dy) < 22) return;
    if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 1 : -1, 0);
    else setDir(0, dy > 0 ? 1 : -1);
    drag = { x: e.clientX, y: e.clientY };
  });
  function endDrag() { drag = null; }
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && state === 'playing') togglePause();
  });

  // ---------- update ----------
  function update(dt) {
    if (state === 'paused') return;
    clock += dt;
    fx.update(dt);
    shake = Math.max(0, shake - 22 * dt);
    headPulse = Math.max(0, headPulse - dt * 5);

    for (var i = sparks.length - 1; i >= 0; i--) {
      var p = sparks[i];
      p.life -= dt;
      if (p.life <= 0) { sparks.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vx *= 0.955; p.vy *= 0.955;
    }
    for (var j = pops.length - 1; j >= 0; j--) {
      pops[j].life -= dt;
      pops[j].y -= 26 * dt;
      if (pops[j].life <= 0) pops.splice(j, 1);
    }
    for (var k = 0; k < motes.length; k++) {
      var mo = motes[k];
      mo.x += mo.vx * dt; mo.y += mo.vy * dt;
      if (mo.y < -50) { mo.y = H + 50; mo.x = U.rand(0, W); }
      if (mo.x < -50) mo.x = W + 50;
      if (mo.x > W + 50) mo.x = -50;
    }

    if (state === 'dying') {
      deathT -= dt;
      if (deathT <= 0) gameOver();
      return;
    }
    if (state !== 'playing') return;

    if (frostTime > 0) frostTime -= dt;
    if (comboTimer > 0) {
      comboTimer -= dt;
      if (comboTimer <= 0) { combo = 0; syncHud(); }
    }
    if (bonus) {
      bonus.ttl -= dt;
      if (bonus.ttl <= 0) bonus = null;
    }

    tickT += dt;
    var iv = interval();
    while (tickT >= iv) {
      tickT -= iv;
      step();
      if (state !== 'playing') break;
      iv = interval();
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

  function mix(c1, c2, t) {
    var a = parseInt(c1.slice(1), 16), b = parseInt(c2.slice(1), 16);
    var r = Math.round((a >> 16) + ((b >> 16) - (a >> 16)) * t);
    var g = Math.round((a >> 8 & 255) + ((b >> 8 & 255) - (a >> 8 & 255)) * t);
    var bl = Math.round((a & 255) + ((b & 255) - (a & 255)) * t);
    return 'rgb(' + r + ',' + g + ',' + bl + ')';
  }

  function drawBoard() {
    ctx.fillStyle = C.board;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = C.board2;
    for (var y = 0; y < N; y++) {
      for (var x = 0; x < N; x++) {
        if ((x + y) % 2 === 0) ctx.fillRect(x * CS, y * CS, CS, CS);
      }
    }
    for (var i = 0; i < motes.length; i++) {
      var mo = motes[i];
      A.glow(ctx, mo.x, mo.y, mo.r * 2.4, mo.c, 0.07 + 0.04 * Math.sin(clock * 0.9 + mo.ph));
    }
  }

  function drawRock(r) {
    var x = r.x * CS + 3, y = r.y * CS + 3, s = CS - 6;
    var grow = Math.min(1, (clock - r.born) * 4);
    var k = grow < 1 ? 0.6 + 0.4 * grow : 1;
    var off = (s - s * k) / 2;
    ctx.fillStyle = C.ink;
    rr(x + off - 1, y + off - 1, s * k + 2, s * k + 2, 8); ctx.fill();
    ctx.fillStyle = C.rock;
    rr(x + off, y + off, s * k, s * k, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.fillRect(x + off + 4, y + off + 3, s * k - 8, 3);
    ctx.fillStyle = 'rgba(14,11,46,0.3)';
    ctx.fillRect(x + off + 3, y + off + s * k - 6, s * k - 6, 3);
  }

  function drawApple() {
    var x = cx(apple), y = cy(apple);
    var pulse = 1 + Math.sin(clock * 5) * 0.06;
    A.glow(ctx, x, y, 46, C.pink, 0.5 + 0.15 * Math.sin(clock * 5));
    ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.arc(x, y + 1, 12.5 * pulse, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.pink;
    ctx.beginPath(); ctx.arc(x, y + 1, 10.5 * pulse, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath(); ctx.ellipse(x - 3.5, y - 3, 2.6, 1.8, -0.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.mint;
    ctx.beginPath(); ctx.ellipse(x + 3, y - 10, 5, 2.6, -0.6, 0, Math.PI * 2); ctx.fill();
  }

  function drawBonus() {
    var x = cx(bonus), y = cy(bonus);
    var urgent = bonus.ttl < 2.5 && Math.floor(clock * 8) % 2 === 0;
    var color = bonus.type === 'gold' ? C.butter : C.frost;
    A.glow(ctx, x, y, 58, color, urgent ? 0.25 : 0.65);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(clock * 1.4);
    ctx.fillStyle = C.ink;
    ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var ang = i * Math.PI / 5, rad = i % 2 ? 6.5 : 15;
      ctx.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
    }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    for (var j = 0; j < 10; j++) {
      var a2 = j * Math.PI / 5, r2 = j % 2 ? 4.5 : 12.5;
      ctx.lineTo(Math.cos(a2) * r2, Math.sin(a2) * r2);
    }
    ctx.closePath(); ctx.fill();
    ctx.restore();
    // countdown ring
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, 19, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (bonus.ttl / bonus.max));
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawSnake() {
    var a = state === 'playing' ? U.clamp(tickT / interval(), 0, 1) : 1;
    var len = snake.length;
    var pts = [];
    for (var i = 0; i < len; i++) {
      var from = prev[Math.min(i, prev.length - 1)];
      var to = snake[i];
      pts.push({ x: U.lerp(cx(from), cx(to), a), y: U.lerp(cy(from), cy(to), a) });
    }

    var frozen = frostTime > 0;
    var headC = frozen ? C.frost : C.mint;
    var tailC = frozen ? '#5BA8FF' : C.cobalt;
    var dying = state === 'dying';
    var blink = dying && Math.floor(clock * 16) % 2 === 0;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // dark outline
    for (var j = len - 1; j >= 1; j--) {
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = CS * (0.5 + 0.38 * (1 - j / len)) + 5;
      ctx.beginPath(); ctx.moveTo(pts[j].x, pts[j].y); ctx.lineTo(pts[j - 1].x, pts[j - 1].y); ctx.stroke();
    }
    // body
    for (var k = len - 1; k >= 1; k--) {
      var t = k / Math.max(1, len - 1);
      ctx.strokeStyle = blink ? C.pink : mix(headC, tailC, t);
      ctx.lineWidth = CS * (0.5 + 0.38 * (1 - k / len));
      ctx.beginPath(); ctx.moveTo(pts[k].x, pts[k].y); ctx.lineTo(pts[k - 1].x, pts[k - 1].y); ctx.stroke();
    }
    // highlight stripe
    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = CS * 0.18;
    ctx.beginPath();
    ctx.moveTo(pts[len - 1].x, pts[len - 1].y - 3);
    for (var h = len - 2; h >= 0; h--) ctx.lineTo(pts[h].x, pts[h].y - 3);
    ctx.stroke();

    // glow rides along the body
    for (var g = 0; g < len; g += 3) {
      A.glow(ctx, pts[g].x, pts[g].y, 34, mix(headC, tailC, g / Math.max(1, len - 1)), 0.16);
    }

    // head
    var hx = pts[0].x, hy = pts[0].y;
    var hr = CS * 0.47 * (1 + headPulse * 0.28);
    A.glow(ctx, hx, hy, 66, headC, 0.42);
    ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.arc(hx, hy, hr + 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = blink ? C.pink : headC;
    ctx.beginPath(); ctx.arc(hx, hy, hr, 0, Math.PI * 2); ctx.fill();

    var px = -dir.y, py = dir.x;
    for (var e = -1; e <= 1; e += 2) {
      var ex = hx + dir.x * 5 + px * 6 * e, ey = hy + dir.y * 5 + py * 6 * e;
      ctx.fillStyle = C.cloud;
      ctx.beginPath(); ctx.arc(ex, ey, 4.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.ink;
      ctx.beginPath(); ctx.arc(ex + dir.x * 1.4, ey + dir.y * 1.4, 2.1, 0, Math.PI * 2); ctx.fill();
    }
    if (frozen) {
      ctx.strokeStyle = C.frost;
      ctx.globalAlpha = 0.6 + 0.3 * Math.sin(clock * 10);
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(hx, hy, hr + 7, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  function render() {
    var k = view.k;
    ctx.setTransform(k, 0, 0, k, 0, 0);

    var sx = 0, sy = 0;
    if (shake > 0) { sx = U.rand(-shake, shake); sy = U.rand(-shake, shake); }
    ctx.save();
    ctx.translate(sx, sy);

    drawBoard();
    for (var r = 0; r < rocks.length; r++) drawRock(rocks[r]);
    if (apple) drawApple();
    if (bonus) drawBonus();
    drawSnake();

    for (var p = 0; p < sparks.length; p++) {
      var sp = sparks[p];
      ctx.globalAlpha = Math.max(0, sp.life / sp.max);
      ctx.fillStyle = sp.color;
      ctx.fillRect(sp.x - sp.size / 2, sp.y - sp.size / 2, sp.size, sp.size);
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    fx.draw(ctx, W, H);

    // frozen tint
    if (frostTime > 0 && state === 'playing') {
      ctx.fillStyle = 'rgba(154,244,255,' + (0.06 + 0.03 * Math.sin(clock * 6)) + ')';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = C.frost;
      ctx.font = '600 13px "Instrument Sans", system-ui, sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText('Freeze ' + Math.ceil(frostTime) + 's', 12, H - 14);
    }

    // floating text
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (var q = 0; q < pops.length; q++) {
      var pp = pops[q];
      ctx.globalAlpha = Math.min(1, pp.life * 2);
      ctx.fillStyle = pp.big ? C.cloud : C.butter;
      ctx.font = (pp.big ? '800 40px' : '800 16px') + ' "Bricolage Grotesque", system-ui, sans-serif';
      ctx.fillText(pp.text, pp.x, pp.y);
    }
    ctx.globalAlpha = 1;

    // starting hint
    if (state === 'playing' && tickT < 0) {
      ctx.fillStyle = C.cloud;
      ctx.font = '600 16px "Instrument Sans", system-ui, sans-serif';
      ctx.fillText('Steer with the arrow keys or swipe', W / 2, H * 0.72);
    }
  }

  // ---------- boot ----------
  reset();
  overlay.show(
    'Serpentine',
    'Steer with the arrow keys, or swipe on the board. Eat fruit, avoid walls, rocks and your own tail.',
    'Start game',
    startGame,
    false
  );
  updatePauseButton();
  A.createLoop(update, render).start();
})();
