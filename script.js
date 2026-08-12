(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Navbar scroll state ---------- */
  var navbar = document.getElementById('navbar');
  function onScroll() {
    if (window.scrollY > 40) navbar.classList.add('is-scrolled');
    else navbar.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var burgerBtn = document.getElementById('burgerBtn');
  var mobileMenu = document.getElementById('mobileMenu');

  function closeMenu() {
    mobileMenu.classList.remove('is-open');
    burgerBtn.setAttribute('aria-expanded', 'false');
  }
  function toggleMenu() {
    var isOpen = mobileMenu.classList.toggle('is-open');
    burgerBtn.setAttribute('aria-expanded', String(isOpen));
  }
  burgerBtn.addEventListener('click', toggleMenu);
  mobileMenu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reducedMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var delay = entry.target.getAttribute('data-delay');
            var ms = delay ? parseInt(delay, 10) * 90 : 0;
            setTimeout(function () {
              entry.target.classList.add('is-visible');
            }, ms);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Animated counters (Why Choose Us) ---------- */
  var counters = document.querySelectorAll('.why__stat');
  if ('IntersectionObserver' in window) {
    var counterIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          counterIO.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) { counterIO.observe(el); });
  } else {
    counters.forEach(function (el) { animateCounter(el); });
  }

  function animateCounter(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var isDecimal = el.getAttribute('data-decimal') === 'true';
    var duration = reducedMotion ? 0 : 1400;
    var start = null;

    if (duration === 0) {
      el.textContent = isDecimal ? target.toFixed(1) : Math.round(target);
      return;
    }

    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = target * eased;
      el.textContent = isDecimal ? value.toFixed(1) : Math.round(value);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = isDecimal ? target.toFixed(1) : Math.round(target);
    }
    requestAnimationFrame(step);
  }

  /* ---------- Subtle hero parallax ---------- */
  var heroBg = document.querySelector('.hero__bg-image');
  if (heroBg && !reducedMotion) {
    window.addEventListener(
      'scroll',
      function () {
        var y = window.scrollY;
        if (y < window.innerHeight) {
          heroBg.style.transform = 'translateY(' + y * 0.18 + 'px)';
        }
      },
      { passive: true }
    );
  }

  /* ---------- Gallery lightbox ---------- */
  var galleryItems = document.querySelectorAll('.gallery__item');
  var lightbox = document.getElementById('lightbox');
  var lightboxCaption = document.getElementById('lightboxCaption');
  var lightboxClose = document.getElementById('lightboxClose');

  galleryItems.forEach(function (item) {
    item.addEventListener('click', function () {
      var caption = item.getAttribute('data-caption') || '';
      lightboxCaption.textContent = caption;
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lightboxClose.focus();
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
  });

  /* ---------- Reviews slider ---------- */
  var track = document.getElementById('reviewsTrack');
  var prevBtn = document.getElementById('reviewPrev');
  var nextBtn = document.getElementById('reviewNext');
  var dotsWrap = document.getElementById('reviewDots');
  var cards = track ? track.children : [];
  var current = 0;
  var autoplayId;

  if (track && cards.length) {
    for (var i = 0; i < cards.length; i++) {
      var dot = document.createElement('span');
      if (i === 0) dot.classList.add('is-active');
      (function (idx) {
        dot.addEventListener('click', function () { goTo(idx); });
      })(i);
      dotsWrap.appendChild(dot);
    }

    function goTo(index) {
      current = (index + cards.length) % cards.length;
      track.scrollTo({ left: cards[current].offsetLeft - track.offsetLeft, behavior: reducedMotion ? 'auto' : 'smooth' });
      Array.prototype.forEach.call(dotsWrap.children, function (d, i) {
        d.classList.toggle('is-active', i === current);
      });
    }

    prevBtn.addEventListener('click', function () { stopAutoplay(); goTo(current - 1); });
    nextBtn.addEventListener('click', function () { stopAutoplay(); goTo(current + 1); });

    function startAutoplay() {
      if (reducedMotion) return;
      autoplayId = setInterval(function () { goTo(current + 1); }, 6000);
    }
    function stopAutoplay() {
      clearInterval(autoplayId);
      startAutoplay();
    }
    startAutoplay();
  }

  /* ---------- Appointment form validation ---------- */
  var form = document.getElementById('appointmentForm');
  var successNote = document.getElementById('formSuccess');

  if (form) {
    var dateInput = form.querySelector('#date');
    if (dateInput) {
      var today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;

      Array.prototype.forEach.call(form.elements, function (field) {
        if (!field.name) return;
        field.setAttribute('data-touched', 'true');
        var errorEl = form.querySelector('[data-error-for="' + field.name + '"]');
        if (!errorEl) return;

        if (field.hasAttribute('required') && !field.value.trim()) {
          errorEl.textContent = 'This field is required.';
          valid = false;
        } else if (field.name === 'phone' && field.value && !/^[0-9]{10}$/.test(field.value.trim())) {
          errorEl.textContent = 'Enter a valid 10-digit phone number.';
          valid = false;
        } else {
          errorEl.textContent = '';
        }
      });

      if (!valid) {
        successNote.textContent = '';
        return;
      }

      successNote.textContent = 'Thank you! Your request has been noted — we will call you shortly to confirm.';
      form.reset();
      Array.prototype.forEach.call(form.elements, function (field) {
        field.removeAttribute('data-touched');
      });
    });
  }
})();
