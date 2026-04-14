import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAdmin } from "../_lib/auth";
import { query } from "../_lib/db";
import {
  getRouteParam,
  methodNotAllowed,
  sendJson,
} from "../_lib/http";
import { mapOrder, type OrderItemRow, type OrderRow } from "../_lib/orders";

async function getOrderById(
  req: VercelRequest,
  res: VercelResponse,
  idParam: string,
) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  try {
    const [order] = await query<OrderRow>(
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
        WHERE id = $1
        LIMIT 1
      `,
      [idParam],
    );

    if (!order) {
      return sendJson(res, 404, {
        error: "not_found",
        message: "Order not found",
      });
    }

    const items = await query<OrderItemRow>(
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
        WHERE order_id = $1
      `,
      [order.id],
    );

    return sendJson(res, 200, mapOrder(order, items));
  } catch (error) {
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to fetch order",
    });
  }
}

async function updateOrderStatus(
  req: VercelRequest,
  res: VercelResponse,
  idParam: string,
) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  try {
    const status = String(req.body?.status ?? "").trim();
    if (!status) {
      return sendJson(res, 400, {
        error: "bad_request",
        message: "status is required",
      });
    }

    const [updated] = await query<OrderRow>(
      `
        UPDATE orders
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING
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
      `,
      [status, idParam],
    );

    if (!updated) {
      return sendJson(res, 404, {
        error: "not_found",
        message: "Order not found",
      });
    }

    const items = await query<OrderItemRow>(
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
        WHERE order_id = $1
      `,
      [updated.id],
    );

    return sendJson(res, 200, mapOrder(updated, items));
  } catch (error) {
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to update order",
    });
  }
}

async function deleteOrder(
  req: VercelRequest,
  res: VercelResponse,
  idParam: string,
) {
  const admin = await requireAdmin(req, res);
  if (!admin) return;

  try {
    await query("DELETE FROM order_items WHERE order_id = $1", [idParam]);
    const [deleted] = await query<{ id: string }>(
      `
        DELETE FROM orders
        WHERE id = $1
        RETURNING id
      `,
      [idParam],
    );

    if (!deleted) {
      return sendJson(res, 404, {
        error: "not_found",
        message: "Order not found",
      });
    }

    return sendJson(res, 200, { success: true });
  } catch (error) {
    return sendJson(res, 500, {
      error: "internal_error",
      message: "Failed to delete order",
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
      message: "Missing order id",
    });
  }

  if (req.method === "GET") return getOrderById(req, res, idParam);
  if (req.method === "PUT") return updateOrderStatus(req, res, idParam);
  if (req.method === "DELETE") return deleteOrder(req, res, idParam);

  return methodNotAllowed(res, ["GET", "PUT", "DELETE"]);
}
