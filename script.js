/**
 * MARCA CREATIVES - INTERACTIVE LOGIC & GSAP SCROLL ANIMATIONS
 */

document.addEventListener('DOMContentLoaded', () => {
  // Register GSAP ScrollTrigger
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    initGSAPScrollReveal();
    initHeroScrollParallax();
  } else {
    // Fallback if CDNs fail to load
    initFallbackScrollReveal();
    initFallbackScrollParallax();
  }

  initMobileMenu();
  initFaqAccordion();
  initContentStudio();
  initServicesTabs();
  initReelsPortfolio();
});

/**
 * GSAP ScrollTrigger Animations for clean, premium slide-in reveals
 */
function initGSAPScrollReveal() {
  // Standard data-reveal fade-blur animation
  gsap.utils.toArray('[data-reveal]').forEach(el => {
    const delayAttr = el.getAttribute('data-reveal-delay');
    const delay = delayAttr ? parseFloat(delayAttr) / 1000 : 0;
    
    // Skip element if it is part of a custom staggered layout handled below
    if (el.closest('.cases-grid') || el.closest('.process-flow-slider') || el.closest('.solutions-cards-grid') || el.closest('.results-cards-grid')) {
      return;
    }

    gsap.fromTo(el, 
      { opacity: 0, y: 40, filter: 'blur(5px)' },
      {
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none none"
        },
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.0,
        ease: "power2.out",
        delay: delay
      }
    );
  });

  // Stagger reveal of cases grid cards
  if (document.querySelector('.cases-grid')) {
    gsap.fromTo(".case-card",
      { opacity: 0, y: 50, filter: 'blur(5px)' },
      {
        scrollTrigger: {
          trigger: ".cases-grid",
          start: "top 86%"
        },
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.0,
        stagger: 0.15,
        ease: "power2.out"
      }
    );
  }

  // Stagger reveal of process flowchart circles
  if (document.querySelector('.process-flow-section')) {
    gsap.fromTo(".flow-step-item",
      { opacity: 0, y: 40, filter: 'blur(5px)' },
      {
        scrollTrigger: {
          trigger: ".process-flow-section",
          start: "top 80%"
        },
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.0,
        stagger: 0.08,
        ease: "power2.out"
      }
    );
  }

  // Stagger reveal of detailed marketing solutions cards
  if (document.querySelector('.solutions-grid-section')) {
    gsap.fromTo(".solution-item-card",
      { opacity: 0, y: 40, filter: 'blur(5px)' },
      {
        scrollTrigger: {
          trigger: ".solutions-grid-section",
          start: "top 80%"
        },
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.0,
        stagger: 0.08,
        ease: "power2.out"
      }
    );
  }

  // Stagger reveal of results section metric cards
  if (document.querySelector('.results-cards-section')) {
    gsap.fromTo(".result-card-item",
      { opacity: 0, y: 40, filter: 'blur(5px)' },
      {
        scrollTrigger: {
          trigger: ".results-cards-section",
          start: "top 80%"
        },
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.0,
        stagger: 0.1,
        ease: "power2.out"
      }
    );
  }
}

/**
 * GSAP ScrollTrigger Carousel Parallax - Smooth momentum rotation
 */
function initHeroScrollParallax() {
  const wrapper = document.getElementById('arcWheelWrapper');
  const cancelers = document.querySelectorAll('.card-scroll-canceler');

  if (!wrapper) return;

  // Turn the wheel wrapper counter-clockwise as we scroll down
  gsap.to(wrapper, {
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      scrub: 1.2 // Adds beautiful physics-based easing on scroll scrub
    },
    rotation: -26, // Rotates counter-clockwise
    ease: "none"
  });

  // Turn the card scroll-cancelers clockwise at the exact same rate to keep cards upright
  cancelers.forEach(canceler => {
    gsap.to(canceler, {
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        scrub: 1.2
      },
      rotation: 26, // Rotates clockwise
      ease: "none"
    });
  });
}

/**
 * Fallbacks if GSAP is unavailable
 */
function initFallbackScrollReveal() {
  const revealElements = document.querySelectorAll('[data-reveal]');
  if (!revealElements.length) return;

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        entry.target.style.filter = 'blur(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(40px)';
    el.style.filter = 'blur(5px)';
    el.style.transition = 'opacity 1s ease, transform 1s ease, filter 1s ease';
    
    const delay = el.getAttribute('data-reveal-delay');
    if (delay) el.style.transitionDelay = `${delay}ms`;
    
    revealObserver.observe(el);
  });
}

function initFallbackScrollParallax() {
  const wrapper = document.getElementById('arcWheelWrapper');
  const cancelers = document.querySelectorAll('.card-scroll-canceler');
  if (!wrapper) return;

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    if (scrollTop < window.innerHeight + 100) {
      const rotation = scrollTop * 0.035;
      wrapper.style.setProperty('--scroll-rotation', `${rotation}deg`);
      cancelers.forEach(c => c.style.setProperty('--scroll-rotation', `${rotation}deg`));
    }
  }, { passive: true });
}

/**
 * Mobile Navigation Menu Toggle Drawer
 */
function initMobileMenu() {
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  
  if (!mobileToggle || !navLinks) return;

  mobileToggle.addEventListener('click', () => {
    const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
    
    mobileToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    mobileToggle.setAttribute('aria-expanded', !isExpanded);
  });

  const links = navLinks.querySelectorAll('a');
  links.forEach(link => {
    link.addEventListener('click', () => {
      mobileToggle.classList.remove('active');
      navLinks.classList.remove('active');
      mobileToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/**
 * FAQ Accordion Mutual Exclusion
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const summary = item.querySelector('.faq-question');
    summary.addEventListener('click', () => {
      if (!item.hasAttribute('open')) {
        faqItems.forEach(otherItem => {
          if (otherItem !== item && otherItem.hasAttribute('open')) {
            otherItem.removeAttribute('open');
          }
        });
      }
    });
  });
}

/**
 * Content Studio Section - Highlight/Dim Side-by-Side Swapper
 */
function initContentStudio() {
  const platformItems = document.querySelectorAll('.platform-item');
  const mockupFrames = document.querySelectorAll('.mockup-frame');

  if (!platformItems.length || !mockupFrames.length) return;

  // Initialize
  const initialIndex = '0';
  mockupFrames.forEach(frame => {
    if (frame.id !== `mockup-${initialIndex}`) {
      frame.classList.add('dimmed');
      frame.classList.remove('active');
    } else {
      frame.classList.remove('dimmed');
      frame.classList.add('active');
    }
  });

  platformItems.forEach(item => {
    item.addEventListener('click', () => {
      platformItems.forEach(pi => pi.classList.remove('active'));
      item.classList.add('active');

      const index = item.getAttribute('data-platform');
      mockupFrames.forEach(frame => {
        if (frame.id === `mockup-${index}`) {
          frame.classList.add('active');
          frame.classList.remove('dimmed');
        } else {
          frame.classList.remove('active');
          frame.classList.add('dimmed');
        }
      });
    });
  });
}

/**
 * Services - Tabs Dynamic Pane Switcher
 */
function initServicesTabs() {
  const tabButtons = document.querySelectorAll('.service-tab-btn');
  const contentPanes = document.querySelectorAll('.service-tab-pane');

  if (!tabButtons.length || !contentPanes.length) return;

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(tb => tb.classList.remove('active'));
      contentPanes.forEach(pane => pane.classList.remove('active'));

      btn.classList.add('active');
      const tabIndex = btn.getAttribute('data-service-tab');
      const targetPane = document.getElementById(`service-pane-${tabIndex}`);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
}

/**
 * Reels Portfolio - Dynamic Category Filter & Custom Scrollbar Track
 */
function initReelsPortfolio() {
  const slider = document.getElementById('portfolioSlider');
  const handle = document.getElementById('sliderHandle');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const scrollUp = document.querySelector('.scroll-up');
  const scrollDown = document.querySelector('.scroll-down');
  const cards = document.querySelectorAll('.portfolio-card-item');

  if (!slider || !filterButtons.length || !cards.length) return;

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(fb => fb.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');
      cards.forEach(card => {
        const categories = card.getAttribute('data-category').split(' ');
        if (filterValue === 'all' || categories.includes(filterValue)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });

      slider.scrollLeft = 0;
      updateScrollHandle();
    });
  });

  const trackHeight = 220;
  const handleHeight = 44;
  const maxScrollTop = trackHeight - handleHeight;

  function updateScrollHandle() {
    const scrollWidth = slider.scrollWidth - slider.clientWidth;
    if (scrollWidth <= 0) {
      handle.style.top = '0px';
      return;
    }
    const scrollPercentage = slider.scrollLeft / scrollWidth;
    const topOffset = scrollPercentage * maxScrollTop;
    handle.style.top = `${Math.min(maxScrollTop, Math.max(0, topOffset))}px`;
  }

  slider.addEventListener('scroll', updateScrollHandle);

  if ('ResizeObserver' in window) {
    new ResizeObserver(updateScrollHandle).observe(slider);
  }

  if (scrollUp && scrollDown) {
    scrollUp.addEventListener('click', () => {
      slider.scrollBy({ left: -264, behavior: 'smooth' });
    });
    scrollDown.addEventListener('click', () => {
      slider.scrollBy({ left: 264, behavior: 'smooth' });
    });
  }
}
