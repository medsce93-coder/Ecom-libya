import { randomUUID } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "./_lib/auth.js";
import { query, withTransaction } from "./_lib/db.js";
import {
  getRouteParam,
  methodNotAllowed,
  parseBoolParam,
  parseIntParam,
  sendJson,
} from "./_lib/http.js";
import {
  UUID_RE,
  generateSlug,
  mapProduct,
  type ProductRow,
} from "./_lib/products.js";

const PRODUCT_ACTIVE_SQL = `(
  COALESCE(
    NULLIF(LOWER(to_jsonb(p)->>'active'), ''),
    NULLIF(LOWER(to_jsonb(p)->>'is_active'), ''),
    'true'
  ) IN ('true', 't', '1', 'yes', 'y', 'on')
)`;

const PRODUCT_FEATURED_SQL = `(
  COALESCE(
    NULLIF(LOWER(to_jsonb(p)->>'featured'), ''),
    NULLIF(LOWER(to_jsonb(p)->>'is_featured'), ''),
    'false'
  ) IN ('true', 't', '1', 'yes', 'y', 'on')
)`;

const PRODUCT_IMAGE_SQL = `COALESCE(to_jsonb(p)->>'image_url', to_jsonb(p)->>'image')`;
const CATEGORY_NAME_SQL = `COALESCE(to_jsonb(c)->>'name_ar', to_jsonb(c)->>'nameAr', to_jsonb(c)->>'name')`;

function buildProductsWhere(
  req: VercelRequest,
  includeInactive = false,
) {
  const values: unknown[] = [];
  const clauses: string[] = [];

  if (!includeInactive) {
    clauses.push(PRODUCT_ACTIVE_SQL);
  }

  const categoryId = req.query.categoryId;
  if (typeof categoryId === "string" && categoryId.trim()) {
    values.push(categoryId.trim());
    clauses.push(`COALESCE(to_jsonb(p)->>'category_id', to_jsonb(p)->>'categoryId') = $${values.length}`);
  }

  const search = req.query.search;
  if (typeof search === "string" && search.trim()) {
    values.push(`%${search.trim()}%`);
    const searchIndex = values.length;
    clauses.push(`(
      COALESCE(to_jsonb(p)->>'name_ar', to_jsonb(p)->>'nameAr', to_jsonb(p)->>'name', '') ILIKE $${searchIndex}
      OR COALESCE(to_jsonb(p)->>'name', '') ILIKE $${searchIndex}
    )`);
  }

  const minPrice = req.query.minPrice;
  if (typeof minPrice === "string" && minPrice.trim()) {
    const parsed = Number(minPrice);
    if (Number.isFinite(parsed)) {
      values.push(parsed);
      clauses.push(`COALESCE(NULLIF(to_jsonb(p)->>'price', ''), '0')::numeric >= $${values.length}`);
    }
  }

  const maxPrice = req.query.maxPrice;
  if (typeof maxPrice === "string" && maxPrice.trim()) {
    const parsed = Number(maxPrice);
    if (Number.isFinite(parsed)) {
      values.push(parsed);
      clauses.push(`COALESCE(NULLIF(to_jsonb(p)->>'price', ''), '0')::numeric <= $${values.length}`);
    }
  }

  if (parseBoolParam(req.query.inStock, false)) {
    clauses.push(`COALESCE(NULLIF(to_jsonb(p)->>'stock', ''), '0')::int >= 1`);
  }

  return {
    whereSql: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "",
    values,
  };
}

async function listProducts(req: VercelRequest, res: VercelResponse) {
  try {
    const includeInactive = parseBoolParam(req.query.includeInactive, false);
    if (includeInactive) {
      const admin = await requireAdmin(req, res);
      if (!admin) return;
    }

    const page = Math.max(1, parseIntParam(req.query.page, 1));
    const limit = Math.min(100, Math.max(1, parseIntParam(req.query.limit, 20)));
    const offset = (page - 1) * limit;

    const { whereSql, values } = buildProductsWhere(req, includeInactive);
    const pagingStart = values.length + 1;

    const rows = await query<ProductRow>(
      `
        SELECT
          p.id,
          COALESCE(to_jsonb(p)->>'slug', p.id) AS slug,
          p.name,
          COALESCE(to_jsonb(p)->>'name_ar', to_jsonb(p)->>'nameAr', p.name) AS "nameAr",
          COALESCE(to_jsonb(p)->>'description', '') AS description,
          COALESCE(to_jsonb(p)->>'description_ar', to_jsonb(p)->>'descriptionAr', to_jsonb(p)->>'description', '') AS "descriptionAr",
          COALESCE(NULLIF(to_jsonb(p)->>'price', ''), '0') AS price,
          COALESCE(to_jsonb(p)->>'compare_at_price', to_jsonb(p)->>'compareAtPrice') AS "compareAtPrice",
          COALESCE(to_jsonb(p)->>'price_qty_2', to_jsonb(p)->>'priceQty2') AS "priceQty2",
          COALESCE(to_jsonb(p)->>'price_qty_3', to_jsonb(p)->>'priceQty3') AS "priceQty3",
(
  SELECT COALESCE(
    json_agg(
      json_build_object(
        'quantity', pqp.quantity,
        'price', pqp.price
      )
      ORDER BY pqp.quantity ASC
    ),
    '[]'::json
  )
  FROM product_quantity_prices pqp
  WHERE pqp.product_id = p.id
) AS "quantityPrices",
          ${PRODUCT_IMAGE_SQL} AS "imageUrl",
          CASE
            WHEN jsonb_typeof(to_jsonb(p)->'images') = 'array'
              THEN ARRAY(SELECT jsonb_array_elements_text(to_jsonb(p)->'images'))
            ELSE ARRAY[]::text[]
          END AS images,
          COALESCE(to_jsonb(p)->>'category_id', to_jsonb(p)->>'categoryId') AS "categoryId",
          ${CATEGORY_NAME_SQL} AS "categoryName",
          COALESCE(NULLIF(to_jsonb(p)->>'stock', ''), '0')::int AS stock,
          NULLIF(COALESCE(to_jsonb(p)->>'sku', ''), '') AS sku,
          ${PRODUCT_FEATURED_SQL} AS featured,
          ${PRODUCT_ACTIVE_SQL} AS active,
          NULLIF(COALESCE(to_jsonb(p)->>'badge', ''), '') AS badge,
          COALESCE(to_jsonb(p)->>'rating', '4.5') AS rating,
          COALESCE(to_jsonb(p)->>'created_at', now()::text) AS "createdAt",
          COALESCE(to_jsonb(p)->>'updated_at', to_jsonb(p)->>'created_at', now()::text) AS "updatedAt"
        FROM products p
        LEFT JOIN categories c
          ON c.id = COALESCE(to_jsonb(p)->>'category_id', to_jsonb(p)->>'categoryId')
        ${whereSql}
        ORDER BY COALESCE(NULLIF(to_jsonb(p)->>'created_at', '')::timestamptz, NOW()) DESC
        LIMIT $${pagingStart}
        OFFSET $${pagingStart + 1}
      `,
      [...values, limit, offset],
    );

    const [countRow] = await query<{ count: string }>(
      `
        SELECT COUNT(*)::text AS count
        FROM products p
        ${whereSql}
      `,
      values,
    );

    const total = Number(countRow?.count ?? 0);

    return sendJson(res, 200, {
      products: rows.map(mapProduct),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Failed to fetch products", { error, query: req.query });
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to fetch products",
    });
  }
}

async function listFeaturedProducts(req: VercelRequest, res: VercelResponse) {
  try {
    const limit = Math.min(50, Math.max(1, parseIntParam(req.query.limit, 12)));
    const rows = await query<ProductRow>(
      `
        SELECT
          p.id,
          COALESCE(to_jsonb(p)->>'slug', p.id) AS slug,
          p.name,
          COALESCE(to_jsonb(p)->>'name_ar', to_jsonb(p)->>'nameAr', p.name) AS "nameAr",
          COALESCE(to_jsonb(p)->>'description', '') AS description,
          COALESCE(to_jsonb(p)->>'description_ar', to_jsonb(p)->>'descriptionAr', to_jsonb(p)->>'description', '') AS "descriptionAr",
          COALESCE(NULLIF(to_jsonb(p)->>'price', ''), '0') AS price,
          COALESCE(to_jsonb(p)->>'compare_at_price', to_jsonb(p)->>'compareAtPrice') AS "compareAtPrice",
          COALESCE(to_jsonb(p)->>'price_qty_2', to_jsonb(p)->>'priceQty2') AS "priceQty2",
          COALESCE(to_jsonb(p)->>'price_qty_3', to_jsonb(p)->>'priceQty3') AS "priceQty3",
(
  SELECT COALESCE(
    json_agg(
      json_build_object(
        'quantity', pqp.quantity,
        'price', pqp.price
      )
      ORDER BY pqp.quantity ASC
    ),
    '[]'::json
  )
  FROM product_quantity_prices pqp
  WHERE pqp.product_id = p.id
) AS "quantityPrices",
          ${PRODUCT_IMAGE_SQL} AS "imageUrl",
          CASE
            WHEN jsonb_typeof(to_jsonb(p)->'images') = 'array'
              THEN ARRAY(SELECT jsonb_array_elements_text(to_jsonb(p)->'images'))
            ELSE ARRAY[]::text[]
          END AS images,
          COALESCE(to_jsonb(p)->>'category_id', to_jsonb(p)->>'categoryId') AS "categoryId",
          ${CATEGORY_NAME_SQL} AS "categoryName",
          COALESCE(NULLIF(to_jsonb(p)->>'stock', ''), '0')::int AS stock,
          NULLIF(COALESCE(to_jsonb(p)->>'sku', ''), '') AS sku,
          ${PRODUCT_FEATURED_SQL} AS featured,
          ${PRODUCT_ACTIVE_SQL} AS active,
          NULLIF(COALESCE(to_jsonb(p)->>'badge', ''), '') AS badge,
          COALESCE(to_jsonb(p)->>'rating', '4.5') AS rating,
          COALESCE(to_jsonb(p)->>'created_at', now()::text) AS "createdAt",
          COALESCE(to_jsonb(p)->>'updated_at', to_jsonb(p)->>'created_at', now()::text) AS "updatedAt"
        FROM products p
        LEFT JOIN categories c
          ON c.id = COALESCE(to_jsonb(p)->>'category_id', to_jsonb(p)->>'categoryId')
        WHERE ${PRODUCT_FEATURED_SQL} AND ${PRODUCT_ACTIVE_SQL}
        ORDER BY COALESCE(NULLIF(to_jsonb(p)->>'created_at', '')::timestamptz, NOW()) DESC
        LIMIT $1
      `,
      [limit],
    );

    return sendJson(res, 200, rows.map(mapProduct));
  } catch (error) {
    console.error("Failed to fetch featured products", { error, query: req.query });
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to fetch featured products",
    });
  }
}

async function getProduct(
  req: VercelRequest,
  res: VercelResponse,
  idParam: string,
) {
  try {
    const includeInactive = parseBoolParam(req.query.includeInactive, false);
    if (includeInactive) {
      const admin = await requireAdmin(req, res);
      if (!admin) return;
    }

    const byId = UUID_RE.test(idParam);
    const identifierField = byId ? "p.id" : "COALESCE(to_jsonb(p)->>'slug', p.id)";
    const [row] = await query<ProductRow>(
      `
        SELECT
          p.id,
          COALESCE(to_jsonb(p)->>'slug', p.id) AS slug,
          p.name,
          COALESCE(to_jsonb(p)->>'name_ar', to_jsonb(p)->>'nameAr', p.name) AS "nameAr",
          COALESCE(to_jsonb(p)->>'description', '') AS description,
          COALESCE(to_jsonb(p)->>'description_ar', to_jsonb(p)->>'descriptionAr', to_jsonb(p)->>'description', '') AS "descriptionAr",
          COALESCE(NULLIF(to_jsonb(p)->>'price', ''), '0') AS price,
          COALESCE(to_jsonb(p)->>'compare_at_price', to_jsonb(p)->>'compareAtPrice') AS "compareAtPrice",
          COALESCE(to_jsonb(p)->>'price_qty_2', to_jsonb(p)->>'priceQty2') AS "priceQty2",
          COALESCE(to_jsonb(p)->>'price_qty_3', to_jsonb(p)->>'priceQty3') AS "priceQty3",
(
  SELECT COALESCE(
    json_agg(
      json_build_object(
        'quantity', pqp.quantity,
        'price', pqp.price
      )
      ORDER BY pqp.quantity ASC
    ),
    '[]'::json
  )
  FROM product_quantity_prices pqp
  WHERE pqp.product_id = p.id
) AS "quantityPrices",
          ${PRODUCT_IMAGE_SQL} AS "imageUrl",
          CASE
            WHEN jsonb_typeof(to_jsonb(p)->'images') = 'array'
              THEN ARRAY(SELECT jsonb_array_elements_text(to_jsonb(p)->'images'))
            ELSE ARRAY[]::text[]
          END AS images,
          COALESCE(to_jsonb(p)->>'category_id', to_jsonb(p)->>'categoryId') AS "categoryId",
          ${CATEGORY_NAME_SQL} AS "categoryName",
          COALESCE(NULLIF(to_jsonb(p)->>'stock', ''), '0')::int AS stock,
          NULLIF(COALESCE(to_jsonb(p)->>'sku', ''), '') AS sku,
          ${PRODUCT_FEATURED_SQL} AS featured,
          ${PRODUCT_ACTIVE_SQL} AS active,
          NULLIF(COALESCE(to_jsonb(p)->>'badge', ''), '') AS badge,
          COALESCE(to_jsonb(p)->>'rating', '4.5') AS rating,
          COALESCE(to_jsonb(p)->>'created_at', now()::text) AS "createdAt",
          COALESCE(to_jsonb(p)->>'updated_at', to_jsonb(p)->>'created_at', now()::text) AS "updatedAt"
        FROM products p
        LEFT JOIN categories c
          ON c.id = COALESCE(to_jsonb(p)->>'category_id', to_jsonb(p)->>'categoryId')
        WHERE ${identifierField} = $1
          ${includeInactive ? "" : `AND ${PRODUCT_ACTIVE_SQL}`}
        LIMIT 1
      `,
      [decodeURIComponent(idParam)],
    );

    if (!row) {
      return sendJson(res, 404, {
        error: "not_found",
        message: "Product not found",
      });
    }

    return sendJson(res, 200, mapProduct(row));
  } catch (error) {
    console.error("Failed to fetch single product", {
      error,
      id: idParam,
      query: req.query,
    });
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to fetch product",
    });
  }
}

type QuantityPriceInput = {
  quantity: number;
  price: number;
};

function parseQuantityPrices(value: unknown): QuantityPriceInput[] {
  if (!Array.isArray(value)) return [];

  const result: QuantityPriceInput[] = [];
  const seen = new Set<number>();

  for (const item of value) {
    if (!item || typeof item !== "object") continue;

    const quantity = Number((item as { quantity?: unknown }).quantity);
    const price = Number((item as { price?: unknown }).price);

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0 ||
      !Number.isFinite(price) ||
      price < 0 ||
      seen.has(quantity)
    ) {
      continue;
    }

    seen.add(quantity);
    result.push({ quantity, price });
  }

  return result.sort((a, b) => a.quantity - b.quantity);
}

async function createProduct(req: VercelRequest, res: VercelResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  try {
    const body = req.body ?? {};
    const id = randomUUID();
    const nameAr = String(body.nameAr ?? body.name ?? "").trim();

    if (!nameAr) {
      return sendJson(res, 400, {
        error: "bad_request",
        message: "nameAr is required",
      });
    }

    const slug = generateSlug(nameAr, id);
    const quantityPrices = parseQuantityPrices(body.quantityPrices);

    const created = await withTransaction(async (client) => {
      const result = await client.query<ProductRow>(
        `
          INSERT INTO products (
            id, slug, name, name_ar, description, description_ar, price,
            compare_at_price, price_qty_2, price_qty_3, image_url, images,
            category_id, stock, sku, featured, active, badge, rating, created_at, updated_at
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7,
            $8, $9, $10, $11, $12,
            $13, $14, $15, $16, $17, $18, $19, NOW(), NOW()
          )
          RETURNING
            id, slug, name, name_ar AS "nameAr",
            description, description_ar AS "descriptionAr",
            price, compare_at_price AS "compareAtPrice",
            price_qty_2 AS "priceQty2", price_qty_3 AS "priceQty3",
            image_url AS "imageUrl", images,
            category_id AS "categoryId", NULL::text AS "categoryName",
            stock, sku, featured, active, badge, rating,
            created_at AS "createdAt", updated_at AS "updatedAt"
        `,
        [
          id,
          slug,
          String(body.name ?? nameAr),
          nameAr,
          String(body.description ?? ""),
          String(body.descriptionAr ?? ""),
          String(Number(body.price ?? 0)),
          body.compareAtPrice === null ||
          body.compareAtPrice === undefined ||
          body.compareAtPrice === ""
            ? null
            : String(Number(body.compareAtPrice)),
          body.priceQty2 === null ||
          body.priceQty2 === undefined ||
          body.priceQty2 === ""
            ? null
            : String(Number(body.priceQty2)),
          body.priceQty3 === null ||
          body.priceQty3 === undefined ||
          body.priceQty3 === ""
            ? null
            : String(Number(body.priceQty3)),
          body.imageUrl ? String(body.imageUrl) : null,
          Array.isArray(body.images) ? body.images.map(String) : [],
          body.categoryId ? String(body.categoryId) : null,
          Number.isFinite(Number(body.stock)) ? Number(body.stock) : 0,
          body.sku ? String(body.sku) : null,
          body.featured === true,
          body.active !== false,
          body.badge ? String(body.badge) : null,
          body.rating === null ||
          body.rating === undefined ||
          body.rating === ""
            ? "4.5"
            : String(Number(body.rating)),
        ],
      );

      const created = result.rows[0];

      if (!created) {
        throw new Error("Failed to create product");
      }

      if (quantityPrices.length > 0) {
        for (const item of quantityPrices) {
          await client.query(
            `
              INSERT INTO product_quantity_prices (
                id, product_id, quantity, price, created_at, updated_at
              )
              VALUES ($1, $2, $3, $4, NOW(), NOW())
            `,
            [
              randomUUID(),
              id,
              item.quantity,
              item.price,
            ],
          );
        }
      }

      return created;
    });

    return sendJson(res, 201, mapProduct(created));
  } catch (error) {
    console.error("Failed to create product", {
      error,
      body: req.body,
    });
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to create product",
    });
  }
}

async function updateProduct(
  req: VercelRequest,
  res: VercelResponse,
  productId: string,
) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  try {
    const body = req.body ?? {};
    const updates: string[] = [];
    const values: unknown[] = [];

    const push = (column: string, value: unknown) => {
      values.push(value);
      updates.push(`${column} = $${values.length}`);
    };

    if (body.name !== undefined) push("name", String(body.name));

    if (body.nameAr !== undefined) {
      push("name_ar", String(body.nameAr));
      push("slug", generateSlug(String(body.nameAr), productId));
    }

    if (body.description !== undefined) {
      push("description", String(body.description ?? ""));
    }

    if (body.descriptionAr !== undefined) {
      push("description_ar", String(body.descriptionAr ?? ""));
    }

    if (body.price !== undefined) {
      push("price", String(Number(body.price)));
    }

    if (body.compareAtPrice !== undefined) {
      push(
        "compare_at_price",
        body.compareAtPrice === null || body.compareAtPrice === ""
          ? null
          : String(Number(body.compareAtPrice)),
      );
    }

    if (body.priceQty2 !== undefined) {
      push(
        "price_qty_2",
        body.priceQty2 === null || body.priceQty2 === ""
          ? null
          : String(Number(body.priceQty2)),
      );
    }

    if (body.priceQty3 !== undefined) {
      push(
        "price_qty_3",
        body.priceQty3 === null || body.priceQty3 === ""
          ? null
          : String(Number(body.priceQty3)),
      );
    }

    if (body.imageUrl !== undefined) {
      push("image_url", body.imageUrl ? String(body.imageUrl) : null);
    }

    if (body.images !== undefined) {
      push(
        "images",
        Array.isArray(body.images) ? body.images.map(String) : [],
      );
    }

    if (body.categoryId !== undefined) {
      push("category_id", body.categoryId ? String(body.categoryId) : null);
    }

    if (body.stock !== undefined) {
      push("stock", Number(body.stock ?? 0));
    }

    if (body.sku !== undefined) {
      push("sku", body.sku ? String(body.sku) : null);
    }

    if (body.featured !== undefined) {
      push("featured", body.featured === true);
    }

    if (body.active !== undefined) {
      push("active", body.active === true);
    }

    if (body.badge !== undefined) {
      push("badge", body.badge ? String(body.badge) : null);
    }

    if (body.rating !== undefined) {
      push(
        "rating",
        body.rating === null || body.rating === ""
          ? null
          : String(Number(body.rating)),
      );
    }

    push("updated_at", new Date().toISOString());

    const quantityPricesProvided = body.quantityPrices !== undefined;
    const quantityPrices = quantityPricesProvided
      ? parseQuantityPrices(body.quantityPrices)
      : [];

    const updated = await withTransaction(async (client) => {
      values.push(productId);
      const idIndex = values.length;

      const result = await client.query<ProductRow>(
        `
          UPDATE products
          SET ${updates.join(", ")}
          WHERE id = $${idIndex}
          RETURNING
            id, slug, name, name_ar AS "nameAr",
            description, description_ar AS "descriptionAr",
            price, compare_at_price AS "compareAtPrice",
            price_qty_2 AS "priceQty2", price_qty_3 AS "priceQty3",
            image_url AS "imageUrl", images,
            category_id AS "categoryId", NULL::text AS "categoryName",
            stock, sku, featured, active, badge, rating,
            created_at AS "createdAt", updated_at AS "updatedAt"
        `,
        values,
      );

      const updated = result.rows[0];

      if (!updated) {
        return null;
      }

      if (quantityPricesProvided) {
        await client.query(
          `
            DELETE FROM product_quantity_prices
            WHERE product_id = $1
          `,
          [productId],
        );

        for (const item of quantityPrices) {
          await client.query(
            `
              INSERT INTO product_quantity_prices (
                id, product_id, quantity, price, created_at, updated_at
              )
              VALUES ($1, $2, $3, $4, NOW(), NOW())
            `,
            [
              randomUUID(),
              productId,
              item.quantity,
              item.price,
            ],
          );
        }

        updated.quantityPrices = quantityPrices;
      }

      return updated;
    });

    if (!updated) {
      return sendJson(res, 404, {
        error: "not_found",
        message: "Product not found",
      });
    }

    return sendJson(res, 200, mapProduct(updated));
  } catch (error) {
    console.error("Failed to update product", {
      error,
      productId,
      body: req.body,
    });
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to update product",
    });
  }
}

async function deleteProduct(
  req: VercelRequest,
  res: VercelResponse,
  productId: string,
) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  try {
    await query("DELETE FROM products WHERE id = $1", [productId]);
    return res.status(204).end();
  } catch (error) {
    console.error("Failed to delete product", { error, productId });
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to delete product",
    });
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  const idParam = getRouteParam(req, "id");
  const featured = parseBoolParam(req.query.featured, false);

  if (req.method === "GET") {
    if (idParam) {
      return getProduct(req, res, idParam);
    }
    if (featured) {
      return listFeaturedProducts(req, res);
    }
    return listProducts(req, res);
  }

  if (req.method === "POST") {
    return createProduct(req, res);
  }

  if (req.method === "PUT") {
    if (!idParam) {
      return sendJson(res, 400, {
        error: "bad_request",
        message: "Missing product id",
      });
    }
    return updateProduct(req, res, idParam);
  }

  if (req.method === "DELETE") {
    if (!idParam) {
      return sendJson(res, 400, {
        error: "bad_request",
        message: "Missing product id",
      });
    }
    return deleteProduct(req, res, idParam);
  }

  return methodNotAllowed(res, ["GET", "POST", "PUT", "DELETE"]);
}
