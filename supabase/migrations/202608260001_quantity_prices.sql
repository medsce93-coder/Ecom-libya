CREATE TABLE IF NOT EXISTS product_quantity_prices (
  id text PRIMARY KEY,
  product_id text NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, quantity)
);

CREATE INDEX IF NOT EXISTS idx_product_quantity_prices_product_id
  ON product_quantity_prices(product_id);