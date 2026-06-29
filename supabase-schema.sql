-- ============================================================================
-- Knot & Thread Tales — Supabase Schema
-- Run this in the Supabase SQL editor to create all required tables.
-- Row Level Security (RLS) policies grant public read-only access,
-- matching the anon-key, read-only frontend in this project.
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------------
-- brands
-- ---------------------------------------------------------------------------
create table if not exists brands (
  id bigint generated always as identity primary key,
  name text not null,
  slug text unique not null,
  logo_url text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table if not exists categories (
  id bigint generated always as identity primary key,
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table if not exists products (
  id bigint generated always as identity primary key,
  name text not null,
  slug text unique not null,
  product_code text,
  description text,
  price numeric(10,2) not null default 0,
  offer_price numeric(10,2),
  cover_image text,
  category_id bigint references categories(id) on delete set null,
  brand_id bigint references brands(id) on delete set null,
  in_stock boolean default true,
  is_handmade boolean default true,
  is_bestseller boolean default false,
  is_customizable boolean default false,
  dimensions text,
  materials text,
  washing_instructions text,
  available_colors text,
  customization_options text,
  estimated_delivery text default '5-7 business days',
  created_at timestamptz default now()
);

create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_created on products(created_at desc);
create index if not exists idx_products_name on products using gin (name gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- product_images
-- ---------------------------------------------------------------------------
create table if not exists product_images (
  id bigint generated always as identity primary key,
  product_id bigint references products(id) on delete cascade,
  image_url text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

create index if not exists idx_product_images_product on product_images(product_id);

-- ---------------------------------------------------------------------------
-- reviews
-- ---------------------------------------------------------------------------
create table if not exists reviews (
  id bigint generated always as identity primary key,
  product_id bigint references products(id) on delete cascade,
  customer_name text not null,
  rating int check (rating between 1 and 5) default 5,
  message text not null,
  location text,
  created_at timestamptz default now()
);

create index if not exists idx_reviews_product on reviews(product_id);

-- ---------------------------------------------------------------------------
-- featured_products
-- ---------------------------------------------------------------------------
create table if not exists featured_products (
  id bigint generated always as identity primary key,
  product_id bigint references products(id) on delete cascade,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- faqs
-- ---------------------------------------------------------------------------
create table if not exists faqs (
  id bigint generated always as identity primary key,
  question text not null,
  answer text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- testimonials
-- ---------------------------------------------------------------------------
create table if not exists testimonials (
  id bigint generated always as identity primary key,
  customer_name text not null,
  rating int check (rating between 1 and 5) default 5,
  message text not null,
  location text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- orders (write access should be limited; see RLS policy notes below)
-- ---------------------------------------------------------------------------
create table if not exists orders (
  id bigint generated always as identity primary key,
  product_code text,
  product_name text not null,
  price numeric(10,2),
  customer_name text not null,
  customer_phone text not null,
  customer_address text not null,
  customer_pincode text not null,
  quantity int default 1,
  customization_notes text,
  status text default 'pending',
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- payment_settings (single row table)
-- ---------------------------------------------------------------------------
create table if not exists payment_settings (
  id bigint generated always as identity primary key,
  upi_id text not null,
  merchant_name text not null,
  qr_code_url text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- business_settings (single row table)
-- ---------------------------------------------------------------------------
create table if not exists business_settings (
  id bigint generated always as identity primary key,
  business_name text not null default 'Knot & Thread Tales',
  whatsapp_number text not null,
  support_email text,
  instagram_handle text,
  created_at timestamptz default now()
);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table brands enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table reviews enable row level security;
alter table featured_products enable row level security;
alter table faqs enable row level security;
alter table testimonials enable row level security;
alter table orders enable row level security;
alter table payment_settings enable row level security;
alter table business_settings enable row level security;

create policy "Public read access" on brands for select using (true);
create policy "Public read access" on categories for select using (true);
create policy "Public read access" on products for select using (true);
create policy "Public read access" on product_images for select using (true);
create policy "Public read access" on reviews for select using (true);
create policy "Public read access" on featured_products for select using (true);
create policy "Public read access" on faqs for select using (true);
create policy "Public read access" on testimonials for select using (true);
create policy "Public read access" on payment_settings for select using (true);
create policy "Public read access" on business_settings for select using (true);

-- Orders: allow anonymous INSERT only (no read/update/delete from the client).
create policy "Public insert orders" on orders for insert with check (true);
