# Knot & Thread Tales

A premium, static, handmade-business storefront for crochet, embroidery, personalized gifts, pet accessories, home decor and corporate gifting. Built with plain HTML5, CSS3 and vanilla JavaScript (ES2023) — no frameworks, no build step, no Node.js backend. Deployable directly to GitHub Pages.

Data is served from Supabase (via its REST/PostgREST API using the public anon key, read-only) and images are served from Cloudinary (auto format, auto quality, responsive). Ordering happens via WhatsApp (no traditional cart), and payment is collected via UPI (QR code, copy, download, share, screenshot upload).

---

## 1. Project structure

```
knot-thread-tales/
├── index.html                 Homepage
├── products.html              Full shop listing (search, filter, sort, pagination)
├── category.html              All categories, or a single category's products (?id=)
├── product.html                Standalone product detail page (?slug=)
├── search.html                 Dedicated live search page
├── about.html                  Brand story
├── contact.html                 Contact form + info
├── faq.html                     Full FAQ list
├── reviews.html                 Reviews + ratings summary
├── privacy-policy.html
├── terms-and-conditions.html
├── sitemap.xml
├── robots.txt
├── supabase-schema.sql          SQL to create all required tables + RLS policies
├── css/
│   ├── tokens.css               Design tokens: color, type, spacing, shadow, motion
│   ├── base.css                 Reset + base elements
│   ├── motion.css                Scroll reveal, thread-stroke signature motif, skeletons, toasts
│   ├── header-footer.css
│   ├── sections.css              Hero, product grid, categories, testimonials, FAQ, CTA
│   ├── components.css            Buttons, badges, forms
│   ├── product-card.css
│   ├── modals.css                Order modal, payment modal, product modal, lightbox
│   └── pages.css                 About/contact/search/policy/reviews layouts
├── js/
│   ├── config.js                 All credentials/placeholders live here
│   ├── supabase-client.js        REST wrapper: pagination, filtering, sorting, caching
│   ├── cloudinary.js              Responsive URL builder
│   ├── products-api.js            Product data layer / view-model mapping
│   ├── product-render.js          Product card + grid rendering, skeletons
│   ├── product-detail.js          Modal-based product detail (gallery, zoom, fullscreen)
│   ├── product-page.js            Standalone product page controller
│   ├── category-page.js           Category page controller
│   ├── search-engine.js           Debounced live search + filters + sort + pagination
│   ├── whatsapp-order.js          Order modal + WhatsApp message generation
│   ├── payment.js                 UPI QR, copy/download/share, screenshot upload
│   ├── toast.js                   Toast notifications
│   ├── motion.js                  IntersectionObserver scroll reveal + parallax
│   └── app.js                     Homepage bootstrap
└── assets/icons/favicon.png
```

---

## 2. Configure your credentials

Open `js/config.js` and replace every placeholder:

```js
SUPABASE_URL: 'https://YOUR_PROJECT_REF.supabase.co',
SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
CLOUDINARY_CLOUD_NAME: 'YOUR_CLOUDINARY_CLOUD_NAME',
WHATSAPP_NUMBER: '91XXXXXXXXXX',   // full international number, no +, no spaces
UPI_ID: 'yourbusiness@upi',
```

Also do a project-wide find/replace for:

- `yourusername.github.io/knot-thread-tales` -> your actual GitHub Pages URL (used in canonical tags, Open Graph tags, sitemap.xml, robots.txt, and JSON-LD schema)
- `91XXXXXXXXXX` -> your WhatsApp Business number (appears in footers, contact page, FAQ page)
- `YOUR_CLOUDINARY_CLOUD_NAME` -> your Cloudinary cloud name (appears inline in a few `<img>` tags for hero/about imagery — these are placeholders for demonstration and should be swapped for your real asset public IDs)

---

## 3. Set up Supabase

1. Create a free project at supabase.com.
2. Open the SQL Editor and run `supabase-schema.sql` from this project. It creates all 11 tables (`brands`, `categories`, `products`, `product_images`, `reviews`, `featured_products`, `faqs`, `testimonials`, `orders`, `payment_settings`, `business_settings`) with Row Level Security enabled and public read-only policies (the `orders` table additionally allows public INSERT only, so the site can log order intents without ever being able to read other customers' orders).
3. Go to Project Settings -> API and copy:
   - Project URL -> `SUPABASE_URL`
   - anon public key -> `SUPABASE_ANON_KEY`
4. Populate your tables — at minimum: a few `categories`, `products` (with `product_images`), one row in `payment_settings`, and some `faqs`.

### Key columns the frontend expects

- products: `name`, `slug`, `product_code`, `description`, `price`, `offer_price`, `cover_image` (Cloudinary public ID), `category_id`, `in_stock`, `is_handmade`, `is_bestseller`, `is_customizable`, `dimensions`, `materials`, `washing_instructions`, `available_colors` (comma-separated), `customization_options`, `estimated_delivery`.
- product_images: `product_id`, `image_url` (Cloudinary public ID), `sort_order`.
- categories: `name`, `slug`, `description`, `image_url`, `sort_order`.
- payment_settings: `upi_id`, `merchant_name`, `qr_code_url` (optional — if empty, a QR is generated automatically from the UPI ID).

---

## 4. Set up Cloudinary

1. Create a free account at cloudinary.com.
2. Upload your product, category and hero images.
3. Store each image's public ID (not the full URL) in Supabase — e.g. `products/crochet-bouquet-01`. The frontend automatically builds optimized, responsive URLs with `f_auto,q_auto` and width-based `srcset`.
4. If you'd rather store full external URLs instead of Cloudinary public IDs, that also works — `cloudinary.js` passes through any string starting with `http` unchanged.

---

## 5. Connect WhatsApp & UPI

- WhatsApp: set `WHATSAPP_NUMBER` in `config.js` to your WhatsApp Business number in international format with no `+` or spaces (e.g. `919876543210`). The "Order via WhatsApp" button collects customer details, then opens `wa.me/<number>?text=<prefilled message>`.
- UPI: set `UPI_ID` and `MERCHANT_NAME` in `config.js` as a fallback. For full control (custom QR artwork, merchant logo, etc.), add a row to the `payment_settings` table in Supabase — the frontend will use it instead of the fallback.

---

## 6. Deploy to GitHub Pages

1. Push this folder's contents to a GitHub repository (root of the repo, or a `/docs` folder).
2. In the repo, go to Settings -> Pages.
3. Under Source, choose the branch and folder where these files live.
4. Save — your site will be live at `https://<username>.github.io/<repo-name>/`.
5. Update `SITE_URL` in `config.js` and all canonical/OG URLs to match.

No build step, no `npm install`, no server required — it's plain static files.

---

## 7. Performance & accessibility notes

- All product images use `loading="lazy"` (except the hero/LCP image, which uses `fetchpriority="high"`), `decoding="async"`, explicit `width`/`height` to prevent layout shift, and Cloudinary `srcset` for responsive delivery.
- Scroll animations use `IntersectionObserver` and respect `prefers-reduced-motion`.
- All interactive elements are keyboard-operable; modals close on Escape; color contrast follows WCAG AA against the brand palette.
- `Supabase.select()` caches GET responses client-side for 5 minutes to reduce duplicate network calls during a session.

---

## 8. Customizing the design system

All design tokens (colors, type scale, spacing, radii, shadows, motion timing) live in `css/tokens.css` as CSS custom properties — change them once and the whole site updates. The signature "thread stroke" motif (an animated single-line SVG path echoing the brand's looped-yarn heart mark) is defined in `css/motion.css` under `.thread-stroke` and used as a section accent throughout.
