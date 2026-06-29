/**
 * Knot & Thread Tales — Category Page Controller
 */
(function () {
  function escapeHtml(str = '') {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function initHeader() {
    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', () => {
      header.classList.toggle('site-header--scrolled', window.scrollY > 24);
    }, { passive: true });

    const menuBtn = document.querySelector('.nav-toggle');
    const mobileNav = document.querySelector('.mobile-nav');
    menuBtn.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('no-scroll', isOpen);
    });
    document.querySelectorAll('[data-year]').forEach((el) => el.textContent = new Date().getFullYear());
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

  async function renderAllCategories() {
    const container = document.getElementById('categories-grid');
    try {
      const result = await Supabase.select(CONFIG.TABLES.CATEGORIES, { orderBy: 'sort_order', pageSize: 30 });
      container.innerHTML = result.data.map(categoryCard).join('');
      Motion.init();
    } catch {
      container.innerHTML = '<p class="empty-state__body">Categories could not be loaded right now.</p>';
    }
  }

  function renderCategoryHero(category) {
    const wrap = document.getElementById('category-hero-wrap');
    wrap.innerHTML = `
      <div class="page-hero">
        <div class="container">
          <span class="page-hero__eyebrow">Category</span>
          <h1>${escapeHtml(category.name)}</h1>
          ${category.description ? `<p>${escapeHtml(category.description)}</p>` : ''}
        </div>
      </div>
    `;
  }

  async function initSingleCategory(categoryId) {
    document.getElementById('all-categories-section').hidden = true;
    document.getElementById('category-products-section').hidden = false;

    let category = null;
    try {
      const result = await Supabase.select(CONFIG.TABLES.CATEGORIES, {
        filters: { id: { op: 'eq', value: categoryId } },
        single: true,
        pageSize: 1
      });
      category = result.data;
    } catch {}

    if (category) {
      renderCategoryHero(category);
      document.getElementById('breadcrumb-current').textContent = category.name;
      document.title = `${category.name} — Knot & Thread Tales`;
    }

    SearchEngine.setInitialState({ categoryId: String(categoryId) });

    document.getElementById('filter-sort').addEventListener('change', (e) => {
      SearchEngine.setInitialState({ sort: e.target.value, page: 1 });
      SearchEngine.run(
        document.getElementById('results-grid'),
        document.getElementById('results-pagination'),
        document.getElementById('results-count')
      );
    });

    SearchEngine.run(
      document.getElementById('results-grid'),
      document.getElementById('results-pagination'),
      document.getElementById('results-count')
    );
  }

  document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    WhatsAppOrder.init();
    PaymentModal.init();
    ProductDetail.init();

    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('id');

    if (categoryId) {
      initSingleCategory(categoryId);
    } else {
      renderAllCategories();
    }
  });
})();
