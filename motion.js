/**
 * ============================================================
 *  MARCA CREATIVES — PREMIUM MOTION ENGINE
 *  Layers cinematic motion on top of the existing site.
 *  Does NOT change layout, colors, fonts, or spacing.
 * ============================================================
 *
 *  Stack:
 *    – Lenis (smooth scroll, inertia)
 *    – GSAP + ScrollTrigger (already loaded via CDN in HTML)
 *    – SplitType (dynamically loaded)
 *    – requestAnimationFrame loop (cursor, magnetic)
 *
 *  Entry: auto-runs on DOMContentLoaded
 * ============================================================
 */

(function () {
  'use strict';

  /* ─── Utility ─────────────────────────────────────────────────────── */
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
  const isMobile = () => window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches;

  /* Custom GSAP eases matching our CSS vars */
  const EASE = {
    expo: 'expo.out',
    spring: 'back.out(1.4)',
    silk: 'power2.out',
    snap: 'power4.out',
  };

  /* ─── 1. Inject DOM Fixtures ──────────────────────────────────────── */
  function injectFixtures() {
    /* Page Loader */
    if (!$('#marca-loader')) {
      const loader = document.createElement('div');
      loader.id = 'marca-loader';
      loader.innerHTML = `
        <div class="loader-logo">
          <span class="loader-logo-text">MARCO</span>
          <div class="loader-logo-dot"></div>
        </div>
        <div class="loader-bar-wrap"><div class="loader-bar" id="loaderBar"></div></div>
        <div class="loader-pct" id="loaderPct">0%</div>`;
      document.body.prepend(loader);
    }

    /* Scroll Progress Bar */
    if (!$('#scroll-progress')) {
      const bar = document.createElement('div');
      bar.id = 'scroll-progress';
      document.body.prepend(bar);
    }

    /* Custom Cursor (desktop only) */
    if (!$('#mc-cursor') && !isMobile()) {
      const cur = document.createElement('div');
      cur.id = 'mc-cursor';
      cur.innerHTML = `
        <div class="cur-ring"><span class="cur-label" id="curLabel"></span></div>
        <div class="cur-dot"></div>`;
      document.body.appendChild(cur);
    }

    /* Hero Mesh Gradient + Noise — only for #hero section */
    const hero = $('#hero');
    if (hero) {
      hero.style.position = 'relative';
      hero.style.overflow = 'hidden';
      if (!$('#hero-mesh')) {
        const mesh = document.createElement('div');
        mesh.id = 'hero-mesh';
        mesh.innerHTML = `
          <div class="mesh-orb mesh-orb-1"></div>
          <div class="mesh-orb mesh-orb-2"></div>
          <div class="mesh-orb mesh-orb-3"></div>`;
        hero.prepend(mesh);
        const noise = document.createElement('div');
        noise.id = 'hero-noise';
        hero.prepend(noise);
      }

      /* Scroll indicator */
      if (!$('.hero-scroll-indicator')) {
        const ind = document.createElement('div');
        ind.className = 'hero-scroll-indicator';
        ind.id = 'heroScrollIndicator';
        ind.innerHTML = `<div class="scroll-line"></div><span class="scroll-label">Scroll</span>`;
        hero.appendChild(ind);
      }
    }

    /* Add cursor:none on desktop to all interactive cards */
    if (!isMobile()) {
      document.documentElement.style.cursor = 'none';
      $$('a, button, [role="button"]').forEach(el => { el.style.cursor = 'none'; });
    }
  }

  /* ─── 2. Page Loader ──────────────────────────────────────────────── */
  function initLoader(onComplete) {
    document.body.classList.add('is-loading');

    const loader     = $('#marca-loader');
    const loaderLogo = loader?.querySelector('.loader-logo');
    const loaderBar  = $('#loaderBar');
    const loaderPct  = $('#loaderPct');

    if (!loader || !loaderBar || !loaderPct) {
      document.body.classList.remove('is-loading');
      document.body.classList.add('is-ready');
      onComplete?.();
      return;
    }

    const tl = gsap.timeline();

    /* 1. Logo scales in */
    tl.to(loaderLogo, {
      opacity: 1, scale: 1,
      duration: 0.7, ease: EASE.expo, delay: 0.1
    });

    /* 2. Counter fades in */
    tl.to(loaderPct, { opacity: 1, duration: 0.3, ease: 'power2.out' }, '-=0.4');

    /* 3. Loading bar + counter animate together */
    const obj = { val: 0 };
    tl.to(obj, {
      val: 100,
      duration: 1.4,
      ease: 'power1.inOut',
      onUpdate() {
        const v = Math.round(obj.val);
        loaderPct.textContent = v + '%';
        loaderBar.style.width = v + '%';
      }
    }, '-=0.2');

    /* 4. Exit: wipe upward */
    tl.to(loader, {
      yPercent: -100,
      duration: 1.0,
      ease: EASE.expo,
      delay: 0.15,
      onStart() {
        document.body.classList.remove('is-loading');
        document.body.classList.add('is-ready');
      },
      onComplete() {
        loader.style.display = 'none';
        onComplete?.();
      }
    });
  }

  /* ─── 3. Lenis Smooth Scroll ──────────────────────────────────────── */
  let lenis;
  function initLenis() {
    /* Lenis loaded from CDN — if not available, skip gracefully */
    if (typeof Lenis === 'undefined') return;

    lenis = new Lenis({
      duration: 1.25,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), /* expo */
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.4,
    });

    /* Pipe Lenis into GSAP ticker for perfect sync */
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    /* Tell ScrollTrigger to use Lenis scroll position */
    lenis.on('scroll', ScrollTrigger.update);
  }

  /* ─── 4. Scroll Progress Bar ─────────────────────────────────────── */
  function initScrollProgress() {
    const bar = $('#scroll-progress');
    if (!bar) return;

    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate(self) {
        bar.style.width = (self.progress * 100) + '%';
      }
    });
  }

  /* ─── 5. Custom Cursor ────────────────────────────────────────────── */
  function initCursor() {
    if (isMobile()) return;
    const cursor = $('#mc-cursor');
    if (!cursor) return;

    const dot   = cursor.querySelector('.cur-dot');
    const ring  = cursor.querySelector('.cur-ring');
    const label = $('#curLabel');

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my; /* ring lags behind */
    let raf;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
    });

    /* Dot follows cursor instantly via transform */
    document.addEventListener('mousemove', e => {
      gsap.set(cursor, { x: e.clientX, y: e.clientY });
    });

    /* Ring follows with lerp for smooth lag */
    function ringLoop() {
      rx += (mx - rx) * 0.1;
      ry += (my - ry) * 0.1;
      /* Ring is absolutely positioned within cursor div — offset to center */
      ring.style.transform = `translate(${rx - mx}px, ${ry - my}px)`;
      raf = requestAnimationFrame(ringLoop);
    }
    ringLoop();

    /* Cursor state: hover */
    const hoverEls = $$('a, button, .solution-item-card, .ind-gallery-card, .case-card, .platform-item, .filter-btn, .faq-question, .portfolio-card-item');
    hoverEls.forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cur-hover');
        if (label) label.textContent = 'Open';
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cur-hover', 'cur-view', 'cur-expand');
      });
    });

    /* Cursor state: view (on media cards) */
    const viewEls = $$('.ind-gallery-card, .case-card, .portfolio-card-item, .service-visual-card');
    viewEls.forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.remove('cur-hover');
        document.body.classList.add('cur-view');
        if (label) label.textContent = 'View';
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cur-view');
      });
    });

    /* Click squish */
    document.addEventListener('mousedown', () => document.body.classList.add('cur-click'));
    document.addEventListener('mouseup',   () => document.body.classList.remove('cur-click'));
  }

  /* ─── 6. Navbar Blur on Scroll ───────────────────────────────────── */
  function initNavbar() {
    const header = $('header.header, .header');
    if (!header) return;

    ScrollTrigger.create({
      start: 60,
      onEnter:      () => header.classList.add('nav-scrolled'),
      onLeaveBack:  () => header.classList.remove('nav-scrolled'),
    });

    /* Active section indicator */
    const sections = $$('section[id]');
    const navLinks = $$('.nav-links a');

    sections.forEach(sec => {
      ScrollTrigger.create({
        trigger: sec,
        start: 'top 60%',
        end: 'bottom 40%',
        onEnter: () => setActive(sec.id),
        onEnterBack: () => setActive(sec.id),
      });
    });

    function setActive(id) {
      navLinks.forEach(a => {
        a.classList.toggle('nav-active', a.getAttribute('href')?.includes('#' + id));
      });
    }
  }

  /* ─── 7. Magnetic Buttons ─────────────────────────────────────────── */
  function initMagnetic() {
    if (isMobile()) return;

    const magneticEls = $$('.btn-primary, .btn-primary-pill, .btn-arrow, .btn-banner-action, .btn-cta-outline-pill');
    magneticEls.forEach(el => {
      el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        const dx = (e.clientX - rect.left - rect.width  / 2) * 0.22;
        const dy = (e.clientY - rect.top  - rect.height / 2) * 0.22;
        gsap.to(el, { x: dx, y: dy, duration: 0.4, ease: EASE.snap });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: EASE.expo });
      });
    });
  }

  /* ─── 8. Ripple on Click ──────────────────────────────────────────── */
  function initRipple() {
    const rippleTargets = $$('.btn-primary-pill, .btn-banner-action, .btn-primary, .btn-cta-outline-pill');
    rippleTargets.forEach(el => {
      el.classList.add('ripple-host');
      el.addEventListener('click', e => {
        const rect = el.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top  - size / 2;
        const ripple = document.createElement('span');
        ripple.className = 'ripple-circle';
        ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;
        el.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
      });
    });
  }

  /* ─── 9. Hero Animations ─────────────────────────────────────────── */
  function initHeroAnimations() {
    const hero = $('#hero');
    if (!hero) return;

    /* Hero content reveal — stagger words */
    const heroTitle = $('.hero-title', hero);
    const heroDesc  = $('.hero-description', hero);
    const tagBadge  = $('.tag-badge', hero);
    const scrollInd = $('#heroScrollIndicator');

    const heroTL = gsap.timeline({ delay: 0 }); /* starts AFTER loader calls onComplete */

    if (tagBadge) {
      heroTL.fromTo(tagBadge,
        { opacity: 0, y: 20, filter: 'blur(6px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: EASE.expo },
        0
      );
    }

    if (heroTitle) {
      /* SplitType word-by-word animation */
      if (typeof SplitType !== 'undefined') {
        const split = new SplitType(heroTitle, { types: 'words,chars' });
        heroTL.fromTo(split.chars,
          { y: '110%', opacity: 0, rotationZ: 4, filter: 'blur(4px)' },
          {
            y: '0%', opacity: 1, rotationZ: 0, filter: 'blur(0px)',
            duration: 0.9, ease: EASE.expo,
            stagger: 0.025,
          },
          0.15
        );
      } else {
        /* Fallback without SplitType */
        heroTL.fromTo(heroTitle,
          { opacity: 0, y: 40, filter: 'blur(8px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.0, ease: EASE.expo },
          0.1
        );
      }
    }

    if (heroDesc) {
      heroTL.fromTo(heroDesc,
        { opacity: 0, y: 30, filter: 'blur(4px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: EASE.expo },
        0.45
      );
    }

    /* Arc wheel floats in */
    const arcWrap = $('#arcWheelWrapper');
    if (arcWrap) {
      heroTL.fromTo(arcWrap,
        { opacity: 0, scale: 0.94, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 1.4, ease: EASE.expo },
        0.3
      );
    }

    /* Scroll indicator fades in then hides after first scroll */
    if (scrollInd) {
      heroTL.fromTo(scrollInd,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.8, ease: EASE.silk },
        1.0
      );

      let indicatorHidden = false;
      const hideIndicator = () => {
        if (!indicatorHidden && window.scrollY > 80) {
          indicatorHidden = true;
          scrollInd.classList.add('hidden');
          window.removeEventListener('scroll', hideIndicator);
        }
      };
      window.addEventListener('scroll', hideIndicator, { passive: true });
    }

    /* Arc wheel fixed position - mouse parallax disabled to keep location locked */
    if (arcWrap) {
      gsap.set(arcWrap, { x: 0, y: 0 });
    }

    return heroTL;
  }

  /* ─── 10. SplitType Heading Reveals ─────────────────────────────── */
  function initHeadingReveals() {
    if (typeof SplitType === 'undefined') {
      /* Fallback: treat every h2 as a data-reveal */
      $$('h2, h1.detail-hero-title').forEach(el => el.setAttribute('data-reveal', ''));
      return;
    }

    const headings = $$([
      'h2.solutions-title',
      'h2.industries-title',
      'h2.detail-case-title',
      'h2.banner-title',
      'h2.empathy-title',
      'h2.studio-title',
      'h2.services-main-title',
      'h1.detail-hero-title',
    ].join(','));

    headings.forEach(el => {
      const split = new SplitType(el, { types: 'words,chars' });

      /* Set initial state */
      gsap.set(split.chars, { y: '115%', opacity: 0, rotationZ: 3, filter: 'blur(4px)' });

      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter() {
          gsap.to(split.chars, {
            y: '0%', opacity: 1, rotationZ: 0, filter: 'blur(0px)',
            duration: 0.9, ease: EASE.expo,
            stagger: 0.018,
          });
        }
      });
    });
  }

  /* ─── 11. Paragraph Line Reveals ────────────────────────────────── */
  function initParagraphReveals() {
    const paras = $$([
      '.detail-hero-desc',
      '.solutions-desc',
      '.detail-case-desc',
      '.empathy-lead',
      '.empathy-text',
      '.studio-description',
      '.banner-desc-text',
      '.footer-about-text',
    ].join(','));

    paras.forEach(el => {
      if (typeof SplitType !== 'undefined') {
        const split = new SplitType(el, { types: 'lines' });
        gsap.set(split.lines, { y: '100%', opacity: 0 });

        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          once: true,
          onEnter() {
            gsap.to(split.lines, {
              y: '0%', opacity: 1,
              duration: 0.8, ease: EASE.expo,
              stagger: 0.08
            });
          }
        });
      } else {
        gsap.fromTo(el,
          { opacity: 0, y: 24 },
          {
            scrollTrigger: { trigger: el, start: 'top 90%', once: true },
            opacity: 1, y: 0, duration: 0.9, ease: EASE.expo
          }
        );
      }
    });
  }

  /* ─── 12. Service Cards Stagger ─────────────────────────────────── */
  function initServiceCards() {
    const cards = $$('.solution-item-card');
    if (!cards.length) return;

    /* Initial hidden state (override the existing data-reveal fallback) */
    gsap.set(cards, { opacity: 0, y: 50, scale: 0.95, filter: 'blur(6px)' });

    ScrollTrigger.create({
      trigger: '.solutions-cards-grid',
      start: 'top 82%',
      once: true,
      onEnter() {
        gsap.to(cards, {
          opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
          duration: 0.85, ease: EASE.expo,
          stagger: 0.06
        });
      }
    });

    /* Card glow — cursor follow */
    if (!isMobile()) {
      cards.forEach(card => {
        const glow = document.createElement('div');
        glow.className = 'card-glow';
        card.appendChild(glow);

        card.addEventListener('mousemove', e => {
          const rect = card.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
          const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
          card.style.setProperty('--glow-x', x + '%');
          card.style.setProperty('--glow-y', y + '%');
        });
      });
    }

    /* Mouse tilt on cards */
    if (!isMobile()) {
      cards.forEach(card => {
        card.addEventListener('mousemove', e => {
          const rect = card.getBoundingClientRect();
          const cx   = rect.left + rect.width  / 2;
          const cy   = rect.top  + rect.height / 2;
          const dx   = (e.clientX - cx) / (rect.width  / 2);
          const dy   = (e.clientY - cy) / (rect.height / 2);
          gsap.to(card, {
            rotationX: -dy * 5,
            rotationY:  dx * 5,
            transformPerspective: 800,
            duration: 0.4, ease: EASE.silk
          });
        });
        card.addEventListener('mouseleave', () => {
          gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.6, ease: EASE.expo });
        });
      });
    }
  }

  /* ─── 13. Industry Gallery Clip-path Reveals ─────────────────────── */
  function initGalleryReveals() {
    const cards = $$('.ind-gallery-card');
    if (!cards.length) return;

    cards.forEach((card, i) => {
      gsap.fromTo(card,
        { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        {
          scrollTrigger: { trigger: card, start: 'top 88%', once: true },
          clipPath: 'inset(0 0% 0 0)', opacity: 1,
          duration: 1.0, ease: EASE.expo,
          delay: i * 0.08
        }
      );
    });
  }

  /* ─── 14. Case Cards Stagger ─────────────────────────────────────── */
  function initCaseCards() {
    const cards = $$('.case-card');
    if (!cards.length) return;

    gsap.set(cards, { opacity: 0, y: 60, filter: 'blur(6px)' });

    ScrollTrigger.create({
      trigger: '.cases-grid',
      start: 'top 84%',
      once: true,
      onEnter() {
        gsap.to(cards, {
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 0.9, ease: EASE.expo,
          stagger: 0.12
        });
      }
    });
  }

  /* ─── 15. Counter Rolling Numbers ──────────────────────────────── */
  function initCounters() {
    const counterEls = $$('.stat-number, .overlay-stat-item h4, .metric-row-item strong');
    counterEls.forEach(el => {
      const raw = el.textContent.trim();
      /* Parse numeric part, keep suffix */
      const match = raw.match(/^([\d.]+)(.*)$/);
      if (!match) return;

      const targetNum = parseFloat(match[1]);
      const suffix    = match[2] || '';

      const obj = { val: 0 };

      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter() {
          gsap.to(obj, {
            val: targetNum,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate() {
              /* Smart decimal formatting */
              const v = obj.val;
              el.textContent = (Number.isInteger(targetNum) ? Math.round(v) : v.toFixed(1)) + suffix;
            }
          });
        }
      });
    });
  }

  /* ─── 16. Brands Logo Board Reveal ──────────────────────────────── */
  function initBrandsReveal() {
    const board = $('.flat-logo-board');
    if (!board) return;

    const logoItems = $$('.logo-text-item', board);
    gsap.set(logoItems, { opacity: 0, y: 20, filter: 'blur(4px)' });

    ScrollTrigger.create({
      trigger: board,
      start: 'top 88%',
      once: true,
      onEnter() {
        gsap.to(logoItems, {
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 0.8, ease: EASE.expo,
          stagger: 0.07
        });
      }
    });
  }

  /* ─── 17. Detail Hero Visual Parallax ──────────────────────────── */
  function initDetailHeroParallax() {
    const right = $('.detail-hero-right');
    if (!right) return;

    gsap.to(right, {
      scrollTrigger: {
        trigger: '.detail-hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.4
      },
      y: -40,
      ease: 'none'
    });

    /* Float animation on the hero card */
    const card = $('.service-visual-card', right);
    if (card) {
      gsap.to(card, {
        y: -12,
        duration: 3.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
    }
  }

  /* ─── 18. Case Study Image Parallax ──────────────────────────────── */
  function initCaseParallax() {
    const caseImg = $('.case-visual-container');
    if (!caseImg) return;

    gsap.fromTo(caseImg.querySelector('img'),
      { y: 30 },
      {
        scrollTrigger: {
          trigger: caseImg,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2
        },
        y: -30,
        ease: 'none'
      }
    );
  }

  /* ─── 19. CTA Banner Parallax BG ────────────────────────────────── */
  function initCTABannerParallax() {
    const bannerBg = $('.cta-banner-bg');
    if (!bannerBg) return;

    gsap.fromTo(bannerBg,
      { scale: 1.0, y: 0 },
      {
        scrollTrigger: {
          trigger: '.services-cta-banner',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5
        },
        scale: 1.08, y: -30,
        ease: 'none'
      }
    );
  }

  /* ─── 20. Section Tag Reveals ────────────────────────────────────── */
  function initSectionTags() {
    $$('.section-tag, .banner-subtag').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, x: -16, filter: 'blur(3px)' },
        {
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          opacity: 1, x: 0, filter: 'blur(0px)',
          duration: 0.7, ease: EASE.expo
        }
      );
    });
  }

  /* ─── 21. Footer Reveal ──────────────────────────────────────────── */
  function initFooterReveal() {
    const footer = $('footer.footer');
    if (!footer) return;

    /* Logo */
    const logoText = footer.querySelector('.logo-text');
    if (logoText) {
      gsap.fromTo(logoText,
        { opacity: 0, y: 30, filter: 'blur(5px)' },
        {
          scrollTrigger: { trigger: footer, start: 'top 90%', once: true },
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 1.0, ease: EASE.expo
        }
      );
    }

    /* Footer links stagger */
    const links = $$('.footer-links a', footer);
    gsap.set(links, { opacity: 0, y: 15 });
    ScrollTrigger.create({
      trigger: footer,
      start: 'top 88%',
      once: true,
      onEnter() {
        gsap.to(links, {
          opacity: 1, y: 0,
          duration: 0.7, ease: EASE.expo,
          stagger: 0.04
        });
      }
    });

    /* Footer headers */
    const headers = $$('.footer-header', footer);
    gsap.fromTo(headers,
      { opacity: 0, y: 12 },
      {
        scrollTrigger: { trigger: footer, start: 'top 88%', once: true },
        opacity: 1, y: 0, duration: 0.6, ease: EASE.expo, stagger: 0.05
      }
    );
  }

  /* ─── 22. Generic data-reveal Enhancement ────────────────────────── */
  function enhanceDataReveals() {
    /* The existing script.js handles [data-reveal].
       We intercept and upgrade to more cinematic animations
       for elements not already handled by our specific functions. */
    $$('[data-reveal]').forEach(el => {
      /* Skip if already GSAP animated */
      if (el.dataset.motionInit) return;
      el.dataset.motionInit = '1';

      /* Kill any existing CSS transition for GSAP control */
      el.style.transition = 'none';

      const delay = parseFloat(el.getAttribute('data-reveal-delay') || 0) / 1000;

      gsap.fromTo(el,
        { opacity: 0, y: 44, filter: 'blur(6px)' },
        {
          scrollTrigger: { trigger: el, start: 'top 87%', once: true },
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 1.0, ease: EASE.expo, delay
        }
      );
    });
  }

  /* ─── 23. Process Flow Timeline ──────────────────────────────────── */
  function initProcessTimeline() {
    const flowItems = $$('.flow-step-item');
    if (!flowItems.length) return;

    gsap.set(flowItems, { opacity: 0, y: 40, scale: 0.95, filter: 'blur(4px)' });

    ScrollTrigger.create({
      trigger: '.process-flow-section',
      start: 'top 80%',
      once: true,
      onEnter() {
        gsap.to(flowItems, {
          opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
          duration: 0.8, ease: EASE.expo, stagger: 0.09
        });
      }
    });
  }

  /* ─── 24. Results/Metric Cards ───────────────────────────────────── */
  function initResultCards() {
    const cards = $$('.result-card-item');
    if (!cards.length) return;

    gsap.set(cards, { opacity: 0, y: 40, filter: 'blur(5px)' });

    ScrollTrigger.create({
      trigger: '.results-cards-section',
      start: 'top 82%',
      once: true,
      onEnter() {
        gsap.to(cards, {
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 0.85, ease: EASE.expo, stagger: 0.09
        });
      }
    });
  }

  /* ─── 25. Testimonial Cards Float ────────────────────────────────── */
  function initTestimonialCards() {
    const cards = $$('.testimonial-card, .review-card');
    cards.forEach((card, i) => {
      gsap.to(card, {
        y: i % 2 === 0 ? -8 : 8,
        duration: 3 + i * 0.4,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: i * 0.3
      });
    });
  }

  /* ─── 26. Load SplitType Dynamically ─────────────────────────────── */
  function loadSplitType(callback) {
    if (typeof SplitType !== 'undefined') { callback(); return; }
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/split-type@0.3.4/umd/index.min.js';
    s.onload  = callback;
    s.onerror = callback; /* run without SplitType if CDN fails */
    document.head.appendChild(s);
  }

  /* ─── 27. Load Lenis Dynamically ─────────────────────────────────── */
  function loadLenis(callback) {
    if (typeof Lenis !== 'undefined') { callback(); return; }
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/@studio-freight/lenis@1.0.42/dist/lenis.min.js';
    s.onload  = callback;
    s.onerror = callback;
    document.head.appendChild(s);
  }

  /* ─── ORCHESTRATOR ─────────────────────────────────────────────── */
  function boot() {
    /* Guard: GSAP must be present */
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('[Motion] GSAP not found — skipping premium animations.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    /* Inject DOM elements first */
    injectFixtures();

    /* Load external libs in parallel, then init */
    let lenisReady = false, splitReady = false;

    function checkReady() {
      if (!lenisReady || !splitReady) return;
      initLenis();
      initScrollProgress();
      initCursor();
      initNavbar();
      initMagnetic();
      initRipple();
      initSectionTags();
      initHeadingReveals();
      initParagraphReveals();
      initServiceCards();
      initGalleryReveals();
      initCaseCards();
      initCounters();
      initBrandsReveal();
      initDetailHeroParallax();
      initCaseParallax();
      initCTABannerParallax();
      initProcessTimeline();
      initResultCards();
      initTestimonialCards();
      enhanceDataReveals();
      initFooterReveal();

      ScrollTrigger.refresh();
    }

    loadLenis(() => { lenisReady = true; checkReady(); });
    loadSplitType(() => { splitReady = true; checkReady(); });

    /* Page Loader — hero starts AFTER loader exits */
    initLoader(() => {
      const heroTL = initHeroAnimations();
      /* Refresh ScrollTrigger once hero is laid out */
      setTimeout(() => ScrollTrigger.refresh(), 800);
    });
  }

  /* ─── Entry Point ──────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
