import { randomUUID } from "node:crypto";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "./_lib/auth.js";
import { query } from "./_lib/db.js";
import { methodNotAllowed, sendJson } from "./_lib/http.js";

async function listCategories(res: VercelResponse) {
  try {
    const rows = await query<{
      id: string;
      name: string;
      nameAr: string;
      description: string | null;
      imageUrl: string | null;
      createdAt: string;
      productCount: number;
    }>(
      `
        SELECT
          c.id,
          c.name,
          c.name_ar AS "nameAr",
          c.description,
          c.image_url AS "imageUrl",
          c.created_at AS "createdAt",
          COUNT(p.id)::int AS "productCount"
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id AND p.active = true
        GROUP BY c.id
        ORDER BY c.name_ar ASC
      `,
    );

    return sendJson(res, 200, rows);
  } catch (error) {
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to fetch categories",
    });
  }
}

async function createCategory(req: VercelRequest, res: VercelResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  try {
    const body = req.body ?? {};
    const nameAr = String(body.nameAr ?? body.name ?? "").trim();
    if (!nameAr) {
      return sendJson(res, 400, {
        error: "bad_request",
        message: "nameAr is required",
      });
    }

    const [row] = await query<{
      id: string;
      name: string;
      nameAr: string;
      description: string | null;
      imageUrl: string | null;
      createdAt: string;
    }>(
      `
        INSERT INTO categories (id, name, name_ar, description, image_url, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING
          id,
          name,
          name_ar AS "nameAr",
          description,
          image_url AS "imageUrl",
          created_at AS "createdAt"
      `,
      [
        randomUUID(),
        String(body.name ?? nameAr),
        nameAr,
        body.description ? String(body.description) : null,
        body.imageUrl ? String(body.imageUrl) : null,
      ],
    );

    return sendJson(res, 201, {
      ...row,
      productCount: 0,
    });
  } catch (error) {
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to create category",
    });
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method === "GET") {
    return listCategories(res);
  }
  if (req.method === "POST") {
    return createCategory(req, res);
  }
  return methodNotAllowed(res, ["GET", "POST"]);
}
