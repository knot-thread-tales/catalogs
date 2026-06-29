/**
 * Knot & Thread Tales — Toast Notifications
 */
const Toast = (() => {
  let container = null;

  function ensureContainer() {
    if (container) return container;
    container = document.createElement('div');
    container.className = 'toast-stack';
    container.setAttribute('role', 'status');
    container.setAttribute('aria-live', 'polite');
    document.body.appendChild(container);
    return container;
  }

  function show(message, type = 'success', duration = 3800) {
    const stack = ensureContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    stack.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('toast--visible'));

    setTimeout(() => {
      toast.classList.remove('toast--visible');
      setTimeout(() => toast.remove(), 280);
    }, duration);
  }

  return { show };
})();
