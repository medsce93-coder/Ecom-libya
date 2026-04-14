CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  name_ar text NOT NULL,
  description text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  name text NOT NULL,
  name_ar text NOT NULL,
  description text NOT NULL DEFAULT '',
  description_ar text NOT NULL DEFAULT '',
  price numeric(10, 2) NOT NULL,
  compare_at_price numeric(10, 2),
  image_url text,
  images text[] NOT NULL DEFAULT '{}',
  category_id text REFERENCES categories(id),
  stock integer NOT NULL DEFAULT 0,
  sku text,
  featured boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  badge text,
  slug text,
  price_qty_2 numeric(10, 2),
  price_qty_3 numeric(10, 2),
  rating numeric(3, 1) DEFAULT '4.5',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured_active ON products(featured, active);

CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY,
  order_number text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_city text NOT NULL,
  customer_address text NOT NULL,
  subtotal numeric(10, 2) NOT NULL,
  shipping_fee numeric(10, 2) NOT NULL DEFAULT '0',
  total numeric(10, 2) NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS order_items (
  id text PRIMARY KEY,
  order_id text NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id text,
  product_name text NOT NULL,
  product_name_ar text NOT NULL,
  product_image text,
  price numeric(10, 2) NOT NULL,
  quantity integer NOT NULL,
  subtotal numeric(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

CREATE TABLE IF NOT EXISTS cart_items (
  id text PRIMARY KEY,
  session_id text NOT NULL,
  product_id text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cart_items_session_id ON cart_items(session_id);

CREATE TABLE IF NOT EXISTS landing_pages (
  id text PRIMARY KEY,
  product_id text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  headline text NOT NULL,
  subheadline text NOT NULL DEFAULT '',
  media_urls text[] NOT NULL DEFAULT '{}',
  features text[] NOT NULL DEFAULT '{}',
  box_contents text,
  urgency_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_landing_pages_slug ON landing_pages(slug);

CREATE TABLE IF NOT EXISTS store_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);
