/* Starfall: a vertical space shooter.
   Waves of ships, power-ups, a boss every fourth wave, combo multiplier. */
(function () {
  'use strict';

  var A = window.Arcade, U = A.util, sfx = A.sfx;

  var W = 480, H = 720;
  var BEST_KEY = 'best:starfall';

  var C = {
    night: '#0A0723', ink: '#0E0B2E', cloud: '#F4F2FF', butter: '#FFD23F',
    pink: '#FF6FC4', mint: '#52F0B8', coral: '#FF9F55', lilac: '#8F86FF', cobalt: '#2B2DDB'
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
  var setWave = A.text('hud-wave');
  var setMult = A.text('hud-mult');
  var setLives = A.pips('hud-lives');

  var best = A.store.get(BEST_KEY, 0);
var bestAtStart = best;

  // ---------- state ----------
  var state = 'title'; // title | playing | paused | over
  var clock = 0;
  var score = 0, lives = 3, wave = 0, combo = 0, comboTimer = 0;
  var player, bullets, enemies, enemyShots, drops, sparks, pops, boss;
  var spawnLeft = 0, spawnTimer = 0, waveDelay = 0, bannerTime = 0, bannerText = '';
  var shake = 0;
  var autoFire = U.coarsePointer;
  var pointer = { active: false, down: false, x: W / 2, y: H - 120, touch: false };

  var stars = [];
  for (var s = 0; s < 90; s++) {
    var z = [0.25, 0.5, 1][s % 3];
    stars.push({ x: U.rand(0, W), y: U.rand(0, H), z: z, size: z < 0.4 ? 1.5 : z < 0.8 ? 2 : 3 });
  }

  function multiplier() { return Math.min(5, 1 + Math.floor(combo / 6)); }

  function reset() {
    score = 0; lives = 3; wave = 0; combo = 0; comboTimer = 0;
    player = { x: W / 2, y: H - 96, r: 14, cool: 0, inv: 1.2, rapid: 0, triple: 0, shield: false };
    bullets = []; enemies = []; enemyShots = []; drops = []; sparks = []; pops = [];
    boss = null;
    bestAtStart = best;
    spawnLeft = 0; spawnTimer = 0; waveDelay = 0.6; bannerTime = 0; shake = 0;
    syncHud();
  }
  reset();

  // ---------- HUD ----------
  function syncHud() {
    setScore(U.fmt(score));
    setBest(U.fmt(Math.max(best, score)));
    setWave(wave > 0 ? String(wave) : '0');
    setMult('x' + multiplier());
    setLives(Math.max(0, lives));
  }

  function addScore(base, x, y) {
    combo++;
    comboTimer = 2.6;
    var pts = base * multiplier();
    score += pts;
    pops.push({ x: x, y: y, text: '+' + U.fmt(pts), life: 0.8 });
    if (score > best) {
      best = score;
      A.store.set(BEST_KEY, best);
    }
  }

  // ---------- effects ----------
  function burst(x, y, color, n, speed, size) {
    for (var i = 0; i < n; i++) {
      var a = Math.random() * Math.PI * 2;
      var v = U.rand(speed * 0.3, speed);
      sparks.push({
        x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        life: U.rand(0.35, 0.8), max: 0.8, size: U.rand(size * 0.6, size * 1.4), color: color
      });
    }
  }

  function addShake(amount) {
    if (!U.reduceMotion) shake = Math.max(shake, amount);
  }

  // ---------- waves and enemies ----------
  function nextWave() {
    wave++;
    var isBoss = wave % 4 === 0;
    spawnLeft = isBoss ? 8 : 6 + wave * 2;
    spawnTimer = 0.8;
    if (isBoss) spawnBoss();
    bannerText = isBoss ? 'Wave ' + wave + ': boss incoming' : 'Wave ' + wave;
    bannerTime = 2.2;
    syncHud();
  }

  function spawnEnemy() {
    var k = Math.min(2, 1 + (wave - 1) * 0.07);
    var roll = Math.random();
    var type = 'scout';
    if (wave >= 3 && roll > 0.84) type = 'tank';
    else if (wave >= 2 && roll > 0.55) type = 'weaver';

    var e = { type: type, x: U.rand(44, W - 44), y: -30, t: 0, hit: 0, shootCool: U.rand(1, 2.4) };
    if (type === 'scout') {
      e.r = 16; e.hp = 1; e.vy = U.rand(90, 130) * k; e.amp = U.rand(20, 50);
      e.freq = U.rand(1.5, 3); e.base = e.x; e.pts = 100;
    } else if (type === 'weaver') {
      e.r = 17; e.hp = 2; e.vy = U.rand(70, 100) * k;
      e.vx = (Math.random() < 0.5 ? -1 : 1) * U.rand(110, 160);
      e.flip = U.rand(0.6, 1.1); e.pts = 200;
    } else {
      e.r = 24; e.hp = 5; e.vy = U.rand(40, 60) * k; e.pts = 450;
    }
    e.maxHp = e.hp;
    enemies.push(e);
  }

  function spawnBoss() {
    var hp = 36 + wave * 4;
    boss = { x: W / 2, y: -90, r: 56, hp: hp, maxHp: hp, t: 0, cool: 2, mode: 0, hit: 0, entering: true };
  }

  function shotSpeed() { return Math.min(300, 190 + wave * 6); }

  function enemyShoot(x, y, vx, vy) {
    enemyShots.push({ x: x, y: y, vx: vx, vy: vy, r: 5 });
  }

  function aimedShot(e) {
    var dx = player.x - e.x, dy = player.y - e.y;
    var len = Math.sqrt(dx * dx + dy * dy) || 1;
    var sp = shotSpeed();
    enemyShoot(e.x, e.y + e.r * 0.5, dx / len * sp, dy / len * sp);
  }

  function maybeDrop(x, y, chance) {
    if (Math.random() > chance) return;
    var roll = Math.random();
    var type = roll < 0.34 ? 'rapid' : roll < 0.68 ? 'triple' : roll < 0.95 ? 'shield' : 'life';
    if (type === 'life' && lives >= 5) type = 'shield';
    drops.push({ x: x, y: y, type: type, t: 0 });
  }

  function killEnemy(e) {
    var color = e.type === 'scout' ? C.pink : e.type === 'weaver' ? C.coral : C.lilac;
    burst(e.x, e.y, color, e.type === 'tank' ? 28 : 16, 230, 3.2);
    burst(e.x, e.y, C.cloud, 6, 160, 2);
    sfx.boom();
    fx.ring(e.x, e.y, color, e.type === 'tank' ? 90 : 55, 0.4);
    addShake(e.type === 'tank' ? 6 : 3);
    addScore(e.pts, e.x, e.y);
    maybeDrop(e.x, e.y, e.type === 'tank' ? 0.4 : 0.1);
  }

  function killBoss() {
    for (var i = 0; i < 5; i++) burst(boss.x + U.rand(-50, 50), boss.y + U.rand(-24, 24), i % 2 ? C.pink : C.butter, 22, 300, 4);
    sfx.boom();
    fx.ring(boss.x, boss.y, C.butter, 260, 0.9);
    fx.flash(C.butter, 0.35);
    addShake(16);
    addScore(3000, boss.x, boss.y);
    maybeDrop(boss.x - 30, boss.y, 1);
    maybeDrop(boss.x + 30, boss.y, 1);
    boss = null;
    enemyShots = [];
  }

  // ---------- player ----------
  function fire() {
    var vy = -720;
    bullets.push({ x: player.x, y: player.y - 18, vx: 0, vy: vy });
    if (player.triple > 0) {
      bullets.push({ x: player.x - 8, y: player.y - 10, vx: -130, vy: vy });
      bullets.push({ x: player.x + 8, y: player.y - 10, vx: 130, vy: vy });
    }
    sfx.shoot();
  }

  function hurtPlayer() {
    if (player.inv > 0 || state !== 'playing') return;
    if (player.shield) {
      player.shield = false;
      player.inv = 1;
      burst(player.x, player.y, C.cloud, 16, 220, 3);
      sfx.hit();
      addShake(5);
      return;
    }
    lives--;
    burst(player.x, player.y, C.butter, 30, 320, 4);
    burst(player.x, player.y, C.pink, 12, 240, 3);
    sfx.hurt();
    fx.flash(C.coral, 0.45);
    fx.ring(player.x, player.y, C.butter, 150, 0.6);
    addShake(14);
    combo = 0; comboTimer = 0;
    enemyShots = [];
    player.rapid = 0; player.triple = 0;
    if (lives <= 0) {
      gameOver();
    } else {
      player.inv = 2.2;
      player.x = W / 2; player.y = H - 96;
    }
    syncHud();
  }

  function collect(d) {
    sfx.power();
    var label = '';
    if (d.type === 'rapid') { player.rapid = 10; label = 'Rapid fire'; }
    else if (d.type === 'triple') { player.triple = 10; label = 'Triple shot'; }
    else if (d.type === 'shield') { player.shield = true; label = 'Shield'; }
    else { lives = Math.min(5, lives + 1); label = 'Extra life'; }
    pops.push({ x: d.x, y: d.y - 10, text: label, life: 1.1 });
    syncHud();
  }

  // ---------- game flow ----------
  function startGame() {
    if (state === 'playing' || state === 'paused') return;
    sfx.unlock();
    reset();
    state = 'playing';
    overlay.hide();
    sfx.start();
    music.play('starfall');
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

  var autoBtn = A.bindToggleButton('btn-auto',
    function () { return autoFire ? 'Auto-fire on' : 'Auto-fire off'; },
    function () { return autoFire; },
    function () { autoFire = !autoFire; });

  // ---------- input ----------
  var kb = A.keyboard(function (code) {
    if (code === 'Space' || code === 'Enter') {
      if (state === 'title' || state === 'over') startGame();
      else if (state === 'paused') togglePause();
    } else if (code === 'KeyP' || code === 'Escape') {
      togglePause();
    } else if (code === 'KeyM') {
      sfx.setMuted(!sfx.isMuted()); soundBtn.refresh();
    } else if (code === 'KeyF') {
      autoFire = !autoFire; autoBtn.refresh();
    }
  });

  function movePointer(e) {
    var p = view.toLogical(e.clientX, e.clientY);
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.touch = e.pointerType === 'touch';
  }
  stage.addEventListener('pointermove', function (e) { movePointer(e); pointer.active = true; });
  stage.addEventListener('pointerdown', function (e) {
    movePointer(e);
    pointer.active = true;
    if (e.target === canvas) {
      pointer.down = true;
      sfx.unlock();
    }
  });
  function pointerUp(e) {
    pointer.down = false;
    if (e.pointerType === 'touch') pointer.active = false;
  }
  window.addEventListener('pointerup', pointerUp);
  window.addEventListener('pointercancel', pointerUp);

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && state === 'playing') togglePause();
  });

  // ---------- update ----------
  function update(dt) {
    if (state === 'paused') return;
    clock += dt;

    // starfield scrolls always; faster while playing
    var scroll = state === 'playing' ? 150 + wave * 8 : 50;
    for (var i = 0; i < stars.length; i++) {
      var st = stars[i];
      st.y += scroll * st.z * dt;
      if (st.y > H) { st.y = -4; st.x = U.rand(0, W); }
    }

    updateEffects(dt);
    fx.update(dt);
    if (state !== 'playing') return;

    updatePlayer(dt);
    updateWaves(dt);
    updateEnemies(dt);
    updateBoss(dt);
    updateShots(dt);
    updateDrops(dt);
    collide();

    if (comboTimer > 0) {
      comboTimer -= dt;
      if (comboTimer <= 0) combo = 0;
    }
    syncHud();
  }

  function updateEffects(dt) {
    for (var i = sparks.length - 1; i >= 0; i--) {
      var p = sparks[i];
      p.life -= dt;
      if (p.life <= 0) { sparks.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vx *= 0.96; p.vy *= 0.96;
    }
    for (var j = pops.length - 1; j >= 0; j--) {
      var q = pops[j];
      q.life -= dt;
      q.y -= 28 * dt;
      if (q.life <= 0) pops.splice(j, 1);
    }
    if (bannerTime > 0) bannerTime -= dt;
    shake = Math.max(0, shake - 30 * dt);
  }

  function updatePlayer(dt) {
    var dx = (kb.has('ArrowRight', 'KeyD') ? 1 : 0) - (kb.has('ArrowLeft', 'KeyA') ? 1 : 0);
    var dy = (kb.has('ArrowDown', 'KeyS') ? 1 : 0) - (kb.has('ArrowUp', 'KeyW') ? 1 : 0);

    if (dx || dy) {
      pointer.active = false;
      player.x += dx * 340 * dt;
      player.y += dy * 300 * dt;
    } else if (pointer.active) {
      var tx = pointer.x;
      var ty = pointer.y - (pointer.touch ? 60 : 0);
      var max = 760 * dt;
      player.x += U.clamp(tx - player.x, -max, max);
      player.y += U.clamp(ty - player.y, -max, max);
    }
    player.x = U.clamp(player.x, player.r + 4, W - player.r - 4);
    player.y = U.clamp(player.y, H * 0.42, H - player.r - 10);

    if (player.inv > 0) player.inv -= dt;
    if (player.rapid > 0) player.rapid -= dt;
    if (player.triple > 0) player.triple -= dt;

    player.cool -= dt;
    if ((kb.has('Space') || pointer.down || autoFire) && player.cool <= 0) {
      fire();
      player.cool = player.rapid > 0 ? 0.11 : 0.21;
    }
  }

  function updateWaves(dt) {
    if (waveDelay > 0) {
      waveDelay -= dt;
      if (waveDelay <= 0) nextWave();
      return;
    }
    if (spawnLeft > 0) {
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawnEnemy();
        spawnLeft--;
        spawnTimer = Math.max(0.32, 0.95 - wave * 0.045) * U.rand(0.7, 1.2);
      }
    } else if (enemies.length === 0 && !boss) {
      waveDelay = 1.6;
      score += 250;
      bannerText = 'Wave ' + wave + ' cleared';
      bannerTime = 1.4;
      sfx.levelup();
    }
  }

  function updateEnemies(dt) {
    for (var i = enemies.length - 1; i >= 0; i--) {
      var e = enemies[i];
      e.t += dt;
      if (e.hit > 0) e.hit -= dt;

      if (e.type === 'scout') {
        e.y += e.vy * dt;
        e.x = e.base + Math.sin(e.t * e.freq) * e.amp;
      } else if (e.type === 'weaver') {
        e.y += e.vy * dt;
        e.x += e.vx * dt;
        e.flip -= dt;
        if (e.flip <= 0) { e.vx = -e.vx; e.flip = U.rand(0.6, 1.1); }
        if (e.x < 30) { e.x = 30; e.vx = Math.abs(e.vx); }
        if (e.x > W - 30) { e.x = W - 30; e.vx = -Math.abs(e.vx); }
      } else {
        e.y += e.vy * dt;
      }

      if (e.type !== 'scout' && wave >= 3 && e.y > 20 && e.y < H * 0.62) {
        e.shootCool -= dt;
        if (e.shootCool <= 0) {
          if (e.type === 'tank') aimedShot(e);
          else enemyShoot(e.x, e.y + 14, 0, shotSpeed());
          e.shootCool = U.rand(1.6, 2.8) / (1 + wave * 0.04);
        }
      }

      if (e.y > H + 40) {
        enemies.splice(i, 1);
        combo = 0; comboTimer = 0;
      }
    }
  }

  function updateBoss(dt) {
    if (!boss) return;
    boss.t += dt;
    if (boss.hit > 0) boss.hit -= dt;
    if (boss.entering) {
      boss.y += 90 * dt;
      if (boss.y >= 112) { boss.y = 112; boss.entering = false; }
      return;
    }
    boss.x = W / 2 + Math.sin(boss.t * 0.9) * (W / 2 - 100);
    boss.cool -= dt;
    if (boss.cool <= 0) {
      var sp = shotSpeed();
      if (boss.mode % 2 === 0) {
        for (var a = -2; a <= 2; a++) {
          var ang = Math.PI / 2 + a * 0.3;
          enemyShoot(boss.x, boss.y + 40, Math.cos(ang) * sp, Math.sin(ang) * sp);
        }
      } else {
        for (var n = -1; n <= 1; n++) {
          var dx = player.x - boss.x + n * 70, dy = player.y - boss.y;
          var len = Math.sqrt(dx * dx + dy * dy) || 1;
          enemyShoot(boss.x + n * 34, boss.y + 40, dx / len * sp * 1.1, dy / len * sp * 1.1);
        }
      }
      boss.mode++;
      boss.cool = Math.max(0.7, 1.3 - wave * 0.03);
    }
  }

  function updateShots(dt) {
    for (var i = bullets.length - 1; i >= 0; i--) {
      var b = bullets[i];
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.y < -20 || b.x < -20 || b.x > W + 20) bullets.splice(i, 1);
    }
    for (var j = enemyShots.length - 1; j >= 0; j--) {
      var s = enemyShots[j];
      s.x += s.vx * dt; s.y += s.vy * dt;
      if (s.y > H + 20 || s.y < -20 || s.x < -20 || s.x > W + 20) enemyShots.splice(j, 1);
    }
  }

  function updateDrops(dt) {
    for (var i = drops.length - 1; i >= 0; i--) {
      var d = drops[i];
      d.t += dt;
      d.y += 95 * dt;
      d.x += Math.sin(d.t * 3) * 20 * dt;
      if (U.hit(d.x, d.y, 14, player.x, player.y, player.r + 8)) {
        collect(d);
        drops.splice(i, 1);
      } else if (d.y > H + 20) {
        drops.splice(i, 1);
      }
    }
  }

  function collide() {
    // player bullets vs enemies and boss
    for (var i = bullets.length - 1; i >= 0; i--) {
      var b = bullets[i];
      var used = false;
      for (var j = enemies.length - 1; j >= 0; j--) {
        var e = enemies[j];
        if (U.hit(b.x, b.y, 4, e.x, e.y, e.r)) {
          e.hp--; e.hit = 0.08;
          burst(b.x, b.y, C.mint, 3, 140, 2);
          if (e.hp <= 0) { killEnemy(e); enemies.splice(j, 1); } else { sfx.hit(); }
          used = true;
          break;
        }
      }
      if (!used && boss && !boss.entering && U.hit(b.x, b.y, 4, boss.x, boss.y, boss.r)) {
        boss.hp--; boss.hit = 0.06;
        burst(b.x, b.y, C.pink, 2, 120, 2);
        used = true;
        if (boss.hp <= 0) killBoss();
      }
      if (used) bullets.splice(i, 1);
    }

    // hazards vs player
    for (var k = enemyShots.length - 1; k >= 0; k--) {
      var s = enemyShots[k];
      if (U.hit(s.x, s.y, s.r, player.x, player.y, player.r - 2)) {
        enemyShots.splice(k, 1);
        hurtPlayer();
        break; // hurtPlayer can clear enemyShots, so stop walking the old list
      }
    }
    for (var m = enemies.length - 1; m >= 0; m--) {
      var en = enemies[m];
      if (U.hit(en.x, en.y, en.r, player.x, player.y, player.r)) {
        if (player.inv <= 0) {
          killEnemy(en);
          enemies.splice(m, 1);
        }
        hurtPlayer();
      }
    }
    if (boss && U.hit(boss.x, boss.y, boss.r, player.x, player.y, player.r)) hurtPlayer();
  }

  // ---------- drawing ----------
  function drawShip(x, y, scale, thrust) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.fillStyle = C.coral;
    ctx.beginPath();
    ctx.moveTo(-6, 18); ctx.lineTo(0, 28 + thrust * 9); ctx.lineTo(6, 18);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = C.pink;
    ctx.beginPath();
    ctx.moveTo(-8, -2); ctx.lineTo(-23, 17); ctx.lineTo(-23, 23); ctx.lineTo(-7, 17);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(8, -2); ctx.lineTo(23, 17); ctx.lineTo(23, 23); ctx.lineTo(7, 17);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = C.butter;
    ctx.beginPath();
    ctx.moveTo(0, -25); ctx.lineTo(10, 8); ctx.lineTo(8, 21); ctx.lineTo(-8, 21); ctx.lineTo(-10, 8);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.ellipse(0, -1, 3.8, 7.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.mint;
    ctx.beginPath(); ctx.ellipse(-1, -3, 1.3, 3, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawEnemy(e) {
    var flash = e.hit > 0;
    ctx.save();
    ctx.translate(e.x, e.y);
    if (e.type === 'scout') {
      ctx.fillStyle = flash ? '#fff' : C.pink;
      ctx.beginPath(); ctx.ellipse(0, 4, e.r, e.r * 0.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = flash ? '#fff' : '#FFD3EE';
      ctx.beginPath(); ctx.arc(0, 1, e.r * 0.52, Math.PI, 0); ctx.fill();
      ctx.fillStyle = C.ink;
      for (var i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(i * 8, 6, 2, 0, Math.PI * 2); ctx.fill(); }
    } else if (e.type === 'weaver') {
      ctx.fillStyle = flash ? '#fff' : C.coral;
      ctx.beginPath();
      ctx.moveTo(0, -e.r - 2); ctx.lineTo(e.r + 2, 0); ctx.lineTo(0, e.r + 2); ctx.lineTo(-e.r - 2, 0);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.ink;
      ctx.beginPath();
      ctx.moveTo(0, -8); ctx.lineTo(8, 0); ctx.lineTo(0, 8); ctx.lineTo(-8, 0);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = flash ? '#fff' : C.butter;
      ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = flash ? '#fff' : C.lilac;
      ctx.beginPath();
      for (var a = 0; a < 6; a++) {
        var ang = a * Math.PI / 3 + Math.PI / 6;
        ctx.lineTo(Math.cos(ang) * (e.r + 2), Math.sin(ang) * (e.r + 2));
      }
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = C.ink;
      ctx.beginPath(); ctx.arc(0, 0, e.r * 0.55, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = flash ? '#fff' : C.pink;
      ctx.fillRect(-e.r * 0.4, -3, e.r * 0.8 * (e.hp / e.maxHp), 6);
    }
    ctx.restore();
  }

  function drawBoss() {
    var b = boss;
    var flash = b.hit > 0;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.fillStyle = flash ? '#fff' : C.lilac;
    ctx.fillRect(-70, -6, 22, 34); ctx.fillRect(48, -6, 22, 34);
    ctx.fillStyle = flash ? '#fff' : C.pink;
    ctx.beginPath();
    ctx.moveTo(-72, -8); ctx.lineTo(-40, -38); ctx.lineTo(40, -38); ctx.lineTo(72, -8);
    ctx.lineTo(56, 30); ctx.lineTo(0, 44); ctx.lineTo(-56, 30);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.arc(0, -2, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = flash ? '#fff' : C.butter;
    ctx.beginPath(); ctx.arc(0, -2, 10 + Math.sin(clock * 6) * 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink;
    ctx.fillRect(-52, 6, 12, 5); ctx.fillRect(40, 6, 12, 5);
    ctx.restore();

    // health bar
    var bw = 280, bx = (W - bw) / 2;
    ctx.fillStyle = C.ink; ctx.fillRect(bx - 3, 17, bw + 6, 16);
    ctx.fillStyle = C.pink; ctx.fillRect(bx, 20, bw * Math.max(0, b.hp / b.maxHp), 10);
  }

  function drawDrop(d) {
    var colors = { rapid: C.butter, triple: C.mint, shield: C.cloud, life: C.pink };
    var letters = { rapid: 'R', triple: 'T', shield: 'S', life: '+' };
    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.fillStyle = C.ink;
    ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = colors[d.type];
    ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.ink;
    ctx.font = '800 15px "Bricolage Grotesque", system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(letters[d.type], 0, 1);
    ctx.restore();
  }

  function render() {
    var k = view.k;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.fillStyle = C.night;
    ctx.fillRect(0, 0, W, H);
    A.glow(ctx, W * (0.3 + 0.12 * Math.sin(clock * 0.2)), H * 0.3, 300, C.cobalt || '#2B2DDB', 0.22);
    A.glow(ctx, W * (0.75 + 0.1 * Math.cos(clock * 0.17)), H * 0.7, 260, C.pink, 0.1);

    // stars
    ctx.fillStyle = C.cloud;
    for (var i = 0; i < stars.length; i++) {
      var st = stars[i];
      ctx.globalAlpha = 0.25 + st.z * 0.55;
      ctx.fillRect(st.x, st.y, st.size, st.size);
    }
    ctx.globalAlpha = 1;

    var sx = 0, sy = 0;
    if (shake > 0) { sx = U.rand(-shake, shake); sy = U.rand(-shake, shake); }
    ctx.save();
    ctx.translate(sx, sy);

    for (var d = 0; d < drops.length; d++) drawDrop(drops[d]);

    for (var e = 0; e < enemies.length; e++) drawEnemy(enemies[e]);
    if (boss) drawBoss();

    // enemy shots
    for (var s = 0; s < enemyShots.length; s++) {
      var es = enemyShots[s];
      ctx.fillStyle = C.pink;
      ctx.beginPath(); ctx.arc(es.x, es.y, es.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.cloud;
      ctx.beginPath(); ctx.arc(es.x, es.y, es.r * 0.45, 0, Math.PI * 2); ctx.fill();
      A.glow(ctx, es.x, es.y, 26, C.pink, 0.45);
    }

    // player bullets
    ctx.fillStyle = C.mint;
    for (var b = 0; b < bullets.length; b++) {
      ctx.fillRect(bullets[b].x - 2.5, bullets[b].y - 8, 5, 16);
      A.glow(ctx, bullets[b].x, bullets[b].y, 22, C.mint, 0.4);
    }

    // player
    if (state !== 'over' || lives > 0) {
      var blink = player.inv > 0 && Math.floor(clock * 14) % 2 === 0;
      if (!blink && (state === 'playing' || state === 'paused' || state === 'title')) {
        A.glow(ctx, player.x, player.y + 18, 46, C.butter, 0.25 + 0.1 * Math.sin(clock * 30));
        drawShip(player.x, player.y, 1, 0.5 + 0.5 * Math.sin(clock * 40));
        if (player.shield) {
          ctx.strokeStyle = C.cloud;
          ctx.globalAlpha = 0.65 + 0.25 * Math.sin(clock * 8);
          ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.arc(player.x, player.y, 27, 0, Math.PI * 2); ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }

    // sparks
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
      var pp = pops[q];
      ctx.globalAlpha = Math.min(1, pp.life * 2);
      ctx.fillStyle = C.butter;
      ctx.fillText(pp.text, pp.x, pp.y);
    }
    ctx.globalAlpha = 1;

    // power-up timers
    if (state === 'playing') {
      var ty = H - 20;
      ctx.textAlign = 'left';
      ctx.font = '600 13px "Instrument Sans", system-ui, sans-serif';
      if (player.rapid > 0) { ctx.fillStyle = C.butter; ctx.fillText('Rapid ' + Math.ceil(player.rapid) + 's', 12, ty); }
      if (player.triple > 0) { ctx.fillStyle = C.mint; ctx.fillText('Triple ' + Math.ceil(player.triple) + 's', 100, ty); }
    }

    // wave banner
    if (bannerTime > 0 && state === 'playing') {
      ctx.globalAlpha = Math.min(1, bannerTime, (2.2 - bannerTime) * 4 + 0.2);
      ctx.fillStyle = C.cloud;
      ctx.textAlign = 'center';
      ctx.font = '800 34px "Bricolage Grotesque", system-ui, sans-serif';
      ctx.fillText(bannerText, W / 2, H * 0.36);
      ctx.globalAlpha = 1;
    }
  }

  // ---------- boot ----------
  overlay.show(
    'Starfall',
    'Move with the arrow keys, the mouse or your finger. Fire with Space, a click or a tap.',
    'Start game',
    startGame,
    false
  );
  updatePauseButton();
  A.createLoop(update, render).start();
})();
