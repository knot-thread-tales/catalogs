/**
 * Knot & Thread Tales — UPI Payment Modal
 */
const PaymentModal = (() => {
  let settings = null;

  async function loadSettings() {
    if (settings) return settings;
    try {
      const res = await Supabase.select(CONFIG.TABLES.PAYMENT_SETTINGS, { pageSize: 1, single: true });
      settings = res.data || {
        upi_id: CONFIG.UPI_ID,
        merchant_name: CONFIG.MERCHANT_NAME,
        qr_code_url: null
      };
    } catch {
      settings = { upi_id: CONFIG.UPI_ID, merchant_name: CONFIG.MERCHANT_NAME, qr_code_url: null };
    }
    return settings;
  }

  function buildUpiUri(amount) {
    const params = new URLSearchParams({
      pa: settings.upi_id || CONFIG.UPI_ID,
      pn: settings.merchant_name || CONFIG.MERCHANT_NAME,
      cu: 'INR'
    });
    if (amount) params.set('am', amount);
    return `upi://pay?${params.toString()}`;
  }

  function qrSrc(amount) {
    if (settings.qr_code_url) return CloudinaryImg.url(settings.qr_code_url, { width: 400 });
    const uri = encodeURIComponent(buildUpiUri(amount));
    return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${uri}`;
  }

  async function open(product) {
    await loadSettings();
    const modal = document.getElementById('payment-modal');
    const amount = product?.offerPrice || product?.price || '';

    document.getElementById('payment-upi-id').textContent = settings.upi_id || CONFIG.UPI_ID;
    document.getElementById('payment-merchant-name').textContent = settings.merchant_name || CONFIG.MERCHANT_NAME;
    document.getElementById('payment-amount').textContent = amount ? `${CONFIG.CURRENCY_SYMBOL}${amount}` : '';

    const img = document.getElementById('payment-qr-img');
    img.src = qrSrc(amount);
    img.alt = `UPI QR code for ${settings.merchant_name || CONFIG.MERCHANT_NAME}`;

    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-open');
    document.body.classList.add('no-scroll');
  }

  function close() {
    const modal = document.getElementById('payment-modal');
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }

  function copyUpiId() {
    const id = settings.upi_id || CONFIG.UPI_ID;
    navigator.clipboard.writeText(id).then(() => {
      Toast.show('UPI ID copied to clipboard.', 'success');
    }).catch(() => {
      Toast.show('Could not copy automatically. UPI ID: ' + id, 'error');
    });
  }

  async function downloadQr() {
    const img = document.getElementById('payment-qr-img');
    try {
      const res = await fetch(img.src);
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'knot-and-thread-tales-upi-qr.png';
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      window.open(img.src, '_blank', 'noopener');
    }
  }

  async function shareQr() {
    const img = document.getElementById('payment-qr-img');
    const shareText = `Pay ${settings.merchant_name || CONFIG.MERCHANT_NAME} via UPI: ${settings.upi_id || CONFIG.UPI_ID}`;
    if (navigator.share) {
      try {
        const res = await fetch(img.src);
        const blob = await res.blob();
        const file = new File([blob], 'upi-qr.png', { type: blob.type });
        await navigator.share({ title: 'UPI Payment', text: shareText, files: [file] });
      } catch {
        await navigator.share({ title: 'UPI Payment', text: shareText, url: img.src }).catch(() => {});
      }
    } else {
      navigator.clipboard.writeText(shareText);
      Toast.show('Payment details copied to clipboard.', 'success');
    }
  }

  function handleScreenshotUpload(e) {
    const file = e.target.files[0];
    const label = document.getElementById('payment-upload-filename');
    if (file) {
      label.textContent = file.name;
      label.hidden = false;
    }
  }

  function handlePaymentFormSubmit(e) {
    e.preventDefault();
    const refInput = document.getElementById('payment-reference');
    if (!refInput.value.trim()) {
      Toast.show('Please enter your transaction reference number.', 'error');
      return;
    }
    Toast.show('Thank you! We will confirm your payment shortly on WhatsApp.', 'success');
    close();
    document.getElementById('payment-confirm-form').reset();
    document.getElementById('payment-upload-filename').hidden = true;
  }

  function init() {
    document.querySelectorAll('[data-close-payment-modal]').forEach((el) =>
      el.addEventListener('click', close)
    );
    document.getElementById('copy-upi-btn')?.addEventListener('click', copyUpiId);
    document.getElementById('download-qr-btn')?.addEventListener('click', downloadQr);
    document.getElementById('share-qr-btn')?.addEventListener('click', shareQr);
    document.getElementById('payment-screenshot')?.addEventListener('change', handleScreenshotUpload);
    document.getElementById('payment-confirm-form')?.addEventListener('submit', handlePaymentFormSubmit);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('payment-modal');
        if (modal && modal.classList.contains('is-open')) close();
      }
    });
  }

  return { open, close, init };
})();
