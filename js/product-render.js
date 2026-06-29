/**
 * Knot & Thread Tales — Product Rendering
 */
const ProductRender = (() => {
  function escapeHtml(str = '') {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function badgeMarkup(product) {
    const badges = [];
    if (product.isHandmade) badges.push('<span class="badge badge--handmade">Handmade</span>');
    if (product.isBestseller) badges.push('<span class="badge badge--bestseller">Bestseller</span>');
    if (product.isCustomizable) badges.push('<span class="badge badge--customizable">Customizable</span>');
    return badges.join('');
  }

  function priceMarkup(product) {
    if (product.offerPrice && product.discount > 0) {
      return `
        <span class="price-offer">${CONFIG.CURRENCY_SYMBOL}${product.offerPrice.toLocaleString('en-IN')}</span>
        <span class="price-original">${CONFIG.CURRENCY_SYMBOL}${product.price.toLocaleString('en-IN')}</span>
        <span class="price-discount">${product.discount}% off</span>
      `;
    }
    return `<span class="price-offer">${CONFIG.CURRENCY_SYMBOL}${product.price.toLocaleString('en-IN')}</span>`;
  }

  function card(product) {
    const img = CloudinaryImg.url(product.image, { width: 640 });
    const srcset = CloudinaryImg.srcset(product.image);
    const orderPayload = JSON.stringify({
      code: product.code, name: product.name, price: product.price,
      offerPrice: product.offerPrice, image: product.image, slug: product.slug
    }).replace(/'/g, '&#39;');

    return `
      <article class="product-card" data-reveal>
        <a href="product.html?slug=${encodeURIComponent(product.slug)}" class="product-card__media" aria-label="View ${escapeHtml(product.name)}">
          <div class="product-card__badges">${badgeMarkup(product)}</div>
          <img
            src="${img}"
            srcset="${srcset}"
            sizes="(min-width: 1024px) 320px, 45vw"
            alt="${escapeHtml(product.name)}"
            loading="lazy"
            decoding="async"
            width="640" height="640"
            class="product-card__img"
          >
          <span class="product-card__shine" aria-hidden="true"></span>
        </a>
        <div class="product-card__body">
          <p class="product-card__code">Code: ${escapeHtml(product.code || '—')}</p>
          <h3 class="product-card__name">
            <a href="product.html?slug=${encodeURIComponent(product.slug)}">${escapeHtml(product.name)}</a>
          </h3>
          <p class="product-card__price">${priceMarkup(product)}</p>
          <p class="product-card__stock ${product.inStock ? 'in-stock' : 'out-of-stock'}">
            ${product.inStock ? 'In stock · made to order' : 'Currently unavailable'}
          </p>
          <button class="btn btn--whatsapp btn--block" data-order-product='${orderPayload}'>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.2-.1-.4-.1-.6.1-.2.2-.6.9-.8 1-.1.2-.3.2-.5.1-1.4-.6-2.4-1.4-3.3-2.8-.1-.2-.1-.4.1-.5.2-.2.4-.4.6-.7.1-.2.1-.4 0-.6-.1-.2-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.5 3.8 2.2.8 2.6.6 3.1.6.5-.1 1.6-.6 1.8-1.3.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.4z"/><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l4.9-1.3A10 10 0 1 0 12 2zm0 18.2c-1.7 0-3.4-.5-4.8-1.4l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2z"/></svg>
            Order via WhatsApp
          </button>
        </div>
      </article>
    `;
  }

  function skeletonCard() {
    return `
      <div class="product-card product-card--skeleton" aria-hidden="true">
        <div class="skeleton skeleton--media"></div>
        <div class="product-card__body">
          <div class="skeleton skeleton--line skeleton--xs"></div>
          <div class="skeleton skeleton--line skeleton--md"></div>
          <div class="skeleton skeleton--line skeleton--sm"></div>
          <div class="skeleton skeleton--btn"></div>
        </div>
      </div>
    `;
  }

  function renderSkeletons(container, count = 8) {
    container.innerHTML = Array.from({ length: count }, skeletonCard).join('');
  }

  function renderGrid(container, products) {
    if (!products.length) {
      container.innerHTML = `
        <div class="empty-state">
          <p class="empty-state__title">No pieces found</p>
          <p class="empty-state__body">Try adjusting your filters or search a different keyword.</p>
        </div>
      `;
      return;
    }
    container.innerHTML = products.map(card).join('');
    Motion.init();
    bindOrderButtons(container);
  }

  function bindOrderButtons(scope = document) {
    scope.querySelectorAll('[data-order-product]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const product = JSON.parse(btn.dataset.orderProduct);
        WhatsAppOrder.openModal(product);
      });
    });
  }

  return { card, badgeMarkup, priceMarkup, renderSkeletons, renderGrid, bindOrderButtons, escapeHtml };
})();
