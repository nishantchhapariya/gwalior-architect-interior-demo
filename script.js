/* ===================================================
   KSK & Associates — Interactive JS
   Mobile-first, accessible, lightweight
   =================================================== */

(function () {
  'use strict';

  /* ─── UTILS ─────────────────────────────────── */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ─── NAV: Scroll shadow ─────────────────────── */
  const navHeader = $('#nav-header');
  const SCROLL_THRESHOLD = 20;

  function handleNavScroll() {
    if (!navHeader) return;
    if (window.scrollY > SCROLL_THRESHOLD) {
      navHeader.classList.add('scrolled');
    } else {
      navHeader.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* ─── MOBILE DRAWER ──────────────────────────── */
  const hamburger     = $('#hamburger');
  const mobileDrawer  = $('#mobile-drawer');
  const drawerOverlay = $('#drawer-overlay');
  const drawerClose   = $('#drawer-close');
  const drawerLinks   = $$('.drawer-link');

  let drawerOpen = false;

  function openDrawer() {
    drawerOpen = true;
    drawerOverlay.classList.add('active');
    mobileDrawer.classList.add('open');
    mobileDrawer.removeAttribute('inert');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Focus first interactive element
    const firstFocus = mobileDrawer.querySelector('button, a');
    if (firstFocus) firstFocus.focus();
  }

  function closeDrawer() {
    drawerOpen = false;
    drawerOverlay.classList.remove('active');
    mobileDrawer.classList.remove('open');
    mobileDrawer.setAttribute('inert', '');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  if (hamburger && mobileDrawer) {
    hamburger.addEventListener('click', () => drawerOpen ? closeDrawer() : openDrawer());
    drawerClose?.addEventListener('click', closeDrawer);
    drawerOverlay?.addEventListener('click', closeDrawer);

    // Close on link click
    drawerLinks.forEach(link => {
      link.addEventListener('click', closeDrawer);
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawerOpen) closeDrawer();
    });
  }

  /* ─── FAQ ACCORDION ──────────────────────────── */
  const faqItems = $$('.faq-item');

  faqItems.forEach(item => {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';

      // Close all others
      faqItems.forEach(other => {
        const otherBtn    = other.querySelector('.faq-question');
        const otherAnswer = other.querySelector('.faq-answer');
        if (otherBtn && otherAnswer && otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherAnswer.hidden = true;
        }
      });

      // Toggle current
      btn.setAttribute('aria-expanded', String(!isExpanded));
      answer.hidden = isExpanded;
    });
  });

  /* ─── SCROLL REVEAL (IntersectionObserver) ──── */
  const revealEls = $$(
    '.trust-card, .service-card, .gallery-card, .why-card, .process-step, .testimonial-card, .faq-item, .map-container'
  );

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Stagger children in a parent grid
            const siblings = $$('.trust-card, .service-card, .gallery-card, .testimonial-card', entry.target.parentElement);
            const idx      = siblings.indexOf(entry.target);
            const delay    = Math.min(idx * 70, 350);

            setTimeout(() => {
              entry.target.classList.add('visible');
            }, delay);

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback: show everything immediately
    revealEls.forEach(el => el.classList.add('visible'));
  }

  /* ─── STICKY WHATSAPP BAR — Scroll Show/Hide ── */
  const stickyBar = $('#sticky-wa-bar');
  let lastScrollY = 0;
  let ticking     = false;

  function handleStickyBar() {
    if (!stickyBar) return;
    const scrollY = window.scrollY;

    // Show after scrolling down 100px; hide when near top
    if (scrollY < 100) {
      stickyBar.style.transform = 'translateY(100%)';
      stickyBar.style.opacity   = '0';
    } else {
      stickyBar.style.transform = 'translateY(0)';
      stickyBar.style.opacity   = '1';
    }

    lastScrollY = scrollY;
    ticking     = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(handleStickyBar);
      ticking = true;
    }
  }, { passive: true });

  // Initial state
  if (stickyBar) {
    stickyBar.style.transform  = 'translateY(100%)';
    stickyBar.style.opacity    = '0';
    stickyBar.style.transition = 'transform 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.35s ease';
  }

  /* ─── SMOOTH SCROLL for anchor links ─────────── */
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = link.getAttribute('href');
      if (!target || target === '#') return;
      const el = document.querySelector(target);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Update URL without jump
        history.pushState(null, '', target);
      }
    });
  });

  /* ─── NAV active link highlight ─────────────── */
  const sections   = $$('section[id]');
  const navLinks   = $$('.nav-link');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.style.fontWeight = link.getAttribute('href') === `#${id}` ? '700' : '';
            link.style.color      = link.getAttribute('href') === `#${id}` ? 'var(--clr-charcoal)' : '';
          });
        }
      });
    },
    { threshold: 0.3, rootMargin: '-60px 0px -60px 0px' }
  );

  sections.forEach(section => sectionObserver.observe(section));

  /* ─── Done ───────────────────────────────────── */
  console.log('%c KSK & Associates 🏛️ ', 'background:#2c2826;color:#c9a96e;font-size:1rem;padding:4px 8px;border-radius:4px;');

})();
