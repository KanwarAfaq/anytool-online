/* Shared helpers for the arcade games: storage, sound, canvas fitting,
   the game loop, keyboard input and the start / pause / game-over overlay. */
(function () {
  'use strict';

  var PREFIX = 'kanwar-arcade:';

  var store = {
    get: function (key, fallback) {
      try {
        var raw = window.localStorage.getItem(PREFIX + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set: function (key, value) {
      try {
        window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
      } catch (e) { /* storage unavailable: scores just won't persist */ }
    }
  };

  function media(query) {
    try { return window.matchMedia(query).matches; } catch (e) { return false; }
  }

  var util = {
    rand: function (a, b) { return a + Math.random() * (b - a); },
    clamp: function (v, a, b) { return Math.max(a, Math.min(b, v)); },
    lerp: function (a, b, t) { return a + (b - a) * t; },
    fmt: function (n) { return Math.round(n).toLocaleString('en-US'); },
    hit: function (ax, ay, ar, bx, by, br) {
      var dx = ax - bx, dy = ay - by, r = ar + br;
      return dx * dx + dy * dy <= r * r;
    },
    reduceMotion: media('(prefers-reduced-motion: reduce)'),
    coarsePointer: media('(pointer: coarse)')
  };

  /* ---------- Sound (tiny synth, no audio files) ---------- */

  var AudioCtx = window.AudioContext || window.webkitAudioContext;
  var audio = null;
  var muted = !!store.get('muted', false);

  function getAudio() {
    if (!AudioCtx) return null;
    if (!audio) {
      try { audio = new AudioCtx(); } catch (e) { return null; }
    }
    if (audio.state === 'suspended') audio.resume();
    return audio;
  }

  function tone(o) {
    if (muted) return;
    var a = getAudio();
    if (!a) return;
    var t0 = a.currentTime + (o.delay || 0);
    var osc = a.createOscillator();
    var gain = a.createGain();
    osc.type = o.type || 'square';
    osc.frequency.setValueAtTime(o.freq, t0);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.to), t0 + o.dur);
    gain.gain.setValueAtTime(o.vol || 0.05, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
    osc.connect(gain);
    gain.connect(a.destination);
    osc.start(t0);
    osc.stop(t0 + o.dur + 0.03);
  }

  function noise(o) {
    if (muted) return;
    var a = getAudio();
    if (!a) return;
    var len = Math.max(1, Math.floor(a.sampleRate * o.dur));
    var buffer = a.createBuffer(1, len, a.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = a.createBufferSource();
    var filter = a.createBiquadFilter();
    var gain = a.createGain();
    filter.type = 'lowpass';
    filter.frequency.value = o.freq || 1200;
    gain.gain.value = o.vol || 0.1;
    src.buffer = buffer;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(a.destination);
    src.start();
  }

  var sfx = {
    unlock: function () { getAudio(); },
    isMuted: function () { return muted; },
    setMuted: function (v) {
      muted = !!v;
      store.set('muted', muted);
      if (muted && window.Arcade && window.Arcade.music) window.Arcade.music.stop();
      else if (window.Arcade && window.Arcade.music) window.Arcade.music.resume();
    },

    shoot: function () { tone({ freq: 920, to: 380, dur: 0.07, vol: 0.022 }); },
    hit: function () { tone({ freq: 320, to: 160, dur: 0.07, vol: 0.04 }); },
    boom: function () {
      noise({ dur: 0.32, vol: 0.11, freq: 900 });
      tone({ type: 'sawtooth', freq: 130, to: 40, dur: 0.3, vol: 0.06 });
    },
    hurt: function () {
      noise({ dur: 0.55, vol: 0.16, freq: 700 });
      tone({ type: 'sawtooth', freq: 220, to: 50, dur: 0.5, vol: 0.08 });
    },
    power: function () {
      tone({ type: 'triangle', freq: 520, to: 1040, dur: 0.14, vol: 0.07 });
      tone({ type: 'triangle', freq: 780, to: 1560, dur: 0.16, vol: 0.06, delay: 0.1 });
    },
    start: function () {
      tone({ freq: 392, dur: 0.1, vol: 0.05 });
      tone({ freq: 523, dur: 0.1, vol: 0.05, delay: 0.1 });
      tone({ freq: 784, dur: 0.18, vol: 0.05, delay: 0.2 });
    },
    over: function () {
      tone({ freq: 392, to: 330, dur: 0.18, vol: 0.06 });
      tone({ freq: 294, to: 220, dur: 0.22, vol: 0.06, delay: 0.18 });
      tone({ freq: 196, to: 110, dur: 0.4, vol: 0.06, delay: 0.38 });
    },
    levelup: function () {
      [523, 659, 784, 1047].forEach(function (f, i) {
        tone({ freq: f, dur: 0.12, vol: 0.05, delay: i * 0.09 });
      });
    },
    paddle: function () { tone({ type: 'triangle', freq: 300, to: 220, dur: 0.07, vol: 0.09 }); },
    wall: function () { tone({ type: 'triangle', freq: 200, to: 170, dur: 0.04, vol: 0.05 }); },
    metal: function () { tone({ type: 'square', freq: 1200, to: 900, dur: 0.05, vol: 0.03 }); },
    brick: function (streak) {
      tone({ freq: 420 + Math.min(streak, 14) * 38, dur: 0.07, vol: 0.045 });
    }
  };

  /* ---------- Canvas fitting (crisp on high-DPI screens) ---------- */

  function fitCanvas(canvas, W, H) {
    var view = { W: W, H: H, k: 1 };

    function resize() {
      var rect = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = Math.max(1, Math.round(rect.width * dpr));
      var h = Math.round(w * H / W);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      view.k = canvas.width / W;
    }

    resize();
    if ('ResizeObserver' in window) {
      new ResizeObserver(resize).observe(canvas);
    } else {
      window.addEventListener('resize', resize);
    }

    view.toLogical = function (clientX, clientY) {
      var r = canvas.getBoundingClientRect();
      return { x: (clientX - r.left) / r.width * W, y: (clientY - r.top) / r.height * H };
    };
    return view;
  }

  /* ---------- Fixed-timestep loop ---------- */

  function createLoop(update, render) {
    var STEP = 1 / 60;
    var acc = 0, last = 0, running = false, raf = 0;

    function frame(ms) {
      if (!running) return;
      var now = ms / 1000;
      acc += Math.min(0.1, now - last);
      last = now;
      while (acc >= STEP) { update(STEP); acc -= STEP; }
      render();
      raf = window.requestAnimationFrame(frame);
    }

    return {
      start: function () {
        if (running) return;
        running = true;
        last = window.performance.now() / 1000;
        raf = window.requestAnimationFrame(frame);
      },
      stop: function () {
        running = false;
        window.cancelAnimationFrame(raf);
      }
    };
  }

  /* ---------- Keyboard ---------- */

  function keyboard(onPress) {
    var down = {};

    window.addEventListener('keydown', function (e) {
      var tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.code.indexOf('Arrow') === 0 || (e.code === 'Space' && tag !== 'BUTTON')) e.preventDefault();
      if (!e.repeat) {
        down[e.code] = true;
        if (onPress) onPress(e.code, e);
      }
    });
    window.addEventListener('keyup', function (e) { delete down[e.code]; });
    window.addEventListener('blur', function () { down = {}; });

    return {
      has: function () {
        for (var i = 0; i < arguments.length; i++) if (down[arguments[i]]) return true;
        return false;
      }
    };
  }

  /* ---------- UI bits ---------- */

  // Returns a setter that only touches the DOM when the value changes.
  function text(id) {
    var el = document.getElementById(id);
    var last = null;
    return function (value) {
      if (el && value !== last) {
        el.textContent = value;
        last = value;
      }
    };
  }

  // Draws a row of life pips and keeps the accessible label in sync.
  function pips(id, extraClass) {
    var el = document.getElementById(id);
    var last = -1;
    return function (n) {
      if (!el || n === last) return;
      last = n;
      var html = '';
      for (var i = 0; i < n; i++) html += '<span class="pip ' + (extraClass || '') + '"></span>';
      el.innerHTML = html;
      el.setAttribute('aria-label', n + (n === 1 ? ' life left' : ' lives left'));
    };
  }

  function overlay() {
    var root = document.getElementById('overlay');
    var title = document.getElementById('overlay-title');
    var body = document.getElementById('overlay-text');
    var btn = document.getElementById('overlay-btn');
    var handler = null;

    btn.addEventListener('click', function () { if (handler) handler(); });

    return {
      show: function (t, b, label, onClick, focus) {
        title.textContent = t;
        body.textContent = b;
        btn.textContent = label;
        handler = onClick;
        root.hidden = false;
        if (focus) window.setTimeout(function () { btn.focus({ preventScroll: true }); }, 0);
      },
      hide: function () { root.hidden = true; handler = null; },
      isVisible: function () { return !root.hidden; }
    };
  }

  function bindToggleButton(id, getLabel, getPressed, onClick) {
    var btn = document.getElementById(id);
    if (!btn) return { refresh: function () {} };
    function refresh() {
      btn.textContent = getLabel();
      btn.setAttribute('aria-pressed', String(getPressed()));
    }
    btn.addEventListener('click', function () {
      onClick();
      refresh();
      btn.blur(); // keep Space free for the game
    });
    refresh();
    return { refresh: refresh };
  }


  /* ---------- Light and effects ---------- */

  // '#RRGGBB' or '#RGB' + alpha -> 'rgba(...)'. Other colour strings pass through.
  function rgba(color, a) {
    if (typeof color === 'string' && color.charAt(0) === '#') {
      var h = color.slice(1);
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      var n = parseInt(h, 16);
      return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
    }
    return color;
  }

  // Soft additive halo: the basic building block of every light effect.
  function glow(ctx, x, y, r, color, alpha) {
    if (r <= 0 || alpha <= 0) return;
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, rgba(color, alpha));
    g.addColorStop(0.45, rgba(color, alpha * 0.35));
    g.addColorStop(1, rgba(color, 0));
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
  }

  // Shockwave rings and full-screen flashes. Both are skipped for reduced motion.
  function createFx() {
    var rings = [];
    var flashes = [];
    return {
      ring: function (x, y, color, maxR, dur) {
        if (util.reduceMotion) return;
        rings.push({ x: x, y: y, c: color, r: maxR || 80, t: 0, d: dur || 0.5 });
      },
      flash: function (color, alpha) {
        if (util.reduceMotion) return;
        flashes.push({ c: color, a: Math.min(alpha || 0.3, 0.6), t: 0, d: 0.35 });
      },
      clear: function () { rings.length = 0; flashes.length = 0; },
      update: function (dt) {
        var i;
        for (i = rings.length - 1; i >= 0; i--) { rings[i].t += dt; if (rings[i].t >= rings[i].d) rings.splice(i, 1); }
        for (i = flashes.length - 1; i >= 0; i--) { flashes[i].t += dt; if (flashes[i].t >= flashes[i].d) flashes.splice(i, 1); }
      },
      draw: function (ctx, W, H) {
        var i, k, o;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (i = 0; i < rings.length; i++) {
          o = rings[i];
          k = o.t / o.d;
          var rr = o.r * (1 - Math.pow(1 - k, 3));
          ctx.lineWidth = 2 + 5 * (1 - k);
          ctx.strokeStyle = rgba(o.c, 0.75 * (1 - k));
          ctx.beginPath();
          ctx.arc(o.x, o.y, rr, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
        for (i = 0; i < flashes.length; i++) {
          o = flashes[i];
          ctx.fillStyle = rgba(o.c, o.a * (1 - o.t / o.d));
          ctx.fillRect(0, 0, W, H);
        }
      }
    };
  }

  /* ---------- Background music (synthesised, looping, optional) ---------- */

  var THEMES = {
    starfall:   { bpm: 132, wave: 'sawtooth', root: 110, scale: [0, 3, 7, 10], pattern: [0, 2, 1, 3, 0, 2, 3, 1], bass: [0, 0, 3, 2] },
    'brick-rally': { bpm: 120, wave: 'square', root: 130.8, scale: [0, 4, 7, 9], pattern: [0, 1, 2, 1, 3, 2, 1, 0], bass: [0, 3, 2, 3] },
    serpentine: { bpm: 108, wave: 'triangle', root: 123.5, scale: [0, 2, 5, 7], pattern: [0, 1, 2, 3, 2, 1, 3, 2], bass: [0, 2, 0, 3] },
    lightmerge: { bpm: 96, wave: 'sine', root: 130.8, scale: [0, 4, 7, 11], pattern: [0, 1, 2, 3, 1, 2, 0, 3], bass: [0, 2, 3, 1] },
    driftrock:  { bpm: 118, wave: 'sawtooth', root: 98, scale: [0, 3, 5, 10], pattern: [0, 2, 3, 2, 1, 3, 2, 0], bass: [0, 0, 2, 3] },
    skyhop:     { bpm: 100, wave: 'sine', root: 146.8, scale: [0, 2, 4, 7], pattern: [0, 2, 3, 1, 2, 3, 1, 0], bass: [0, 0, 2, 3] }
  };

  var musicOn = !!store.get('music', true);
  var mus = { theme: null, timer: 0, step: 0, next: 0, paused: false, gain: null };

  function semi(root, n) { return root * Math.pow(2, n / 12); }

  function musicNote(a, t, freq, dur, wave, vol) {
    var osc = a.createOscillator();
    var g = a.createGain();
    osc.type = wave;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(mus.gain);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  function musicTick() {
    var a = audio;
    var th = THEMES[mus.theme];
    if (!a || !th || mus.paused) return;
    var beat = 60 / th.bpm / 2;
    while (mus.next < a.currentTime + 0.25) {
      var i = mus.step;
      var note = th.scale[th.pattern[i % th.pattern.length]] + (i % 16 >= 8 ? 12 : 0);
      musicNote(a, mus.next, semi(th.root * 2, note), beat * 1.6, th.wave, 0.05);
      if (i % 4 === 0) {
        var b = th.scale[th.bass[(i / 4) % th.bass.length | 0]];
        musicNote(a, mus.next, semi(th.root / 2, b), beat * 3.6, 'triangle', 0.09);
      }
      mus.next += beat;
      mus.step++;
    }
  }

  var music = {
    isEnabled: function () { return musicOn; },
    setEnabled: function (v) {
      musicOn = !!v;
      store.set('music', musicOn);
      if (!musicOn) music.stop();
      else if (mus.theme && !mus.timer) music.play(mus.theme);
    },
    play: function (theme) {
      mus.theme = theme;
      if (!musicOn || muted) return;
      var a = getAudio();
      if (!a || !THEMES[theme]) return;
      window.clearInterval(mus.timer);
      if (!mus.gain) { mus.gain = a.createGain(); mus.gain.connect(a.destination); }
      mus.gain.gain.value = 0.5;
      mus.paused = false;
      mus.step = 0;
      mus.next = a.currentTime + 0.1;
      mus.timer = window.setInterval(musicTick, 80);
    },
    stop: function () {
      window.clearInterval(mus.timer);
      mus.timer = 0;
    },
    pause: function () { mus.paused = true; },
    resume: function () {
      if (!mus.theme || !musicOn || muted) return;
      if (!mus.timer) { music.play(mus.theme); return; }
      mus.paused = false;
      if (audio) mus.next = Math.max(mus.next, audio.currentTime + 0.05);
    }
  };

  // Wires the music and fullscreen buttons in the game toolbar, plus the N key.
  function tools() {
    var cabinet = document.querySelector('.cabinet');
    var musicBtn = bindToggleButton('btn-music',
      function () { return musicOn ? 'Music on' : 'Music off'; },
      function () { return musicOn; },
      function () { music.setEnabled(!musicOn); });
    var fullBtn = document.getElementById('btn-full');
    var canFull = cabinet && (cabinet.requestFullscreen || cabinet.webkitRequestFullscreen);
    function toggleFull() {
      if (!canFull) return;
      var on = document.fullscreenElement || document.webkitFullscreenElement;
      if (on) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      else (cabinet.requestFullscreen || cabinet.webkitRequestFullscreen).call(cabinet);
    }
    if (fullBtn) {
      if (!canFull) fullBtn.hidden = true;
      fullBtn.addEventListener('click', function () { toggleFull(); fullBtn.blur(); });
    }
    window.addEventListener('keydown', function (e) {
      var tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      if (e.code === 'KeyN') { music.setEnabled(!musicOn); musicBtn.refresh(); }
    });
    return { refreshMusic: musicBtn.refresh };
  }

  window.Arcade = {
    store: store,
    util: util,
    sfx: sfx,
    fitCanvas: fitCanvas,
    createLoop: createLoop,
    keyboard: keyboard,
    text: text,
    pips: pips,
    overlay: overlay,
    bindToggleButton: bindToggleButton,
    rgba: rgba,
    glow: glow,
    createFx: createFx,
    music: music,
    tools: tools
  };
})();
