/* فارس آل فهيد — portfolio behavior. Zero dependencies.
   Rules: content works without JS; every animation gated by prefers-reduced-motion;
   Arabic-Indic numerals in AR; canvas field draws faithful Najdi motifs (exact paths),
   sparse, hero-only, paused offscreen. */
(function () {
  'use strict';
  var html = document.documentElement;
  html.classList.remove('no-js');
  html.classList.add('js');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- language toggle with crenellation wipe ---------- */
  var LANG_KEY = 'faris-lang';
  var wipe = document.getElementById('wipe');
  function applyLang(lang) {
    if (lang === 'en') {
      html.classList.add('en');
      html.setAttribute('lang', 'en');
      html.setAttribute('dir', 'ltr');
    } else {
      html.classList.remove('en');
      html.setAttribute('lang', 'ar');
      html.setAttribute('dir', 'rtl');
    }
    document.querySelectorAll('.lang-btn').forEach(function (b) {
      b.textContent = lang === 'en' ? 'عربي' : 'EN';
      b.setAttribute('aria-label', lang === 'en' ? 'التبديل إلى العربية' : 'Switch to English');
    });
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
  }
  function switchLang() {
    var next = html.classList.contains('en') ? 'ar' : 'en';
    if (reduced || !wipe) { applyLang(next); return; }
    // the AR⇄EN moment: an ink pane with a Najdi crenellated edge sweeps across
    wipe.style.transform = 'translateX(101%)';
    wipe.classList.remove('run');
    void wipe.offsetWidth;
    wipe.classList.add('run');
    wipe.style.transform = 'translateX(0)';
    setTimeout(function () {
      applyLang(next);
      wipe.style.transform = 'translateX(-101%)';
      setTimeout(function () {
        wipe.classList.remove('run');
        wipe.style.transform = 'translateX(101%)';
      }, 480);
    }, 470);
  }
  document.querySelectorAll('.lang-btn').forEach(function (b) {
    b.addEventListener('click', switchLang);
  });
  try {
    if (localStorage.getItem(LANG_KEY) === 'en') applyLang('en');
  } catch (e) {}

  /* ---------- header state + progress ---------- */
  var top = document.querySelector('.top');
  var prog = document.querySelector('.progress');
  function onScroll() {
    var y = window.scrollY;
    if (top) top.classList.toggle('scrolled', y > 30);
    if (prog) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- reveal on scroll ---------- */
  var rvs = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
    rvs.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 70 + 'ms';
      io.observe(el);
    });
  } else {
    rvs.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- count-up numbers (Arabic-Indic in AR) ---------- */
  function toDigits(n) {
    var s = String(n);
    if (html.getAttribute('lang') === 'ar') {
      return s.replace(/\d/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'[d]; });
    }
    return s;
  }
  function renderCount(el, val) {
    el.textContent = toDigits(val);
  }
  var counters = document.querySelectorAll('[data-count]');
  function runCount(el) {
    var target = parseInt(el.dataset.count, 10);
    var t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1300, 1);
      renderCount(el, Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  counters.forEach(function (c) { renderCount(c, c.dataset.count); });
  if ('IntersectionObserver' in window && !reduced) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.25, rootMargin: '0px 0px -8% 0px' });
    counters.forEach(function (c) { cio.observe(c); });
  }
  // re-render final values when language flips (digits differ)
  document.querySelectorAll('.lang-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      setTimeout(function () {
        counters.forEach(function (c) { renderCount(c, c.dataset.count); });
      }, reduced ? 30 : 520);
    });
  });

  /* ---------- hero entrance ---------- */
  setTimeout(function () { html.classList.add('hero-go'); }, 120);

  /* ---------- Najdi field (restored, lightened): site-wide, motifs + faint constellation,
     scroll-flow, mouse-aware, paused when hidden, off under reduced-motion ---------- */
  (function field() {
    if (reduced) return;
    var host = document.createElement('div');
    host.className = 'njfield';
    host.setAttribute('aria-hidden', 'true');
    document.body.appendChild(host);
    var canvas = document.createElement('canvas');
    host.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    // Exact motif paths (1:1 from the approved Najdi asset set — do not alter proportions)
    var shapes = [
      { p: new Path2D('M69.66,61.53c13.55,10.96,22.34,24.33,21.18,42.69-17.18-7.21-25.91-19.79-30.86-38.5-3.76,18.21-11.76,29.41-28.34,39.56,18.71,10.53,39.75,10.76,59.96-1.36,14.51-8.71,27.82-25.64,27.71-47-17.51,9.74-32.88,10-49.65,4.62Z M50.33,51.36c-13.63-10.43-23.17-23.77-21.56-42.6,17.99,7.4,25.87,20.09,30.97,38.88,3.72-19.58,12.79-31.18,28.81-40.25-20.62-10.33-40.64-9.86-60.24,1.47C13.87,17.22.35,33.29.02,55.83c16.55-9.09,32.88-10.08,50.32-4.47Z M50.37,62.13c-19.98,5.13-34.45,3.6-50.37-4.81.99,21.41,11.31,37.34,29.73,47.27-.29-19.1,7.68-32.24,20.64-42.46Z M69.02,51.4c17.64-5.91,32.6-5.1,50.37,4.13-.64-21.65-11.61-36.45-29.14-47.43-.86,19.72-7.91,31.88-21.23,43.3Z'), ox: -60, oy: -56 },
      { p: new Path2D('M .11 70.22 L 18.64 93.23 L 0 116.52 L 37.66 116.48 L 19.01 93.43 L 37.51 70.21 Z M .16 .07 L 18.69 29.83 L 37.42 0 Z M 34.42 48.22 a 15.61 15.61 0 1 0 -31.22 0 a 15.61 15.61 0 1 0 31.22 0 Z'), ox: -19, oy: -58 },
      { p: new Path2D('M129.61,47.92l-23.06.1c-1.48,0-2.9-1.08-2.93-2.68l-.39-21.46-25.58-.37-.61-23.5-24.47.22-.33,23.31-25.59.36-.87,23.81-25.78.41.2,22.31,129.42.06v-22.57Z'), ox: -65, oy: -35 }
    ];
    var W, H, parts = [], running = false, raf = null;
    var mouse = { x: undefined, y: undefined };
    var lastY = window.scrollY;
    window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    window.addEventListener('mouseout', function () { mouse.x = undefined; mouse.y = undefined; });
    function resize() {
      var dpi = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpi; canvas.height = H * dpi;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpi, 0, 0, dpi, 0, 0);
    }
    function init() {
      parts = [];
      var count = W < 760 ? 14 : 30;
      for (var i = 0; i < count; i++) {
        parts.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
          s: shapes[i % shapes.length],
          sc: Math.random() * 0.24 + 0.13,
          a: Math.random() * Math.PI * 2,
          sp: (Math.random() - 0.5) * 0.004
        });
      }
    }
    // the field flows with the scroll — the page feels alive under your hand
    window.addEventListener('scroll', function () {
      var dy = window.scrollY - lastY;
      lastY = window.scrollY;
      for (var i = 0; i < parts.length; i++) {
        parts[i].y -= dy * 0.16;
        if (parts[i].y < -90) parts[i].y = H + 60;
        if (parts[i].y > H + 90) parts[i].y = -60;
      }
    }, { passive: true });
    function draw() {
      ctx.clearRect(0, 0, W, H);
      // faint constellation between nearby motifs
      for (var i = 0; i < parts.length; i++) {
        for (var j = i + 1; j < parts.length; j++) {
          var dx = parts[i].x - parts[j].x, dyy = parts[i].y - parts[j].y;
          var d2 = dx * dx + dyy * dyy;
          if (d2 < 16900) {
            var al = 0.05 * (1 - Math.sqrt(d2) / 130);
            ctx.strokeStyle = 'rgba(19,32,57,' + al.toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(parts[i].x, parts[i].y); ctx.lineTo(parts[j].x, parts[j].y); ctx.stroke();
          }
        }
      }
      for (var k = 0; k < parts.length; k++) {
        var pt = parts[k];
        pt.x += pt.vx; pt.y += pt.vy; pt.a += pt.sp;
        if (pt.x < -90) pt.x = W + 60; if (pt.x > W + 90) pt.x = -60;
        if (pt.y < -90) pt.y = H + 60; if (pt.y > H + 90) pt.y = -60;
        var hovered = false;
        if (mouse.x !== undefined) {
          var mdx = pt.x - mouse.x, mdy = pt.y - mouse.y;
          hovered = (mdx * mdx + mdy * mdy) < 12100; // 110px — the page notices you
        }
        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.scale(pt.sc, pt.sc);
        ctx.rotate(pt.a);
        ctx.translate(pt.s.ox, pt.s.oy);
        ctx.fillStyle = hovered ? 'rgba(46,159,194,0.5)' : 'rgba(19,32,57,0.085)';
        ctx.fill(pt.s.p);
        ctx.restore();
      }
      if (running) raf = requestAnimationFrame(draw);
    }
    function start() { if (!running) { running = true; raf = requestAnimationFrame(draw); } }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); }
    resize(); init(); start();
    window.addEventListener('resize', function () { resize(); init(); }, { passive: true });
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start();
    });
  })();

  /* ---------- najdi cursor follower (restored): velocity-driven, fine pointers only ---------- */
  (function cursor() {
    if (reduced || !finePointer) return;
    var cur = document.createElement('div');
    cur.className = 'najdi-cursor hide';
    cur.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cur);
    var mx = -100, my = -100, cx = -100, cy = -100, ang = 0, lastX = -100, lastYc = -100;
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      cur.classList.remove('hide');
    }, { passive: true });
    document.addEventListener('mouseleave', function () { cur.classList.add('hide'); });
    document.addEventListener('mouseover', function (e) {
      cur.classList.toggle('grow', !!e.target.closest('a,button,.shot'));
    });
    (function loop() {
      cx += (mx - cx) * 0.14; cy += (my - cy) * 0.14;
      var v = Math.abs(mx - lastX) + Math.abs(my - lastYc);
      lastX = mx; lastYc = my;
      ang += 0.3 + Math.min(v * 0.12, 5); // spins with your movement
      cur.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px) rotate(' + ang.toFixed(1) + 'deg)';
      requestAnimationFrame(loop);
    })();
  })();

  /* ---------- hero headline: word-by-word entrance ---------- */
  (function words() {
    if (reduced) return;
    document.querySelectorAll('.hero h1 > span').forEach(function (block) {
      var d = 0;
      Array.prototype.slice.call(block.childNodes).forEach(function (node) {
        var isEm = node.nodeType === 1 && node.tagName === 'EM';
        if (node.nodeType !== 3 && !isEm) return;
        var text = node.textContent;
        var frag = document.createDocumentFragment();
        text.split(/(\s+)/).forEach(function (w) {
          if (/^\s*$/.test(w)) { frag.appendChild(document.createTextNode(w)); return; }
          var sp = document.createElement('span');
          sp.className = 'w';
          sp.textContent = w;
          sp.style.transitionDelay = (d * 95) + 'ms'; d++;
          frag.appendChild(sp);
        });
        if (isEm) { node.textContent = ''; node.appendChild(frag); }
        else block.replaceChild(frag, node);
      });
    });
  })();

  /* ---------- story thread fills as the story is read ---------- */
  (function thread() {
    var th = document.querySelector('.thread');
    if (!th || reduced) return;
    var wrap = th.parentElement;
    function upd() {
      var r = wrap.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.7 - r.top) / r.height));
      th.style.setProperty('--tp', p.toFixed(3));
    }
    window.addEventListener('scroll', upd, { passive: true });
    upd();
  })();

  /* ---------- acts wake as they enter ---------- */
  if ('IntersectionObserver' in window) {
    var aio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { en.target.classList.toggle('on', en.isIntersecting); });
    }, { threshold: 0.25 });
    document.querySelectorAll('.act').forEach(function (a) { aio.observe(a); });
  }

  /* ---------- lightbox (focus-trapped, keyboard, swipe) ---------- */
  var lb = document.getElementById('lb');
  if (lb) {
    var lbImg = lb.querySelector('img');
    var lbCap = lb.querySelector('.cap');
    var items = [];
    var current = 0, lastFocus = null;
    document.querySelectorAll('button.shot, .figrow button').forEach(function (el) {
      var img = el.querySelector('img');
      if (!img) return;
      var idx = items.length;
      var fig = el.closest('figure');
      var capEl = fig ? fig.querySelector('figcaption') : el.querySelector('.sc');
      items.push({
        src: el.dataset.full || img.currentSrc || img.src,
        ar: capEl ? (capEl.querySelector('.lang-ar') || capEl).textContent.trim() : (img.alt || ''),
        en: capEl ? (capEl.querySelector('.lang-en') || capEl).textContent.trim() : (img.alt || ''),
        alt: img.alt || ''
      });
      el.addEventListener('click', function () { open(idx); });
    });
    function caption(it) {
      return html.classList.contains('en') ? (it.en || it.alt) : (it.ar || it.alt);
    }
    function open(i) {
      current = (i + items.length) % items.length;
      lbImg.src = items[current].src;
      lbImg.alt = items[current].alt;
      lbCap.textContent = caption(items[current]);
      lastFocus = document.activeElement;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
      lb.querySelector('.x').focus();
    }
    function close() {
      lb.classList.remove('open');
      lbImg.src = '';
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }
    lb.querySelector('.x').addEventListener('click', close);
    lb.querySelector('.nx').addEventListener('click', function () { open(current + 1); });
    lb.querySelector('.pv').addEventListener('click', function () { open(current - 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') open(current + 1);
      else if (e.key === 'ArrowLeft') open(current - 1);
      else if (e.key === 'Tab') {
        // focus trap across the three buttons
        var f = lb.querySelectorAll('button');
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    var tx = null;
    lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (tx === null) return;
      var dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 48) open(current + (dx < 0 ? 1 : -1));
      tx = null;
    }, { passive: true });
  }

  /* ---------- UGC videos: tap to play/pause, wired posters ---------- */
  document.querySelectorAll('.ugc figure').forEach(function (f) {
    var v = f.querySelector('video');
    var badge = f.querySelector('.play');
    if (!v) return;
    function toggle() {
      if (v.paused) { v.play(); if (badge) badge.textContent = '❚❚'; }
      else { v.pause(); if (badge) badge.textContent = '▶'; }
    }
    v.addEventListener('click', toggle);
    if (badge) badge.addEventListener('click', toggle);
    v.addEventListener('ended', function () { if (badge) badge.textContent = '▶'; });
  });

  /* ---------- to top ---------- */
  document.querySelectorAll('.totop').forEach(function (b) {
    b.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
  });
})();
