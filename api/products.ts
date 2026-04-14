import { randomUUID } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "./_lib/auth";
import { query } from "./_lib/db";
import {
  methodNotAllowed,
  parseBoolParam,
  parseIntParam,
  sendJson,
} from "./_lib/http";
import {
  generateSlug,
  mapProduct,
  type ProductRow,
} from "./_lib/products";

function buildProductsWhere(
  req: VercelRequest,
  includeInactive = false,
) {
  const values: unknown[] = [];
  const clauses: string[] = [];

  if (!includeInactive) {
    clauses.push("p.active = true");
  }

  const categoryId = req.query.categoryId;
  if (typeof categoryId === "string" && categoryId.trim()) {
    values.push(categoryId.trim());
    clauses.push(`p.category_id = $${values.length}`);
  }

  const search = req.query.search;
  if (typeof search === "string" && search.trim()) {
    values.push(`%${search.trim()}%`);
    const searchIndex = values.length;
    clauses.push(`(p.name_ar ILIKE $${searchIndex} OR p.name ILIKE $${searchIndex})`);
  }

  const minPrice = req.query.minPrice;
  if (typeof minPrice === "string" && minPrice.trim()) {
    const parsed = Number(minPrice);
    if (Number.isFinite(parsed)) {
      values.push(parsed);
      clauses.push(`p.price::numeric >= $${values.length}`);
    }
  }

  const maxPrice = req.query.maxPrice;
  if (typeof maxPrice === "string" && maxPrice.trim()) {
    const parsed = Number(maxPrice);
    if (Number.isFinite(parsed)) {
      values.push(parsed);
      clauses.push(`p.price::numeric <= $${values.length}`);
    }
  }

  if (parseBoolParam(req.query.inStock, false)) {
    clauses.push("p.stock >= 1");
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
          p.slug,
          p.name,
          p.name_ar AS "nameAr",
          p.description,
          p.description_ar AS "descriptionAr",
          p.price,
          p.compare_at_price AS "compareAtPrice",
          p.price_qty_2 AS "priceQty2",
          p.price_qty_3 AS "priceQty3",
          p.image_url AS "imageUrl",
          p.images,
          p.category_id AS "categoryId",
          c.name_ar AS "categoryName",
          p.stock,
          p.sku,
          p.featured,
          p.active,
          p.badge,
          p.rating,
          p.created_at AS "createdAt",
          p.updated_at AS "updatedAt"
        FROM products p
        LEFT JOIN categories c ON c.id = p.category_id
        ${whereSql}
        ORDER BY p.created_at DESC
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
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to fetch products",
    });
  }
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
    const [created] = await query<ProductRow>(
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
        body.compareAtPrice === null || body.compareAtPrice === undefined || body.compareAtPrice === ""
          ? null
          : String(Number(body.compareAtPrice)),
        body.priceQty2 === null || body.priceQty2 === undefined || body.priceQty2 === ""
          ? null
          : String(Number(body.priceQty2)),
        body.priceQty3 === null || body.priceQty3 === undefined || body.priceQty3 === ""
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
        body.rating === null || body.rating === undefined || body.rating === ""
          ? "4.5"
          : String(Number(body.rating)),
      ],
    );

    return sendJson(res, 201, mapProduct(created));
  } catch (error) {
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to create product",
    });
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method === "GET") {
    return listProducts(req, res);
  }

  if (req.method === "POST") {
    return createProduct(req, res);
  }

  return methodNotAllowed(res, ["GET", "POST"]);
}
