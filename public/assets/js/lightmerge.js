/* Lightmerge: a 2048-style sliding puzzle. Slide glowing tiles, merge equal
   pairs and reach 2048. Arrow keys, WASD or swipe. */
(function () {
  'use strict';

  var A = window.Arcade, U = A.util, sfx = A.sfx;

  var N = 4, CELL = 118, GAP = 12, PAD = 16;
  var W = PAD * 2 + N * CELL + (N - 1) * GAP, H = W;
  var BEST_KEY = 'best:lightmerge';

  var C = { ink: '#0E0B2E', board: '#17124F', cell: '#221B6B', cloud: '#F4F2FF', butter: '#FFD23F', pink: '#FF6FC4', mint: '#52F0B8' };
  var TILE = {
    2: ['#E4E0FF', '#0E0B2E'], 4: ['#C7C0FF', '#0E0B2E'], 8: ['#52F0B8', '#0E0B2E'], 16: ['#35D5FF', '#0E0B2E'],
    32: ['#FFD23F', '#0E0B2E'], 64: ['#FF9F55', '#0E0B2E'], 128: ['#FF6FC4', '#0E0B2E'], 256: ['#FF4DA6', '#FFFFFF'],
    512: ['#B78BFF', '#FFFFFF'], 1024: ['#6C6CFF', '#FFFFFF'], 2048: ['#FFFFFF', '#0E0B2E']
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
  var setMoves = A.text('hud-moves');
  var setTop = A.text('hud-top');

  var best = A.store.get(BEST_KEY, 0);
  var bestAtStart = best;

  var state = 'title'; // title | playing | paused | over
  var clock = 0, score = 0, moves = 0, won = false, wonShown = false, shake = 0;
  var grid, tiles, pops;

  function pos(i) { return PAD + i * (CELL + GAP); }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }

  function topTile() {
    var m = 2;
    tiles.forEach(function (t) { if (!t.dying && t.v > m) m = t.v; });
    return m;
  }

  function syncHud() {
    setScore(U.fmt(score));
    setBest(U.fmt(Math.max(best, score)));
    setMoves(String(moves));
    setTop(String(topTile()));
  }

  function makeTile(v, r, c) {
    return { v: v, r: r, c: c, sr: r, sc: c, t: 1, pop: 0, spawn: 0, dying: false, merged: false };
  }

  function spawn() {
    var empty = [];
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) if (!grid[r][c]) empty.push([r, c]);
    if (!empty.length) return;
    var e = empty[Math.floor(Math.random() * empty.length)];
    var t = makeTile(Math.random() < 0.9 ? 2 : 4, e[0], e[1]);
    t.spawn = 0.0001;
    grid[e[0]][e[1]] = t;
    tiles.push(t);
  }

  function reset() {
    grid = []; tiles = []; pops = [];
    for (var r = 0; r < N; r++) { grid.push([]); for (var c = 0; c < N; c++) grid[r].push(null); }
    score = 0; moves = 0; won = false; wonShown = false; shake = 0;
    spawn(); spawn();
    syncHud();
  }

  function canMove() {
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) {
      var t = grid[r][c];
      if (!t) return true;
      if (c + 1 < N && grid[r][c + 1] && grid[r][c + 1].v === t.v) return true;
      if (r + 1 < N && grid[r + 1][c] && grid[r + 1][c].v === t.v) return true;
    }
    return false;
  }

  function move(dr, dc) {
    if (state !== 'playing') return;
    // drop tiles that finished merging away
    tiles = tiles.filter(function (t) { return !t.dying; });
    var changed = false, gained = 0, bigMerge = 0;
    tiles.forEach(function (t) { t.merged = false; t.sr = t.r; t.sc = t.c; });
    var rs = [], cs = [], i;
    for (i = 0; i < N; i++) { rs.push(i); cs.push(i); }
    if (dr === 1) rs.reverse();
    if (dc === 1) cs.reverse();
    var dying = [];
    rs.forEach(function (r) {
      cs.forEach(function (c) {
        var t = grid[r][c];
        if (!t) return;
        var nr = r, nc = c;
        while (true) {
          var tr = nr + dr, tc = nc + dc;
          if (tr < 0 || tr >= N || tc < 0 || tc >= N) break;
          var o = grid[tr][tc];
          if (!o) { nr = tr; nc = tc; continue; }
          if (o.v === t.v && !o.merged && !o.willMerge) {
            nr = tr; nc = tc;
          }
          break;
        }
        if (nr === r && nc === c) return;
        var target = grid[nr][nc];
        grid[r][c] = null;
        changed = true;
        if (target && target.v === t.v) {
          target.v *= 2; target.merged = true; target.pop = 0.0001;
          gained += target.v; if (target.v > bigMerge) bigMerge = target.v;
          t.r = nr; t.c = nc; t.t = 0; t.dying = true;
          dying.push(t);
          if (target.v === 2048) won = true;
        } else {
          grid[nr][nc] = t;
          t.r = nr; t.c = nc; t.t = 0;
        }
      });
    });
    tiles.forEach(function (t) { if (!t.dying && (t.r !== t.sr || t.c !== t.sc)) t.t = 0; });
    tiles = tiles.concat([]);
    dying.forEach(function (t) { if (tiles.indexOf(t) < 0) tiles.push(t); });

    if (!changed) { shake = 0.12; return; }
    moves++;
    score += gained;
    if (gained) {
      sfx.brick(Math.min(14, Math.log(bigMerge) / Math.LN2));
      tiles.forEach(function (t) {
        if (t.merged) {
          fx.ring(pos(t.c) + CELL / 2, pos(t.r) + CELL / 2, TILE[Math.min(t.v, 2048)] ? TILE[Math.min(t.v, 2048)][0] : C.cloud, 70 + Math.min(100, t.v / 8), 0.45);
        }
      });
      if (bigMerge >= 128) fx.flash(C.butter, 0.15);
      pops.push({ x: W / 2, y: H / 2, text: '+' + gained, life: 0.7 });
    } else {
      sfx.hit();
    }
    spawn();
    syncHud();
    if (score > best) { best = score; A.store.set(BEST_KEY, best); }
    if (won && !wonShown) {
      wonShown = true;
      state = 'paused';
      sfx.levelup();
      fx.flash(C.mint, 0.3);
      overlay.show('You made 2048!', 'Brilliant. Keep going to push your score even higher.', 'Keep going', function () { state = 'playing'; overlay.hide(); updatePauseButton(); }, true);
      updatePauseButton();
      return;
    }
    if (!canMove()) window.setTimeout(gameOver, 350);
  }

  function startGame() {
    if (state === 'playing' || state === 'paused') return;
    sfx.unlock();
    bestAtStart = best;
    reset();
    state = 'playing';
    overlay.hide();
    sfx.start();
    music.play('lightmerge');
    updatePauseButton();
  }

  function gameOver() {
    if (state !== 'playing') return;
    state = 'over';
    music.stop();
    sfx.over();
    fx.flash(C.pink, 0.3);
    if (score > best) { best = score; A.store.set(BEST_KEY, best); }
    var isBest = score > 0 && score > bestAtStart;
    overlay.show('No moves left', 'You scored ' + U.fmt(score) + ' with a top tile of ' + topTile() + (isBest ? '. That is a new best!' : '. Your best is ' + U.fmt(best) + '.'), 'Play again', startGame, true);
    updatePauseButton();
  }

  function togglePause() {
    if (state === 'playing') {
      state = 'paused'; music.pause();
      overlay.show('Paused', 'Take a breath. Your board is waiting.', 'Resume', togglePause, true);
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

  A.keyboard(function (code) {
    if (code === 'ArrowUp' || code === 'KeyW') move(-1, 0);
    else if (code === 'ArrowDown' || code === 'KeyS') move(1, 0);
    else if (code === 'ArrowLeft' || code === 'KeyA') move(0, -1);
    else if (code === 'ArrowRight' || code === 'KeyD') move(0, 1);
    else if (code === 'Space' || code === 'Enter') {
      if (state === 'title' || state === 'over') startGame();
      else if (state === 'paused') togglePause();
    } else if (code === 'KeyP' || code === 'Escape') togglePause();
    else if (code === 'KeyM') { sfx.setMuted(!sfx.isMuted()); soundBtn.refresh(); }
  });

  var drag = null;
  stage.addEventListener('pointerdown', function (e) {
    if (e.target !== canvas) return;
    sfx.unlock();
    drag = { x: e.clientX, y: e.clientY };
  });
  window.addEventListener('pointerup', function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    if (Math.abs(dx) > Math.abs(dy)) move(0, dx > 0 ? 1 : -1);
    else move(dy > 0 ? 1 : -1, 0);
  });
  window.addEventListener('pointercancel', function () { drag = null; });
  document.addEventListener('visibilitychange', function () { if (document.hidden && state === 'playing') togglePause(); });

  function update(dt) {
    if (state === 'paused') return;
    clock += dt;
    var i;
    for (i = tiles.length - 1; i >= 0; i--) {
      var t = tiles[i];
      if (t.t < 1) t.t = Math.min(1, t.t + dt / 0.11);
      if (t.dying && t.t >= 1) { tiles.splice(i, 1); continue; }
      if (t.spawn > 0 && t.spawn < 1) t.spawn = Math.min(1, t.spawn + dt / 0.18);
      if (t.pop > 0 && t.pop < 1) t.pop = Math.min(1, t.pop + dt / 0.22);
    }
    for (i = pops.length - 1; i >= 0; i--) { pops[i].life -= dt; pops[i].y -= 40 * dt; if (pops[i].life <= 0) pops.splice(i, 1); }
    shake = Math.max(0, shake - dt);
    fx.update(dt);
  }

  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawTile(t) {
    var e = ease(t.t);
    var rp = t.sr + (t.r - t.sr) * e, cp = t.sc + (t.c - t.sc) * e;
    var x = pos(cp), y = pos(rp);
    var s = 1;
    if (t.spawn > 0 && t.spawn < 1) s = ease(t.spawn);
    if (t.pop > 0 && t.pop < 1) s = 1 + 0.16 * Math.sin(t.pop * Math.PI);
    var col = TILE[Math.min(t.v, 2048)] || TILE[2048];
    var cx = x + CELL / 2, cy = y + CELL / 2, sz = CELL * s;
    if (t.v >= 8) A.glow(ctx, cx, cy, CELL * 0.95, col[0], Math.min(0.5, 0.12 + Math.log(t.v) / Math.LN2 * 0.03));
    ctx.fillStyle = col[0];
    rr(cx - sz / 2, cy - sz / 2, sz, sz, 18 * s);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    rr(cx - sz / 2 + 5, cy - sz / 2 + 5, sz - 10, sz * 0.32, 12 * s);
    ctx.fill();
    ctx.fillStyle = col[1];
    var digits = String(t.v).length;
    ctx.font = '800 ' + Math.round((digits > 3 ? 34 : digits > 2 ? 42 : 52) * s) + 'px "Bricolage Grotesque", system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(t.v), cx, cy + 3);
  }

  function render() {
    var k = view.k;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.fillStyle = '#0A0723';
    ctx.fillRect(0, 0, W, H);
    A.glow(ctx, W * (0.3 + 0.1 * Math.sin(clock * 0.3)), H * 0.3, 360, '#2B2DDB', 0.35);
    A.glow(ctx, W * (0.75 + 0.1 * Math.cos(clock * 0.25)), H * 0.75, 320, C.pink, 0.14);

    var sx = 0, sy = 0;
    if (shake > 0) { sx = U.rand(-3, 3); sy = U.rand(-3, 3); }
    ctx.save();
    ctx.translate(sx, sy);

    ctx.fillStyle = C.board;
    rr(0, 0, W, H, 26); ctx.fill();
    ctx.fillStyle = C.cell;
    for (var r = 0; r < N; r++) for (var c = 0; c < N; c++) { rr(pos(c), pos(r), CELL, CELL, 16); ctx.fill(); }

    // dying tiles under, live tiles on top
    tiles.filter(function (t) { return t.dying; }).forEach(drawTile);
    tiles.filter(function (t) { return !t.dying; }).forEach(drawTile);
    ctx.restore();

    fx.draw(ctx, W, H);

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (var i = 0; i < pops.length; i++) {
      var p = pops[i];
      ctx.globalAlpha = Math.min(1, p.life * 2);
      ctx.fillStyle = C.butter;
      ctx.font = '800 34px "Bricolage Grotesque", system-ui, sans-serif';
      ctx.fillText(p.text, p.x, p.y);
    }
    ctx.globalAlpha = 1;
  }

  reset();
  overlay.show('Lightmerge', 'Slide the tiles with the arrow keys or a swipe. Merge equal numbers to reach 2048.', 'Start game', startGame, false);
  updatePauseButton();
  A.createLoop(update, render).start();
})();
