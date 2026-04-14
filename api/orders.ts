import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "./_lib/auth";
import { query } from "./_lib/db";
import { mapOrder, type OrderItemRow, type OrderRow } from "./_lib/orders";
import {
  methodNotAllowed,
  parseIntParam,
  sendJson,
} from "./_lib/http";

async function listOrders(req: VercelRequest, res: VercelResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  try {
    const page = Math.max(1, parseIntParam(req.query.page, 1));
    const limit = Math.min(200, Math.max(1, parseIntParam(req.query.limit, 100)));
    const offset = (page - 1) * limit;
    const status = typeof req.query.status === "string" ? req.query.status : null;

    const values: unknown[] = [];
    const where = status
      ? (() => {
          values.push(status);
          return `WHERE status = $${values.length}`;
        })()
      : "";

    const pagingStart = values.length + 1;

    const orders = await query<OrderRow>(
      `
        SELECT
          id,
          order_number AS "orderNumber",
          status,
          customer_name AS "customerName",
          customer_phone AS "customerPhone",
          customer_city AS "customerCity",
          customer_address AS "customerAddress",
          subtotal,
          shipping_fee AS "shippingFee",
          total,
          notes,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM orders
        ${where}
        ORDER BY created_at DESC
        LIMIT $${pagingStart}
        OFFSET $${pagingStart + 1}
      `,
      [...values, limit, offset],
    );

    const [countRow] = await query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM orders ${where}`,
      values,
    );

    const orderIds = orders.map((order) => order.id);
    const items =
      orderIds.length === 0
        ? []
        : await query<OrderItemRow>(
            `
              SELECT
                id,
                order_id AS "orderId",
                product_id AS "productId",
                product_name AS "productName",
                product_name_ar AS "productNameAr",
                product_image AS "productImage",
                price,
                quantity,
                subtotal
              FROM order_items
              WHERE order_id = ANY($1::text[])
            `,
            [orderIds],
          );

    const total = Number(countRow?.count ?? 0);
    const mapped = orders.map((order) =>
      mapOrder(
        order,
        items.filter((item) => item.orderId === order.id),
      ),
    );

    return sendJson(res, 200, {
      orders: mapped,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to fetch orders",
    });
  }
}

async function clearOrders(req: VercelRequest, res: VercelResponse) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  try {
    await query("DELETE FROM order_items");
    await query("DELETE FROM orders");
    return sendJson(res, 200, { success: true });
  } catch (error) {
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to delete all orders",
    });
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method === "GET") return listOrders(req, res);
  if (req.method === "DELETE") return clearOrders(req, res);
  return methodNotAllowed(res, ["GET", "DELETE"]);
}
