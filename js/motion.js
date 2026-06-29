/**
 * Knot & Thread Tales — Motion Engine
 */
const Motion = (() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function revealAll() {
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('is-revealed'));
    document.querySelectorAll('[data-thread-stroke]').forEach((el) => el.classList.add('is-drawn'));
  }

  function observe(selector, className, options = {}) {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add(className));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.revealDelay || 0;
          setTimeout(() => entry.target.classList.add(className), Number(delay));
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px', ...options });

    els.forEach((el) => observer.observe(el));
  }

  function staggerChildren(containerSelector, childSelector, stepMs = 80) {
    document.querySelectorAll(containerSelector).forEach((container) => {
      const children = container.querySelectorAll(childSelector);
      children.forEach((child, i) => {
        child.dataset.revealDelay = String(i * stepMs);
      });
    });
  }

  function initParallax() {
    if (reduceMotion) return;
    const layers = document.querySelectorAll('[data-parallax]');
    if (!layers.length) return;

    let ticking = false;
    function update() {
      const scrollY = window.scrollY;
      layers.forEach((layer) => {
        const speed = parseFloat(layer.dataset.parallax) || 0.15;
        layer.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`;
      });
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href');
        if (id.length <= 1) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });
  }

  function init() {
    staggerChildren('[data-stagger]', ':scope > *');
    observe('[data-reveal]', 'is-revealed');
    observe('[data-thread-stroke]', 'is-drawn');
    initParallax();
    initSmoothAnchors();
  }

  return { init, revealAll };
})();
