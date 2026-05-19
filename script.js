/* =====================================================
   Faris Al Fuhayd · Portfolio · v11
   ===================================================== */

/* Custom Najdi-shape constellation — Faris's drifting SVG patterns.
   Each particle is one of his 6 SVG shapes, rotating + drifting.
   Mouse repels them. Nearby shapes light turquoise. Lines connect close drift. */
(function() {
  const canvas = document.createElement('canvas');
  canvas.className = 'particle-canvas';
  canvas.id = 'customSvgCanvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let mouse = { x: null, y: null, radius: 140 };

  window.addEventListener('mousemove', (e) => { mouse.x = e.x; mouse.y = e.y; });
  window.addEventListener('mouseout', () => { mouse.x = undefined; mouse.y = undefined; });

  function resize() {
    const dpi = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpi;
    canvas.height = height * dpi;
    ctx.setTransform(dpi, 0, 0, dpi, 0, 0);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    init();
  }
  window.addEventListener('resize', resize);

  const customShapes = [
    { path: new Path2D("M69.66,61.53c13.55,10.96,22.34,24.33,21.18,42.69-17.18-7.21-25.91-19.79-30.86-38.5-3.76,18.21-11.76,29.41-28.34,39.56,18.71,10.53,39.75,10.76,59.96-1.36,14.51-8.71,27.82-25.64,27.71-47-17.51,9.74-32.88,10-49.65,4.62Z M50.33,51.36c-13.63-10.43-23.17-23.77-21.56-42.6,17.99,7.4,25.87,20.09,30.97,38.88,3.72-19.58,12.79-31.18,28.81-40.25-20.62-10.33-40.64-9.86-60.24,1.47C13.87,17.22.35,33.29.02,55.83c16.55-9.09,32.88-10.08,50.32-4.47Z M50.37,62.13c-19.98,5.13-34.45,3.6-50.37-4.81.99,21.41,11.31,37.34,29.73,47.27-.29-19.1,7.68-32.24,20.64-42.46Z M69.02,51.4c17.64-5.91,32.6-5.1,50.37,4.13-.64-21.65-11.61-36.45-29.14-47.43-.86,19.72-7.91,31.88-21.23,43.3Z"), offsetX: -60, offsetY: -56 },
    { path: new Path2D("M70.73,0L0,70.87l71.11,70.97,70.73-70.87L70.73,0ZM70.69,116.85c-25.49,0-46.15-20.66-46.15-46.15s20.66-46.15,46.15-46.15,46.15,20.66,46.15,46.15-20.66,46.15-46.15,46.15Z M70.56,76.26c-1.85,13.91-8.92,23.96-20.17,29.29l-1.08-1.13c-.32-11.56,5.08-21.67,14.84-29.5-12,3.6-23.39,3.87-34.34-3.85,10.72-7.68,23.54-8.12,35.96-2.94-9.92-8.15-16.54-18.54-15.36-32.62,12.83,5.99,18.39,16.77,20.72,30.17,1.53-12.96,9.02-24.36,20.88-29.27.28.22.39.38.4.56.43,12.45-5.65,22.85-15.55,31.08,12.05-5.34,23.65-3.81,35.15,2.56-.08-14.47-6.98-26.55-17.75-33.62-.38-.55-.93-.99-1.36-1.26-19.44-12.32-45.17-6.4-57.29,13.13-11.84,19.07-6.36,44.75,12.79,56.32.62.41,1.31,1.05,1.74,1.31,11.68,6.95,27.04,7.72,40.91.38-12.99-6.95-18.6-17.56-20.49-30.61Z M75.58,73.82c10.46,8.39,16.32,18.03,15.89,32.73,12.72-7.75,20.45-20.58,20.37-34.97-12.54,7.45-24.38,7.4-36.25,2.24Z"), offsetX: -71, offsetY: -71 },
    { path: new Path2D("M 16.36 0 L 7.35 12.7 L 24.91 12.61 Z M11.78,82.34c3.68.43,6,.62,9.26-.18l-3.73-46.4-1.25-8.11-4.28,54.69Z M 0 91.01 L 32.66 91.01 L 32.66 131.56 L 0 131.56 Z"), offsetX: -16, offsetY: -65 },
    { path: new Path2D("M129.61,47.92l-23.06.1c-1.48,0-2.9-1.08-2.93-2.68l-.39-21.46-25.58-.37-.61-23.5-24.47.22-.33,23.31-25.59.36-.87,23.81-25.78.41.2,22.31,129.42.06v-22.57Z"), offsetX: -65, offsetY: -35 },
    { path: new Path2D("M .11 70.22 L 18.64 93.23 L 0 116.52 L 37.66 116.48 L 19.01 93.43 L 37.51 70.21 Z M .16 .07 L 18.69 29.83 L 37.42 0 Z M 34.42 48.22 a 15.61 15.61 0 1 0 -31.22 0 a 15.61 15.61 0 1 0 31.22 0 Z"), offsetX: -19, offsetY: -58 },
    { path: new Path2D("M131.08,22.42l-2.45,14.58-.67.55-11.85-11.6-13.75-8.16-16.33-5.29,11.51-9.03,4.9,13.11,13.11-5.59,1.52,13.9,13.87-2.46c-30.29-30.54-79.34-29.38-108.84.41-29.58,29.88-29.33,78.28-.11,107.9,29.97,30.38,78.87,30.52,108.96.71,29.81-29.54,30.66-78.5.13-109.02ZM153.29,76.77l-12.13,8.76-.06-16.29.83-.68,11.36,8.22ZM141.58,68.11l-.7.45-3.97-15.18,1.2-1.08,12.36,4.99-8.89,10.82ZM129.16,37.15l13.72,1.41-5.5,13.35-.51.82-8.5-14.57.79-1.01ZM136.71,76.86c0,33.07-26.81,59.88-59.88,59.88s-59.88-26.81-59.88-59.88,26.81-59.88,59.88-59.88,59.88,26.81,59.88,59.88ZM76.83.4l8.65,12.17-17.34.09L76.83.4ZM39.26,10.25l12.35,5.74,4.86-12.71,11.36,9.25-15.69,4.76-14.07,7.61c-.6-4.61.15-9.12,1.18-14.66ZM37.04,25.47l-11.44,11.66-2.77-14.3,14.22,2.63ZM.69,77.09l11.79-9.14-9.63-10.9,13.47-5.1-5.67-13.35,14.69-1.21-8.15,14.93-4.67,15.6h.01s.45,17.51.45,17.51l3.82,15.43-.78.58-13.22-4.84,9.11-11.18L.69,77.09ZM10.76,114.85l5.32-12.5c.17-.39.55-.84.98-1.01l8.41,14.73-.52.49-14.2-1.71ZM55.84,150.23l-4.99-13.06-12.56,5.62-1.49-13.87-13.88,2.04,1.96-13.55,1.08-.86,11.98,11.5,13.16,7.81,16.58,5.15-11.84,9.22ZM76.79,153.26l-8.41-12.02,16.63.15-8.22,11.87ZM142.94,114.93l-14.24,1.58,2.17,14.52-14.62-2.34-1.72,14.63-12.05-5.63-5.13,12.63-11.27-9.28,15.23-4.74,14.52-8.31c6.02-3.45,18.29-19.23,20.37-26.43l4.7-16.26,9.77,11.22-13.45,5.28,5.7,13.15Z M19.61,76.83c0,31.59,25.61,57.21,57.21,57.21s57.21-25.61,57.21-57.21-25.61-57.21-57.21-57.21-57.21,25.61-57.21,57.21ZM130.94,76.82c0,29.89-24.23,54.11-54.11,54.11s-54.11-24.23-54.11-54.11,24.23-54.11,54.11-54.11,54.11,24.23,54.11,54.11Z M76.8,128.67c28.64,0,51.85-23.21,51.85-51.85s-23.21-51.85-51.85-51.85-51.85,23.21-51.85,51.85,23.21,51.85,51.85,51.85ZM71.41,73.61c-13.39-9.61-20.8-23.44-20.07-40.84,15.3,7.22,24.69,22.04,25.62,39.1,1.63-17.39,11.07-31.05,26.66-38.45.32,16.38-6.6,30.3-20.23,39.91,14.74-6.6,31.19-5.37,44.49,3.69-14.94,9.56-31.23,9.89-46.27,2.7,14.08,9.49,21.89,24.66,20.45,41.28-15.63-8.19-24.31-22.18-25.31-38.69-2.03,17.13-10.97,30.56-26.67,37.88-.42-16.86,6.95-30.74,20.74-40.07-15.03,6.87-31.17,5.68-45.19-3.39,14.53-9.36,30.56-9.99,45.79-3.13Z"), offsetX: -77, offsetY: -77 }
  ];

  class CustomParticle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.shapeData = customShapes[Math.floor(Math.random() * customShapes.length)];
      this.scale = (Math.random() * 0.15) + 0.15;
      this.angle = Math.random() * 360;
      this.spinSpeed = (Math.random() - 0.5) * 0.006;
    }
    draw(isHovered) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.scale(this.scale, this.scale);
      ctx.rotate(this.angle);
      ctx.translate(this.shapeData.offsetX, this.shapeData.offsetY);
      ctx.fillStyle = isHovered ? 'rgba(49, 162, 196, 0.85)' : 'rgba(20, 33, 61, 0.22)';
      ctx.fill(this.shapeData.path);
      ctx.restore();
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.angle += this.spinSpeed;
      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
      let dx = mouse.x - this.x, dy = mouse.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      let isHovered = false;
      if (mouse.x !== undefined && distance < mouse.radius) {
        isHovered = true;
        let force = (mouse.radius - distance) / mouse.radius;
        this.x -= (dx / distance) * force * 3;
        this.y -= (dy / distance) * force * 3;
      }
      this.draw(isHovered);
    }
  }

  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i; j < particles.length; j++) {
        let dx = particles[i].x - particles[j].x;
        let dy = particles[i].y - particles[j].y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 110) {
          let opacity = 1 - (distance / 110);
          let nearMouse = false;
          if (mouse.x !== undefined) {
            let mdx = mouse.x - particles[i].x;
            let mdy = mouse.y - particles[i].y;
            nearMouse = Math.sqrt(mdx * mdx + mdy * mdy) < mouse.radius;
          }
          ctx.strokeStyle = nearMouse
            ? `rgba(49, 162, 196, ${opacity * 0.5})`
            : `rgba(20, 33, 61, ${opacity * 0.08})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function init() {
    particles = [];
    let n = Math.min(60, Math.floor((width * height) / 14000));
    for (let i = 0; i < n; i++) particles.push(new CustomParticle());
  }
  function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, width, height);
    connectParticles();
    for (let i = 0; i < particles.length; i++) particles[i].update();
  }
  resize();
  animate();
})();

(function() {
  'use strict';

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

  /* ---------- Sticky nav ---------- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Hero word-stagger + pullquote word-stagger ---------- */
  document.querySelectorAll('.hero-title').forEach((title) => {
    title.querySelectorAll('[data-lang]').forEach((block) => {
      const txt = block.textContent.trim();
      const words = txt.split(/\s+/);
      block.innerHTML = words.map((w, i) => {
        return `<span class="word" style="animation-delay:${0.9 + i * 0.12}s">${w}</span>`;
      }).join(' ');
    });
  });
  document.querySelectorAll('.pullquote').forEach((q) => {
    q.querySelectorAll('span[class^="lang"]').forEach((block) => {
      const txt = block.textContent.trim();
      const words = txt.split(/\s+/);
      block.innerHTML = words.map((w, i) => {
        return `<span class="word" style="transition-delay:${i * 0.06}s">${w}</span>`;
      }).join(' ');
    });
  });

  /* ---------- Scroll reveals ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        if (e.target.classList.contains('count-on-scroll')) startCount(e.target);
        if (e.target.classList.contains('case-overview')) e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.reveal, .seq-item, .pillar-row, .brand-entry, .case-stat-number.count-on-scroll, .anchor-moment, .ugc-card, .case-overview, .about, .anchor-moment-image, .hero-inner, .najdi-divider, .najdi-frame-divider, .section-title, .case-headline, .page-hero h1, .contact-title, .case-overview h2, .kv-brief h3').forEach((el) => {
    if (!el.classList.contains('section-title') && !el.classList.contains('case-headline') && !el.classList.contains('contact-title') && !el.classList.contains('najdi-frame-divider')) {
      el.classList.add('reveal');
    }
    io.observe(el);
  });

  /* ---------- Number counter with pulse ---------- */
  function startCount(el) {
    const target = parseFloat(el.dataset.target || el.textContent);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();
    const useArabicNumerals = document.documentElement.lang === 'ar';
    const toArabic = (n) => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      const val = Math.floor(target * eased);
      el.textContent = (useArabicNumerals ? toArabic(val) : val) + suffix;
      if (t < 1) requestAnimationFrame(frame);
      else {
        el.textContent = (useArabicNumerals ? toArabic(target) : target) + suffix;
        el.classList.add('pulse');
        setTimeout(() => el.classList.remove('pulse'), 500);
      }
    }
    requestAnimationFrame(frame);
  }

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

  /* ---------- Active nav link ---------- */
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  /* ---------- Hero video battery saver ---------- */
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    const hv = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) heroVideo.play().catch(() => {});
        else heroVideo.pause();
      });
    }, { threshold: 0.1 });
    hv.observe(heroVideo);
  }

  /* ---------- V11: Add colored icons to every contact cell (all pages) ---------- */
  const ICONS = {
    email: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.2-1.8-.9-2-1s-.5-.1-.7.2-.8 1-.9 1.2-.4.2-.6.1c-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.1-1.4-.1-.1-.3-.2-.6-.4M12 21.8h0a9.9 9.9 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4a9.9 9.9 0 0 1-1.5-5.3c0-5.5 4.4-9.9 9.9-9.9 2.6 0 5.1 1 7 2.9a9.8 9.8 0 0 1 2.9 7c0 5.5-4.4 9.9-9.9 9.9M20.5 3.5A11.8 11.8 0 0 0 12 0C5.5 0 .2 5.3.2 11.9c0 2.1.5 4.1 1.6 5.9L0 24l6.3-1.7c1.7 1 3.7 1.5 5.7 1.5 6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.4z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 0H5a5 5 0 0 0-5 5v14a5 5 0 0 0 5 5h14a5 5 0 0 0 5-5V5a5 5 0 0 0-5-5zM8 19H5V8h3v11zM6.5 6.7c-1 0-1.7-.8-1.7-1.8s.7-1.7 1.7-1.7 1.8.7 1.8 1.7-.8 1.8-1.8 1.8zM20 19h-3v-5.6c0-3.4-4-3.1-4 0V19h-3V8h3v1.8c1.4-2.6 7-2.8 7 2.4V19z"/></svg>',
    location: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>'
  };
  document.querySelectorAll('.contact-cell').forEach((cell) => {
    if (cell.querySelector('.contact-icon')) return;
    const keyEl = cell.querySelector('.contact-key');
    if (!keyEl) return;
    const text = keyEl.textContent.toLowerCase();
    let icon = '';
    if (text.includes('email') || text.includes('بريد')) icon = ICONS.email;
    else if (text.includes('whatsapp') || text.includes('واتساب')) icon = ICONS.whatsapp;
    else if (text.includes('linkedin')) icon = ICONS.linkedin;
    else if (text.includes('location') || text.includes('مكان')) icon = ICONS.location;
    if (icon) {
      const wrap = document.createElement('div');
      wrap.className = 'contact-icon';
      wrap.innerHTML = icon;
      cell.insertBefore(wrap, cell.firstChild);
    }
  });

  /* ---------- PER-PAGE: cursor parallax tilt (home + brand) ---------- */
  const page = document.body.dataset.page;

  /* Universal mouse parallax on every visual (v9) */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.seq-image, .case-img, .brand-art, .about-photo, .ugc-card, .anchor-moment-image').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.setProperty('--px', px.toFixed(3));
        el.style.setProperty('--py', py.toFixed(3));
        if (el.classList.contains('seq-image')) {
          el.style.setProperty('--mx', px.toFixed(3));
          el.style.setProperty('--my', py.toFixed(3));
        }
        if (el.classList.contains('brand-art')) {
          el.style.setProperty('--tx', px.toFixed(3));
          el.style.setProperty('--ty', py.toFixed(3));
        }
      });
      el.addEventListener('mouseleave', () => {
        el.style.setProperty('--px', 0); el.style.setProperty('--py', 0);
        el.style.setProperty('--mx', 0); el.style.setProperty('--my', 0);
        el.style.setProperty('--tx', 0); el.style.setProperty('--ty', 0);
      });
    });
  }

  /* ---------- Video page: KV + UGC interactions ---------- */
  if (page === 'video') {
    const kv = document.querySelector('.kv-frame video');
    if (kv) {
      const kvio = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (!e.isIntersecting) kv.pause(); });
      }, { threshold: 0.3 });
      kvio.observe(kv);
    }
    // UGC: play on hover, pause on leave
    document.querySelectorAll('.ugc-card-frame video').forEach((v) => {
      const frame = v.closest('.ugc-card-frame');
      const card = v.closest('.ugc-card');
      card.addEventListener('mouseenter', () => {
        v.play().catch(() => {});
        frame.classList.add('playing');
      });
      card.addEventListener('mouseleave', () => {
        v.pause();
        v.currentTime = 0;
        frame.classList.remove('playing');
      });
      // Click toggles sound + play
      card.addEventListener('click', () => {
        if (v.paused) { v.muted = false; v.play().catch(() => {}); }
        else { v.pause(); v.muted = true; }
      });
    });
  }

  /* ---------- V10: Velocity-driven Najdi cursor (Asset 19) ----------
     - Small spinning rosette follows the cursor
     - Rotation speed = mouse speed (faster you move, faster it spins)
     - When mouse stops, rotation stops
     - A fading turquoise trail rosette lags behind on motion
  */
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const cursorEl = document.createElement('div');
    cursorEl.className = 'najdi-cursor';
    cursorEl.innerHTML = '<div class="najdi-cursor-inner"></div>';
    document.body.appendChild(cursorEl);

    const trailEl = document.createElement('div');
    trailEl.className = 'najdi-trail';
    trailEl.innerHTML = '<div class="najdi-trail-inner"></div>';
    document.body.appendChild(trailEl);

    const inner = cursorEl.querySelector('.najdi-cursor-inner');
    const trail = trailEl;

    let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    let tx = cx, ty = cy;
    let trailX = cx, trailY = cy;
    let lastRawX = cx, lastRawY = cy;
    let angle = 0;
    let movingNow = false;
    let lastMove = performance.now();

    document.addEventListener('mousemove', (e) => {
      cx = e.clientX; cy = e.clientY;
      lastMove = performance.now();
    });

    function frame() {
      const now = performance.now();
      // Smooth follow
      tx += (cx - tx) * 0.65;
      ty += (cy - ty) * 0.65;
      trailX += (cx - trailX) * 0.18;
      trailY += (cy - trailY) * 0.18;

      // Raw movement this frame (used to decide rotation)
      const rawDx = cx - lastRawX;
      const rawDy = cy - lastRawY;
      const rawSpeed = Math.sqrt(rawDx * rawDx + rawDy * rawDy);
      lastRawX = cx; lastRawY = cy;

      const idle = now - lastMove;
      movingNow = rawSpeed > 0.4 && idle < 60;

      // STRICT CLOCKWISE rotation — only when actually moving, no coast.
      if (movingNow) {
        angle += Math.min(rawSpeed * 1.8, 22);
      }
      // Trail opacity follows movement directly
      const trailOpacity = movingNow ? Math.min(0.55, rawSpeed * 0.06) : 0;

      cursorEl.style.transform = `translate(${tx}px, ${ty}px) translate(-50%, -50%)`;
      inner.style.transform = `rotate(${angle}deg)`;
      trail.style.transform = `translate(${trailX}px, ${trailY}px) translate(-50%, -50%) rotate(${angle * 0.8}deg)`;
      trail.style.opacity = trailOpacity;

      requestAnimationFrame(frame);
    }
    frame();
  }

  /* ---------- Scroll progress bar ---------- */
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);
  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const pct = (window.scrollY / h) * 100;
    progress.style.width = pct + '%';
  }, { passive: true });

  /* ---------- Page-load Najdi intro overlay (once per session) ---------- */
  if (!sessionStorage.getItem('intro-shown')) {
    const intro = document.createElement('div');
    intro.className = 'najdi-intro';
    intro.innerHTML = `<img src="assets/svg/najdi-15.svg" alt="" />`;
    document.body.appendChild(intro);
    sessionStorage.setItem('intro-shown', '1');
    setTimeout(() => intro.remove(), 2400);
  }

})();
