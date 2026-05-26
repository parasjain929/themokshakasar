/**
 * gallery.js — The Moksha Retreat
 * Masonry layout, lightbox, lazy loading, filter tabs
 */

'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ============================================================
   GALLERY DATA
   ============================================================ */
const GALLERY_ITEMS = [
  {
    src: 'assets/gallery/g1.jpg',
    thumb: 'assets/gallery/g1.jpg',
    caption: 'The cottages at golden hour — Kasar Devi',
    category: 'property',
    tall: true
  },
  {
    src: 'assets/gallery/g5.jpg',
    thumb: 'assets/gallery/g5.jpg',
    caption: 'Deluxe Himalaya Facing Cottage — open to the peaks',
    category: 'rooms',
    tall: false
  },
  {
    src: 'assets/gallery/g3.jpg',
    thumb: 'assets/gallery/g3.jpg',
    caption: 'Indoor infinity pool with mountain views',
    category: 'experiences',
    tall: true
  },
  {
    src: 'assets/gallery/g4.jpg',
    thumb: 'assets/gallery/g4.jpg',
    caption: 'Attic suite terrace — your own private Himalayan balcony',
    category: 'rooms',
    tall: false
  },
  {
    src: 'assets/gallery/g2.jpg',
    thumb: 'assets/gallery/g2.jpg',
    caption: 'Twilight over the retreat, valley below',
    category: 'property',
    tall: false
  },
  {
    src: 'assets/gallery/g6.jpg',
    thumb: 'assets/gallery/g6.jpg',
    caption: 'Attic suite — staircase, TV, and mountain morning table',
    category: 'rooms',
    tall: true
  },
  {
    src: 'assets/gallery/g11.jpg',
    thumb: 'assets/gallery/g11.jpg',
    caption: 'Deluxe cottage warm interiors with tree wall art',
    category: 'rooms',
    tall: false
  },
  {
    src: 'assets/gallery/g8.jpg',
    thumb: 'assets/gallery/g8.jpg',
    caption: 'Himalayan Heights Room — clean and serene',
    category: 'rooms',
    tall: false
  },
  {
    src: 'assets/gallery/g13.jpg',
    thumb: 'assets/gallery/g13.jpg',
    caption: 'The cottages nestled in the hillside at dusk',
    category: 'property',
    tall: true
  },
  {
    src: 'assets/gallery/g12.jpg',
    thumb: 'assets/gallery/g12.jpg',
    caption: 'Deluxe cottage with valley balcony and sitting area',
    category: 'rooms',
    tall: false
  },
  {
    src: 'assets/gallery/g7.jpg',
    thumb: 'assets/gallery/g7.jpg',
    caption: 'Attic suite with private balcony and chairs',
    category: 'rooms',
    tall: false
  },
  {
    src: 'assets/gallery/g9.jpg',
    thumb: 'assets/gallery/g9.jpg',
    caption: 'Himalayan Heights — wider view with wardrobe',
    category: 'rooms',
    tall: true
  },
  {
    src: 'assets/gallery/g10.jpg',
    thumb: 'assets/gallery/g10.jpg',
    caption: 'Himalayan Heights — bright natural mountain light',
    category: 'rooms',
    tall: false
  },
  {
    src: 'assets/gallery/g14.jpg',
    thumb: 'assets/gallery/g14.jpg',
    caption: 'Premium suite bathroom with LED mirror',
    category: 'rooms',
    tall: false
  },
  {
    src: 'assets/gallery/g15.jpg',
    thumb: 'assets/gallery/g15.jpg',
    caption: 'En-suite marble bathroom — fresh towels, mountain light',
    category: 'rooms',
    tall: false
  },
  {
    src: 'assets/gallery/g16.jpg',
    thumb: 'assets/gallery/g16.jpg',
    caption: 'Bathroom with a forest view through the window',
    category: 'rooms',
    tall: false
  }
];

/* ============================================================
   FILTER TABS
   ============================================================ */
let currentFilter = 'all';
let filteredItems  = [...GALLERY_ITEMS];

function initFilterTabs() {
  const tabs = $$('.filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter || 'all';
      filteredItems  = currentFilter === 'all'
        ? [...GALLERY_ITEMS]
        : GALLERY_ITEMS.filter(item => item.category === currentFilter);
      renderMasonry();
    });
  });
}

/* ============================================================
   MASONRY RENDER
   ============================================================ */
function renderMasonry() {
  const grid = $('.gallery-masonry');
  if (!grid) return;

  // Fade out
  grid.style.opacity = '0';
  grid.style.transition = 'opacity 0.25s ease';

  setTimeout(() => {
    grid.innerHTML = '';
    filteredItems.forEach((item, idx) => {
      const el = document.createElement('div');
      el.className = 'gallery-item reveal';
      el.dataset.index = idx;
      el.innerHTML = `
        <img
          src="${item.thumb}"
          alt="${item.caption}"
          loading="lazy"
          class="lazy-load"
          data-src="${item.src}"
        />
        <div class="gallery-item-overlay">
          <span>🔍</span>
          <p class="gallery-item-caption">${item.caption}</p>
        </div>
      `;
      el.addEventListener('click', () => openLightbox(idx));
      grid.appendChild(el);
    });

    // Fade in
    grid.style.opacity = '1';

    // Trigger lazy load for new images
    initLazyLoad();

    // Trigger scroll reveal for new items
    setTimeout(() => {
      $$('.gallery-item.reveal', grid).forEach(el => {
        scrollRevealObserver.observe(el);
      });
    }, 50);
  }, 260);
}

/* ============================================================
   LAZY LOADING
   ============================================================ */
let lazyObserver = null;

function initLazyLoad() {
  const lazyImages = $$('img.lazy-load');
  if (!lazyImages.length) return;

  if ('IntersectionObserver' in window) {
    if (lazyObserver) {
      lazyImages.forEach(img => lazyObserver.observe(img));
      return;
    }
    lazyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.addEventListener('load', () => {
              img.classList.add('loaded');
            });
            img.removeAttribute('data-src');
          }
          lazyObserver.unobserve(img);
        }
      });
    }, { rootMargin: '200px 0px' });

    lazyImages.forEach(img => lazyObserver.observe(img));
  } else {
    // Fallback: load all immediately
    lazyImages.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        img.classList.add('loaded');
      }
    });
  }
}

/* ============================================================
   SCROLL REVEAL OBSERVER (used by gallery items)
   ============================================================ */
let scrollRevealObserver = null;

function initScrollRevealObserver() {
  if (!('IntersectionObserver' in window)) {
    $$('.reveal').forEach(el => el.classList.add('revealed'));
    return;
  }
  scrollRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        scrollRevealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal').forEach(el => scrollRevealObserver.observe(el));
}

/* ============================================================
   LIGHTBOX
   ============================================================ */
let lightboxCurrentIndex = 0;

function buildLightbox() {
  if ($('#gallery-lightbox')) return;

  const lb = document.createElement('div');
  lb.id = 'gallery-lightbox';
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Image lightbox');

  lb.innerHTML = `
    <button class="lightbox-close" aria-label="Close lightbox">✕</button>
    <div class="lightbox-inner">
      <button class="lightbox-prev" aria-label="Previous image">‹</button>
      <img class="lightbox-img" src="" alt="" />
      <button class="lightbox-next" aria-label="Next image">›</button>
    </div>
    <div class="lightbox-meta">
      <p class="lightbox-counter"></p>
      <p class="lightbox-caption"></p>
    </div>
  `;

  document.body.appendChild(lb);

  // Bind events
  lb.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lb.querySelector('.lightbox-prev').addEventListener('click', lightboxPrev);
  lb.querySelector('.lightbox-next').addEventListener('click', lightboxNext);

  // Click outside image to close
  lb.addEventListener('click', e => {
    if (e.target === lb) closeLightbox();
  });

  // Touch swipe
  let touchStart = 0;
  lb.addEventListener('touchstart', e => { touchStart = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? lightboxNext() : lightboxPrev();
  }, { passive: true });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowRight') lightboxNext();
    if (e.key === 'ArrowLeft')  lightboxPrev();
  });
}

function openLightbox(idx) {
  lightboxCurrentIndex = idx;
  const lb = $('#gallery-lightbox');
  if (!lb) return;
  updateLightboxContent();
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
  lb.querySelector('.lightbox-img').focus();
}

function closeLightbox() {
  const lb = $('#gallery-lightbox');
  if (!lb) return;
  lb.classList.remove('open');
  document.body.style.overflow = '';
}

function lightboxNext() {
  lightboxCurrentIndex = (lightboxCurrentIndex + 1) % filteredItems.length;
  updateLightboxContent();
}

function lightboxPrev() {
  lightboxCurrentIndex = (lightboxCurrentIndex - 1 + filteredItems.length) % filteredItems.length;
  updateLightboxContent();
}

function updateLightboxContent() {
  const lb = $('#gallery-lightbox');
  if (!lb) return;
  const item = filteredItems[lightboxCurrentIndex];
  if (!item) return;

  const img     = lb.querySelector('.lightbox-img');
  const counter = lb.querySelector('.lightbox-counter');
  const caption = lb.querySelector('.lightbox-caption');

  // Animate image swap
  img.style.opacity = '0';
  img.style.transition = 'opacity 0.2s ease';

  setTimeout(() => {
    img.src = item.src;
    img.alt = item.caption;
    img.onload = () => {
      img.style.opacity = '1';
    };
    // Handle cached images
    if (img.complete) img.style.opacity = '1';
  }, 150);

  if (counter) counter.textContent = `${lightboxCurrentIndex + 1} of ${filteredItems.length}`;
  if (caption) caption.textContent = item.caption;
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initScrollRevealObserver();
  initFilterTabs();
  buildLightbox();
  renderMasonry();
  initLazyLoad();
});
