/**
 * Knot & Thread Tales — Products Data Layer
 */
const ProductsAPI = (() => {
  function toViewModel(row, images = []) {
    const price = Number(row.price) || 0;
    const offerPrice = row.offer_price != null ? Number(row.offer_price) : null;
    const discount = offerPrice && price > offerPrice
      ? Math.round(((price - offerPrice) / price) * 100)
      : 0;

    return {
      id: row.id,
      code: row.product_code || row.code || '',
      name: row.name,
      slug: row.slug,
      description: row.description || '',
      price,
      offerPrice,
      discount,
      image: row.cover_image || (images[0] && images[0].image_url) || '',
      gallery: images.length ? images.map((i) => i.image_url) : (row.cover_image ? [row.cover_image] : []),
      categoryId: row.category_id,
      categoryName: row.category_name || '',
      brandId: row.brand_id,
      inStock: row.in_stock !== false,
      isHandmade: row.is_handmade !== false,
      isBestseller: !!row.is_bestseller,
      isCustomizable: !!row.is_customizable,
      dimensions: row.dimensions || '',
      materials: row.materials || '',
      washingInstructions: row.washing_instructions || '',
      availableColors: row.available_colors ? String(row.available_colors).split(',').map((c) => c.trim()) : [],
      customizationOptions: row.customization_options || '',
      estimatedDelivery: row.estimated_delivery || '5–7 business days',
      createdAt: row.created_at
    };
  }

  async function listProducts({
    page = 1,
    pageSize = CONFIG.PAGE_SIZE,
    categoryId = null,
    search = '',
    minPrice = null,
    maxPrice = null,
    sort = 'newest'
  } = {}) {
    const filters = {};
    if (categoryId) filters.category_id = { op: 'eq', value: categoryId };
    if (search) filters.name = { op: 'ilike', value: `*${search}*` };
    if (minPrice != null) filters.price = { op: 'gte', value: minPrice };
    if (maxPrice != null) filters.price = { ...(filters.price || {}), op: 'lte', value: maxPrice };

    let orderBy = 'created_at';
    let ascending = false;
    if (sort === 'price_asc') { orderBy = 'price'; ascending = true; }
    if (sort === 'price_desc') { orderBy = 'price'; ascending = false; }
    if (sort === 'name_asc') { orderBy = 'name'; ascending = true; }
    if (sort === 'bestseller') { orderBy = 'is_bestseller'; ascending = false; }

    const result = await Supabase.select(CONFIG.TABLES.PRODUCTS, {
      filters, orderBy, ascending, page, pageSize
    });

    return {
      ...result,
      data: result.data.map((row) => toViewModel(row))
    };
  }

  async function getProductBySlug(slug) {
    const result = await Supabase.select(CONFIG.TABLES.PRODUCTS, {
      filters: { slug: { op: 'eq', value: slug } },
      single: true,
      pageSize: 1
    });
    if (!result.data) return null;

    const imagesResult = await Supabase.select(CONFIG.TABLES.PRODUCT_IMAGES, {
      filters: { product_id: { op: 'eq', value: result.data.id } },
      orderBy: 'sort_order',
      pageSize: 20
    });

    return toViewModel(result.data, imagesResult.data || []);
  }

  async function getFeatured() {
    const featResult = await Supabase.select(CONFIG.TABLES.FEATURED_PRODUCTS, {
      orderBy: 'sort_order',
      pageSize: 12
    });
    const ids = featResult.data.map((f) => f.product_id).filter(Boolean);
    if (!ids.length) return [];

    const productsResult = await Supabase.select(CONFIG.TABLES.PRODUCTS, {
      filters: { id: { op: 'in', value: ids } },
      pageSize: 12
    });
    return productsResult.data.map((row) => toViewModel(row));
  }

  async function getTrending() {
    const result = await Supabase.select(CONFIG.TABLES.PRODUCTS, {
      filters: { is_bestseller: { op: 'eq', value: true } },
      orderBy: 'created_at',
      ascending: false,
      pageSize: 8
    });
    return result.data.map((row) => toViewModel(row));
  }

  async function getReviewsForProduct(productId) {
    const result = await Supabase.select(CONFIG.TABLES.REVIEWS, {
      filters: { product_id: { op: 'eq', value: productId } },
      orderBy: 'created_at',
      ascending: false,
      pageSize: 50
    });
    return result.data;
  }

  return { listProducts, getProductBySlug, getFeatured, getTrending, getReviewsForProduct, toViewModel };
})();
