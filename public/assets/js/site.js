/* Site-wide behaviour: mobile game-library drawer and saved best scores. */
(function () {
  'use strict';

  var body = document.body;
  var toggle = document.querySelector('.menu-toggle');
  var scrim = document.querySelector('.scrim');

  function setOpen(open) {
    body.classList.toggle('sidebar-open', open);
    if (toggle) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close game library' : 'Open game library');
    }
    if (scrim) scrim.hidden = !open;
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setOpen(!body.classList.contains('sidebar-open'));
    });
  }
  if (scrim) scrim.addEventListener('click', function () { setOpen(false); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && body.classList.contains('sidebar-open')) {
      setOpen(false);
      if (toggle) toggle.focus();
    }
  });

  try {
    window.matchMedia('(min-width: 900px)').addEventListener('change', function (e) {
      if (e.matches) setOpen(false);
    });
  } catch (err) { /* older browsers: the drawer simply stays as it is */ }

  // Best scores are written by the games into localStorage.
  function readBest(id) {
    try {
      var key = id === 'aether-run' ? 'arcade-aether-best' : id === 'moonlit-grove' ? 'arcade-grove-best' : 'kanwar-arcade:best:' + id;
      var v = JSON.parse(window.localStorage.getItem(key));
      return typeof v === 'number' ? v : 0;
    } catch (err) {
      return 0;
    }
  }

  function showBest() {
    var nodes = document.querySelectorAll('[data-best]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var value = readBest(el.getAttribute('data-best'));
      var prefix = el.getAttribute('data-prefix') || 'Best ';
      el.textContent = value > 0 ? prefix + value.toLocaleString('en-US') : 'No score yet';
    }
  }

  showBest();
  window.addEventListener('storage', showBest);
  window.addEventListener('pageshow', showBest);

  // ---------- Light that follows the pointer (hero and game cards) ----------
  var finePointer = false;
  var reduceMotion = false;
  try {
    finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (err) { /* keep the defaults */ }

  function trackLight(el) {
    var raf = 0, x = 0, y = 0;
    el.addEventListener('pointermove', function (e) {
      x = e.clientX;
      y = e.clientY;
      if (raf) return;
      raf = window.requestAnimationFrame(function () {
        raf = 0;
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (x - r.left) + 'px');
        el.style.setProperty('--my', (y - r.top) + 'px');
      });
    });
  }
  if (finePointer && !reduceMotion) {
    var lit = document.querySelectorAll('.hero, .game-card');
    for (var l = 0; l < lit.length; l++) trackLight(lit[l]);
  }

  // ---------- Game cards pop in once as they scroll into view ----------
  var cards = document.querySelectorAll('.game-grid .game-card');
  if ('IntersectionObserver' in window && !reduceMotion && cards.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    for (var c = 0; c < cards.length; c++) {
      cards[c].classList.add('reveal');
      cards[c].style.setProperty('--d', (c % 2) * 0.12 + 's');
      io.observe(cards[c]);
    }
  }

  // ---------- Offline support ----------
  if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
    window.addEventListener('load', function () {
      Promise.resolve().catch(function () { /* offline mode is optional */ });
    });
  }
})();
