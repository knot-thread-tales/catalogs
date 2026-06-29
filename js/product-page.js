/**
 * Knot & Thread Tales — Standalone Product Page Controller
 */
(function () {
  let currentProduct = null;
  let activeIndex = 0;

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

  function thumbsMarkup(gallery) {
    return gallery.map((img, i) => `
      <button class="gallery-thumb ${i === 0 ? 'is-active' : ''}" data-index="${i}" aria-label="View image ${i + 1}">
        <img src="${CloudinaryImg.thumb(img, 96)}" alt="" loading="lazy" width="64" height="64">
      </button>
    `).join('');
  }

  function colorsMarkup(colors) {
    if (!colors.length) return '';
    return `
      <div class="detail-attr">
        <span class="detail-attr__label">Available colors</span>
        <div class="color-swatches">
          ${colors.map((c) => `<span class="color-swatch" title="${escapeHtml(c)}" style="background:${escapeHtml(c.toLowerCase())}"></span>`).join('')}
        </div>
      </div>
    `;
  }

  function setActiveImage(index) {
    activeIndex = index;
    const img = currentProduct.gallery[index];
    const mainImg = document.getElementById('pp-main-img');
    mainImg.src = CloudinaryImg.url(img, { width: 900 });
    mainImg.srcset = CloudinaryImg.srcset(img);
    document.querySelectorAll('.gallery-thumb').forEach((t, i) => t.classList.toggle('is-active', i === index));
  }

  function openFullscreen() {
    const lightbox = document.getElementById('fullscreen-lightbox');
    document.getElementById('fullscreen-img').src = CloudinaryImg.url(currentProduct.gallery[activeIndex], { width: 1600 });
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
  }

  function closeFullscreen() {
    const lightbox = document.getElementById('fullscreen-lightbox');
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
  }

  function injectSeo(product) {
    document.getElementById('page-title').textContent = `${product.name} — Knot & Thread Tales`;
    document.getElementById('page-description').setAttribute('content', product.description.slice(0, 155) || `${product.name}, handmade by Knot & Thread Tales.`);
    document.getElementById('page-canonical').setAttribute('href', `https://yourusername.github.io/knot-thread-tales/product.html?slug=${product.slug}`);

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: product.name,
      image: product.gallery.map((g) => CloudinaryImg.url(g, { width: 800 })),
      description: product.description,
      sku: product.code,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: product.offerPrice || product.price,
        availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
      }
    });
    document.head.appendChild(script);
  }

  function render(product) {
    currentProduct = product;
    activeIndex = 0;

    document.getElementById('breadcrumb-current').textContent = product.name;

    document.getElementById('pp-gallery-main').innerHTML = `
      <img id="pp-main-img" src="${CloudinaryImg.url(product.gallery[0], { width: 900 })}"
           srcset="${CloudinaryImg.srcset(product.gallery[0])}"
           sizes="(min-width: 860px) 540px, 90vw"
           alt="${escapeHtml(product.name)}" loading="eager" decoding="async">
      <button class="gallery-zoom-btn" id="pp-fullscreen-btn" aria-label="View fullscreen">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M3 3h7v2H5v5H3V3zm14 0h-7v2h5v5h2V3zM3 21h7v-2H5v-5H3v7zm14 0h-7v-2h5v-5h2v7z"/></svg>
      </button>
    `;
    document.getElementById('pp-thumbs').innerHTML = thumbsMarkup(product.gallery);

    document.getElementById('pp-info').innerHTML = `
      <div class="product-card__badges product-modal__badges">${ProductRender.badgeMarkup(product)}</div>
      <p class="product-modal__code">Code: ${escapeHtml(product.code || '—')}</p>
      <h1 class="product-modal__name">${escapeHtml(product.name)}</h1>
      <p class="product-modal__price">${ProductRender.priceMarkup(product)}</p>
      <p class="product-modal__desc">${escapeHtml(product.description)}</p>
      <div class="detail-attrs">
        ${product.dimensions ? `<div class="detail-attr"><span class="detail-attr__label">Dimensions</span><span>${escapeHtml(product.dimensions)}</span></div>` : ''}
        ${product.materials ? `<div class="detail-attr"><span class="detail-attr__label">Materials used</span><span>${escapeHtml(product.materials)}</span></div>` : ''}
        ${product.washingInstructions ? `<div class="detail-attr"><span class="detail-attr__label">Care instructions</span><span>${escapeHtml(product.washingInstructions)}</span></div>` : ''}
        <div class="detail-attr"><span class="detail-attr__label">Estimated delivery</span><span>${escapeHtml(product.estimatedDelivery)}</span></div>
        ${product.customizationOptions ? `<div class="detail-attr"><span class="detail-attr__label">Customization options</span><span>${escapeHtml(product.customizationOptions)}</span></div>` : ''}
        ${colorsMarkup(product.availableColors)}
      </div>
      <button class="btn btn--whatsapp btn--block btn--lg" id="pp-order-btn">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.2-.1-.4-.1-.6.1-.2.2-.6.9-.8 1-.1.2-.3.2-.5.1-1.4-.6-2.4-1.4-3.3-2.8-.1-.2-.1-.4.1-.5.2-.2.4-.4.6-.7.1-.2.1-.4 0-.6-.1-.2-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.5 3.8 2.2.8 2.6.6 3.1.6.5-.1 1.6-.6 1.8-1.3.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.4z"/><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l4.9-1.3A10 10 0 1 0 12 2zm0 18.2c-1.7 0-3.4-.5-4.8-1.4l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2z"/></svg>
        Order via WhatsApp
      </button>
    `;

    document.querySelectorAll('.gallery-thumb').forEach((btn) => {
      btn.addEventListener('click', () => setActiveImage(Number(btn.dataset.index)));
    });
    document.getElementById('pp-fullscreen-btn').addEventListener('click', openFullscreen);
    document.getElementById('pp-order-btn').addEventListener('click', () => {
      WhatsAppOrder.openModal({
        code: product.code, name: product.name, price: product.price,
        offerPrice: product.offerPrice, image: product.image, slug: product.slug
      });
    });

    injectSeo(product);
    loadRelated(product);
  }

  async function loadRelated(product) {
    try {
      const result = await ProductsAPI.listProducts({ categoryId: product.categoryId, pageSize: 4 });
      const related = result.data.filter((p) => p.id !== product.id).slice(0, 4);
      if (!related.length) return;
      document.getElementById('related-section').hidden = false;
      ProductRender.renderGrid(document.getElementById('related-grid'), related);
    } catch {}
  }

  async function init() {
    initHeader();
    WhatsAppOrder.init();
    PaymentModal.init();

    document.querySelectorAll('[data-close-lightbox]').forEach((el) => el.addEventListener('click', closeFullscreen));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const lightbox = document.getElementById('fullscreen-lightbox');
        if (lightbox.classList.contains('is-open')) closeFullscreen();
      }
      if (currentProduct && e.key === 'ArrowRight') setActiveImage((activeIndex + 1) % currentProduct.gallery.length);
      if (currentProduct && e.key === 'ArrowLeft') setActiveImage((activeIndex - 1 + currentProduct.gallery.length) % currentProduct.gallery.length);
    });

    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    if (!slug) {
      document.getElementById('product-page-content').innerHTML = '<div class="empty-state"><p class="empty-state__title">No product specified</p><p class="empty-state__body">Please go back to the shop and choose a piece.</p></div>';
      return;
    }

    try {
      const product = await ProductsAPI.getProductBySlug(slug);
      if (!product) {
        document.getElementById('product-page-content').innerHTML = '<div class="empty-state"><p class="empty-state__title">This piece could not be found</p><p class="empty-state__body">It may have sold out or moved. <a href="products.html">Browse the shop</a> instead.</p></div>';
        return;
      }
      render(product);
    } catch {
      document.getElementById('product-page-content').innerHTML = '<div class="empty-state"><p class="empty-state__title">Something went wrong</p><p class="empty-state__body">Please refresh and try again.</p></div>';
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
