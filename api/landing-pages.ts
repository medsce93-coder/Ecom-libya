import { randomUUID } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "./_lib/auth";
import { query } from "./_lib/db";
import { methodNotAllowed, sendJson } from "./_lib/http";

async function listLandingPages(res: VercelResponse) {
  try {
    const rows = await query<{
      id: string;
      productId: string;
      slug: string;
      headline: string;
      subheadline: string;
      mediaUrls: string[] | null;
      features: string[] | null;
      boxContents: string | null;
      urgencyText: string | null;
      createdAt: string;
      updatedAt: string;
      productNameAr: string;
      productImageUrl: string | null;
      productPrice: string;
    }>(
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
          p.name_ar AS "productNameAr",
          p.image_url AS "productImageUrl",
          p.price AS "productPrice"
        FROM landing_pages lp
        INNER JOIN products p ON p.id = lp.product_id
        ORDER BY lp.created_at ASC
      `,
    );

    return sendJson(
      res,
      200,
      rows.map((row) => ({
        ...row,
        mediaUrls: Array.isArray(row.mediaUrls) ? row.mediaUrls : [],
        features: Array.isArray(row.features) ? row.features : [],
      })),
    );
  } catch (error) {
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to fetch landing pages",
    });
  }
}

async function createLandingPage(req: VercelRequest, res: VercelResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  try {
    const body = req.body ?? {};
    const productId = String(body.productId ?? "").trim();
    const slug = String(body.slug ?? "")
      .trim()
      .toLowerCase();
    const headline = String(body.headline ?? "").trim();

    if (!productId || !slug || !headline) {
      return sendJson(res, 400, {
        error: "bad_request",
        message: "productId, slug, and headline are required",
      });
    }

    const [created] = await query<{ id: string }>(
      `
        INSERT INTO landing_pages (
          id, product_id, slug, headline, subheadline, media_urls, features,
          box_contents, urgency_text, created_at, updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
        )
        RETURNING id
      `,
      [
        randomUUID(),
        productId,
        slug,
        headline,
        String(body.subheadline ?? ""),
        Array.isArray(body.mediaUrls) ? body.mediaUrls.filter(Boolean).map(String) : [],
        Array.isArray(body.features) ? body.features.filter(Boolean).map(String) : [],
        body.boxContents ? String(body.boxContents) : null,
        body.urgencyText ? String(body.urgencyText) : null,
      ],
    );

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
      [created.id],
    );

    if (!full) {
      return sendJson(res, 500, {
        error: "internal_error",
        message: "Landing page was created but failed to load its details",
      });
    }

    return sendJson(res, 201, {
      ...full,
      mediaUrls: Array.isArray((full as any)?.mediaUrls)
        ? (full as any).mediaUrls
        : [],
      features: Array.isArray((full as any)?.features)
        ? (full as any).features
        : [],
    });
  } catch (error: any) {
    if (error?.code === "23505") {
      return sendJson(res, 409, {
        error: "conflict",
        message: "A landing page with this slug already exists",
      });
    }
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to create landing page",
    });
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method === "GET") return listLandingPages(res);
  if (req.method === "POST") return createLandingPage(req, res);
  return methodNotAllowed(res, ["GET", "POST"]);
}
