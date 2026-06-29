/**
 * Knot & Thread Tales — Global Configuration
 * Replace every placeholder below with your live credentials before deploying.
 */

const CONFIG = Object.freeze({
  SUPABASE_URL: 'https://vgbidligpmrblgmngtqs.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_22xgvBSlk5b4AkUoKsz0jw_VpTdgVb-',

  CLOUDINARY_CLOUD_NAME: 'YOUR_CLOUDINARY_CLOUD_NAME',
  CLOUDINARY_BASE: function () {
    return `https://res.cloudinary.com/${this.CLOUDINARY_CLOUD_NAME}/image/upload`;
  },

  WHATSAPP_NUMBER: '917075636381',
  UPI_ID: 'rakeshroy001@icici',
  MERCHANT_NAME: 'Knot & Thread Tales',
  SITE_URL: 'https://knot-thread-tales.github.io/knot-thread-tales',
  SITE_NAME: 'Knot & Thread Tales',
  BUSINESS_EMAIL: 'knotthreadtales@gmail.com',
  INSTAGRAM_HANDLE: '@knotandthreadtales',
  INSTAGRAM_URL: 'https://instagram.com/knotandthreadtales',

  CURRENCY_SYMBOL: '₹',
  PAGE_SIZE: 12,
  SEARCH_DEBOUNCE_MS: 350,
  CACHE_TTL_MS: 5 * 60 * 1000,

  TABLES: {
    BRANDS: 'brands',
    CATEGORIES: 'categories',
    PRODUCTS: 'products',
    PRODUCT_IMAGES: 'product_images',
    REVIEWS: 'reviews',
    FEATURED_PRODUCTS: 'featured_products',
    FAQS: 'faqs',
    TESTIMONIALS: 'testimonials',
    ORDERS: 'orders',
    PAYMENT_SETTINGS: 'payment_settings',
    BUSINESS_SETTINGS: 'business_settings'
  }
});

Object.freeze(CONFIG.TABLES);
