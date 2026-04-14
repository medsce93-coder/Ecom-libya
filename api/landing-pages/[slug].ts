import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../_lib/auth";
import { query } from "../_lib/db";
import {
  getRouteParam,
  methodNotAllowed,
  sendJson,
} from "../_lib/http";

function normalizeLandingPageRow<T extends Record<string, unknown>>(row: T): T {
  return {
    ...row,
    mediaUrls: Array.isArray(row.mediaUrls) ? row.mediaUrls : [],
    features: Array.isArray(row.features) ? row.features : [],
  };
}

async function getLandingPageBySlug(
  res: VercelResponse,
  slugParam: string,
) {
  try {
    const [row] = await query(
      `
        SELECT
          lp.id,
          lp.product_id AS "productId",
          lp.slug,
          lp.headline,
          lp.subheadline,
          lp.media_urls AS "mediaUrls",
          lp.features,
          lp.box_contents AS "boxContents",
          lp.urgency_text AS "urgencyText",
          lp.created_at AS "createdAt",
          lp.updated_at AS "updatedAt",
          json_build_object(
            'id', p.id,
            'name', p.name,
            'nameAr', p.name_ar,
            'price', p.price,
            'compareAtPrice', p.compare_at_price,
            'priceQty2', p.price_qty_2,
            'priceQty3', p.price_qty_3,
            'imageUrl', p.image_url,
            'slug', p.slug
          ) AS product
        FROM landing_pages lp
        INNER JOIN products p ON p.id = lp.product_id
        WHERE lp.slug = $1
        LIMIT 1
      `,
      [decodeURIComponent(slugParam)],
    );

    if (!row) {
      return sendJson(res, 404, {
        error: "not_found",
        message: "Landing page not found",
      });
    }

    return sendJson(res, 200, normalizeLandingPageRow(row));
  } catch (error) {
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to fetch landing page",
    });
  }
}

async function updateLandingPage(
  req: VercelRequest,
  res: VercelResponse,
  idParam: string,
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

    if (body.productId !== undefined) push("product_id", String(body.productId));
    if (body.slug !== undefined) push("slug", String(body.slug).trim().toLowerCase());
    if (body.headline !== undefined) push("headline", String(body.headline));
    if (body.subheadline !== undefined) push("subheadline", String(body.subheadline ?? ""));
    if (body.mediaUrls !== undefined) {
      push(
        "media_urls",
        Array.isArray(body.mediaUrls) ? body.mediaUrls.filter(Boolean).map(String) : [],
      );
    }
    if (body.features !== undefined) {
      push(
        "features",
        Array.isArray(body.features) ? body.features.filter(Boolean).map(String) : [],
      );
    }
    if (body.boxContents !== undefined) {
      push("box_contents", body.boxContents ? String(body.boxContents) : null);
    }
    if (body.urgencyText !== undefined) {
      push("urgency_text", body.urgencyText ? String(body.urgencyText) : null);
    }

    push("updated_at", new Date().toISOString());

    values.push(idParam);
    const idIndex = values.length;

    const [updated] = await query<{ id: string }>(
      `
        UPDATE landing_pages
        SET ${updates.join(", ")}
        WHERE id = $${idIndex}
        RETURNING id
      `,
      values,
    );

    if (!updated) {
      return sendJson(res, 404, {
        error: "not_found",
        message: "Landing page not found",
      });
    }

    const [full] = await query(
      `
        SELECT
          lp.id,
          lp.product_id AS "productId",
          lp.slug,
          lp.headline,
          lp.subheadline,
          lp.media_urls AS "mediaUrls",
          lp.features,
          lp.box_contents AS "boxContents",
          lp.urgency_text AS "urgencyText",
          lp.created_at AS "createdAt",
          lp.updated_at AS "updatedAt",
          json_build_object(
            'id', p.id,
            'name', p.name,
            'nameAr', p.name_ar,
            'price', p.price,
            'compareAtPrice', p.compare_at_price,
            'priceQty2', p.price_qty_2,
            'priceQty3', p.price_qty_3,
            'imageUrl', p.image_url,
            'slug', p.slug
          ) AS product
        FROM landing_pages lp
        INNER JOIN products p ON p.id = lp.product_id
        WHERE lp.id = $1
        LIMIT 1
      `,
      [updated.id],
    );

    return sendJson(res, 200, normalizeLandingPageRow(full));
  } catch (error: any) {
    if (error?.code === "23505") {
      return sendJson(res, 409, {
        error: "conflict",
        message: "A landing page with this slug already exists",
      });
    }

    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to update landing page",
    });
  }
}

async function deleteLandingPage(
  req: VercelRequest,
  res: VercelResponse,
  idParam: string,
) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  try {
    const [deleted] = await query<{ id: string }>(
      `
        DELETE FROM landing_pages
        WHERE id = $1
        RETURNING id
      `,
      [idParam],
    );

    if (!deleted) {
      return sendJson(res, 404, {
        error: "not_found",
        message: "Landing page not found",
      });
    }

    return sendJson(res, 200, { success: true });
  } catch (error) {
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to delete landing page",
    });
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  const param = getRouteParam(req, "slug");
  if (!param) {
    return sendJson(res, 400, {
      error: "bad_request",
      message: "Missing route parameter",
    });
  }

  if (req.method === "GET") {
    return getLandingPageBySlug(res, param);
  }
  if (req.method === "PUT") {
    return updateLandingPage(req, res, param);
  }
  if (req.method === "DELETE") {
    return deleteLandingPage(req, res, param);
  }

  return methodNotAllowed(res, ["GET", "PUT", "DELETE"]);
}
