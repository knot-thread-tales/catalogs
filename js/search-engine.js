/**
 * Knot & Thread Tales — Search & Filter Engine
 */
const SearchEngine = (() => {
  let state = {
    query: '',
    categoryId: '',
    minPrice: null,
    maxPrice: null,
    sort: 'newest',
    page: 1
  };

  function debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  }

  async function run(resultsContainer, paginationContainer, countEl) {
    ProductRender.renderSkeletons(resultsContainer, 8);
    try {
      const result = await ProductsAPI.listProducts({
        page: state.page,
        categoryId: state.categoryId || null,
        search: state.query,
        minPrice: state.minPrice,
        maxPrice: state.maxPrice,
        sort: state.sort
      });
      ProductRender.renderGrid(resultsContainer, result.data);
      if (countEl) {
        countEl.textContent = result.total === 0
          ? 'No results'
          : `${result.total} piece${result.total === 1 ? '' : 's'} found`;
      }
      if (paginationContainer) renderPagination(paginationContainer, result, resultsContainer, paginationContainer, countEl);
    } catch (err) {
      resultsContainer.innerHTML = `<div class="empty-state"><p class="empty-state__title">Something went wrong</p><p class="empty-state__body">Please refresh and try again.</p></div>`;
    }
  }

  function renderPagination(container, result, resultsContainer, paginationContainer, countEl) {
    if (result.totalPages <= 1) {
      container.innerHTML = '';
      return;
    }
    let html = '';
    for (let i = 1; i <= result.totalPages; i++) {
      html += `<button class="page-btn ${i === result.page ? 'is-active' : ''}" data-page="${i}" aria-current="${i === result.page}">${i}</button>`;
    }
    container.innerHTML = html;
    container.querySelectorAll('.page-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.page = Number(btn.dataset.page);
        run(resultsContainer, paginationContainer, countEl);
        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  function bindControls({ searchInput, categorySelect, minPriceInput, maxPriceInput, sortSelect, resultsContainer, paginationContainer, countEl }) {
    const debouncedRun = debounce(() => {
      state.page = 1;
      run(resultsContainer, paginationContainer, countEl);
    }, CONFIG.SEARCH_DEBOUNCE_MS);

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.query = e.target.value.trim();
        debouncedRun();
      });
    }
    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        state.categoryId = e.target.value;
        state.page = 1;
        run(resultsContainer, paginationContainer, countEl);
      });
    }
    if (minPriceInput) {
      minPriceInput.addEventListener('input', debounce((e) => {
        state.minPrice = e.target.value ? Number(e.target.value) : null;
        state.page = 1;
        run(resultsContainer, paginationContainer, countEl);
      }, CONFIG.SEARCH_DEBOUNCE_MS));
    }
    if (maxPriceInput) {
      maxPriceInput.addEventListener('input', debounce((e) => {
        state.maxPrice = e.target.value ? Number(e.target.value) : null;
        state.page = 1;
        run(resultsContainer, paginationContainer, countEl);
      }, CONFIG.SEARCH_DEBOUNCE_MS));
    }
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        state.sort = e.target.value;
        state.page = 1;
        run(resultsContainer, paginationContainer, countEl);
      });
    }

    run(resultsContainer, paginationContainer, countEl);
  }

  function setInitialState(partial) {
    state = { ...state, ...partial };
  }

  return { bindControls, run, setInitialState, get state() { return state; } };
})();
