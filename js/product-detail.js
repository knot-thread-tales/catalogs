/**
 * Knot & Thread Tales — Product Detail Modal (gallery, zoom, fullscreen)
 */
const ProductDetail = (() => {
  let activeIndex = 0;
  let currentProduct = null;

  function escapeHtml(str = '') {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
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

  function render(product) {
    currentProduct = product;
    activeIndex = 0;
    const modal = document.getElementById('product-modal');

    modal.querySelector('.product-modal__gallery-main').innerHTML = `
      <img id="pm-main-img" src="${CloudinaryImg.url(product.gallery[0], { width: 900 })}"
           srcset="${CloudinaryImg.srcset(product.gallery[0])}"
           sizes="(min-width: 900px) 480px, 90vw"
           alt="${escapeHtml(product.name)}" loading="eager" decoding="async">
      <button class="gallery-zoom-btn" id="pm-fullscreen-btn" aria-label="View fullscreen">
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M3 3h7v2H5v5H3V3zm14 0h-7v2h5v5h2V3zM3 21h7v-2H5v-5H3v7zm14 0h-7v-2h5v-5h2v7z"/></svg>
      </button>
    `;

    modal.querySelector('.product-modal__thumbs').innerHTML = thumbsMarkup(product.gallery);

    modal.querySelector('.product-modal__info').innerHTML = `
      <div class="product-card__badges product-modal__badges">${ProductRender.badgeMarkup(product)}</div>
      <p class="product-modal__code">Code: ${escapeHtml(product.code || '—')}</p>
      <h2 class="product-modal__name" id="product-modal-title">${escapeHtml(product.name)}</h2>
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

      <button class="btn btn--whatsapp btn--block btn--lg" id="pm-order-btn">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.6-.8-1.9-.9-.2-.1-.4-.1-.6.1-.2.2-.6.9-.8 1-.1.2-.3.2-.5.1-1.4-.6-2.4-1.4-3.3-2.8-.1-.2-.1-.4.1-.5.2-.2.4-.4.6-.7.1-.2.1-.4 0-.6-.1-.2-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s.9 2.5 1 2.7c.1.2 1.8 2.8 4.5 3.8 2.2.8 2.6.6 3.1.6.5-.1 1.6-.6 1.8-1.3.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.4z"/><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l4.9-1.3A10 10 0 1 0 12 2zm0 18.2c-1.7 0-3.4-.5-4.8-1.4l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2z"/></svg>
        Order via WhatsApp
      </button>
    `;

    modal.querySelectorAll('.gallery-thumb').forEach((btn) => {
      btn.addEventListener('click', () => setActiveImage(Number(btn.dataset.index)));
    });
    document.getElementById('pm-fullscreen-btn').addEventListener('click', openFullscreen);
    document.getElementById('pm-order-btn').addEventListener('click', () => {
      close();
      WhatsAppOrder.openModal({
        code: product.code, name: product.name, price: product.price,
        offerPrice: product.offerPrice, image: product.image, slug: product.slug
      });
    });

    injectProductSchema(product);
  }

  function setActiveImage(index) {
    activeIndex = index;
    const product = currentProduct;
    const img = product.gallery[index];
    document.getElementById('pm-main-img').src = CloudinaryImg.url(img, { width: 900 });
    document.getElementById('pm-main-img').srcset = CloudinaryImg.srcset(img);
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

  async function open(slug) {
    const modal = document.getElementById('product-modal');
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    modal.querySelector('.product-modal__info').innerHTML = '<div class="skeleton skeleton--line skeleton--lg"></div>';

    try {
      const product = await ProductsAPI.getProductBySlug(slug);
      if (!product) {
        modal.querySelector('.product-modal__info').innerHTML = '<p>This piece could not be found.</p>';
        return;
      }
      render(product);
    } catch {
      modal.querySelector('.product-modal__info').innerHTML = '<p>Something went wrong loading this piece. Please try again.</p>';
    }
  }

  function close() {
    const modal = document.getElementById('product-modal');
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }

  function injectProductSchema(product) {
    let scriptEl = document.getElementById('product-schema');
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'product-schema';
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify({
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
  }

  function init() {
    document.querySelectorAll('[data-close-product-modal]').forEach((el) => el.addEventListener('click', close));
    document.querySelectorAll('[data-close-lightbox]').forEach((el) => el.addEventListener('click', closeFullscreen));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const lightbox = document.getElementById('fullscreen-lightbox');
        if (lightbox && lightbox.classList.contains('is-open')) { closeFullscreen(); return; }
        const modal = document.getElementById('product-modal');
        if (modal && modal.classList.contains('is-open')) close();
      }
      if (e.key === 'ArrowRight' && currentProduct) setActiveImage((activeIndex + 1) % currentProduct.gallery.length);
      if (e.key === 'ArrowLeft' && currentProduct) setActiveImage((activeIndex - 1 + currentProduct.gallery.length) % currentProduct.gallery.length);
    });

    document.body.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-product-slug]');
      if (trigger) {
        e.preventDefault();
        open(trigger.dataset.productSlug);
      }
    });
  }

  return { open, close, init };
})();
