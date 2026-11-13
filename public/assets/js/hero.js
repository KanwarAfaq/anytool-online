/* Home page hero: a self-playing Brick Rally "attract mode" screen.
   Pauses when off screen or when the tab is hidden, and shows a still frame
   for visitors who prefer reduced motion. */
(function () {
  'use strict';

  var canvas = document.getElementById('hero-canvas');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');

  var W = 560, H = 420;
  var COLS = 9, ROWS = 5, BW = 52, BH = 20, GAP = 6;
  var OX = (W - (COLS * BW + (COLS - 1) * GAP)) / 2, OY = 36;
  var COLORS = ['#FF6FC4', '#FFD23F', '#FFD23F', '#52F0B8', '#52F0B8'];

  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* ignore */ }

  var bricks, ball, pad, sparks, clock = 0;

  function resize() {
    var rect = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(1, Math.round(rect.width * dpr));
    var h = Math.round(w * H / W);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  }

  function build() {
    bricks = [];
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        if (Math.random() < 0.07) continue;
        bricks.push({ x: OX + c * (BW + GAP), y: OY + r * (BH + GAP), color: COLORS[r], flash: 0 });
      }
    }
  }

  function serve() {
    var a = (Math.random() - 0.5) * 0.9;
    ball = { x: pad.x, y: pad.y - 30, dx: Math.sin(a), dy: -Math.cos(a), r: 7, speed: 300, trail: [] };
  }

  function init() {
    pad = { x: W / 2, y: H - 34, w: 96, h: 14 };
    sparks = [];
    build();
    serve();
  }

  function burst(x, y, color) {
    for (var i = 0; i < 8; i++) {
      var a = Math.random() * Math.PI * 2, v = 60 + Math.random() * 150;
      sparks.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 30, life: 0.6, color: color });
    }
  }

  function step(dt) {
    clock += dt;

    // the paddle lags behind the ball a little so it looks like a person
    var goal = ball.x + Math.sin(clock * 0.8) * 26;
    pad.x += (goal - pad.x) * Math.min(1, dt * 7);
    pad.x = Math.max(pad.w / 2, Math.min(W - pad.w / 2, pad.x));

    var dist = ball.speed * dt;
    var n = Math.max(1, Math.ceil(dist / 4));
    for (var i = 0; i < n; i++) {
      ball.x += ball.dx * dist / n;
      ball.y += ball.dy * dist / n;

      if (ball.x < ball.r) { ball.x = ball.r; ball.dx = Math.abs(ball.dx); }
      if (ball.x > W - ball.r) { ball.x = W - ball.r; ball.dx = -Math.abs(ball.dx); }
      if (ball.y < ball.r) { ball.y = ball.r; ball.dy = Math.abs(ball.dy); }

      var top = pad.y - pad.h / 2;
      if (ball.dy > 0 && ball.y + ball.r >= top && ball.y - ball.r <= pad.y + pad.h / 2 &&
          Math.abs(ball.x - pad.x) <= pad.w / 2 + ball.r * 0.6) {
        var off = Math.max(-1, Math.min(1, (ball.x - pad.x) / (pad.w / 2)));
        ball.dx = Math.sin(off * 1.0);
        ball.dy = -Math.cos(off * 1.0);
        ball.y = top - ball.r;
      }

      for (var b = 0; b < bricks.length; b++) {
        var br = bricks[b];
        var cx = Math.max(br.x, Math.min(ball.x, br.x + BW));
        var cy = Math.max(br.y, Math.min(ball.y, br.y + BH));
        var ddx = ball.x - cx, ddy = ball.y - cy;
        if (ddx * ddx + ddy * ddy <= ball.r * ball.r) {
          if (Math.abs(ddx) > Math.abs(ddy)) ball.dx = Math.abs(ball.dx) * (ddx > 0 ? 1 : -1);
          else ball.dy = Math.abs(ball.dy) * (ddy > 0 ? 1 : -1);
          if (Math.abs(ball.dy) < 0.25) { ball.dy = (ball.dy < 0 ? -1 : 1) * 0.25; ball.dx = (ball.dx < 0 ? -1 : 1) * 0.968; }
          burst(br.x + BW / 2, br.y + BH / 2, br.color);
          bricks.splice(b, 1);
          break;
        }
      }

      if (ball.y - ball.r > H) serve();
    }

    if (bricks.length === 0) build();

    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > 8) ball.trail.shift();

    for (var s = sparks.length - 1; s >= 0; s--) {
      var p = sparks[s];
      p.life -= dt;
      if (p.life <= 0) { sparks.splice(s, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 360 * dt;
    }
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

  function draw() {
    var k = canvas.width / W;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.fillStyle = '#1B1C9E';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgba(244,242,255,0.07)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (var x = 40; x < W; x += 40) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (var y = 40; y < H; y += 40) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();

    for (var i = 0; i < bricks.length; i++) {
      var b = bricks[i];
      ctx.fillStyle = b.color;
      rr(b.x, b.y, BW, BH, 5); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(b.x + 4, b.y + 3, BW - 8, 3);
      ctx.fillStyle = 'rgba(14,11,46,0.28)';
      ctx.fillRect(b.x + 3, b.y + BH - 5, BW - 6, 3);
    }

    ctx.fillStyle = '#0E0B2E';
    rr(pad.x - pad.w / 2 - 3, pad.y - pad.h / 2 - 3, pad.w + 6, pad.h + 6, 10); ctx.fill();
    ctx.fillStyle = '#FFD23F';
    rr(pad.x - pad.w / 2, pad.y - pad.h / 2, pad.w, pad.h, 7); ctx.fill();
    ctx.fillStyle = '#52F0B8';
    rr(pad.x - pad.w / 2, pad.y - pad.h / 2, 12, pad.h, 6); ctx.fill();
    rr(pad.x + pad.w / 2 - 12, pad.y - pad.h / 2, 12, pad.h, 6); ctx.fill();

    for (var t = 0; t < ball.trail.length; t++) {
      var f = (t + 1) / ball.trail.length;
      ctx.globalAlpha = f * 0.35;
      ctx.fillStyle = '#F4F2FF';
      ctx.beginPath(); ctx.arc(ball.trail[t].x, ball.trail[t].y, ball.r * f, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#0E0B2E';
    ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r + 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#F4F2FF';
    ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill();

    for (var s = 0; s < sparks.length; s++) {
      ctx.globalAlpha = Math.max(0, sparks[s].life / 0.6);
      ctx.fillStyle = sparks[s].color;
      ctx.fillRect(sparks[s].x - 2, sparks[s].y - 2, 4, 4);
    }
    ctx.globalAlpha = 1;
  }

  resize();
  init();

  if (reduce) {
    // Show one still frame: simulate a couple of seconds so some bricks are gone.
    for (var i = 0; i < 150; i++) step(1 / 60);
    sparks = [];
    draw();
    window.addEventListener('resize', function () { resize(); draw(); });
    return;
  }

  var running = false, visible = true, raf = 0, last = 0, acc = 0;

  function frame(ms) {
    if (!running) return;
    var now = ms / 1000;
    acc += Math.min(0.1, now - last);
    last = now;
    while (acc >= 1 / 60) { step(1 / 60); acc -= 1 / 60; }
    draw();
    raf = window.requestAnimationFrame(frame);
  }

  function sync() {
    var shouldRun = visible && !document.hidden;
    if (shouldRun && !running) {
      running = true;
      last = window.performance.now() / 1000;
      raf = window.requestAnimationFrame(frame);
    } else if (!shouldRun && running) {
      running = false;
      window.cancelAnimationFrame(raf);
    }
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      sync();
    }).observe(canvas);
  }
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
  document.addEventListener('visibilitychange', sync);
  sync();
})();
