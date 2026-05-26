/**
 * main.js — The Moksha Retreat
 * Navbar, mobile menu, scrolling, booking, testimonials, WhatsApp, footer year
 */

'use strict';

/* ============================================================
   UTILITY HELPERS
   ============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   1. SCROLL PROGRESS INDICATOR
   ============================================================ */
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  }, { passive: true });
}

/* ============================================================
   2. NAVBAR — transparent → frosted glass on scroll
   ============================================================ */
function initNavbar() {
  const navbar = $('.navbar');
  if (!navbar) return;

  const THRESHOLD = 60;

  function updateNavbar() {
    if (window.scrollY > THRESHOLD) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar(); // initial check
}

/* ============================================================
   3. MOBILE MENU TOGGLE
   ============================================================ */
function initMobileMenu() {
  const hamburger = $('.hamburger');
  const mobileNav = $('.mobile-nav');
  if (!hamburger || !mobileNav) return;

  let isOpen = false;

  function openMenu() {
    isOpen = true;
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    isOpen = false;
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    isOpen ? closeMenu() : openMenu();
  });

  // Close on nav link click
  $$('.mobile-nav .nav-link, .mobile-nav .btn', mobileNav).forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });

  // Close on outside click
  mobileNav.addEventListener('click', e => {
    if (e.target === mobileNav) closeMenu();
  });
}

/* ============================================================
   4. SMOOTH SCROLLING FOR ANCHOR LINKS
   ============================================================ */
function initSmoothScroll() {
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const targetId = link.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-h')) || 70;
    const top = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
}

/* ============================================================
   5. ACTIVE NAV LINK HIGHLIGHTING
   ============================================================ */
function initActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  $$('.nav-link, .mobile-nav .nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    const hrefFile = href.split('/').pop();
    if (
      hrefFile === path ||
      (path === '' && hrefFile === 'index.html') ||
      (path === 'index.html' && hrefFile === 'index.html') ||
      (hrefFile === '' && (path === '' || path === 'index.html'))
    ) {
      link.classList.add('active');
    }
  });
}

/* ============================================================
   6. BOOKING CARD — date defaults + validation
   ============================================================ */
function initBookingCard() {
  const checkInInput  = $('input[name="checkin"], #checkin');
  const checkOutInput = $('input[name="checkout"], #checkout');
  if (!checkInInput || !checkOutInput) return;

  // Set default dates (today + 3 days)
  const today = new Date();
  const futureDate = new Date(today);
  futureDate.setDate(today.getDate() + 3);

  function formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  checkInInput.min  = formatDate(today);
  checkInInput.value = formatDate(today);
  checkOutInput.min  = formatDate(futureDate);
  checkOutInput.value = formatDate(futureDate);

  // When check-in changes, ensure check-out is after
  checkInInput.addEventListener('change', () => {
    const checkinDate = new Date(checkInInput.value);
    const minCheckout = new Date(checkinDate);
    minCheckout.setDate(checkinDate.getDate() + 1);
    checkOutInput.min = formatDate(minCheckout);
    if (new Date(checkOutInput.value) <= checkinDate) {
      checkOutInput.value = formatDate(minCheckout);
    }
  });

  // Booking form submit
  const bookingForm = $('.booking-card form, #booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', e => {
      e.preventDefault();
      const checkin  = checkInInput.value;
      const checkout = checkOutInput.value;
      const guests   = $('select[name="guests"], #guests')?.value || '2';
      const msg = encodeURIComponent(
        `Hello! I'd like to book at The Moksha Retreat.\n\nCheck-in: ${checkin}\nCheck-out: ${checkout}\nGuests: ${guests}\n\nPlease confirm availability.`
      );
      window.open(`https://wa.me/919876543210?text=${msg}`, '_blank');
    });
  }

  // Booking card button (if not inside a form)
  const bookBtn = $('.booking-card .btn-book, #book-btn');
  if (bookBtn && !bookingForm) {
    bookBtn.addEventListener('click', () => {
      const checkin  = checkInInput.value;
      const checkout = checkOutInput.value;
      const guests   = $('select[name="guests"], #guests')?.value || '2';
      const msg = encodeURIComponent(
        `Hello! I'd like to book at The Moksha Retreat.\n\nCheck-in: ${checkin}\nCheck-out: ${checkout}\nGuests: ${guests}\n\nPlease confirm availability.`
      );
      window.open(`https://wa.me/919876543210?text=${msg}`, '_blank');
    });
  }
}

/* ============================================================
   7. TESTIMONIALS SLIDER
   ============================================================ */
function initTestimonials() {
  const wrapper = $('.testimonials-wrapper');
  if (!wrapper) return;

  const track    = $('.testimonials-track', wrapper);
  const slides   = $$('.testimonial-slide', wrapper);
  const dotsContainer = $('.testimonials-dots');
  const prevBtn  = $('.testimonials-btn.prev');
  const nextBtn  = $('.testimonials-btn.next');

  if (!track || slides.length === 0) return;

  let current  = 0;
  let autoTimer = null;
  const AUTOPLAY_MS = 5500;

  // Build dots
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });
  }

  function updateDots(idx) {
    if (!dotsContainer) return;
    $$('.dot', dotsContainer).forEach((d, i) => {
      d.classList.toggle('active', i === idx);
    });
  }

  function goTo(idx) {
    current = (idx + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    updateDots(current);
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  prevBtn?.addEventListener('click', () => { prev(); resetAuto(); });
  nextBtn?.addEventListener('click', () => { next(); resetAuto(); });

  // Touch swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
      resetAuto();
    }
  }, { passive: true });

  // Keyboard navigation
  wrapper.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { prev(); resetAuto(); }
    if (e.key === 'ArrowRight') { next(); resetAuto(); }
  });
  wrapper.setAttribute('tabindex', '0');

  function startAuto() {
    autoTimer = setInterval(next, AUTOPLAY_MS);
  }
  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  // Pause on hover
  wrapper.addEventListener('mouseenter', () => clearInterval(autoTimer));
  wrapper.addEventListener('mouseleave', startAuto);

  goTo(0);
  startAuto();
}

/* ============================================================
   8. WhatsApp CTA HANDLER
   ============================================================ */
function initWhatsApp() {
  const WA_URL = 'https://wa.me/919876543210?text=Hello!%20I%27m%20interested%20in%20booking%20at%20The%20Moksha%20Retreat%2C%20Kasar%20Devi';

  $$('[data-whatsapp]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      window.open(WA_URL, '_blank', 'noopener noreferrer');
    });
  });

  // FAB
  const fab = $('.whatsapp-fab');
  if (fab && !fab.getAttribute('href')) {
    fab.addEventListener('click', e => {
      e.preventDefault();
      window.open(WA_URL, '_blank', 'noopener noreferrer');
    });
  }
}

/* ============================================================
   9. FAQ ACCORDION
   ============================================================ */
function initFAQ() {
  $$('.faq-item').forEach(item => {
    const question = $('.faq-question', item);
    const answer   = $('.faq-answer', item);
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      $$('.faq-item.open').forEach(openItem => {
        openItem.classList.remove('open');
        const a = $('.faq-answer', openItem);
        if (a) a.style.maxHeight = '0';
      });

      // Open clicked if it was closed
      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

/* ============================================================
   10. FOOTER — CURRENT YEAR
   ============================================================ */
function initFooterYear() {
  $$('.js-year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
}

/* ============================================================
   11. CONTACT FORM
   ============================================================ */
function initContactForm() {
  const form = $('.contact-form form, #contact-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    // Let Formspree handle it naturally if action is set
    const action = form.getAttribute('action');
    if (!action || action.includes('YOUR_FORM_ID')) {
      e.preventDefault();
      // Fallback: open WhatsApp
      const name    = (form.querySelector('[name="name"]')?.value || '').trim();
      const email   = (form.querySelector('[name="email"]')?.value || '').trim();
      const message = (form.querySelector('[name="message"]')?.value || '').trim();
      const msg = encodeURIComponent(
        `Hello! I'm ${name} (${email}).\n\n${message}`
      );
      window.open(`https://wa.me/919876543210?text=${msg}`, '_blank');
    }
  });
}

/* ============================================================
   12. SMOOTH HOVER on BOOKING CARD inputs (visual feedback)
   ============================================================ */
function initBookingCardFocus() {
  $$('.booking-field input, .booking-field select').forEach(el => {
    el.addEventListener('focus', () => {
      el.closest('.booking-field')?.classList.add('focused');
    });
    el.addEventListener('blur', () => {
      el.closest('.booking-field')?.classList.remove('focused');
    });
  });
}

/* ============================================================
   13. INIT ALL
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initNavbar();
  initMobileMenu();
  initSmoothScroll();
  initActiveNav();
  initBookingCard();
  initBookingCardFocus();
  initTestimonials();
  initWhatsApp();
  initFAQ();
  initFooterYear();
  initContactForm();
});
