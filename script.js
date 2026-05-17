/* =====================================================
   Faris Alfuhayd — Portfolio · v2
   Najdi pattern motion logic
   ===================================================== */

(function() {
  'use strict';

  /* ---------- Door reveal on first load ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    const door = document.querySelector('.door-reveal');
    if (door) {
      setTimeout(() => door.classList.add('open'), 1200);
      setTimeout(() => door.remove(), 3000);
    }
  });

  /* ---------- Language toggle ---------- */
  function setLanguage(lang) {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('faris-lang', lang);
    const btn = document.querySelector('.lang-toggle');
    if (btn) btn.textContent = lang === 'ar' ? 'EN' : 'ع';
  }

  const savedLang = localStorage.getItem('faris-lang') || 'ar';
  setLanguage(savedLang);

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.lang-toggle');
    if (btn) {
      const next = document.documentElement.lang === 'ar' ? 'en' : 'ar';
      setLanguage(next);
    }
  });

  /* ---------- Sticky nav background ---------- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Scroll reveals via IntersectionObserver ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        if (e.target.classList.contains('count-on-scroll')) startCount(e.target);
        if (e.target.classList.contains('stat')) e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.reveal, .reveal-stagger, .count-on-scroll, .mask-reveal, .crown-step, .rosette-border, .stat').forEach((el) => io.observe(el));

  /* ---------- Number counter with pulse at end ---------- */
  function startCount(el) {
    const target = parseFloat(el.dataset.target || el.textContent);
    const suffix = el.dataset.suffix || '';
    const duration = 2000;
    const start = performance.now();
    const useArabicNumerals = document.documentElement.lang === 'ar';
    const toArabic = (n) => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
    const statParent = el.closest('.stat');

    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      const val = Math.floor(target * eased);
      el.textContent = (useArabicNumerals ? toArabic(val) : val) + suffix;
      if (t < 1) requestAnimationFrame(frame);
      else {
        el.textContent = (useArabicNumerals ? toArabic(target) : target) + suffix;
        if (statParent) {
          statParent.classList.add('pulse');
          setTimeout(() => statParent.classList.remove('pulse'), 400);
        }
      }
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Custom cursor ---------- */
  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.className = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;
  let dx = mx, dy = my;

  document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });

  function animateCursor() {
    dx += (mx - dx) * 0.55;
    dy += (my - dy) * 0.55;
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, .pillar, .brand-card, .case-img, .cred-pill, .lang-toggle, .stat')) {
      document.body.classList.add('cursor-hover');
    }
  });
  document.addEventListener('mouseout', () => document.body.classList.remove('cursor-hover'));

  /* ---------- Click ripple (Najdi rosette burst) ---------- */
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (target.closest('.lang-toggle, .nav-links a, .nav-logo')) return;
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    ripple.innerHTML = `<svg viewBox="0 0 60 60" fill="none" stroke="#31A2C4" stroke-width="1.5">
      <circle cx="30" cy="30" r="28"/>
      <circle cx="30" cy="30" r="18"/>
      <circle cx="30" cy="30" r="8"/>
      <circle cx="30" cy="6" r="2" fill="#31A2C4"/>
      <circle cx="30" cy="54" r="2" fill="#31A2C4"/>
      <circle cx="6" cy="30" r="2" fill="#31A2C4"/>
      <circle cx="54" cy="30" r="2" fill="#31A2C4"/>
    </svg>`;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 800);
  });

  /* ---------- Hero word stagger ---------- */
  document.querySelectorAll('.hero-title').forEach((title) => {
    title.querySelectorAll('[data-lang]').forEach((langBlock) => {
      const txt = langBlock.textContent.trim();
      const words = txt.split(/\s+/);
      langBlock.innerHTML = words.map((w, i) => {
        return `<span class="word" style="animation-delay:${1.0 + i * 0.09}s">${w}</span>`;
      }).join(' ');
    });
  });

  /* ---------- Smooth-scroll for anchor links ---------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (a) {
      const id = a.getAttribute('href').slice(1);
      const tgt = document.getElementById(id);
      if (tgt) {
        e.preventDefault();
        tgt.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });

  /* ---------- Current page active nav link ---------- */
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ---------- Magnetic hover on pillars / cards ---------- */
  document.querySelectorAll('.pillar, .brand-card').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      el.style.transform = `translateY(-8px) translate(${x * 6}px, ${y * 4}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });

})();
