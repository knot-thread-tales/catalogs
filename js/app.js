/**
 * Knot & Thread Tales — Main Application Bootstrap (homepage)
 */
const App = (() => {
  function escapeHtml(str = '') {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function initHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    window.addEventListener('scroll', () => {
      header.classList.toggle('site-header--scrolled', window.scrollY > 24);
    }, { passive: true });

    const menuBtn = document.querySelector('.nav-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    if (menuBtn && mobileNav) {
      menuBtn.addEventListener('click', () => {
        const isOpen = mobileNav.classList.toggle('is-open');
        menuBtn.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('no-scroll', isOpen);
      });
      mobileNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
        mobileNav.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
      }));
    }
  }

  function initYear() {
    document.querySelectorAll('[data-year]').forEach((el) => {
      el.textContent = new Date().getFullYear();
    });
  }

  async function renderFeatured() {
    const container = document.getElementById('featured-products-grid');
    if (!container) return;
    ProductRender.renderSkeletons(container, 4);
    try {
      const products = await ProductsAPI.getFeatured();
      ProductRender.renderGrid(container, products.length ? products : (await ProductsAPI.listProducts({ pageSize: 4 })).data);
    } catch {
      container.innerHTML = '<p class="empty-state__body">Featured pieces are taking a quick break. Please check back shortly.</p>';
    }
  }

  async function renderTrending() {
    const container = document.getElementById('trending-products-grid');
    if (!container) return;
    ProductRender.renderSkeletons(container, 4);
    try {
      const products = await ProductsAPI.getTrending();
      ProductRender.renderGrid(container, products.length ? products : (await ProductsAPI.listProducts({ pageSize: 4, sort: 'bestseller' })).data);
    } catch {
      container.innerHTML = '<p class="empty-state__body">Trending pieces are taking a quick break. Please check back shortly.</p>';
    }
  }

  function categoryCard(cat) {
    return `
      <a class="category-card" href="category.html?id=${cat.id}" data-reveal>
        <div class="category-card__media">
          <img src="${CloudinaryImg.url(cat.image_url, { width: 480 })}" alt="${escapeHtml(cat.name)}" loading="lazy" decoding="async" width="480" height="480">
        </div>
        <span class="category-card__label">${escapeHtml(cat.name)}</span>
      </a>
    `;
  }

  async function renderCategories() {
    const container = document.getElementById('categories-grid');
    if (!container) return;
    try {
      const result = await Supabase.select(CONFIG.TABLES.CATEGORIES, { orderBy: 'sort_order', pageSize: 8 });
      container.innerHTML = result.data.map(categoryCard).join('');
      Motion.init();
      populateCategoryFilters(result.data);
    } catch {
      container.innerHTML = '';
    }
  }

  function populateCategoryFilters(categories) {
    document.querySelectorAll('[data-category-select]').forEach((select) => {
      categories.forEach((cat) => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.name;
        select.appendChild(opt);
      });
    });
  }

  function testimonialCard(t) {
    const stars = Array.from({ length: 5 }, (_, i) =>
      `<svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true" class="${i < (t.rating || 5) ? 'star-filled' : 'star-empty'}"><path d="M10 1l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L10 15.3 4.4 18.2l1.1-6.2L1 7.6l6.2-.9L10 1z"/></svg>`
    ).join('');
    return `
      <figure class="testimonial-card" data-reveal>
        <div class="testimonial-card__stars">${stars}</div>
        <blockquote>${escapeHtml(t.message)}</blockquote>
        <figcaption>
          <span class="testimonial-card__name">${escapeHtml(t.customer_name)}</span>
          ${t.location ? `<span class="testimonial-card__location">${escapeHtml(t.location)}</span>` : ''}
        </figcaption>
      </figure>
    `;
  }

  async function renderTestimonials() {
    const container = document.getElementById('testimonials-grid');
    if (!container) return;
    try {
      const result = await Supabase.select(CONFIG.TABLES.TESTIMONIALS, { orderBy: 'created_at', ascending: false, pageSize: 6 });
      container.innerHTML = result.data.map(testimonialCard).join('');
      Motion.init();
    } catch {
      container.innerHTML = '';
    }
  }

  function faqItem(faq, index) {
    return `
      <div class="faq-item" data-reveal>
        <button class="faq-item__question" aria-expanded="false" aria-controls="faq-answer-${index}" id="faq-q-${index}">
          <span>${escapeHtml(faq.question)}</span>
          <svg class="faq-item__chevron" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div class="faq-item__answer" id="faq-answer-${index}" role="region" aria-labelledby="faq-q-${index}">
          <p>${escapeHtml(faq.answer)}</p>
        </div>
      </div>
    `;
  }

  function bindFaqAccordion(container) {
    container.querySelectorAll('.faq-item__question').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const isOpen = item.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', String(isOpen));
      });
    });
  }

  async function renderFaqs(limit = null) {
    const container = document.getElementById('faq-list');
    if (!container) return;
    try {
      const result = await Supabase.select(CONFIG.TABLES.FAQS, { orderBy: 'sort_order', pageSize: limit || 50 });
      const data = limit ? result.data.slice(0, limit) : result.data;
      container.innerHTML = data.map((f, i) => faqItem(f, i)).join('');
      Motion.init();
      bindFaqAccordion(container);
      injectFaqSchema(data);
    } catch {
      container.innerHTML = '';
    }
  }

  function injectFaqSchema(faqs) {
    if (!faqs.length) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: { '@type': 'Answer', text: f.answer }
      }))
    });
    document.head.appendChild(script);
  }

  function instagramTile(i) {
    return `
      <a class="instagram-tile" href="${CONFIG.INSTAGRAM_URL}" target="_blank" rel="noopener" data-reveal>
        <img src="${CloudinaryImg.thumb('sample_gallery_' + i, 320)}" alt="Knot & Thread Tales on Instagram" loading="lazy" width="320" height="320" onerror="this.closest('.instagram-tile').style.display='none'">
        <span class="instagram-tile__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 2 .3 2.4.5.6.2 1 .5 1.5 1 .4.4.7.9 1 1.5.2.4.4 1.2.5 2.4.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 2-.5 2.4-.2.6-.5 1-1 1.5-.4.4-.9.7-1.5 1-.4.2-1.2.4-2.4.5-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-2-.3-2.4-.5-.6-.2-1-.5-1.5-1-.4-.4-.7-.9-1-1.5-.2-.4-.4-1.2-.5-2.4C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-2 .5-2.4.2-.6.5-1 1-1.5.4-.4.9-.7 1.5-1 .4-.2 1.2-.4 2.4-.5C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.7.1-1 .1-1.6.2-1.9.4-.5.2-.8.4-1.1.7-.3.3-.5.6-.7 1.1-.1.3-.3.9-.4 1.9-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.1 1 .2 1.6.4 1.9.2.5.4.8.7 1.1.3.3.6.5 1.1.7.3.1.9.3 1.9.4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1-.1 1.6-.2 1.9-.4.5-.2.8-.4 1.1-.7.3-.3.5-.6.7-1.1.1-.3.3-.9.4-1.9.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.1-1-.2-1.6-.4-1.9-.2-.5-.4-.8-.7-1.1-.3-.3-.6-.5-1.1-.7-.3-.1-.9-.3-1.9-.4-1.2-.1-1.6-.1-4.7-.1zm0 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 1.8a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4zm5.7-3.4a1.1 1.1 0 1 1 0 2.1 1.1 1.1 0 0 1 0-2.1z"/></svg>
        </span>
      </a>
    `;
  }

  function renderInstagram() {
    const container = document.getElementById('instagram-grid');
    if (!container) return;
    container.innerHTML = Array.from({ length: 6 }, (_, i) => instagramTile(i + 1)).join('');
    container.querySelectorAll('.instagram-tile img').forEach((img) => {
      img.addEventListener('error', () => { img.closest('.instagram-tile').remove(); }, { once: true });
    });
    Motion.init();
  }

  function init() {
    initHeader();
    initYear();
    WhatsAppOrder.init();
    PaymentModal.init();
    ProductDetail.init();
    renderFeatured();
    renderTrending();
    renderCategories();
    renderTestimonials();
    renderFaqs(6);
    renderInstagram();
    Motion.init();
  }

  return { init, renderFaqs, faqItem, bindFaqAccordion, escapeHtml };
})();

document.addEventListener('DOMContentLoaded', () => App.init());
