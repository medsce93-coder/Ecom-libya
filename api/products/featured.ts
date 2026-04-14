import type { VercelRequest, VercelResponse } from "@vercel/node";
import { query } from "../_lib/db";
import { methodNotAllowed, sendJson } from "../_lib/http";
import { mapProduct, type ProductRow } from "../_lib/products";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "GET") {
    return methodNotAllowed(res, ["GET"]);
  }

  try {
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
        WHERE p.featured = true AND p.active = true
        ORDER BY p.created_at DESC
        LIMIT 12
      `,
    );

    return sendJson(res, 200, rows.map(mapProduct));
  } catch (error) {
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to fetch featured products",
    });
  }
}
