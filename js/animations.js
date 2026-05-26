/**
 * animations.js — The Moksha Retreat
 * IntersectionObserver scroll reveal, parallax, number counters,
 * stagger children, hero mouse parallax
 */

'use strict';

const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   1. SCROLL REVEAL — IntersectionObserver
   ============================================================ */
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    $$('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children').forEach(el => {
      el.classList.add('revealed');
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.10,
    rootMargin: '0px 0px -48px 0px'
  });

  $$('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children').forEach(el => {
    observer.observe(el);
  });
}

/* ============================================================
   2. PARALLAX SCROLLING — hero image depth effect
   ============================================================ */
function initParallax() {
  const parallaxEls = $$('.parallax-img');
  if (parallaxEls.length === 0) return;

  let ticking = false;

  function updateParallax() {
    const scrollY = window.scrollY;
    parallaxEls.forEach(el => {
      const container = el.closest('.parallax-container') || el.parentElement;
      const rect = container.getBoundingClientRect();
      // Only animate if visible
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const rate   = parseFloat(el.dataset.parallaxRate || '0.35');
      const offset = scrollY * rate;
      el.style.transform = `translateY(${offset}px)`;
    });
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  updateParallax();
}

/* ============================================================
   3. HERO MOUSE PARALLAX — subtle depth on mouse move
   ============================================================ */
function initHeroMouseParallax() {
  const hero = $('.hero');
  const heroBg = $('.hero-bg img');
  if (!hero || !heroBg) return;

  const STRENGTH = 12; // pixels max displacement

  hero.addEventListener('mousemove', e => {
    const rect = hero.getBoundingClientRect();
    const cx   = rect.width / 2;
    const cy   = rect.height / 2;
    const dx   = (e.clientX - rect.left - cx) / cx;
    const dy   = (e.clientY - rect.top  - cy) / cy;

    heroBg.style.transform = `scale(1.06) translate(${dx * STRENGTH * -1}px, ${dy * STRENGTH * -0.5}px)`;
  });

  hero.addEventListener('mouseleave', () => {
    heroBg.style.transform = 'scale(1.05) translate(0, 0)';
  });
}

/* ============================================================
   4. NUMBER COUNTER ANIMATION
   ============================================================ */
function animateCounter(el) {
  const text   = el.textContent.trim();
  // Extract: prefix (e.g. ₹), number part, suffix (e.g. m, +, %)
  const match  = text.match(/^([^0-9]*)(\d+[\.,]?\d*)([^0-9]*)$/);
  if (!match) return;

  const prefix = match[1] || '';
  const target = parseFloat(match[2].replace(',', ''));
  const suffix = match[3] || '';

  if (isNaN(target)) return;

  const DURATION = 1800; // ms
  const start    = performance.now();

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function tick(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / DURATION, 1);
    const eased    = easeOutCubic(progress);
    const current  = Math.round(eased * target);

    el.textContent = prefix + current.toLocaleString() + suffix;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = text; // restore exact original text
      el.classList.add('popping');
      setTimeout(() => el.classList.remove('popping'), 400);
    }
  }

  requestAnimationFrame(tick);
}

function initCounters() {
  const counters = $$('.stat-number[data-count], .counter');

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* ============================================================
   5. STAGGER CHILDREN ANIMATION
   ============================================================ */
function initStaggerChildren() {
  // Already handled via CSS + reveal class — this adds additional
  // delay refinement for deeply nested grids
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  $$('.stagger-children').forEach(el => observer.observe(el));
}

/* ============================================================
   6. HERO STAGGER TEXT REVEAL
   ============================================================ */
function initHeroStagger() {
  // CSS handles the hero animations via animation keyframes
  // This JS adds additional class triggers for elements without animations
  const heroContent = $('.hero-content');
  if (!heroContent) return;

  // Hero is always in viewport, so trigger immediately
  heroContent.classList.add('revealed');
}

/* ============================================================
   7. IMAGE LOAD FADE-IN (for non-gallery pages)
   ============================================================ */
function initImageFadeIn() {
  $$('img:not(.lazy-load)').forEach(img => {
    if (img.complete) {
      img.classList.add('loaded');
      return;
    }
    img.addEventListener('load', () => img.classList.add('loaded'));
    img.addEventListener('error', () => img.classList.add('loaded')); // prevent broken forever
  });
}

/* ============================================================
   8. SECTION LABEL ANIMATION (typewriter-like reveal)
   ============================================================ */
function initSectionLabels() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInLeft 0.6s ease forwards';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  $$('.section-label').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
}

/* ============================================================
   9. SPLIT SECTION ENTER ANIMATIONS
   ============================================================ */
function initSplitSections() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const section = entry.target;
        const textEl  = section.querySelector('.split-text');
        const imgEl   = section.querySelector('.split-image');
        const isReverse = section.classList.contains('reverse');

        if (textEl) {
          textEl.style.animation = `fadeIn${isReverse ? 'Right' : 'Left'} 0.8s 0.1s ease both`;
        }
        if (imgEl) {
          imgEl.style.animation = `fadeIn${isReverse ? 'Left' : 'Right'} 0.8s 0.25s ease both`;
        }
        observer.unobserve(section);
      }
    });
  }, { threshold: 0.15 });

  $$('.split-section').forEach(el => observer.observe(el));
}

/* ============================================================
   10. BOOKING CARD FLOAT ANIMATION
   ============================================================ */
function initBookingCardFloat() {
  const card = $('.booking-card');
  if (!card) return;
  // Already using CSS class float — just ensure it's set
  // card.classList.add('float'); // Optional, can be too distracting
}

/* ============================================================
   INIT ALL
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initParallax();
  initHeroMouseParallax();
  initCounters();
  initStaggerChildren();
  initHeroStagger();
  initImageFadeIn();
  initSectionLabels();
  initSplitSections();
  initBookingCardFloat();
});
