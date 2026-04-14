import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../_lib/auth";
import { query } from "../_lib/db";
import {
  getRouteParam,
  methodNotAllowed,
  parseBoolParam,
  sendJson,
} from "../_lib/http";
import {
  UUID_RE,
  generateSlug,
  mapProduct,
  type ProductRow,
} from "../_lib/products";

async function getProduct(req: VercelRequest, res: VercelResponse, idParam: string) {
  try {
    const includeInactive = parseBoolParam(req.query.includeInactive, false);
    if (includeInactive) {
      const admin = await requireAdmin(req, res);
      if (!admin) return;
    }

    const byId = UUID_RE.test(idParam);
    const [row] = await query<ProductRow>(
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
        WHERE ${byId ? "p.id" : "p.slug"} = $1
          ${includeInactive ? "" : "AND p.active = true"}
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
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to fetch product",
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
    if (body.description !== undefined) push("description", String(body.description ?? ""));
    if (body.descriptionAr !== undefined) {
      push("description_ar", String(body.descriptionAr ?? ""));
    }
    if (body.price !== undefined) push("price", String(Number(body.price)));
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
    if (body.stock !== undefined) push("stock", Number(body.stock ?? 0));
    if (body.sku !== undefined) push("sku", body.sku ? String(body.sku) : null);
    if (body.featured !== undefined) push("featured", body.featured === true);
    if (body.active !== undefined) push("active", body.active === true);
    if (body.badge !== undefined) push("badge", body.badge ? String(body.badge) : null);
    if (body.rating !== undefined) {
      push(
        "rating",
        body.rating === null || body.rating === ""
          ? null
          : String(Number(body.rating)),
      );
    }

    push("updated_at", new Date().toISOString());

    values.push(productId);
    const idIndex = values.length;

    const [updated] = await query<ProductRow>(
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

    if (!updated) {
      return sendJson(res, 404, {
        error: "not_found",
        message: "Product not found",
      });
    }

    return sendJson(res, 200, mapProduct(updated));
  } catch (error) {
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
  if (!idParam) {
    return sendJson(res, 400, {
      error: "bad_request",
      message: "Missing product id",
    });
  }

  if (req.method === "GET") {
    return getProduct(req, res, idParam);
  }
  if (req.method === "PUT") {
    return updateProduct(req, res, idParam);
  }
  if (req.method === "DELETE") {
    return deleteProduct(req, res, idParam);
  }

  return methodNotAllowed(res, ["GET", "PUT", "DELETE"]);
}
