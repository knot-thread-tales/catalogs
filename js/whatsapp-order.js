/**
 * Knot & Thread Tales — WhatsApp Order System
 */
const WhatsAppOrder = (() => {
  let currentProduct = null;

  function buildMessage(product, customer) {
    const lines = [
      'Hello Knot & Thread Tales,',
      '',
      'I would like to place an order.',
      '',
      'Product Details:',
      `Product Code: ${product.code || '—'}`,
      `Product Name: ${product.name || '—'}`,
      `Price: ${CONFIG.CURRENCY_SYMBOL}${product.offerPrice || product.price}`,
      '',
      'Customer Details:',
      `Name: ${customer.name}`,
      `Phone: ${customer.phone}`,
      `Address: ${customer.address}`,
      `Pincode: ${customer.pincode}`,
      `Quantity: ${customer.quantity}`,
      '',
      'Customization:',
      customer.customization || 'None',
      '',
      'Please confirm availability and payment instructions.'
    ];
    return lines.join('\n');
  }

  function escapeHtml(str = '') {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function openModal(product) {
    currentProduct = product;
    const modal = document.getElementById('order-modal');
    const summary = document.getElementById('order-product-summary');
    summary.innerHTML = `
      <img src="${CloudinaryImg.thumb(product.image, 96)}" alt="${escapeHtml(product.name)}" width="64" height="64" loading="lazy">
      <div>
        <p class="order-summary-name">${escapeHtml(product.name)}</p>
        <p class="order-summary-meta">Code: ${escapeHtml(product.code || '—')} · ${CONFIG.CURRENCY_SYMBOL}${product.offerPrice || product.price}</p>
      </div>
    `;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-open');
    document.body.classList.add('no-scroll');
    document.getElementById('order-name').focus();
  }

  function closeModal() {
    const modal = document.getElementById('order-modal');
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    document.getElementById('order-form').reset();
  }

  function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const customer = {
      name: form.elements['order-name'].value.trim(),
      phone: form.elements['order-phone'].value.trim(),
      address: form.elements['order-address'].value.trim(),
      pincode: form.elements['order-pincode'].value.trim(),
      quantity: form.elements['order-quantity'].value.trim() || '1',
      customization: form.elements['order-customization'].value.trim()
    };

    if (!customer.name || !customer.phone || !customer.address || !customer.pincode) {
      Toast.show('Please fill in all required fields.', 'error');
      return;
    }

    const message = buildMessage(currentProduct, customer);
    const url = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    OrderRecorder.record(currentProduct, customer).catch(() => {});

    window.open(url, '_blank', 'noopener');
    closeModal();
    PaymentModal.open(currentProduct);
  }

  function init() {
    const form = document.getElementById('order-form');
    if (form) form.addEventListener('submit', handleSubmit);

    document.querySelectorAll('[data-close-order-modal]').forEach((el) =>
      el.addEventListener('click', closeModal)
    );

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('order-modal');
        if (modal && modal.classList.contains('is-open')) closeModal();
      }
    });
  }

  return { openModal, closeModal, init };
})();

/**
 * Best-effort write of the order intent to Supabase `orders` table.
 * Fails silently — WhatsApp remains the source of truth for the order.
 */
const OrderRecorder = (() => {
  async function record(product, customer) {
    const url = `${CONFIG.SUPABASE_URL}/rest/v1/${CONFIG.TABLES.ORDERS}`;
    const payload = {
      product_code: product.code || null,
      product_name: product.name,
      price: product.offerPrice || product.price,
      customer_name: customer.name,
      customer_phone: customer.phone,
      customer_address: customer.address,
      customer_pincode: customer.pincode,
      quantity: Number(customer.quantity) || 1,
      customization_notes: customer.customization || null,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    await fetch(url, {
      method: 'POST',
      headers: Supabase.headers({ Prefer: 'return=minimal' }),
      body: JSON.stringify(payload)
    });
  }
  return { record };
})();
