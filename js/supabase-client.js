/**
 * Knot & Thread Tales — Supabase REST Client
 */
const Supabase = (() => {
  const cache = new Map();

  function cacheKey(table, params) {
    return `${table}::${new URLSearchParams(params).toString()}`;
  }

  function getCached(key) {
    const hit = cache.get(key);
    if (!hit) return null;
    if (Date.now() - hit.time > CONFIG.CACHE_TTL_MS) {
      cache.delete(key);
      return null;
    }
    return hit.data;
  }

  function setCached(key, data) {
    cache.set(key, { data, time: Date.now() });
  }

  function headers(extra = {}) {
    return {
      apikey: CONFIG.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      ...extra
    };
  }

  function buildFilterParams(searchParams, filters) {
    if (!filters) return;
    Object.entries(filters).forEach(([column, condition]) => {
      if (condition === undefined || condition === null) return;
      const { op, value } = condition;
      if (value === undefined || value === null || value === '') return;
      if (op === 'in') {
        searchParams.append(column, `in.(${value.join(',')})`);
      } else {
        searchParams.append(column, `${op}.${value}`);
      }
    });
  }

  async function select(table, {
    columns = '*',
    filters = null,
    orderBy = null,
    ascending = true,
    page = 1,
    pageSize = CONFIG.PAGE_SIZE,
    single = false,
    useCache = true
  } = {}) {
    const params = new URLSearchParams();
    params.set('select', columns);
    buildFilterParams(params, filters);

    if (orderBy) {
      params.set('order', `${orderBy}.${ascending ? 'asc' : 'desc'}`);
    }

    const key = cacheKey(table, params);
    if (useCache) {
      const cached = getCached(key);
      if (cached) return cached;
    }

    const rangeFrom = (page - 1) * pageSize;
    const rangeTo = rangeFrom + pageSize - 1;

    const url = `${CONFIG.SUPABASE_URL}/rest/v1/${table}?${params.toString()}`;

    const res = await fetch(url, {
      headers: headers({
        Prefer: 'count=exact',
        Range: `${rangeFrom}-${rangeTo}`,
        'Range-Unit': 'items'
      })
    });

    if (!res.ok) {
      throw new Error(`Supabase error on ${table}: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const contentRange = res.headers.get('content-range');
    let total = data.length;
    if (contentRange && contentRange.includes('/')) {
      const totalPart = contentRange.split('/')[1];
      total = totalPart === '*' ? data.length : parseInt(totalPart, 10);
    }

    const result = {
      data: single ? (data[0] || null) : data,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize))
    };

    if (useCache) setCached(key, result);
    return result;
  }

  async function selectAll(table, opts = {}) {
    return select(table, { ...opts, page: 1, pageSize: 1000 });
  }

  function clearCache() {
    cache.clear();
  }

  return { select, selectAll, headers, clearCache };
})();
